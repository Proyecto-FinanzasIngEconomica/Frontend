export class RegistrationRepository {
  async register(_request) {
    throw new Error('El adaptador debe implementar register.');
  }
}
