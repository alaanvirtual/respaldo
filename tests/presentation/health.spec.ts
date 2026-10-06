import request from 'supertest';
import { createApp } from '../../src/presentation/app';
import { InMemoryPerfumeRepository } from '../../src/infrastructure/persistence/repositories/InMemoryPerfumeRepository';

describe('Presentation Layer: Health Endpoint', () => {
  const repository = new InMemoryPerfumeRepository([]);
  const app = createApp({ perfumeRepository: repository });

  it('GET /api/health debe responder con status 200 y el objeto esperado', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('system', 'BL FRAGANCIAS API');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptimeSeconds');
  });

  it('GET /api/ruta-inexistente debe responder 404 estructurado', async () => {
    const response = await request(app).get('/api/ruta-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('statusCode', 404);
  });
});
