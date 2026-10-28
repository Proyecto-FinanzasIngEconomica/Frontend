export const ACCOUNT_TYPES = Object.freeze({ SELLER: 'SELLER', CLIENT: 'CLIENT' });

export function validateRegistration(data) {
  const errors = {};
  if (!Object.values(ACCOUNT_TYPES).includes(data.accountType))
    errors.accountType = 'Selecciona un tipo de cuenta.';
  if (!data.fullName.trim() || data.fullName.trim().length > 150)
    errors.fullName = 'Ingresa tu nombre completo (máximo 150 caracteres).';
  if (!/^\d{8}$/.test(data.dni.trim()))
    errors.dni = 'Ingresa los 8 dígitos de tu DNI, sin el dígito verificador.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) || data.email.trim().length > 100)
    errors.email = 'Ingresa un correo electrónico válido.';
  if (data.password.length < 8 || data.password.length > 72)
    errors.password = 'Usa una contraseña de entre 8 y 72 caracteres.';
  if (!data.confirmPassword || data.password !== data.confirmPassword)
    errors.confirmPassword = 'Las contraseñas deben coincidir.';
  if (data.accountType === ACCOUNT_TYPES.SELLER) {
    if (!data.businessName.trim() || data.businessName.trim().length > 100)
      errors.businessName = 'Ingresa el nombre de tu negocio (máximo 100 caracteres).';
    if (!/^\d{11}$/.test(data.ruc.trim())) errors.ruc = 'Ingresa los 11 dígitos del RUC.';
  }
  return errors;
}

export function toRegistrationRequest(data) {
  const common = {
    accountType: data.accountType,
    fullName: data.fullName.trim(),
    documentType: 'DNI',
    documentNumber: data.dni.trim(),
    email: data.email.trim(),
    password: data.password,
  };
  return data.accountType === ACCOUNT_TYPES.SELLER
    ? { ...common, businessName: data.businessName.trim(), ruc: data.ruc.trim() }
    : common;
}
