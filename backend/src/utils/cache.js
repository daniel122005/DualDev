// Caché en memoria para datos de CATÁLOGO (módulos, ejercicios, niveles, logros, desafíos), que solo
// cambian cuando se vuelve a ejecutar el seed. Nunca usar para datos de estudiantes (puntos, intentos…).
// Se guarda la promesa: varias peticiones simultáneas comparten una sola consulta.
const entradas = new Map()

export async function memo(clave, ttlMs, cargar) {
  const ahora = Date.now()
  const actual = entradas.get(clave)
  if (actual && actual.vence > ahora) return actual.promesa

  const promesa = Promise.resolve().then(cargar)
  entradas.set(clave, { promesa, vence: ahora + ttlMs })
  promesa.catch(() => {
    if (entradas.get(clave)?.promesa === promesa) entradas.delete(clave) // no cachear errores
  })
  return promesa
}

export function limpiarCache() {
  entradas.clear()
}

// Tras cambiar el catálogo (seed), los cambios se ven como mucho en este tiempo.
export const TTL_CATALOGO_MS = 60_000
