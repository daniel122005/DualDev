import * as saludRepository from '../repositories/salud.repository.js'
import { memo } from '../utils/cache.js'

// Ruta pública (la usan Render y el ping de cron-job.org): el resultado se reutiliza 30 s para que
// nadie pueda usarla para saturar la BD.
const TTL_SALUD_MS = 30_000

export async function salud(_req, res) {
  try {
    await memo('salud:bd', TTL_SALUD_MS, saludRepository.consultarBaseDeDatos)
    res.json({ status: 'ok', bd: 'ok' })
  } catch {
    res.status(503).json({ status: 'error', bd: 'sin conexión' })
  }
}
