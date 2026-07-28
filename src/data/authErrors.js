const MESSAGES = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Probá iniciar sesión.',
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).',
  'auth/user-not-found': 'No encontramos una cuenta con ese email.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá un momento y probá de nuevo.',
  'auth/network-request-failed': 'Error de red. Revisá tu conexión a internet.',
  'auth/operation-not-allowed': 'El inicio de sesión con email y contraseña no está habilitado en Firebase.',
};

export const authErrorMessage = (err) => {
  const code = err?.code || 'desconocido';
  return `${MESSAGES[code] || 'No pudimos completar la operación.'} (${code})`;
};
