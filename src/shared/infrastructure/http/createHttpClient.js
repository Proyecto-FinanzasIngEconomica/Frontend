export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function createHttpClient({
  baseUrl = '',
  fetchImpl = globalThis.fetch,
  timeoutMs = 12000,
  getAccessToken = () => null,
  credentials = 'include',
} = {}) {
  async function request(method, path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const token = getAccessToken();
      const headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers,
        credentials,
        signal: controller.signal,
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const messages = {
          401: 'El usuario o la contraseña no son correctos.',
          403: 'Tu cuenta no tiene acceso. Contacta al administrador.',
          429: 'Demasiados intentos. Espera un momento y vuelve a intentar.',
        };
        throw new HttpError(
          messages[response.status] ||
            (response.status < 500 && data?.message) ||
            'No pudimos completar la solicitud. Inténtalo nuevamente.',
          response.status,
        );
      }
      return data;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        error.name === 'AbortError'
          ? 'La conexión está tardando demasiado. Vuelve a intentar.'
          : 'No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.',
        0,
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
  };
}
