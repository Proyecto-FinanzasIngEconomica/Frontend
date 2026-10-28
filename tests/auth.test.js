import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignIn } from '../src/identity/application/signIn.js';
import { HttpAuthRepository } from '../src/identity/infrastructure/HttpAuthRepository.js';
import { createHttpClient } from '../src/shared/infrastructure/http/createHttpClient.js';

test('las credenciales vacías no llegan al repositorio', async () => {
  const signIn = createSignIn({ signIn: () => assert.fail('No debe enviar datos inválidos') });
  const result = await signIn({ email: '  ', password: '' });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors), ['email', 'password']);
});

test('normaliza el correo sin modificar la contraseña', async () => {
  const signIn = createSignIn({
    signIn: async (credentials) => {
      assert.deepEqual(credentials, { email: 'juan@example.com', password: ' pass ' });
      return { user: { id: 1 } };
    },
  });
  assert.equal((await signIn({ email: ' JUAN@example.com ', password: ' pass ' })).ok, true);
});

test('la integración deshabilitada no envía credenciales', async () => {
  const repository = new HttpAuthRepository({
    httpClient: { post: () => assert.fail('API pendiente') },
  });
  await assert.rejects(repository.signIn({}), /no se ha enviado/);
});

test('rechaza sesiones incompletas y roles desconocidos', async () => {
  for (const user of [
    { id: 1, role: 'ROOT' },
    { id: 1, role: 'CLIENTE' },
  ]) {
    const repository = new HttpAuthRepository({
      enabled: true,
      httpClient: { post: async () => ({ user }) },
    });
    await assert.rejects(repository.signIn({}), /sesión inválida/);
  }
});

test('envía el contrato propuesto y acepta una sesión de tienda válida', async () => {
  const client = createHttpClient({
    baseUrl: 'http://localhost:8080/',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'http://localhost:8080/api/v1/auth/login');
      assert.equal(options.credentials, 'include');
      assert.deepEqual(JSON.parse(options.body), { email: 'juan@example.com', password: 'clave' });
      return new Response(JSON.stringify({ user: { id: 1, role: 'ADMIN_TIENDA', storeId: 2 } }));
    },
  });
  const repository = new HttpAuthRepository({ enabled: true, httpClient: client });
  assert.equal(
    (await repository.signIn({ email: 'juan@example.com', password: 'clave' })).user.storeId,
    2,
  );
});

test('transforma el rechazo de credenciales y los errores de red', async () => {
  const rejected = createHttpClient({ fetchImpl: async () => new Response('{}', { status: 401 }) });
  await assert.rejects(
    rejected.post('/login', {}),
    (error) => error.status === 401 && /no son correctos/.test(error.message),
  );
  const offline = createHttpClient({
    fetchImpl: async () => {
      throw new TypeError('Failed to fetch');
    },
  });
  await assert.rejects(offline.post('/login', {}), /No pudimos conectarnos/);
});
