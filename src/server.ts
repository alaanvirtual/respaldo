import http from 'http';
import dotenv from 'dotenv';

// Cargar variables de entorno antes de cualquier inicialización
dotenv.config();

import { createApp } from './presentation/app';
import { wsServer } from './presentation/websockets/WebSocketServer';
import { InMemoryPerfumeRepository } from './infrastructure/persistence/repositories/InMemoryPerfumeRepository';
import { InMemoryUserRepository } from './infrastructure/persistence/repositories/InMemoryUserRepository';
import { Perfume } from './domain/entities/Perfume';
import { User } from './domain/entities/User';
import { logger } from './infrastructure/logging/logger';

// 1. Catálogo inicial de Perfumería Fina para demostración inmediata
const initialCatalog: Perfume[] = [
  Perfume.create({
    id: 'perf_bleu_chanel_01',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    concentration: 'EDP',
    sizeMl: 100,
    price: 3650.0,
    stock: 15,
  }),
  Perfume.create({
    id: 'perf_sauvage_elixir_02',
    name: 'Sauvage Elixir',
    brand: 'Dior',
    concentration: 'Parfum',
    sizeMl: 60,
    price: 4200.0,
    stock: 8,
  }),
  Perfume.create({
    id: 'perf_aventus_creed_03',
    name: 'Aventus',
    brand: 'Creed',
    concentration: 'Extrait',
    sizeMl: 100,
    price: 8900.0,
    stock: 4,
  }),
  Perfume.create({
    id: 'perf_oud_wood_tf_04',
    name: 'Oud Wood',
    brand: 'Tom Ford',
    concentration: 'EDP',
    sizeMl: 50,
    price: 5400.0,
    stock: 6,
  }),
];

// Usuarios iniciales para demostración inmediata
const initialUsers: User[] = [
  User.create({
    id: 'usr_admin_01',
    fullname: 'Alan Peña',
    username: 'alanmasterpro',
    email: 'alanmasterpro25@gmail.com',
    passwordHash: '$2a$10$wE99qW4z6h3z87k2NqM9fe3y4z0kL5p91y8Q5k1z3k7m8n9p0q1r2',
    role: 'Admin',
  }),
  User.create({
    id: 'usr_customer_02',
    fullname: 'Cliente Frecuente BL',
    username: 'cliente_vip',
    email: 'cliente@blfragancias.com',
    passwordHash: '$2a$10$wE99qW4z6h3z87k2NqM9fe3y4z0kL5p91y8Q5k1z3k7m8n9p0q1r2',
    role: 'Customer',
  }),
];

// 2. Composición de Dependencias (Clean Architecture Composition Root)
const perfumeRepository = new InMemoryPerfumeRepository(initialCatalog);
const userRepository = new InMemoryUserRepository(initialUsers);

const app = createApp({
  perfumeRepository,
  userRepository,
});

// 3. Servidor HTTP y WebSockets para Notificaciones en Vivo
const server = http.createServer(app);
wsServer.init(server);

const PORT = parseInt(process.env.PORT || '3000', 10);

server.listen(PORT, () => {
  logger.info(`[Bootstrap] Servidor iniciado en modo ${process.env.NODE_ENV || 'development'}`);
  logger.info(`[HTTP] Escuchando en http://localhost:${PORT}`);
  logger.info(`[Docs] Swagger UI disponible en http://localhost:${PORT}/api/docs`);
  logger.info(`[WebSocket] Canal de notificaciones activo en ws://localhost:${PORT}/ws`);
});

// 4. Manejo elegante de apagado (Graceful Shutdown)
const handleShutdown = (signal: string) => {
  logger.info(`[Shutdown] Señal ${signal} recibida. Cerrando conexiones...`);
  server.close(() => {
    logger.info('[Shutdown] Servidor finalizado ordenadamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, server };
