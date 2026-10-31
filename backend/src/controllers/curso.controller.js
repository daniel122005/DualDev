import { z } from 'zod'
import * as cursoService from '../services/curso.service.js'
import * as ejercicioService from '../services/ejercicio.service.js'
import { MAX_CODIGO_BYTES, MAX_ENTRADA_BYTES } from '../runner/index.js'

const idParam = z.object({ id: z.coerce.number().int().positive() })

const envioSchema = z.object({
  respuesta: z.string().max(MAX_CODIGO_BYTES, 'La respuesta es demasiado larga.'),
  // Solo informativo (estadísticas); el servidor no lo usa para calificar.
  duracion_seg: z.coerce.number().int().min(0).max(86400).optional(),
})

const ejecucionSchema = z.object({
  codigo: z.string().max(MAX_CODIGO_BYTES, 'El código es demasiado largo (máximo 20 KB).'),
  id_ejercicio: z.coerce.number().int().positive().optional(),
  // Lo que el estudiante escribe en la consola para que lo lea su Scanner.
  entrada: z.string().max(MAX_ENTRADA_BYTES, 'La entrada es demasiado larga (máximo 2 KB).').optional(),
})

const manejar = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    next(err)
  }
}

export const listarModulos = manejar((req) => cursoService.listarModulos(req.user.id))
export const obtenerModulo = manejar((req) => cursoService.obtenerModulo(req.user.id, idParam.parse(req.params).id))
export const obtenerLeccion = manejar((req) => cursoService.obtenerLeccion(req.user.id, idParam.parse(req.params).id))
export const completarLeccion = manejar((req) => cursoService.completarLeccion(req.user.id, idParam.parse(req.params).id))
export const obtenerEjercicio = manejar((req) => ejercicioService.obtenerEjercicio(req.user.id, idParam.parse(req.params).id))

export const enviarRespuesta = manejar((req) => {
  const { id } = idParam.parse(req.params)
  const body = envioSchema.parse(req.body ?? {})
  return ejercicioService.enviarRespuesta(req.user.id, id, { respuesta: body.respuesta, duracionSeg: body.duracion_seg })
})

export const ejecutarCodigo = manejar((req) => {
  const body = ejecucionSchema.parse(req.body ?? {})
  return ejercicioService.ejecutarCodigo(req.user.id, { codigo: body.codigo, idEjercicio: body.id_ejercicio, entrada: body.entrada })
})
