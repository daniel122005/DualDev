// Determina el nivel a partir de los puntos. `niveles` = filas de la tabla nivel (cualquier orden).
export function resolverNivel(niveles, puntos) {
  const ordenados = [...niveles].sort((a, b) => a.puntos_minimos - b.puntos_minimos)
  let idx = 0
  ordenados.forEach((n, i) => {
    if (puntos >= n.puntos_minimos) idx = i
  })

  const actual = ordenados[idx]
  const siguiente = ordenados[idx + 1] ?? null

  if (!siguiente) {
    return { actual, siguiente: null, puntos_para_siguiente: 0, porcentaje: 100 }
  }
  const tramo = siguiente.puntos_minimos - actual.puntos_minimos
  return {
    actual,
    siguiente,
    puntos_para_siguiente: siguiente.puntos_minimos - puntos,
    porcentaje: Math.round(((puntos - actual.puntos_minimos) / tramo) * 100),
  }
}
