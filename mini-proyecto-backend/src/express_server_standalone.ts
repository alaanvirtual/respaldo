// src/express_server_standalone.ts - Servidor en proceso único (ideal para desarrollo y pruebas directas)
import 'reflect-metadata';
import { ExpressServer } from './express_server';

const server = new ExpressServer();

process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing server...');
  server.closeServer();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing server...');
  server.closeServer();
});
