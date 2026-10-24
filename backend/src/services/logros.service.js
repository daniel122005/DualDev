// RF-11: métricas del estudiante y otorgamiento automático de logros (solo en el backend).
import * as gam from '../repositories/gamificacion.repository.js'
import { calcularRacha } from '../utils/fecha.js'
import { contarPerfectos, logrosAlcanzados } from '../utils/logros.js'
import { posicionEnLista } from '../utils/ranking.js'
import { estadoCurso } from './curso.service.js'
import { posicionGlobal, resumenDeNivel } from './progreso.service.js'

// Todo lo que se sabe del avance de un estudiante. Lo usan los logros y el perfil.
// Todo va en UNA tanda de consultas en paralelo: si ya se conocen los puntos (p. ej. los devolvió el
// registro del intento) el puesto se cuenta en la BD; si no, se traen los puntos de todos y se calcula aquí
// (antes había que esperar los puntos propios y luego contar: un viaje más a la BD).
export async function metricasDe(idUsuario, { ahora = new Date(), puntos = null } = {}) {
  const [nivel, estado, intentos, lecciones, desafios, rankingOTodos] = await Promise.all([
    resumenDeNivel(idUsuario),
    estadoCurso(idUsuario),
    gam.intentosDelUsuario(idUsuario),
    gam.leccionesDelUsuario(idUsuario),
    gam.desafiosDelUsuario(idUsuario),
    puntos === null ? gam.progresoDeTodos() : posicionGlobal(puntos),
  ])
  const ranking = Array.isArray(rankingOTodos) ? posicionEnLista(rankingOTodos, nivel.puntos_acumulados) : rankingOTodos
  const desafiosCompletados = desafios.filter((d) => d.completado)

  return {
    nivel,
    estado,
    intentos,
    lecciones,
    desafios,
    ranking,
    resumen: {
      puntos: nivel.puntos_acumulados,
      nivel: nivel.nivel.numero,
      ejercicios_completados: intentos.filter((i) => i.puntos_otorgados > 0).length,
      lecciones_completadas: lecciones.length,
      modulos_completados: estado.modulos.filter((m) => m.completado).length,
      desafios_completados: desafiosCompletados.length,
      racha_dias: calcularRacha(
        [...intentos.map((i) => i.created_at), ...desafios.map((d) => d.updated_at), ...lecciones.map((l) => l.fecha)],
        ahora,
      ),
      posicion_ranking: ranking.posicion,
      participantes_con_puntos: ranking.con_puntos,
      ejercicios_perfectos: contarPerfectos(intentos),
    },
  }
}

// Revisa los criterios y guarda los logros que falten. Devuelve los recién obtenidos.
// Es idempotente: llamarla muchas veces (o a la vez) no duplica logros.
// metricas: si ya se calcularon; puntos: si se conocen (acelera metricasDe).
export async function sincronizarLogros(idUsuario, { metricas = null, puntos = null } = {}) {
  const [m, catalogo, actuales] = await Promise.all([
    metricas ?? metricasDe(idUsuario, { puntos }),
    gam.catalogoLogros(),
    gam.logrosDelUsuario(idUsuario),
  ])
  const { faltan, insertados } = await completarLogros(idUsuario, m.resumen, catalogo, actuales)
  const ids = new Set(insertados.map((l) => l.id_logro))
  return faltan
    .filter((l) => ids.has(l.id_logro))
    .map(({ id_logro, codigo, nombre, descripcion, icono }) => ({ id_logro, codigo, nombre, descripcion, icono }))
}

// Para pantallas que muestran todos los logros (dashboard, perfil): reutiliza el catálogo y los logros
// que ya se leyeron junto con las métricas, y solo escribe si falta alguno.
// Devuelve Map id_logro -> fecha_obtencion (incluye los recién otorgados).
export async function logrosObtenidos(idUsuario, metricas, catalogo, actuales) {
  const { insertados } = await completarLogros(idUsuario, metricas.resumen, catalogo, actuales)
  return new Map([...actuales, ...insertados].map((l) => [l.id_logro, l.fecha_obtencion]))
}

async function completarLogros(idUsuario, resumen, catalogo, actuales) {
  const tiene = new Set(actuales.map((l) => l.id_logro))
  const faltan = logrosAlcanzados(catalogo, resumen).filter((l) => !tiene.has(l.id_logro))
  if (faltan.length === 0) return { faltan, insertados: [] }
  return { faltan, insertados: await gam.otorgarLogros(idUsuario, faltan.map((l) => l.id_logro)) }
}
