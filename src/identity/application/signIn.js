import { validateCredentials } from '../domain/credentials.js';

export function createSignIn(authRepository) {
  return async (credentials) => {
    const errors = validateCredentials(credentials);
    if (Object.keys(errors).length) return { ok: false, errors };
    const session = await authRepository.signIn({
      username: credentials.username.trim(),
      password: credentials.password,
    });
    return { ok: true, session };
  };
}
