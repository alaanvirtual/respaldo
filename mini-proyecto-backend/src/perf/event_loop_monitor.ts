import { performance, EventLoopUtilization } from 'node:perf_hooks';

export interface ELUMeasurement {
  utilization: number;
  utilizationPercent: string;
  activeMs: number;
  idleMs: number;
}

export class EventLoopMonitor {
  private initialElu: EventLoopUtilization;

  constructor() {
    this.initialElu = performance.eventLoopUtilization();
  }

  /**
   * Reinicia el punto base de medición
   */
  public reset(): void {
    this.initialElu = performance.eventLoopUtilization();
  }

  /**
   * Mide el nivel de utilización del Event Loop (ELU) acumulado desde el inicio o última medición
   */
  public measure(): ELUMeasurement {
    const elu = performance.eventLoopUtilization(this.initialElu);
    return {
      utilization: elu.utilization,
      utilizationPercent: `${(elu.utilization * 100).toFixed(2)}%`,
      activeMs: elu.active,
      idleMs: elu.idle
    };
  }

  /**
   * Simula o diagnostica una operación intensiva en CPU midiendo su impacto en el Event Loop
   */
  public static benchmarkCpuTask(durationMs: number = 50): ELUMeasurement {
    const eluBefore = performance.eventLoopUtilization();
    const start = Date.now();
    // Bloqueo síncrono deliberado para diagnóstico
    while (Date.now() - start < durationMs) {
      Math.sqrt(Math.random());
    }
    const eluAfter = performance.eventLoopUtilization(eluBefore);
    return {
      utilization: eluAfter.utilization,
      utilizationPercent: `${(eluAfter.utilization * 100).toFixed(2)}%`,
      activeMs: eluAfter.active,
      idleMs: eluAfter.idle
    };
  }
}
