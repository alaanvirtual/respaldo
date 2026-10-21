// tests/integration/auth_and_projects.test.ts - Pruebas de Integración con Supertest (Capítulo 9)
import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../src/app';
import { AuthUtil } from '../../src/utils/auth_util';

describe('Pruebas de integración: Módulo de autenticación y Proyectos (/api/projects)', () => {
  let authToken: string;

  before(() => {
    authToken = AuthUtil.generateAccessToken({ userId: 'admin-uuid', role: 'SuperAdmin' });
  });

  it('debe rechazar la creación de proyectos si no se proporciona encabezado Authorization (401)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({
        name: 'Proyecto de prueba sin token',
        description: 'Descripción básica'
      });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('status', 'error');
  });

  it('debe responder 200 en endpoint de healthcheck /ping', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('pong');
  });

  it('debe retornar 400 cuando se envía payload inválido de login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'invalid-email',
        password: ''
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
  });
});
