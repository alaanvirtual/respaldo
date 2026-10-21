// tests/unit/patterns_and_solid.test.ts - Suite de Pruebas de Patrones de Diseño y SOLID (Capítulos 11, 12 y 13)
import { expect } from 'chai';

// Cap 11
import { StorageFactory } from '../../src/factories/storage_factory';
import { HttpClientBuilder } from '../../src/builders/http_client_builder';
import { createLoggingProxy } from '../../src/proxies/logging_proxy';
import { InMemoryTaskRepository } from '../../src/repositories/task_repository';
import { EncryptedTaskRepositoryDecorator } from '../../src/decorators/encrypted_repository_decorator';
import { TwilioSmsAdapter } from '../../src/adapters/twilio_sms_adapter';
import { TaskOrchestrator } from '../../src/controllers/task_orchestrator';

// Cap 12
import { LocalStorageStrategy, CloudStorageStrategy, AttachmentService } from '../../src/strategies/storage.strategy';
import { TaskEntity } from '../../src/domain/task-state.entity';
import { CsvReportGenerator } from '../../src/reports/base-report.generator';
import { AssignUserCommand, CommandManager } from '../../src/commands/task.commands';
import { Pipeline } from '../../src/core/middleware-pipeline';
import { processPagedTasks } from '../../src/utils/async-iterator';
import { IntegratedPmsController } from '../../src/controllers/integrated-pms.controller';

// Cap 13
import { TaskValidator, StandardCostCalculator, UrgentCostCalculator, TaskCostService } from '../../src/solid/solid_principles';
import { DomainTask } from '../../src/clean-architecture/domain/entities/Task';
import { CreateTaskUseCase } from '../../src/clean-architecture/use-cases/CreateTaskUseCase';
import { InMemoryCleanTaskRepository } from '../../src/clean-architecture/adapters/repositories/InMemoryCleanTaskRepository';

describe('Capítulo 11: Patrones Creacionales y Estructurales', () => {
  it('Factory: debe crear instancias adecuadas según el tipo de almacenamiento', () => {
    const localStorage = StorageFactory.createStorage('local');
    const s3Storage = StorageFactory.createStorage('s3');
    expect(localStorage).to.have.property('uploadFile');
    expect(s3Storage).to.have.property('uploadFile');
  });

  it('Builder: debe construir una instancia de cliente HTTP encadenando métodos', () => {
    const client = new HttpClientBuilder()
      .setBaseUrl('https://api.pms.local')
      .setTimeout(3000)
      .addHeader('X-Custom-Header', 'Value')
      .setBearerToken('test-token')
      .build();

    expect(client.defaults.baseURL).to.equal('https://api.pms.local');
    expect(client.defaults.timeout).to.equal(3000);
    expect(client.defaults.headers['X-Custom-Header']).to.equal('Value');
  });

  it('Proxy: debe interceptar llamadas de métodos y registrar métricas sin alterar el resultado', async () => {
    const rawStorage = StorageFactory.createStorage('local');
    const proxiedStorage = createLoggingProxy(rawStorage, 'LocalStorage');

    const result = await proxiedStorage.uploadFile('test.pdf', 'docs/test.pdf');
    expect(result).to.include('docs/test.pdf');
  });

  it('Decorator: debe cifrar la descripción al persistir y descifrarla al recuperar', async () => {
    const innerRepo = new InMemoryTaskRepository();
    const decoratedRepo = new EncryptedTaskRepositoryDecorator(innerRepo);

    await decoratedRepo.create({
      id: 'task-sec-1',
      title: 'Auditoría',
      description: 'Información confidencial de seguridad'
    });

    // En el repositorio interno los datos están cifrados en base64
    const rawSaved = await innerRepo.findById('task-sec-1');
    expect(rawSaved?.description).to.not.equal('Información confidencial de seguridad');

    // A través del decorador se recupera en texto plano transparente
    const retrieved = await decoratedRepo.findById('task-sec-1');
    expect(retrieved?.description).to.equal('Información confidencial de seguridad');
  });

  it('Adapter & Orchestrator: debe orquestar storage, proxy y adaptador SMS', async () => {
    const orchestrator = new TaskOrchestrator();
    const result = await orchestrator.processTaskAttachment('tsk-1', 'doc.pdf', '+526671234567');
    expect(result.notified).to.be.true;
    expect(result.fileUrl).to.include('attachment.pdf');
  });
});

describe('Capítulo 12: Patrones de Comportamiento y Middleware', () => {
  it('Strategy: debe alternar dinámicamente entre almacenamiento local y en la nube', async () => {
    const localStrategy = new LocalStorageStrategy('/tmp');
    const cloudStrategy = new CloudStorageStrategy('bucket-qa');
    const attachmentService = new AttachmentService(localStrategy);

    const buf = Buffer.from('test');
    const localUrl = await attachmentService.processAttachment(buf, 'file1.txt');
    expect(localUrl).to.equal('/uploads/file1.txt');

    attachmentService.setStrategy(cloudStrategy);
    const cloudUrl = await attachmentService.processAttachment(buf, 'file2.txt');
    expect(cloudUrl).to.equal('/cloud-storage/bucket-qa/file2.txt');
  });

  it('State: debe gestionar el ciclo de vida y rechazar transiciones inválidas', () => {
    const task = new TaskEntity('tsk-state-1');
    expect(task.getStatus()).to.equal('DRAFT');

    task.startWork();
    expect(task.getStatus()).to.equal('IN_PROGRESS');

    task.submitForReview();
    expect(task.getStatus()).to.equal('IN_REVIEW');

    task.approve();
    expect(task.getStatus()).to.equal('COMPLETED');

    // Transición inválida desde completado
    expect(() => task.startWork()).to.throw('Tarea completada no admite cambios.');
  });

  it('Template Method: debe generar reportes siguiendo el esqueleto algorítmico', async () => {
    const generator = new CsvReportGenerator();
    const buffer = await generator.generate('proj-100');
    const csvContent = buffer.toString('utf-8');
    expect(csvContent).to.include('ID,Proyecto,Tareas');
    expect(csvContent).to.include('Sistema PMS');
  });

  it('Command: debe ejecutar asignación y revertirla con undo', async () => {
    let currentAssigned = 'user-none';
    const fakeService = {
      assign: async (t: string, u: string) => { currentAssigned = u; },
      unassign: async (t: string) => { currentAssigned = 'unassigned'; }
    };

    const manager = new CommandManager();
    const cmd = new AssignUserCommand('t1', 'user-1', null, fakeService);

    await manager.run(cmd);
    expect(currentAssigned).to.equal('user-1');
    expect(manager.getHistoryLength()).to.equal(1);

    await manager.undoLast();
    expect(currentAssigned).to.equal('unassigned');
  });

  it('Pipeline (Modelo Cebolla): debe procesar middleware con entrada y retorno', async () => {
    const pipeline = new Pipeline();
    const trace: string[] = [];

    pipeline.use(async (ctx, next) => {
      trace.push('m1_in');
      await next();
      trace.push('m1_out');
    });

    pipeline.use(async (ctx, next) => {
      trace.push('m2_in');
      ctx.data = 'ok';
      await next();
      trace.push('m2_out');
    });

    const context = {};
    await pipeline.execute(context);
    expect(trace).to.deep.equal(['m1_in', 'm2_in', 'm2_out', 'm1_out']);
  });

  it('Async Iterators: debe procesar lotes paginados con for await', async () => {
    const items = await processPagedTasks();
    expect(items).to.have.lengthOf(6);
    expect(items[0]).to.equal('Tarea-1-1');
  });

  it('Integrated PMS Controller: debe ejecutar el flujo completo con respuesta 200', async () => {
    const controller = new IntegratedPmsController();
    const res = await controller.runDemo('tsk-999');
    expect(res.statusCode).to.equal(200);
    expect(res.body.newStatus).to.equal('IN_PROGRESS');
  });
});

describe('Capítulo 13: Principios SOLID y Arquitectura Limpia', () => {
  it('SRP: TaskValidator debe rechazar títulos menores a 3 caracteres', () => {
    expect(() => TaskValidator.validateTitle('ab')).to.throw('al menos 3 caracteres');
    expect(() => TaskValidator.validateTitle('Título válido')).to.not.throw();
  });

  it('OCP: debe calcular costos diferenciados sin modificar la clase de servicio', () => {
    const standardService = new TaskCostService(new StandardCostCalculator());
    const urgentService = new TaskCostService(new UrgentCostCalculator());

    const task = { estimatedHours: 10 };
    expect(standardService.processCost(task)).to.equal(500);
    expect(urgentService.processCost(task)).to.equal(750);
  });

  it('Clean Architecture: DomainTask debe validar invariantes de negocio', () => {
    expect(() => new DomainTask('id-1', 'AB', 'proj-1', 'user-1')).to.throw('al menos 3 caracteres');
    expect(() => new DomainTask('id-1', 'Título', '', 'user-1')).to.throw('proyecto válido');

    const validTask = new DomainTask('id-1', 'Diseño de Arquitectura', 'proj-1', 'user-1');
    expect(validTask.status).to.equal('PENDING');
    validTask.complete();
    expect(validTask.status).to.equal('COMPLETED');
  });

  it('Clean Architecture: CreateTaskUseCase debe desacoplarse del almacenamiento', async () => {
    const inMemoryRepo = new InMemoryCleanTaskRepository();
    const useCase = new CreateTaskUseCase(inMemoryRepo);

    const task = await useCase.execute({
      title: 'Crear Base de Datos',
      projectId: 'proj-101',
      assignedUserId: 'user-202'
    });

    expect(task.id).to.be.a('string');
    expect(task.title).to.equal('Crear Base de Datos');

    const persisted = await inMemoryRepo.findById(task.id);
    expect(persisted?.title).to.equal('Crear Base de Datos');
  });
});
