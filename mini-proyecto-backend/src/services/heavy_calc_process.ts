import { fork } from 'node:child_process';
import path from 'node:path';

// Escucha mensajes IPC si este script es ejecutado como proceso hijo
process.on('message', (data: { numero: number }) => {
  let resultado = 0;
  for (let i = 0; i < data.numero; i++) {
    resultado += Math.sqrt(i);
  }

  // Enviamos el resultado de vuelta al proceso padre por IPC
  if (process.send) {
    process.send({ resultado });
  }
});

/**
 * Función auxiliar para invocar el cómputo aislado en un proceso hijo secundario usando fork()
 */
export function executeHeavyCalculationInFork(numero: number): Promise<number> {
  return new Promise((resolve, reject) => {
    // Si estamos en entorno de desarrollo ts-node, usamos ts-node como ejecutor
    const isTs = __filename.endsWith('.ts');
    const child = fork(__filename, [], {
      execArgv: isTs ? ['-r', 'ts-node/register'] : []
    });

    child.on('message', (response: { resultado: number }) => {
      resolve(response.resultado);
      child.kill();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Proceso hijo finalizó con código de salida ${code}`));
      }
    });

    child.send({ numero });
  });
}
