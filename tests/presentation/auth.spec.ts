import request from 'supertest';
import { createApp } from '../../src/presentation/app';
import { InMemoryPerfumeRepository } from '../../src/infrastructure/persistence/repositories/InMemoryPerfumeRepository';
import { InMemoryUserRepository } from '../../src/infrastructure/persistence/repositories/InMemoryUserRepository';
import { User } from '../../src/domain/entities/User';
import { DatabaseSingleton } from '../../src/infrastructure/persistence/DatabaseSingleton';
import { RedisSingleton } from '../../src/infrastructure/cache/RedisSingleton';
import { Application } from 'express';

describe('Presentation Layer: Módulo de Autenticación JWT y RBAC (Entregable 1.1)', () => {
  let app: Application;
  let userRepository: InMemoryUserRepository;
  const demoHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'

  beforeEach(() => {
    const initialUsers = [
      User.create({
        id: 'usr_admin_test',
        fullname: 'Administrador General',
        username: 'admin_test',
        email: 'admin@test.com',
        passwordHash: demoHash,
        role: 'Administrador',
      }),
      User.create({
        id: 'usr_fracc_test',
        fullname: 'Operador Fraccionador',
        username: 'fraccionador_test',
        email: 'fraccionador@test.com',
        passwordHash: demoHash,
        role: 'Operador de Envíos / Fraccionador',
      }),
      User.create({
        id: 'usr_cliente_test',
        fullname: 'Cliente Frecuente',
        username: 'cliente_test',
        email: 'cliente@test.com',
        passwordHash: demoHash,
        role: 'Cliente',
      }),
    ];

    userRepository = new InMemoryUserRepository(initialUsers);
    const perfumeRepository = new InMemoryPerfumeRepository([]);
    app = createApp({ perfumeRepository, userRepository });
  });

  describe('Patrón Creacional Singleton (Capítulo 11)', () => {
    it('DatabaseSingleton debe garantizar una única instancia compartida', () => {
      const instance1 = DatabaseSingleton.getInstance();
      const instance2 = DatabaseSingleton.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1.getConfig().database).toBeDefined();
    });

    it('RedisSingleton debe garantizar una única instancia compartida', () => {
      const instance1 = RedisSingleton.getInstance();
      const instance2 = RedisSingleton.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1.getCacheService()).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('debe registrar un nuevo usuario con rol Cliente por defecto y retornar 201 y JWT', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullname: 'Nuevo Usuario Registrado',
          username: 'nuevo_usuario',
          email: 'nuevo@fragancias.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('nuevo@fragancias.com');
      expect(response.body.user.role).toBe('Cliente');
    });

    it('debe registrar un usuario con rol específico de la terna del sistema', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullname: 'Nuevo Operador Taller',
          username: 'taller_nuevo',
          email: 'taller@fragancias.com',
          password: 'Password123!',
          role: 'Operador de Envíos / Fraccionador',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('Operador de Envíos / Fraccionador');
    });

    it('debe rechazar registro con correo duplicado con status 409', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullname: 'Duplicado',
          username: 'otro_admin',
          email: 'admin@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('debe autenticar exitosamente con credenciales válidas y retornar 200 y token JWT', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('Administrador');
    });

    it('debe rechazar login con contraseña incorrecta retornando 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrong_password',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('debe rechazar login de usuario inexistente retornando 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'password',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/profile y Control RBAC', () => {
    it('debe permitir acceder al perfil con token Bearer válido', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'cliente@test.com', password: 'password' });

      const token = loginRes.body.token;

      const profileRes = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.user.email).toBe('cliente@test.com');
      expect(profileRes.body.user.role).toBe('Cliente');
    });

    it('debe rechazar acceso al perfil sin cabecera Authorization retornando 401', async () => {
      const response = await request(app).get('/api/v1/auth/profile');
      expect(response.status).toBe(401);
    });

    it('debe autorizar endpoint exclusivo de Administrador para rol Administrador (200)', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'password' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/v1/auth/admin-check')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Administrador');
    });

    it('debe denegar endpoint de Administrador con 403 Forbidden si el rol es Cliente', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'cliente@test.com', password: 'password' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/v1/auth/admin-check')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('debe autorizar endpoint de Fraccionador para rol Operador de Envíos / Fraccionador (200)', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'fraccionador@test.com', password: 'password' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/v1/auth/fraccionador-check')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
