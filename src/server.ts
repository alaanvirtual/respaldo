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
import { DatabaseSingleton } from './infrastructure/persistence/DatabaseSingleton';
import { RedisSingleton } from './infrastructure/cache/RedisSingleton';

// 1. Inicialización de Clientes Singleton (Capítulo 11 - Patrones Creacionales)
const db = DatabaseSingleton.getInstance();
const redis = RedisSingleton.getInstance();
void db.connect();

// 2. Catálogo inicial de Perfumería Fina para demostración inmediata
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

// Usuarios iniciales para demostración y verificación de RBAC estricto
// Password para todos: 'Password123!' (hash bcrypt costo 10)
const demoPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'

const initialUsers: User[] = [
  User.create({
    id: 'usr_admin_01',
    fullname: 'Alan Peña (Administrador)',
    username: 'admin_alan',
    email: 'admin@blfragancias.com',
    passwordHash: demoPasswordHash,
    role: 'Administrador',
  }),
  User.create({
    id: 'usr_fraccionador_02',
    fullname: 'Operador de Envíos y Taller',
    username: 'fraccionador_01',
    email: 'fraccionador@blfragancias.com',
    passwordHash: demoPasswordHash,
    role: 'Operador de Envíos / Fraccionador',
  }),
  User.create({
    id: 'usr_cliente_03',
    fullname: 'Cliente Frecuente BL',
    username: 'cliente_vip',
    email: 'cliente@blfragancias.com',
    passwordHash: demoPasswordHash,
    role: 'Cliente',
  }),
];

// 3. Composición de Dependencias (Clean Architecture Composition Root)
const perfumeRepository = new InMemoryPerfumeRepository(initialCatalog);
const userRepository = new InMemoryUserRepository(initialUsers);

const app = createApp({
  perfumeRepository,
  userRepository,
});

// 4. Servidor HTTP y WebSockets para Notificaciones en Vivo
const server = http.createServer(app);
wsServer.init(server);

const PORT = parseInt(process.env.PORT || '3000', 10);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`[Bootstrap] Servidor iniciado en modo ${process.env.NODE_ENV || 'development'}`);
    logger.info(`[HTTP] Escuchando en http://localhost:${PORT}`);
    logger.info(`[API v1] Endpoints disponibles en http://localhost:${PORT}/api/v1`);
    logger.info(`[Docs] Swagger UI disponible en http://localhost:${PORT}/api/docs`);
    logger.info(`[WebSocket] Canal de notificaciones activo en ws://localhost:${PORT}/ws`);
  });
}

// 5. Manejo elegante de apagado (Graceful Shutdown)
const handleShutdown = async (signal: string) => {
  logger.info(`[Shutdown] Señal ${signal} recibida. Cerrando conexiones...`);
  await db.disconnect();
  await redis.disconnect();
  server.close(() => {
    logger.info('[Shutdown] Servidor finalizado ordenadamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
process.on('SIGINT', () => void handleShutdown('SIGINT'));

export { app, server };
