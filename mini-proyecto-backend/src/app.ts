// src/app.ts - Instancia de Express exportada para pruebas con Supertest y ejecución en servidor (Capítulo 9)
import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Routes } from './routes';
import { DatabaseUtil } from './utils/db';
import { CacheUtil } from './utils/cache_util';

export const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/ping', (req: Request, res: Response) => {
  res.send('pong');
});

// Inicializar base de datos y caché
new DatabaseUtil();
new CacheUtil();

// Conectar rutas centralizadas
new Routes(app);

export default app;
