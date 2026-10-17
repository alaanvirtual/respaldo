// src/controllers/task_orchestrator.ts - Orquestador Integrador de Patrones (Capítulo 11)
import { StorageFactory } from '../factories/storage_factory';
import { createLoggingProxy } from '../proxies/logging_proxy';
import { TwilioSmsAdapter, ISmsNotifier } from '../adapters/twilio_sms_adapter';

export class TaskOrchestrator {
  private notifier: ISmsNotifier;

  constructor() {
    // Instanciación del adaptador de notificaciones
    this.notifier = new TwilioSmsAdapter('+15005550006');
  }

  public async processTaskAttachment(taskId: string, filePath: string, userPhone: string): Promise<{ fileUrl: string; notified: boolean }> {
    // 1. Uso de Factory para obtener el proveedor de almacenamiento según el entorno
    const storageType = (process.env.STORAGE_PROVIDER as 'local' | 's3') || 'local';
    const rawStorage = StorageFactory.createStorage(storageType);

    // 2. Aplicación de Proxy Estructural para medir rendimiento y auditar operaciones de I/O
    const storageService = createLoggingProxy(rawStorage, 'StorageService');

    // 3. Ejecución del almacenamiento
    const fileUrl = await storageService.uploadFile(filePath, `tasks/${taskId}/attachment.pdf`);
    console.log(`[TAREA ${taskId}] Archivo adjuntado exitosamente en: ${fileUrl}`);

    // 4. Notificación al usuario mediante el servicio adaptado
    const notified = await this.notifier.sendSms(userPhone, `Tu archivo para la tarea ${taskId} fue subido con éxito.`);
    if (notified) {
      console.log(`[NOTIFICACIÓN] SMS enviado a ${userPhone}`);
    }

    return { fileUrl, notified };
  }
}
