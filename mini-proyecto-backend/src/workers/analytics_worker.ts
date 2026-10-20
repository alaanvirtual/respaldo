import { parentPort } from 'node:worker_threads';

if (parentPort) {
  parentPort.on('message', (taskData: { projectId: string; sampleSize?: number }) => {
    const sampleSize = taskData.sampleSize ?? 100000;
    let sum = 0;
    let sumSquares = 0;

    // Cómputo CPU intensivo simulado para análisis estadístico de tareas y métricas de proyecto
    for (let i = 0; i < sampleSize; i++) {
      const val = Math.sqrt(i) * 1.5;
      sum += val;
      sumSquares += val * val;
    }

    const mean = sum / sampleSize;
    const variance = sumSquares / sampleSize - mean * mean;

    const result = {
      projectId: taskData.projectId,
      sampleSize,
      calculatedMean: Number(mean.toFixed(4)),
      calculatedVariance: Number(variance.toFixed(4)),
      processedAt: new Date().toISOString()
    };

    parentPort!.postMessage(result);
  });
}
