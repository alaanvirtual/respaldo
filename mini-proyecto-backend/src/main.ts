// src/main.ts - Punto de entrada principal con soporte Cluster, Graceful Shutdown y Seeding (--init)
import 'reflect-metadata';
import cluster from 'cluster';
import os from 'os';
import { ExpressServer } from './express_server';
import { DDLUtil } from './utils/ddl_util';

// Si se ejecuta con la bandera --init, se realiza el sembrado de datos inicial y se finaliza el proceso
if (process.argv.includes('--init')) {
  console.log(`Proceso Maestro PID: ${process.pid}`);
  DDLUtil.initDefaultData()
    .then(() => {
      console.log('Inicialización completada.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error durante la inicialización:', err);
      process.exit(1);
    });
} else if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running. Forking for ${numCPUs} CPUs...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const server = new ExpressServer();

  process.on('uncaughtException', (error: Error) => {
    console.error(`Uncaught exception in worker process ${process.pid}:`, error);
    server.closeServer();
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing worker process...');
    server.closeServer();
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Closing worker process...');
    server.closeServer();
  });
}
