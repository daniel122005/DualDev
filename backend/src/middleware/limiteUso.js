import { HttpError } from '../utils/httpError.js'

// Límite de uso por estudiante en memoria (suficiente para una sola instancia del backend;
// con varias instancias habría que moverlo a un almacén compartido).
// Cada ejecución de código levanta JVMs y el ranking/dashboard hacen muchas consultas:
// esto evita que un estudiante sature el servidor para los demás.
export function limitarPorUsuario({ nombre, maximo, ventanaMs, intervaloMinimoMs = 0 }) {
  const registros = new Map() // idUsuario -> [timestamps]

  // Olvida a quien no ha hecho peticiones dentro de la ventana (si no, el mapa crece sin límite).
  setInterval(() => {
    const ahora = Date.now()
    for (const [id, marcas] of registros) {
      if (!marcas.length || ahora - marcas[marcas.length - 1] >= ventanaMs) registros.delete(id)
    }
  }, ventanaMs).unref()

  return function limiteUso(req, _res, next) {
    const id = req.user?.id
    if (!id) return next(new HttpError(401, 'Sesión requerida'))

    const ahora = Date.now()
    const recientes = (registros.get(id) ?? []).filter((t) => ahora - t < ventanaMs)

    const ultimo = recientes[recientes.length - 1]
    if (ultimo !== undefined && ahora - ultimo < intervaloMinimoMs) {
      return next(new HttpError(429, 'Espera un momento antes de volver a intentarlo.'))
    }
    if (recientes.length >= maximo) {
      return next(new HttpError(429, `Hiciste demasiadas solicitudes de ${nombre} seguidas. Espera un minuto.`))
    }

    recientes.push(ahora)
    registros.set(id, recientes)
    next()
  }
}
