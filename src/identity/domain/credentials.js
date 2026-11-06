export function validateCredentials({ email, password }) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 100)
    errors.email = 'Ingresa un correo electrónico válido.';
  if (!password) errors.password = 'Ingresa tu contraseña.';
  return errors;
}
