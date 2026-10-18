// Traduce los errores de Supabase Auth a mensajes claros para el estudiante.
export function mensajeErrorAuth(error: { message: string; code?: string }): string {
  const text = `${error.code ?? ''} ${error.message}`.toLowerCase()

  if (text.includes('invalid login credentials') || text.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (text.includes('already registered') || text.includes('user_already_exists')) {
    return 'Ya existe una cuenta con ese correo.'
  }
  if (text.includes('email not confirmed') || text.includes('email_not_confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión.'
  }
  if (text.includes('weak_password') || text.includes('password should be')) {
    return 'La contraseña es muy débil. Usa al menos 8 caracteres.'
  }
  if (text.includes('rate limit') || text.includes('over_email_send_rate_limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  }
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'No hay conexión con el servidor. Revisa tu internet.'
  }
  return 'No se pudo completar la acción. Inténtalo de nuevo.'
}
