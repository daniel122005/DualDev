import * as aprendizaje from '../repositories/aprendizaje.repository.js'
import * as gam from '../repositories/gamificacion.repository.js'
import { calcularRacha, inicioSemanaBogota } from '../utils/fecha.js'
import { resolverNivel } from '../utils/nivel.js'

export const META_SEMANAL_EJERCICIOS = 5

// Nivel derivado de los puntos (no se confía en la columna nivel_actual para mostrarlo).
export async function resumenDeNivel(idUsuario) {
  const [niveles, progreso] = await Promise.all([aprendizaje.obtenerNiveles(), aprendizaje.obtenerProgreso(idUsuario)])
  const puntos = progreso.puntos_acumulados
  const n = resolverNivel(niveles, puntos)
  return {
    puntos_acumulados: puntos,
    nivel: n.actual,
    nivel_siguiente: n.siguiente,
    puntos_para_siguiente: n.puntos_para_siguiente,
    porcentaje_nivel: n.porcentaje,
  }
}

export async function resumenSemanal(idUsuario, ahora = new Date()) {
  const aciertos = await aprendizaje.obtenerAciertos(idUsuario)
  const desde = inicioSemanaBogota(ahora)
  const hechos = aciertos.filter((a) => a.created_at >= desde).length
  return {
    meta: META_SEMANAL_EJERCICIOS,
    ejercicios: hechos,
    porcentaje: Math.min(100, Math.round((hechos / META_SEMANAL_EJERCICIOS) * 100)),
  }
}

// Racha del estudiante: misma regla que el perfil y el ranking (intentos, lecciones y desafíos).
export async function rachaDe(idUsuario, ahora = new Date()) {
  const [intentos, lecciones, desafios] = await Promise.all([
    gam.intentosDelUsuario(idUsuario),
    gam.leccionesDelUsuario(idUsuario),
    gam.desafiosDelUsuario(idUsuario),
  ])
  return calcularRacha(
    [...intentos.map((i) => i.created_at), ...lecciones.map((l) => l.fecha), ...desafios.map((d) => d.updated_at)],
    ahora,
  )
}

// Puesto en el ranking global (empates comparten puesto) y total de estudiantes.
export async function posicionGlobal(puntos) {
  const [mejores, total, conPuntos] = await Promise.all([
    aprendizaje.contarEstudiantesConMasPuntos(puntos),
    aprendizaje.contarEstudiantes(),
    aprendizaje.contarEstudiantesConPuntos(),
  ])
  return { posicion: mejores + 1, total, con_puntos: conPuntos }
}
