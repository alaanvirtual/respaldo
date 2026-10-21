// tests/unit/auth.test.ts - Pruebas Unitarias de AuthUtil (Capítulo 9)
import { expect } from 'chai';
import { AuthUtil } from '../../src/utils/auth_util';

describe('Pruebas unitarias: AuthUtil', () => {
  const mockPayload = { userId: 'usr-1234-uuid', role: 'SuperAdmin' };

  it('debe generar un token JWT válido y no nulo', () => {
    const token = AuthUtil.generateAccessToken(mockPayload);
    expect(token).to.be.a('string');
    expect(token.split('.')).to.have.lengthOf(3);
  });

  it('debe decodificar correctamente el payload de un token generado', () => {
    const token = AuthUtil.generateAccessToken(mockPayload);
    const decoded = AuthUtil.verifyToken(token);

    expect(decoded).to.have.property('userId', 'usr-1234-uuid');
    expect(decoded).to.have.property('role', 'SuperAdmin');
  });

  it('debe lanzar una excepción al verificar un token con firma alterada', () => {
    const token = AuthUtil.generateAccessToken(mockPayload);
    const tamperedToken = token + 'invalid';

    expect(() => {
      AuthUtil.verifyToken(tamperedToken);
    }).to.throw();
  });
});
