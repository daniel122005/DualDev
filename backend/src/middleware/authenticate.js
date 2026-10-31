import { getSupabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../utils/httpError.js'
import { esTiempoAgotado } from '../utils/tiempoLimite.js'

// Valida el JWT de Supabase Auth enviado como "Authorization: Bearer <token>".
// Deja el usuario autenticado en req.user ({ id, email }).
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization ?? ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Sesión requerida')
    }

    const { data, error } = await getSupabaseAdmin().auth.getUser(token)
    // Si Supabase no respondió a tiempo no es culpa de la sesión: decirlo como lo que es (503).
    if (esTiempoAgotado(error)) {
      throw new HttpError(503, 'No pudimos validar tu sesión porque la base de datos no respondió. Intenta de nuevo.')
    }
    if (error || !data.user) {
      throw new HttpError(401, 'Sesión inválida o expirada')
    }

    req.user = { id: data.user.id, email: data.user.email }
    next()
  } catch (err) {
    next(err)
  }
}
