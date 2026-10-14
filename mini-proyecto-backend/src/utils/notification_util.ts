// src/utils/notification_util.ts - Módulo de Notificaciones y Encolamiento (Capítulo 8)
import * as nodemailer from 'nodemailer';
import Queue from 'bull';

export class NotificationUtil {
  private static transporter: nodemailer.Transporter | null = null;
  private static emailQueue: Queue.Queue | null = null;
  public static isQueueAvailable = false;

  public static getTransporter(): nodemailer.Transporter {
    if (!NotificationUtil.transporter) {
      NotificationUtil.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'pms-notifications@ethereal.email',
          pass: process.env.SMTP_PASS || 'secretpass'
        }
      });
    }
    return NotificationUtil.transporter;
  }

  public static getQueue(): Queue.Queue {
    if (!NotificationUtil.emailQueue) {
      const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      NotificationUtil.emailQueue = new Queue('emailQueue', redisUrl, {
        redis: {
          maxRetriesPerRequest: 1,
          connectTimeout: 800,
          enableOfflineQueue: false
        },
        settings: {
          maxStalledCount: 2
        }
      });

      NotificationUtil.emailQueue.on('error', () => {
        NotificationUtil.isQueueAvailable = false;
      });

      NotificationUtil.emailQueue.on('ready', () => {
        NotificationUtil.isQueueAvailable = true;
        console.log('[OK Bull] Cola emailQueue conectada a Redis');
      });
    }
    return NotificationUtil.emailQueue;
  }

  /**
   * Encolamiento asíncrono no bloqueante mediante Bull y Redis
   */
  public static async enqueueEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const queue = NotificationUtil.getQueue();
      // Encolar con reintentos exponenciales y persistencia garantizada
      await queue.add(
        { to, subject, body },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true
        }
      );
      console.log(`[QUEUE ENQUEUED] Correo encolado exitosamente para: ${to}`);
    } catch (err: any) {
      // Si Redis no está disponible, enviamos directamente como fallback para no perder la notificación
      console.log(`[WARN Queue] Fallback de envío directo para ${to} (Redis offline)`);
      await NotificationUtil.sendEmail(to, subject, body);
    }
  }

  /**
   * Envío directo para acciones críticas (ej. Forgot Password)
   */
  public static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const transporter = NotificationUtil.getTransporter();
      console.log(`[EMAIL DISPATCH] Enviando notificación a: ${to} | Asunto: ${subject}`);

      // Si no hay un servidor SMTP real configurado en variables de entorno, simulamos en desarrollo
      if (!process.env.SMTP_HOST) {
        console.log(`[EMAIL SIMULATED]: ${subject} enviado a ${to}`);
        return true;
      }

      const mailOptions = {
        from: '"Sistema PMS" <no-reply@pms.com>',
        to,
        subject,
        html: body
      };

      const status = await transporter.sendMail(mailOptions);
      return !!status.messageId;
    } catch (error: any) {
      console.error(`[ERROR] Fallo al enviar email => ${error.message}`);
      return false;
    }
  }
}
