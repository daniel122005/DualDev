// Un módulo se desbloquea cuando el anterior lleva al menos este porcentaje.
export const PROGRESO_PARA_DESBLOQUEAR = 50

// El progreso de un módulo cuenta ejercicios resueltos y lecciones terminadas por igual.
// modulos: [{ id_modulo, orden, ... }]
// ejercicios: [{ id_ejercicio, id_modulo }]; aciertos: Set de id_ejercicio resueltos
// lecciones: [{ id_contenido, id_modulo }]; leccionesHechas: Set de id_contenido terminados
export function calcularModulos(modulos, ejercicios, aciertos, lecciones = [], leccionesHechas = new Set()) {
  const ordenados = [...modulos].sort((a, b) => a.orden - b.orden)

  const conProgreso = ordenados.map((m) => {
    const ej = ejercicios.filter((e) => e.id_modulo === m.id_modulo)
    const lec = lecciones.filter((l) => l.id_modulo === m.id_modulo)
    const resueltos = ej.filter((e) => aciertos.has(e.id_ejercicio)).length
    const terminadas = lec.filter((l) => leccionesHechas.has(l.id_contenido)).length
    const total = ej.length + lec.length
    return {
      ...m,
      total_ejercicios: ej.length,
      ejercicios_resueltos: resueltos,
      total_lecciones: lec.length,
      lecciones_completadas: terminadas,
      progreso: total === 0 ? 0 : Math.round(((resueltos + terminadas) / total) * 100),
      _total: total,
    }
  })

  return conProgreso.map(({ _total, ...m }, i) => ({
    ...m,
    completado: _total > 0 && m.progreso === 100,
    bloqueado: i > 0 && conProgreso[i - 1].progreso < PROGRESO_PARA_DESBLOQUEAR,
  }))
}
