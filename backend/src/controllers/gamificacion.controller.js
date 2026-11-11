import { z } from 'zod'
import * as perfilService from '../services/perfil.service.js'
import * as rankingService from '../services/ranking.service.js'

const rankingQuery = z.object({
  periodo: z.enum(['global', 'semana']).default('global'),
  modulo: z.coerce.number().int().positive().optional(),
})

const perfilBody = z
  .object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 letras.').max(80, 'El nombre es demasiado largo.').optional(),
    // Vacío = sin especificar.
    grado: z.enum(['', '6°', '7°', '8°', '9°', '10°', '11°'], { error: 'El grado debe estar entre 6° y 11°.' }).optional(),
  })
  .strict()

const manejar = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    next(err)
  }
}

export const ranking = manejar((req) => {
  const q = rankingQuery.parse(req.query)
  return rankingService.obtenerRanking(req.user.id, { periodo: q.periodo, idModulo: q.modulo ?? null })
})

export const perfil = manejar((req) => perfilService.obtenerPerfil(req.user.id))
export const actualizarPerfil = manejar((req) => perfilService.actualizarPerfil(req.user.id, perfilBody.parse(req.body ?? {})))
