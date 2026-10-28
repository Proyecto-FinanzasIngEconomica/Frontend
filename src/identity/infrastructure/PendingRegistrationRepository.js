import { RegistrationRepository } from '../domain/RegistrationRepository.js';

/** Sustituir por un adaptador HTTP cuando se acuerde e implemente la API. */
export class PendingRegistrationRepository extends RegistrationRepository {
  async register(_request) {
    throw new Error(
      'Los datos están completos. La creación de cuentas estará disponible al conectar el servicio de registro. Tu cuenta aún no se ha creado y tus datos no se han enviado.',
    );
  }
}
