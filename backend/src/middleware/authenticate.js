import { getSupabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../utils/httpError.js'

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
    if (error || !data.user) {
      throw new HttpError(401, 'Sesión inválida o expirada')
    }

    req.user = { id: data.user.id, email: data.user.email }
    next()
  } catch (err) {
    next(err)
  }
}
