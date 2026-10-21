// src/event_loop_demo.ts - Demostración del orden de ejecución del Event Loop (Capítulo 18)
console.log('1. Inicio síncrono');

setTimeout(() => {
  console.log('4. Macrotarea: setTimeout (Fase Timers)');
}, 0);

setImmediate(() => {
  console.log('5. Macrotarea: setImmediate (Fase Check)');
});

Promise.resolve().then(() => {
  console.log('3. Microtarea: Promise.then');
});

process.nextTick(() => {
  console.log('2. Microtarea prioritaria: process.nextTick');
});

console.log('6. Fin síncrono');
