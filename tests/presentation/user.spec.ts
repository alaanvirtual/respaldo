import request from 'supertest';
import { createApp } from '../../src/presentation/app';
import { InMemoryPerfumeRepository } from '../../src/infrastructure/persistence/repositories/InMemoryPerfumeRepository';
import { InMemoryUserRepository } from '../../src/infrastructure/persistence/repositories/InMemoryUserRepository';

describe('Presentation Layer: User Endpoints (CRUD)', () => {
  const perfumeRepo = new InMemoryPerfumeRepository([]);
  const userRepo = new InMemoryUserRepository([]);
  const app = createApp({ perfumeRepository: perfumeRepo, userRepository: userRepo });

  let createdUserId: string;

  it('POST /api/users debe crear un nuevo usuario exitosamente con status 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        fullname: 'Alan Peña',
        username: 'alanp',
        email: 'alan@blfragancias.com',
        password: 'passwordSeguro123',
        role: 'Admin',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.email).toBe('alan@blfragancias.com');
    expect(response.body.data).not.toHaveProperty('passwordHash');

    createdUserId = response.body.data.id;
  });

  it('POST /api/users debe retornar 400 si faltan campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        fullname: 'Incompleto',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('details');
  });

  it('GET /api/users debe listar los usuarios existentes con status 200', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.results).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/users/:id debe retornar el detalle del usuario con status 200', async () => {
    const response = await request(app).get(`/api/users/${createdUserId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdUserId);
    expect(response.body.data.username).toBe('alanp');
  });

  it('PUT /api/users/:id debe actualizar los datos del usuario con status 200', async () => {
    const response = await request(app)
      .put(`/api/users/${createdUserId}`)
      .send({
        fullname: 'Alan Peña Modificado',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.fullname).toBe('Alan Peña Modificado');
  });
});
