import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegisterAccount } from '../src/identity/application/registerAccount.js';
import { PendingRegistrationRepository } from '../src/identity/infrastructure/PendingRegistrationRepository.js';

const valid = {
  accountType: 'CLIENT',
  fullName: ' Juan Pérez ',
  username: 'juan.perez',
  email: 'juan@example.com',
  password: 'clave-ejemplo',
  confirmPassword: 'clave-ejemplo',
  storeCode: 'TIENDA-1234',
  businessName: '',
  ruc: '',
};

test('cliente: envía solo los campos de su perfil, sin confirmación ni rol privilegiado', async () => {
  const register = createRegisterAccount({
    register: async (data) => {
      assert.equal(data.fullName, 'Juan Pérez');
      assert.equal(data.storeCode, 'TIENDA-1234');
      for (const key of ['businessName', 'ruc', 'confirmPassword', 'role'])
        assert.equal(key in data, false);
    },
  });
  assert.equal((await register(valid)).ok, true);
});
test('vendedor: requiere negocio y RUC, y omite la vinculación de cliente', async () => {
  let sent;
  const register = createRegisterAccount({
    register: async (data) => {
      sent = data;
    },
  });
  const missing = await register({ ...valid, accountType: 'SELLER' });
  assert.ok(missing.errors.businessName);
  assert.ok(missing.errors.ruc);
  assert.equal(sent, undefined);
  await register({
    ...valid,
    accountType: 'SELLER',
    businessName: 'Mi bodega',
    ruc: '20123456789',
  });
  assert.equal(sent.businessName, 'Mi bodega');
  assert.equal('storeCode' in sent, false);
});
test('contraseñas distintas, perfil desconocido y código vacío impiden registrar', async () => {
  const register = createRegisterAccount({
    register: async () => assert.fail('No enviar datos inválidos'),
  });
  const result = await register({ ...valid, accountType: 'ADMIN', confirmPassword: 'otra' });
  assert.ok(result.errors.accountType);
  assert.ok(result.errors.confirmPassword);
  assert.ok((await register({ ...valid, storeCode: '' })).errors.storeCode);
});
test('sin API de registro no se crea una cuenta ficticia', async () => {
  const register = createRegisterAccount(new PendingRegistrationRepository());
  await assert.rejects(register(valid), /no se ha creado/);
});
