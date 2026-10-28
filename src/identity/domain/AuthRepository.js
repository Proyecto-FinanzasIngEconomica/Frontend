/** Puerto de identidad. Un adaptador concreto se inyecta en el caso de uso. */
export class AuthRepository {
  async signIn(_credentials) {
    throw new Error('El adaptador debe implementar signIn.');
  }
}
