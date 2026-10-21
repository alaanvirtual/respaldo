// tests/unit/notification_stubs.test.ts - Pruebas aisladas con Stubs usando Sinon.js (Capítulo 9)
import sinon from 'sinon';
import { expect } from 'chai';
import { NotificationUtil } from '../../src/utils/notification_util';

describe('Pruebas aisladas con stubs: NotificationUtil', () => {
  let sendEmailStub: sinon.SinonStub;

  beforeEach(() => {
    sendEmailStub = sinon.stub(NotificationUtil, 'sendEmail').resolves(true);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('debe invocar el utilitario de correo con la dirección y asunto correctos sin enviar un email real', async () => {
    const result = await NotificationUtil.sendEmail(
      'dev@pms.com',
      'Implementación de API REST',
      '<p>Tarea Asignada</p>'
    );

    expect(result).to.equal(true);
    expect(sendEmailStub.calledOnce).to.be.true;
    expect(sendEmailStub.firstCall.args[0]).to.equal('dev@pms.com');
    expect(sendEmailStub.firstCall.args[1]).to.equal('Implementación de API REST');
  });
});
