// src/express_server.ts - Servidor Express integrado con Caché (Redis) y Colas (Bull)
import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { IServerConfig } from './utils/config';
import config from '../server_config.json';
import { Routes } from './routes';
import { DatabaseUtil } from './utils/db';
import { CacheUtil } from './utils/cache_util';
import { QueueWorker } from './workers/queue_worker';
import { UsersUtil } from './utils/users_util';

export class ExpressServer {
  public static server: any = null;
  public server_config: IServerConfig = config;

  constructor() {
    const port = this.server_config.port ?? 3000;
    const app: Express = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/ping', (req: Request, res: Response) => {
      res.send('pong');
    });

    // Conectar rutas centralizadas
    const routes = new Routes(app);
    if (routes) {
      console.log('Server Routes started for server');
    }

    // Inicializar base de datos
    new DatabaseUtil();

    // Inicializar cliente de almacenamiento en caché Redis (Capítulo 7)
    new CacheUtil();

    // Inicializar procesador de colas en segundo plano Bull (Capítulo 8)
    const queueWorker = new QueueWorker();
    queueWorker.beginProcessing();

    // Precarga diferida de usuarios en caché (Cache Warm-up - Capítulo 7)
    setTimeout(() => {
      UsersUtil.putAllUsersInCache();
    }, 5000);

    ExpressServer.server = app.listen(port, () => {
      console.log(`Server is running on port ${port} with pid = ${process.pid}`);
    });
  }

  public closeServer(): void {
    if (ExpressServer.server) {
      ExpressServer.server.close(() => {
        console.log('Server closed gracefully');
        process.exit(0);
      });
    }
  }
}
