import { z } from 'zod'
import { MAX_CODIGO_BYTES, MAX_ENTRADA_BYTES } from '../runner/index.js'
import * as desafioService from '../services/desafio.service.js'

const idParam = z.object({ id: z.coerce.number().int().positive() })
const envioSchema = z.object({
  respuesta: z.string().max(MAX_CODIGO_BYTES, 'La respuesta es demasiado larga.'),
  duracion_seg: z.coerce.number().int().min(0).max(86400).optional(),
})
const ejecucionSchema = z.object({
  codigo: z.string().max(MAX_CODIGO_BYTES, 'El código es demasiado largo (máximo 20 KB).'),
  entrada: z.string().max(MAX_ENTRADA_BYTES, 'La entrada es demasiado larga (máximo 2 KB).').optional(),
})

const manejar = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    next(err)
  }
}

export const listarRetos = manejar((req) => desafioService.listarRetos(req.user.id))
export const obtenerReto = manejar((req) => desafioService.obtenerReto(req.user.id, idParam.parse(req.params).id))

export const ejecutarReto = manejar((req) =>
  desafioService.ejecutarReto(req.user.id, idParam.parse(req.params).id, ejecucionSchema.parse(req.body ?? {})),
)

export const enviarReto = manejar((req) => {
  const body = envioSchema.parse(req.body ?? {})
  return desafioService.enviarReto(req.user.id, idParam.parse(req.params).id, {
    respuesta: body.respuesta,
    duracionSeg: body.duracion_seg,
  })
})
