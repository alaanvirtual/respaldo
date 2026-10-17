// src/proxies/logging_proxy.ts - Patrón Proxy Estructural para Auditoría y Métricas (Capítulo 11)
import { performance } from 'perf_hooks';

export function createLoggingProxy<T extends object>(target: T, serviceName: string): T {
  return new Proxy(target, {
    get(obj: T, prop: string | symbol, receiver: any) {
      const origMethod = Reflect.get(obj, prop, receiver);

      if (typeof origMethod === 'function') {
        return async function (...args: any[]) {
          const start = performance.now();
          console.log(`[AUDITORÍA] Iniciando método ${serviceName}.${String(prop)} con argumentos:`, JSON.stringify(args));

          try {
            const result = await origMethod.apply(obj, args);
            const duration = (performance.now() - start).toFixed(2);
            console.log(`[METRICAS] Método ${serviceName}.${String(prop)} completado en ${duration} ms`);
            return result;
          } catch (error: any) {
            const duration = (performance.now() - start).toFixed(2);
            console.error(`[ERROR] Método ${serviceName}.${String(prop)} falló en ${duration} ms. Causa: ${error.message}`);
            throw error;
          }
        };
      }

      return origMethod;
    }
  });
}
