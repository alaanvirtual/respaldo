import { DomainEvent } from './stream_processor';

export interface WindowResult {
  windowStart: Date;
  windowEnd: Date;
  eventCount: number;
  events: DomainEvent[];
}

export class WindowedStreamAnalytics {
  /**
   * Ventana Fija (Tumbling Window):
   * Divide el flujo en ventanas temporales de longitud fija y completamente disjuntas.
   * Por ejemplo, si windowSizeMs = 60000 (1 minuto), agrupa de 10:00 a 10:01, 10:01 a 10:02, etc.
   */
  public static computeTumblingWindows(
    events: DomainEvent[],
    windowSizeMs: number
  ): WindowResult[] {
    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const startTime = sorted[0].timestamp.getTime();
    const endTime = sorted[sorted.length - 1].timestamp.getTime();

    const results: WindowResult[] = [];
    for (let currentStart = startTime; currentStart <= endTime; currentStart += windowSizeMs) {
      const currentEnd = currentStart + windowSizeMs;
      const windowEvents = sorted.filter((e) => {
        const t = e.timestamp.getTime();
        return t >= currentStart && t < currentEnd;
      });

      results.push({
        windowStart: new Date(currentStart),
        windowEnd: new Date(currentEnd),
        eventCount: windowEvents.length,
        events: windowEvents
      });
    }

    return results;
  }

  /**
   * Ventana Deslizante (Sliding Window):
   * Ventana de tamaño fijo que avanza en intervalos regulares (slideStepMs).
   * Genera ventanas que pueden solaparse.
   */
  public static computeSlidingWindows(
    events: DomainEvent[],
    windowSizeMs: number,
    slideStepMs: number
  ): WindowResult[] {
    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const startTime = sorted[0].timestamp.getTime();
    const endTime = sorted[sorted.length - 1].timestamp.getTime();

    const results: WindowResult[] = [];
    for (let currentStart = startTime; currentStart <= endTime; currentStart += slideStepMs) {
      const currentEnd = currentStart + windowSizeMs;
      const windowEvents = sorted.filter((e) => {
        const t = e.timestamp.getTime();
        return t >= currentStart && t < currentEnd;
      });

      results.push({
        windowStart: new Date(currentStart),
        windowEnd: new Date(currentEnd),
        eventCount: windowEvents.length,
        events: windowEvents
      });
    }

    return results;
  }
}
