import { validateRegistration, toRegistrationRequest } from '../domain/registration.js';

export function createRegisterAccount(registrationRepository) {
  return async (data) => {
    const errors = validateRegistration(data);
    if (Object.keys(errors).length) return { ok: false, errors };
    await registrationRepository.register(toRegistrationRequest(data));
    return { ok: true };
  };
}
