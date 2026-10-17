import { EventEmitter } from 'events';

// 1. Definición de la interfaz de evento inmutable (Event Sourcing)
export interface DomainEvent<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  payload: T;
}

// 2. Eventos concretos del dominio de proyectos
export interface TaskCreatedPayload {
  title: string;
  projectId: string;
  assignedUserId: string;
}

export interface TaskStatusChangedPayload {
  oldStatus: string;
  newStatus: string;
}

// 3. Proyector de vista materializada (CQRS - Read Model)
export class ProjectAnalyticsProjector {
  private activeTaskCount: number = 0;
  private completedTaskCount: number = 0;

  public handleEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'TaskCreated':
        this.activeTaskCount++;
        break;
      case 'TaskCompleted':
        if (this.activeTaskCount > 0) this.activeTaskCount--;
        this.completedTaskCount++;
        break;
      default:
        // Ignorar eventos no relevantes para este modelo de lectura
        break;
    }
  }

  public getMetrics() {
    return {
      activeTasks: this.activeTaskCount,
      completedTasks: this.completedTaskCount,
      totalProcessed: this.activeTaskCount + this.completedTaskCount
    };
  }

  public reset(): void {
    this.activeTaskCount = 0;
    this.completedTaskCount = 0;
  }
}

// 4. Bus de eventos asíncrono e in-memory Event Store
export class EventStore extends EventEmitter {
  private events: DomainEvent[] = [];

  public appendEvent(event: DomainEvent): void {
    // Almacenamiento inmutable en append-only log
    this.events.push(Object.freeze(event));
    this.emit('eventPublished', event);
  }

  public getEventStream(aggregateId: string): DomainEvent[] {
    return this.events.filter((e) => e.aggregateId === aggregateId);
  }

  public getAllEvents(): DomainEvent[] {
    return [...this.events];
  }

  /**
   * Reconstruye el estado histórico mediante "Time Travel" (Viaje en el tiempo),
   * reproduciendo únicamente los eventos ocurridos hasta una fecha/hora determinada.
   */
  public replayUntil(aggregateId: string, cutoffDate: Date): DomainEvent[] {
    return this.events.filter(
      (e) => e.aggregateId === aggregateId && e.timestamp <= cutoffDate
    );
  }
}

// 5. Demostración de ejecución
export async function runEventStreamDemo(): Promise<{
  activeTasks: number;
  completedTasks: number;
  totalProcessed: number;
}> {
  const store = new EventStore();
  const projector = new ProjectAnalyticsProjector();

  // Suscripción de proyección CQRS
  store.on('eventPublished', (event: DomainEvent) => {
    projector.handleEvent(event);
  });

  // Emisión de eventos simulando mutaciones CDC
  store.appendEvent({
    eventId: 'evt-001',
    eventType: 'TaskCreated',
    aggregateId: 'task-101',
    timestamp: new Date(),
    payload: { title: 'Diseñar arquitectura CDC', projectId: 'prj-1', assignedUserId: 'usr-5' }
  });

  store.appendEvent({
    eventId: 'evt-002',
    eventType: 'TaskCompleted',
    aggregateId: 'task-101',
    timestamp: new Date(),
    payload: { oldStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' }
  });

  const metrics = projector.getMetrics();
  console.log('[Métricas Proyectadas]:', metrics);
  return metrics;
}
