import { expect } from 'chai';
import sinon from 'sinon';
import { RabbitMQConnection } from '../../src/messaging/rabbitmq_connection';
import { EventPublisher, TaskCreatedEvent } from '../../src/messaging/event_publisher';
import { startNotificationConsumer } from '../../src/messaging/notification_consumer';
import { startAuditConsumer } from '../../src/messaging/audit_consumer';
import {
  EventStore,
  ProjectAnalyticsProjector,
  DomainEvent,
  runEventStreamDemo
} from '../../src/events/stream_processor';
import { WindowedStreamAnalytics } from '../../src/events/windowed_stream_analytics';

describe('Capítulo 16: Patrones de Mensajería y Microservicios Distribuidos', () => {
  let rabbit: RabbitMQConnection;

  beforeEach(() => {
    rabbit = RabbitMQConnection.getInstance();
  });

  afterEach(() => {
    rabbit.setMockChannel(null);
    sinon.restore();
  });

  it('RabbitMQConnection: debe implementar patrón Singleton y declarar constantes del dominio', () => {
    const instance1 = RabbitMQConnection.getInstance();
    const instance2 = RabbitMQConnection.getInstance();
    expect(instance1).to.equal(instance2);
    expect(instance1.EXCHANGE_NAME).to.equal('pms_events_exchange');
  });

  it('EventPublisher: debe serializar el evento de dominio y publicar con routingKey jerárquico', async () => {
    const publishStub = sinon.stub().returns(true);
    const mockChannel: any = {
      assertExchange: sinon.stub().resolves(),
      publish: publishStub
    };

    rabbit.setMockChannel(mockChannel);

    const event: TaskCreatedEvent = {
      eventId: 'evt-100',
      taskId: 'task-abc',
      title: 'Crear esquema de base de datos',
      projectId: 'prj-alpha',
      assignedToEmail: 'backend@pms.local',
      createdAt: new Date().toISOString()
    };

    const result = await EventPublisher.publishTaskCreated(event);

    expect(result).to.be.true;
    expect(publishStub.calledOnce).to.be.true;

    const [exchange, routingKey, payloadBuffer, options] = publishStub.firstCall.args;
    expect(exchange).to.equal('pms_events_exchange');
    expect(routingKey).to.equal('task.event.created');
    expect(options).to.deep.include({ persistent: true, contentType: 'application/json' });

    const deserialized = JSON.parse(payloadBuffer.toString());
    expect(deserialized.taskId).to.equal('task-abc');
    expect(deserialized.title).to.equal('Crear esquema de base de datos');
  });

  it('NotificationConsumer: debe declarar cola duradera, bind a task.event.*, prefetch(1) y confirmar con ACK', async () => {
    let messageHandler: Function | null = null;

    const ackStub = sinon.stub();
    const nackStub = sinon.stub();

    const mockChannel: any = {
      assertQueue: sinon.stub().resolves(),
      bindQueue: sinon.stub().resolves(),
      prefetch: sinon.stub().resolves(),
      consume: sinon.stub().callsFake((queueName: string, callback: Function) => {
        messageHandler = callback;
        return Promise.resolve({ consumerTag: 'tag-1' });
      }),
      ack: ackStub,
      nack: nackStub
    };

    let processedEvent: TaskCreatedEvent | null = null;
    await startNotificationConsumer({
      channel: mockChannel,
      sendEmailSimulatedTimeoutMs: 0,
      onProcessed: (evt) => {
        processedEvent = evt;
      }
    });

    expect(mockChannel.assertQueue.calledWith('notification_service_queue', { durable: true })).to.be.true;
    expect(mockChannel.bindQueue.calledWith('notification_service_queue', 'pms_events_exchange', 'task.event.*')).to.be.true;
    expect(mockChannel.prefetch.calledWith(1)).to.be.true;
    expect(messageHandler).to.be.a('function');

    // Simular recepción de mensaje
    const dummyEvent: TaskCreatedEvent = {
      eventId: 'evt-200',
      taskId: 'task-xyz',
      title: 'Refactorizar Servicios',
      projectId: 'prj-1',
      assignedToEmail: 'lead@pms.local',
      createdAt: new Date().toISOString()
    };

    const mockMsg: any = {
      content: Buffer.from(JSON.stringify(dummyEvent))
    };

    await messageHandler!(mockMsg);

    expect(processedEvent).to.not.be.null;
    expect((processedEvent as any)?.taskId).to.equal('task-xyz');
    expect(ackStub.calledOnceWith(mockMsg)).to.be.true;
    expect(nackStub.called).to.be.false;
  });

  it('AuditConsumer: debe capturar todos los eventos (# wildcard) y confirmar con ACK', async () => {
    let messageHandler: Function | null = null;
    const ackStub = sinon.stub();

    const mockChannel: any = {
      assertQueue: sinon.stub().resolves(),
      bindQueue: sinon.stub().resolves(),
      consume: sinon.stub().callsFake((queueName: string, callback: Function) => {
        messageHandler = callback;
        return Promise.resolve({ consumerTag: 'audit-tag' });
      }),
      ack: ackStub
    };

    let loggedKey = '';
    let loggedBody = '';

    await startAuditConsumer({
      channel: mockChannel,
      onAuditLogged: (rk, body) => {
        loggedKey = rk;
        loggedBody = body;
      }
    });

    expect(mockChannel.bindQueue.calledWith('audit_service_queue', 'pms_events_exchange', '#')).to.be.true;

    // Simular recepción de mensaje de auditoría
    const mockMsg: any = {
      fields: { routingKey: 'task.event.created' },
      content: Buffer.from(JSON.stringify({ eventId: 'evt-300', action: 'AUDIT_LOG' }))
    };

    messageHandler!(mockMsg);

    expect(loggedKey).to.equal('task.event.created');
    expect(loggedBody).to.include('AUDIT_LOG');
    expect(ackStub.calledOnceWith(mockMsg)).to.be.true;
  });
});

describe('Capítulo 17: Procesamiento de Flujos de Eventos, Event Sourcing y CQRS', () => {
  it('EventStore: debe persistir eventos inmutables, emitir notificaciones y permitir reconstrucción histórica', () => {
    const store = new EventStore();
    const emittedEvents: DomainEvent[] = [];

    store.on('eventPublished', (evt) => {
      emittedEvents.push(evt);
    });

    const event1: DomainEvent = {
      eventId: 'evt-1',
      eventType: 'TaskCreated',
      aggregateId: 'task-10',
      timestamp: new Date('2026-10-20T10:00:00Z'),
      payload: { title: 'Tarea 1' }
    };

    const event2: DomainEvent = {
      eventId: 'evt-2',
      eventType: 'TaskAssigned',
      aggregateId: 'task-10',
      timestamp: new Date('2026-10-20T10:30:00Z'),
      payload: { assignedUserId: 'usr-1' }
    };

    const eventOther: DomainEvent = {
      eventId: 'evt-3',
      eventType: 'TaskCreated',
      aggregateId: 'task-20',
      timestamp: new Date('2026-10-20T10:45:00Z'),
      payload: { title: 'Tarea 2' }
    };

    store.appendEvent(event1);
    store.appendEvent(event2);
    store.appendEvent(eventOther);

    expect(emittedEvents).to.have.lengthOf(3);

    // Obtener flujo por agregado
    const streamTask10 = store.getEventStream('task-10');
    expect(streamTask10).to.have.lengthOf(2);
    expect(streamTask10[0].eventType).to.equal('TaskCreated');
    expect(streamTask10[1].eventType).to.equal('TaskAssigned');

    // Time Travel (Viaje en el tiempo hasta las 10:15)
    const historicStream = store.replayUntil('task-10', new Date('2026-10-20T10:15:00Z'));
    expect(historicStream).to.have.lengthOf(1);
    expect(historicStream[0].eventId).to.equal('evt-1');
  });

  it('ProjectAnalyticsProjector: debe proyectar métricas CQRS de forma atómica y consistente', () => {
    const projector = new ProjectAnalyticsProjector();

    projector.handleEvent({
      eventId: 'e1',
      eventType: 'TaskCreated',
      aggregateId: 't1',
      timestamp: new Date(),
      payload: {}
    });

    projector.handleEvent({
      eventId: 'e2',
      eventType: 'TaskCreated',
      aggregateId: 't2',
      timestamp: new Date(),
      payload: {}
    });

    let metrics = projector.getMetrics();
    expect(metrics.activeTasks).to.equal(2);
    expect(metrics.completedTasks).to.equal(0);
    expect(metrics.totalProcessed).to.equal(2);

    projector.handleEvent({
      eventId: 'e3',
      eventType: 'TaskCompleted',
      aggregateId: 't1',
      timestamp: new Date(),
      payload: {}
    });

    metrics = projector.getMetrics();
    expect(metrics.activeTasks).to.equal(1);
    expect(metrics.completedTasks).to.equal(1);
    expect(metrics.totalProcessed).to.equal(2);
  });

  it('runEventStreamDemo: debe ejecutar la demostración completa de la guía y retornar métricas proyectadas', async () => {
    const metrics = await runEventStreamDemo();
    expect(metrics.activeTasks).to.equal(0);
    expect(metrics.completedTasks).to.equal(1);
    expect(metrics.totalProcessed).to.equal(1);
  });

  it('WindowedStreamAnalytics: debe computar Ventanas Fijas (Tumbling) y Deslizantes (Sliding)', () => {
    const baseTime = new Date('2026-10-20T12:00:00Z').getTime();

    const events: DomainEvent[] = [
      {
        eventId: 'w1',
        eventType: 'TaskCreated',
        aggregateId: 'a1',
        timestamp: new Date(baseTime + 10000), // 12:00:10
        payload: {}
      },
      {
        eventId: 'w2',
        eventType: 'TaskCreated',
        aggregateId: 'a2',
        timestamp: new Date(baseTime + 20000), // 12:00:20
        payload: {}
      },
      {
        eventId: 'w3',
        eventType: 'TaskCompleted',
        aggregateId: 'a1',
        timestamp: new Date(baseTime + 70000), // 12:01:10
        payload: {}
      }
    ];

    // Ventana fija de 60 segundos (1 minuto)
    const tumblingResults = WindowedStreamAnalytics.computeTumblingWindows(events, 60000);
    expect(tumblingResults.length).to.be.at.least(2);
    expect(tumblingResults[0].eventCount).to.equal(2); // w1 y w2
    expect(tumblingResults[1].eventCount).to.equal(1); // w3

    // Ventana deslizante de 60 segundos con avance de 30 segundos
    const slidingResults = WindowedStreamAnalytics.computeSlidingWindows(events, 60000, 30000);
    expect(slidingResults.length).to.be.at.least(2);
  });
});
