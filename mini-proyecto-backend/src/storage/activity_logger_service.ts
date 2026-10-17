// src/storage/activity_logger_service.ts - Servicio de Ingesta Masiva y Telemetría estilo LSM-Tree (Capítulo 14)

export interface TaskEventPayload {
  userId: string;
  action: string;
  timestamp: string;
}

export class ActivityLoggerService {
  // Simulación del comportamiento ordenado de Memtable / SSTable
  private orderedStorage = new Map<string, string>();

  constructor(private dbPath: string = './data/activity_log') {}

  /**
   * Escritura secuencial ultra rápida en Memtable y WAL con clave estructurada
   */
  public async logEvent(taskId: string, userId: string, action: string): Promise<string> {
    const timestamp = `${new Date().toISOString()}_${process.hrtime.bigint()}`;
    // Clave estructurada ordenada por tiempo para consultas eficientes por rango
    const key = `event:${taskId}:${timestamp}`;
    const value = JSON.stringify({ userId, action, timestamp });

    this.orderedStorage.set(key, value);
    console.log(`[LSM-Tree Log] Clave ordenada insertada: ${key}`);
    return key;
  }

  /**
   * Consulta por rango sobre el índice ordenado de claves (SSTable Range Scan)
   */
  public async getTaskHistory(taskId: string): Promise<TaskEventPayload[]> {
    const events: TaskEventPayload[] = [];
    const prefix = `event:${taskId}:`;

    // Filtra e itera sobre las claves ordenadas secuencialmente
    const sortedKeys = Array.from(this.orderedStorage.keys()).sort();
    for (const key of sortedKeys) {
      if (key.startsWith(prefix)) {
        const val = this.orderedStorage.get(key);
        if (val) {
          events.push(JSON.parse(val));
        }
      }
    }

    return events;
  }
}
