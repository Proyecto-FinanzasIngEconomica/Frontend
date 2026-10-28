import { createSignIn } from '../identity/application/signIn.js';
import { createRegisterAccount } from '../identity/application/registerAccount.js';
import { PendingRegistrationRepository } from '../identity/infrastructure/PendingRegistrationRepository.js';
import { HttpAuthRepository } from '../identity/infrastructure/HttpAuthRepository.js';
import { createHttpClient } from '../shared/infrastructure/http/createHttpClient.js';
import { LocalIdentityRepository } from '../identity/infrastructure/LocalIdentityRepository.js';

const httpClient = createHttpClient({ baseUrl: import.meta.env.VITE_API_BASE_URL || '' });
const httpRepository = new HttpAuthRepository({
  httpClient,
  enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  loginPath: import.meta.env.VITE_AUTH_LOGIN_PATH || '/api/v1/auth/login',
});

export const localMode = (import.meta.env.VITE_IDENTITY_PROVIDER || 'local') === 'local';
const localRepository = new LocalIdentityRepository({ storage: window.localStorage });
export const identity = localMode
  ? localRepository
  : {
      getSession: () => null,
      signOut: () => {},
      getActivity: () => [],
      listStores: () => [],
    };
export const signIn = createSignIn(localMode ? localRepository : httpRepository);
export const registerAccount = createRegisterAccount(
  localMode ? localRepository : new PendingRegistrationRepository(),
);
