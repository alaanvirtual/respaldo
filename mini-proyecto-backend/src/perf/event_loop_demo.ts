/**
 * Demostración del orden de ejecución de microtareas y macrotareas en Node.js
 * Capítulo 18: Fases detalladas del event loop y microtareas
 */
export async function runEventLoopSequenceDemo(): Promise<string[]> {
  const executionLog: string[] = [];

  return new Promise((resolve) => {
    executionLog.push('1. Inicio síncrono');

    // Macrotarea: Fase de Timers
    setTimeout(() => {
      executionLog.push('4. Macrotarea: setTimeout (Fase Timers)');
      // Resolver después de completar la fase Check
      setImmediate(() => {
        resolve(executionLog);
      });
    }, 0);

    // Macrotarea: Fase Check
    setImmediate(() => {
      executionLog.push('5. Macrotarea: setImmediate (Fase Check)');
    });

    // Microtarea: Cola de Promesas
    Promise.resolve().then(() => {
      executionLog.push('3. Microtarea: Promise.then');
    });

    // Microtarea prioritaria: Cola de nextTick
    process.nextTick(() => {
      executionLog.push('2. Microtarea prioritaria: process.nextTick');
    });

    executionLog.push('6. Fin síncrono');
  });
}

// Si se ejecuta directamente
if (require.main === module) {
  runEventLoopSequenceDemo().then((log) => {
    log.forEach((entry) => console.log(entry));
  });
}
