// src/workers/queue_worker.ts - Trabajador dedicado de colas en segundo plano (Capítulo 8)
import Queue from 'bull';
import { NotificationUtil } from '../utils/notification_util';

export class QueueWorker {
  private emailQueue: Queue.Queue;
  private static MAX_ATTEMPTS = 3;

  constructor() {
    this.emailQueue = NotificationUtil.getQueue();
    console.log('[OK] Inicializando QueueWorker...');
  }

  public beginProcessing(): void {
    // Definición del procesador de trabajos asíncronos fuera del hilo HTTP de Express
    this.emailQueue.process(async (job) => {
      try {
        const { to, subject, body } = job.data;
        const success = await NotificationUtil.sendEmail(to, subject, body);
        if (!success) {
          throw new Error(`Fallo en el transporte SMTP para destinatario: ${to}`);
        }
        console.log(`[OK] Correo enviado exitosamente a: ${to}`);
        return { success: true };
      } catch (error: any) {
        console.error(`[ERROR] Error procesando trabajo #${job.id}: ${error.message}`);
        throw error; // Re-lanzar para activar eventos de reintento de Bull
      }
    });

    // Escucha de eventos de fallo con gestión de reintentos
    this.emailQueue.on('failed', async (job, err) => {
      console.warn(`[WARN] Trabajo #${job.id} falló (${err.message}). Intento ${job.attemptsMade} de ${QueueWorker.MAX_ATTEMPTS}`);
      if (job.attemptsMade < QueueWorker.MAX_ATTEMPTS) {
        console.log(`[INFO] Reintentando trabajo #${job.id}...`);
        await job.retry();
      } else {
        console.error(`[CRITICAL] Trabajo #${job.id} superó el límite de reintentos. Movido a Dead-Letter.`);
      }
    });
  }
}

export class QueueWorkerWithFailures extends QueueWorker {}
