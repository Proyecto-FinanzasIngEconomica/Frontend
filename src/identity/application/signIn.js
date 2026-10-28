import { validateCredentials } from '../domain/credentials.js';

export function createSignIn(authRepository) {
  return async (credentials) => {
    const errors = validateCredentials(credentials);
    if (Object.keys(errors).length) return { ok: false, errors };
    const session = await authRepository.signIn({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    return { ok: true, session };
  };
}
