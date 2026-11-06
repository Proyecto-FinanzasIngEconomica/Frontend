import { createHttpClient } from '../shared/infrastructure/http/createHttpClient.js';

let accessToken;
export const api = createHttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  getAccessToken: () => accessToken,
  credentials: 'omit',
});

export async function signIn({ email, password }) {
  const username = email.trim();
  const errors = {};
  if (!username || username.length > 50) errors.email = 'Ingresa tu usuario.';
  if (!password) errors.password = 'Ingresa tu contraseña.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const result = await api.post('/api/v1/auth/login', { username, password });
  if (
    !result?.accessToken ||
    !result.user?.id ||
    !['SYSTEM_ADMIN', 'STORE_ADMIN', 'CLIENT'].includes(result.user.role)
  ) {
    throw new Error('El servidor devolvió una sesión inválida.');
  }
  accessToken = result.accessToken;
  return { ok: true, session: { user: result.user, expiresAt: result.expiresAt } };
}

export function signOut() {
  accessToken = undefined;
}
