import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalIdentityRepository } from '../src/identity/infrastructure/LocalIdentityRepository.js';
function setup() {
  const data = new Map([
    [
      'crediflow.local.users.v1',
      JSON.stringify([
        { id: 'one', fullName: 'Ana', email: 'ana@example.com', passwordHash: 'hash', salt: [1] },
        { id: 'two', phone: '999888777' },
      ]),
    ],
    ['crediflow.local.session.v1', JSON.stringify({ userId: 'one' })],
  ]);
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  return { repo: new LocalIdentityRepository({ storage }), storage };
}
test('actualiza contacto de la cuenta activa y persiste sin exponer secretos', () => {
  const { repo, storage } = setup();
  const profile = repo.updateContact({ phone: '+51 999 111 222', email: 'changed@example.com' });
  assert.equal(profile.phone, '+51 999 111 222');
  assert.equal(profile.email, 'ana@example.com');
  assert.equal(profile.passwordHash, undefined);
  assert.equal(new LocalIdentityRepository({ storage }).getSession().user.phone, profile.phone);
  assert.equal(JSON.parse(storage.getItem('crediflow.local.users.v1'))[1].phone, '999888777');
});
test('rechaza teléfonos inválidos y cambios sin sesión', () => {
  const { repo, storage } = setup();
  assert.throws(() => repo.updateContact({ phone: 'abcdefg' }));
  assert.throws(() => repo.updateContact({ phone: '123' }));
  storage.removeItem('crediflow.local.session.v1');
  assert.throws(() => repo.updateContact({ phone: '999111222' }));
});
