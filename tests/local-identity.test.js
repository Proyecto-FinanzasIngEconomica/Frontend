import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalIdentityRepository } from '../src/identity/infrastructure/LocalIdentityRepository.js';
import { PRIVACY_POLICY_VERSION } from '../src/identity/domain/privacyPolicy.js';

function setup() {
  const records = new Map();
  const storage = {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
    removeItem: (key) => records.delete(key),
  };
  return { repository: new LocalIdentityRepository({ storage }), storage, records };
}
const profile = {
  accountType: 'CLIENT',
  fullName: 'Cuenta de prueba',
  email: 'PRUEBA@example.com',
  password: 'solo-pruebas-123',
  documentType: 'DNI',
  documentNumber: '00000001',
  dataConsent: { accepted: true, policyVersion: PRIVACY_POLICY_VERSION },
};

test('registro y acceso persisten sin guardar contraseñas en texto plano', async () => {
  const { repository, storage, records } = setup();
  await repository.register(profile);
  assert.equal([...records.values()].join('').includes(profile.password), false);
  const session = await repository.signIn({
    email: 'prueba@example.com',
    password: profile.password,
  });
  assert.equal(session.user.email, 'prueba@example.com');
  assert.equal('passwordHash' in session.user, false);
  assert.equal('salt' in session.user, false);
  assert.equal(new LocalIdentityRepository({ storage }).getSession().user.id, session.user.id);
  repository.signOut();
  assert.equal(repository.getSession(), null);
  assert.deepEqual(
    repository.getActivity(session.user.id).map((entry) => entry.action),
    ['LOGOUT', 'LOGIN'],
  );
});
test('guarda fecha y versión de consentimiento para ambos perfiles y las recupera al iniciar sesión', async () => {
  for (const accountType of ['CLIENT', 'SELLER']) {
    const { storage } = setup();
    const now = () => '2026-10-28T20:00:00.000Z';
    const repository = new LocalIdentityRepository({ storage, now });
    await repository.register({
      ...profile,
      accountType,
      dataConsent: { ...profile.dataConsent, acceptedAt: 'fecha-falsa' },
    });
    const session = await repository.signIn({ email: profile.email, password: profile.password });
    assert.deepEqual(session.user.dataConsent, {
      accepted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: now(),
    });
    assert.deepEqual(
      new LocalIdentityRepository({ storage }).getSession().user.dataConsent,
      session.user.dataConsent,
    );
  }
});
test('el repositorio también rechaza registros sin consentimiento o con versión antigua', async () => {
  const { repository, storage } = setup();
  for (const dataConsent of [
    undefined,
    { accepted: false, policyVersion: PRIVACY_POLICY_VERSION },
    { accepted: true, policyVersion: 'antigua' },
  ]) {
    await assert.rejects(
      repository.register({ ...profile, dataConsent }),
      /política de privacidad/,
    );
  }
  assert.equal(storage.getItem('crediflow.local.users.v1'), null);
});

test('rechaza credenciales incorrectas, correo repetido y DNI repetido', async () => {
  const { repository } = setup();
  await repository.register(profile);
  await assert.rejects(
    repository.signIn({ email: profile.email, password: 'incorrecta' }),
    /no son correctos/,
  );
  assert.equal(repository.getSession(), null);
  await assert.rejects(repository.register(profile), /correo/);
  await assert.rejects(repository.register({ ...profile, email: 'otra@example.com' }), /DNI/);
});

test('las tiendas muestran solo datos de negocio y la actividad se filtra por cuenta', async () => {
  const { repository } = setup();
  const seller = await repository.register({
    ...profile,
    accountType: 'SELLER',
    businessName: 'Tienda de prueba',
    ruc: '20000000001',
  });
  const customer = await repository.register({
    ...profile,
    email: 'cliente@example.com',
    documentNumber: '00000002',
  });
  await repository.signIn({ email: profile.email, password: profile.password });
  assert.deepEqual(repository.listStores(), [{ id: seller.id, name: 'Tienda de prueba' }]);
  assert.equal(repository.getActivity(customer.id).length, 0);
});
