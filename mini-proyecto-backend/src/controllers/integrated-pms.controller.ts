// src/controllers/integrated-pms.controller.ts - Caso práctico integrado de patrones de comportamiento (Capítulo 12)
import { Pipeline, Context } from '../core/middleware-pipeline';
import { TaskEntity } from '../domain/task-state.entity';
import { CloudStorageStrategy, AttachmentService } from '../strategies/storage.strategy';

export class IntegratedPmsController {
  private pipeline: Pipeline;

  constructor() {
    this.pipeline = new Pipeline();
    this.setupPipeline();
  }

  private setupPipeline(): void {
    // Middleware 1: Validación de sesión
    this.pipeline.use(async (ctx: Context, next) => {
      console.log('[Session Middleware] Validando sesión de usuario...');
      ctx.user = { id: 'usr-100', role: 'Developer' };
      await next();
    });

    // Middleware 2: Logger con Modelo de Cebolla (tiempo de procesamiento)
    this.pipeline.use(async (ctx: Context, next) => {
      const start = Date.now();
      await next();
      console.log(`[Logger Middleware] Petición ${ctx.path} procesada en ${Date.now() - start}ms`);
    });

    // Middleware 3: Lógica de negocio (State + Strategy)
    this.pipeline.use(async (ctx: Context) => {
      console.log('[Controller] Ejecutando cambio de estado en la tarea...');
      const task = new TaskEntity(ctx.taskId);
      task.startWork();

      let fileUrl = null;
      if (ctx.file) {
        const storage = new AttachmentService(new CloudStorageStrategy('pms-bucket'));
        fileUrl = await storage.processAttachment(ctx.file.buffer, ctx.file.name);
        console.log(`[Controller] Archivo adjunto guardado en: ${fileUrl}`);
      }

      ctx.response = {
        statusCode: 200,
        body: {
          taskId: task.getTaskId(),
          newStatus: task.getStatus(),
          fileUrl
        }
      };
    });
  }

  public async runDemo(taskId = 'tsk-101'): Promise<any> {
    const ctx: Context = {
      path: `/tasks/${taskId}/start`,
      taskId: taskId,
      file: { buffer: Buffer.from('PDF_DATA'), name: 'doc.pdf' }
    };
    await this.pipeline.execute(ctx);
    console.log('[PMS Response]', ctx.response);
    return ctx.response;
  }
}
