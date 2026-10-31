import { ZodError } from 'zod'
import { HttpError } from '../utils/httpError.js'
import { esTiempoAgotado } from '../utils/tiempoLimite.js'

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Ruta no encontrada: ${req.method} ${req.path}` } })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: 'Datos inválidos', details: err.issues.map((i) => ({ path: i.path, message: i.message })) },
    })
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message } })
  }
  // Errores del cliente detectados por express.json(): no son fallos del servidor.
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'El cuerpo de la solicitud no es JSON válido.' } })
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'La solicitud es demasiado grande.' } })
  }
  if (esTiempoAgotado(err)) {
    console.error('[bd] tiempo agotado:', err.message)
    return res.status(503).json({
      error: { message: 'La base de datos tardó demasiado en responder. Vuelve a intentarlo en un momento.' },
    })
  }
  console.error(err)
  res.status(500).json({ error: { message: 'Error interno del servidor' } })
}
