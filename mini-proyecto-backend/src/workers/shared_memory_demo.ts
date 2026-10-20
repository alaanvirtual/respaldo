import { Worker, isMainThread, workerData } from 'node:worker_threads';

if (!isMainThread) {
  // Código ejecutado dentro del Worker Thread
  const typedArray = new Int32Array(workerData.buffer);

  // Incrementamos el valor de forma atómica e hilo-segura
  Atomics.add(typedArray, 0, workerData.addValue ?? 50);
  process.exit(0);
}

/**
 * Demostración de sincronización de memoria compartida con SharedArrayBuffer y Atomics
 */
export function executeSharedMemoryDemo(initialValue: number = 100, addValue: number = 50): Promise<number> {
  return new Promise((resolve, reject) => {
    // Creamos un búfer compartido de 4 bytes (1 entero de 32 bits)
    const sharedBuffer = new SharedArrayBuffer(4);
    const typedArray = new Int32Array(sharedBuffer);

    typedArray[0] = initialValue; // Valor inicial

    const isTs = __filename.endsWith('.ts');
    const worker = new Worker(__filename, {
      workerData: { buffer: sharedBuffer, addValue },
      execArgv: isTs ? ['-r', 'ts-node/register'] : []
    });

    worker.on('exit', (code) => {
      if (code === 0) {
        resolve(typedArray[0]);
      } else {
        reject(new Error(`Worker finalizó con código ${code}`));
      }
    });

    worker.on('error', (err) => {
      reject(err);
    });
  });
}
