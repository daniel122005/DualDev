// Tiempo máximo para las llamadas HTTP a Supabase: sin esto, una petición que se queda colgada deja
// al estudiante esperando sin respuesta (pasó 2 veces en 8 corridas locales de test:e2e: 62 s y 8,4 s).
export const MENSAJE_TIEMPO_BD = 'La base de datos no respondió a tiempo'

// Envuelve un fetch para que aborte a los ms indicados, sin pisar el abort de quien llama.
export function conTiempoLimite(fetchImpl, ms) {
  return async (entrada, opciones = {}) => {
    const porTiempo = AbortSignal.timeout(ms)
    const signal = opciones.signal ? AbortSignal.any([opciones.signal, porTiempo]) : porTiempo
    try {
      return await fetchImpl(entrada, { ...opciones, signal })
    } catch (err) {
      if (porTiempo.aborted && !opciones.signal?.aborted) {
        const agotado = new Error(`${MENSAJE_TIEMPO_BD} (${ms} ms)`)
        agotado.name = 'TimeoutError'
        agotado.esTiempoAgotado = true
        throw agotado
      }
      throw err
    }
  }
}

// Reconoce el corte por tiempo tanto en el error lanzado como en el { error } que devuelve
// supabase-js, que lo convierte en texto ("TimeoutError: ...").
export function esTiempoAgotado(err) {
  if (!err) return false
  if (err.esTiempoAgotado) return true
  return typeof err.message === 'string' && err.message.includes(MENSAJE_TIEMPO_BD)
}
