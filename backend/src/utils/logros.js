// Reglas de logros (RF-11). Funciones puras: el servicio reúne las métricas y guarda los logros.

// "Top N" solo tiene mérito si compiten suficientes estudiantes: sin esto, el primero en sumar
// puntos en un curso nuevo ganaría el logro solo por llegar antes.
export const MIN_PARTICIPANTES_TOP = 10

// Ejercicios "perfectos": resueltos en el primer intento (el primer intento registrado fue correcto).
// intentos: [{ id_ejercicio, es_correcto, created_at }]
export function contarPerfectos(intentos) {
  const primero = new Map()
  for (const i of intentos) {
    const previo = primero.get(i.id_ejercicio)
    if (!previo || i.created_at < previo.created_at) primero.set(i.id_ejercicio, i)
  }
  let n = 0
  for (const i of primero.values()) if (i.es_correcto) n += 1
  return n
}

// metricas: { puntos, nivel, ejercicios_completados, lecciones_completadas, modulos_completados,
//             desafios_completados, racha_dias, posicion_ranking, ejercicios_perfectos }
// Devuelve los logros cuyo criterio se cumple.
export function logrosAlcanzados(logros, m) {
  const valor = {
    puntos: m.puntos,
    nivel: m.nivel,
    ejercicios_completados: m.ejercicios_completados,
    lecciones_completadas: m.lecciones_completadas,
    modulos_completados: m.modulos_completados,
    desafios_completados: m.desafios_completados,
    racha_dias: m.racha_dias,
    ejercicios_perfectos: m.ejercicios_perfectos,
  }
  return logros.filter((l) => {
    if (l.tipo_criterio === 'top_ranking') {
      // Hay que tener puntos (con 0 todos "empatan" en el primer puesto) y competir con suficientes estudiantes.
      return (
        m.puntos > 0 &&
        (m.participantes_con_puntos ?? 0) >= MIN_PARTICIPANTES_TOP &&
        m.posicion_ranking != null &&
        m.posicion_ranking <= l.valor_requerido
      )
    }
    const v = valor[l.tipo_criterio]
    return typeof v === 'number' && v >= l.valor_requerido
  })
}
