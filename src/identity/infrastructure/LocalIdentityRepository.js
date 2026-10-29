import { AuthRepository } from '../domain/AuthRepository.js';
import { validateDataConsent } from '../domain/privacyPolicy.js';

const USERS = 'crediflow.local.users.v1';
const SESSION = 'crediflow.local.session.v1';
const EVENTS = 'crediflow.local.events.v1';
const ITERATIONS = 210000;

/** Adaptador de desarrollo: datos locales, sin permisos ni seguridad de servidor. */
export class LocalIdentityRepository extends AuthRepository {
  constructor({ storage, crypto = globalThis.crypto, now = () => new Date().toISOString() }) {
    super();
    this.storage = storage;
    this.crypto = crypto;
    this.now = now;
  }

  read(key, fallback) {
    try {
      return JSON.parse(this.storage.getItem(key)) ?? fallback;
    } catch {
      throw new Error(
        'No se pudieron leer los datos locales. Revisa el almacenamiento del navegador.',
      );
    }
  }

  write(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error(
        'No se pudieron guardar los datos. Comprueba que el navegador permite almacenamiento local.',
      );
    }
  }

  async hash(password, salt) {
    const key = await this.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await this.crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: ITERATIONS, hash: 'SHA-256' },
      key,
      256,
    );
    return Array.from(new Uint8Array(bits))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  publicUser(user) {
    const { passwordHash, salt, ...profile } = user;
    return profile;
  }

  async register(request) {
    if (!validateDataConsent(request.dataConsent))
      throw new Error('Debes aceptar la política de privacidad vigente para registrar tu cuenta.');
    const email = request.email.trim().toLowerCase();
    const salt = Array.from(this.crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await this.hash(request.password, salt);
    const users = this.read(USERS, []);
    if (users.some((user) => user.email === email))
      throw new Error('Ya existe una cuenta con este correo. Inicia sesión.');
    if (users.some((user) => user.documentNumber === request.documentNumber))
      throw new Error('Ya existe una cuenta con este DNI.');
    const { password, ...profile } = request;
    const user = {
      ...profile,
      email,
      id: this.crypto.randomUUID(),
      createdAt: this.now(),
      dataConsent: {
        accepted: true,
        policyVersion: request.dataConsent.policyVersion,
        acceptedAt: this.now(),
      },
      salt,
      passwordHash,
    };
    this.write(USERS, [...users, user]);
    return this.publicUser(user);
  }

  async signIn({ email, password }) {
    const user = this.read(USERS, []).find((entry) => entry.email === email.trim().toLowerCase());
    if (!user || (await this.hash(password, user.salt)) !== user.passwordHash)
      throw new Error('El correo o la contraseña no son correctos.');
    const session = { userId: user.id, signedInAt: this.now() };
    this.write(SESSION, session);
    this.record(user, 'LOGIN');
    return { user: this.publicUser(user), signedInAt: session.signedInAt };
  }

  getSession() {
    const session = this.read(SESSION, null);
    if (!session) return null;
    const user = this.read(USERS, []).find((entry) => entry.id === session.userId);
    return user ? { user: this.publicUser(user), signedInAt: session.signedInAt } : null;
  }

  signOut() {
    const session = this.getSession();
    this.storage.removeItem(SESSION);
    if (session) this.record(session.user, 'LOGOUT');
  }

  updateContact({ phone }) {
    const session = this.getSession();
    if (!session) throw new Error('Inicia sesión para editar tu perfil.');
    const normalized = String(phone || '').trim();
    if (normalized && !/^\+?[\d\s()-]{7,20}$/.test(normalized))
      throw new Error('Ingresa un teléfono válido (7 a 15 dígitos).');
    const digits = normalized.replace(/\D/g, '');
    if (normalized && (digits.length < 7 || digits.length > 15))
      throw new Error('Ingresa un teléfono válido (7 a 15 dígitos).');
    const users = this.read(USERS, []);
    const user = users.find((entry) => entry.id === session.user.id);
    user.phone = normalized;
    this.write(USERS, users);
    return this.publicUser(user);
  }

  record(user, action) {
    this.write(
      EVENTS,
      [
        ...this.read(EVENTS, []),
        {
          id: this.crypto.randomUUID(),
          userId: user.id,
          email: user.email,
          action,
          at: this.now(),
        },
      ].slice(-100),
    );
  }

  getActivity(userId) {
    return this.read(EVENTS, [])
      .filter((event) => event.userId === userId)
      .reverse();
  }

  listStores() {
    return this.read(USERS, [])
      .filter((user) => user.accountType === 'SELLER')
      .map(({ id, businessName }) => ({ id, name: businessName }));
  }
}
