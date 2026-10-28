import { createSignIn } from '../identity/application/signIn.js';
import { createRegisterAccount } from '../identity/application/registerAccount.js';
import { PendingRegistrationRepository } from '../identity/infrastructure/PendingRegistrationRepository.js';
import { HttpAuthRepository } from '../identity/infrastructure/HttpAuthRepository.js';
import { createHttpClient } from '../shared/infrastructure/http/createHttpClient.js';

const httpClient = createHttpClient({ baseUrl: import.meta.env.VITE_API_BASE_URL || '' });
const repository = new HttpAuthRepository({
  httpClient,
  enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  loginPath: import.meta.env.VITE_AUTH_LOGIN_PATH || '/api/v1/auth/login',
});

export const signIn = createSignIn(repository);
export const registerAccount = createRegisterAccount(new PendingRegistrationRepository());
