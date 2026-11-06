import { AuthRepository } from '../domain/AuthRepository.js';

/** Contrato PROPUESTO, pendiente de implementar en el backend recibido. */
export class HttpAuthRepository extends AuthRepository {
  constructor({ httpClient, enabled = false, loginPath = '/api/v1/auth/login' }) {
    super();
    this.httpClient = httpClient;
    this.enabled = enabled;
    this.loginPath = loginPath;
  }

  async signIn(credentials) {
    if (!this.enabled) {
      throw new Error(
        'El acceso estará disponible cuando se conecte el servicio de autenticación. Tu información no se ha enviado.',
      );
    }
    const data = await this.httpClient.post(this.loginPath, credentials);
    const roles = ['ADMIN_SISTEMA', 'ADMIN_TIENDA', 'CLIENTE'];
    if (
      !data?.user?.id ||
      !roles.includes(data.user.role) ||
      (data.user.role !== 'ADMIN_SISTEMA' && !data.user.storeId)
    ) {
      throw new Error('El servicio devolvió una sesión inválida. Contacta al administrador.');
    }
    return { user: data.user };
  }
}
