export function validateCredentials({ username, password }) {
  const errors = {};
  if (!username.trim()) errors.username = 'Ingresa tu nombre de usuario.';
  else if (username.trim().length > 50) errors.username = 'Usa como máximo 50 caracteres.';
  if (!password) errors.password = 'Ingresa tu contraseña.';
  return errors;
}
