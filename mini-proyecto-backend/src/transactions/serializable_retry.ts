// src/transactions/serializable_retry.ts - Manejo defensivo de reintentos ante fallos de serialización (Capítulo 15)

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
}

/**
 * Envoltorio genérico para ejecutar transacciones con reintento automático
 * ante errores de serialización de PostgreSQL (código SQL 40001 / could not serialize access).
 */
export async function executeSerializableTransaction<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, initialDelayMs: 100 }
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      attempt++;
      return await operation();
    } catch (error: any) {
      // Código de error 40001: serialization_failure en PostgreSQL
      const isSerializationFailure =
        error?.code === '40001' ||
        error?.message?.includes('could not serialize access') ||
        error?.message?.includes('serialization failure');

      if (isSerializationFailure && attempt <= options.maxRetries) {
        // Cálculo de retraso con Exponential Backoff y Jitter aleatorio
        const backoffDelay = options.initialDelayMs * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 50);
        const totalDelay = backoffDelay + jitter;

        console.warn(
          `[RETRY_WARN] Transacción abortada por conflicto de serialización (Intento ${attempt}/${options.maxRetries}). Reintentando en ${totalDelay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, totalDelay));
        continue;
      }

      // Si no es un error de serialización o se agotaron los reintentos, re-lanzar la excepción
      throw error;
    }
  }
}
