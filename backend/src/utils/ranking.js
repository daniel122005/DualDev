// Ranking por puntos con "ranking de competición": los empates comparten puesto (1, 2, 2, 4).
// filas: [{ id_usuario, puntos }]
export function ordenarRanking(filas) {
  const ordenadas = [...filas].sort((a, b) => b.puntos - a.puntos || a.id_usuario.localeCompare(b.id_usuario))
  let posicion = 0
  let previo = null
  return ordenadas.map((f, i) => {
    if (f.puntos !== previo) {
      posicion = i + 1
      previo = f.puntos
    }
    return { ...f, posicion }
  })
}

// Privacidad (estudiantes menores): "Valentina Torres Gómez" -> "Valentina T."
export function nombrePublico(nombre) {
  const partes = String(nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'Estudiante'
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[1][0].toUpperCase()}.`
}

// Cuántos puntos le faltan a alguien para alcanzar el puesto de arriba (null si ya es primero).
export function puntosParaSubir(ranking, idUsuario) {
  const yo = ranking.find((f) => f.id_usuario === idUsuario)
  if (!yo) return null
  const arriba = ranking.filter((f) => f.puntos > yo.puntos)
  if (arriba.length === 0) return null
  const objetivo = Math.min(...arriba.map((f) => f.puntos))
  return objetivo - yo.puntos + 1
}

// Puesto en el ranking global a partir de los puntos de todos (misma regla que contar en la BD:
// puesto = estudiantes con MÁS puntos + 1; los empates comparten puesto).
export function posicionEnLista(filas, puntos) {
  let mejores = 0
  let conPuntos = 0
  for (const f of filas) {
    if (f.puntos_acumulados > puntos) mejores++
    if (f.puntos_acumulados > 0) conPuntos++
  }
  return { posicion: mejores + 1, total: filas.length, con_puntos: conPuntos }
}
