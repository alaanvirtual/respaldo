import request from 'supertest';
import { createApp } from '../../src/presentation/app';
import { InMemoryPerfumeRepository } from '../../src/infrastructure/persistence/repositories/InMemoryPerfumeRepository';
import { Perfume } from '../../src/domain/entities/Perfume';

describe('Presentation Layer: Swagger UI & HATEOAS (Semana 09)', () => {
  const samplePerfume = Perfume.create({
    id: 'prf_test_swagger',
    name: 'Herod',
    brand: 'Parfums de Marly',
    concentration: 'EDP',
    sizeMl: 125,
    price: 6500,
    stock: 8,
  });

  const repository = new InMemoryPerfumeRepository([samplePerfume]);
  const app = createApp({ perfumeRepository: repository });

  it('GET /api/docs/swagger.json debe retornar la especificación OpenAPI 3.0.3 válida', async () => {
    const response = await request(app).get('/api/docs/swagger.json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi', '3.0.3');
    expect(response.body).toHaveProperty('info');
    expect(response.body.info.title).toContain('BL FRAGANCIAS API');
    expect(response.body.components.securitySchemes).toHaveProperty('BearerAuth');
    expect(response.body.paths).toHaveProperty('/perfumes');
    expect(response.body.paths).toHaveProperty('/users');
    expect(response.body.paths).toHaveProperty('/health');
  });

  it('GET /api/docs debe responder con el HTML de la consola Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });

  it('GET /api/perfumes debe incluir hipermedios HATEOAS (_links)', async () => {
    const response = await request(app).get('/api/perfumes');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_links');
    expect(response.body._links).toHaveProperty('self');
    expect(response.body._links).toHaveProperty('create');
    expect(response.body._links).toHaveProperty('docs');
  });

  it('GET /api/perfumes/:id debe incluir hipermedios HATEOAS de detalle y acciones', async () => {
    const response = await request(app).get('/api/perfumes/prf_test_swagger');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_links');
    expect(response.body._links).toHaveProperty('self');
    expect(response.body._links).toHaveProperty('deductStock');
    expect(response.body._links.deductStock.method).toBe('POST');
  });
});
