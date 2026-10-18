import * as aprendizaje from '../repositories/aprendizaje.repository.js'
import * as curso from '../repositories/curso.repository.js'
import { HttpError } from '../utils/httpError.js'
import { calcularModulos } from '../utils/modulos.js'
// Dependencia circular con logros.service (que usa estadoCurso): segura porque ambos solo se llaman dentro de funciones.
import { sincronizarLogros } from './logros.service.js'

// Estado del estudiante en todo el curso: progreso y bloqueo de cada módulo.
export async function estadoCurso(idUsuario) {
  const [modulos, ejercicios, lecciones, aciertos, hechas] = await Promise.all([
    curso.obtenerModulosCompletos(),
    curso.obtenerEjerciciosResumen(),
    curso.obtenerLecciones(),
    aprendizaje.obtenerAciertos(idUsuario),
    curso.obtenerLeccionesCompletadas(idUsuario),
  ])
  const setAciertos = new Set(aciertos.map((a) => a.id_ejercicio))
  const setHechas = new Set(hechas.map((h) => h.id_contenido))
  return {
    modulos: calcularModulos(modulos, ejercicios, setAciertos, lecciones, setHechas),
    ejercicios,
    lecciones,
    aciertos: setAciertos,
    leccionesHechas: setHechas,
  }
}

// Lanza 404 si el módulo no existe/no está disponible y 403 si sigue bloqueado para el estudiante.
export function exigirModuloAbierto(estado, idModulo) {
  const modulo = estado.modulos.find((m) => m.id_modulo === idModulo)
  if (!modulo) throw new HttpError(404, 'Módulo no encontrado')
  if (modulo.bloqueado) {
    throw new HttpError(403, 'Este módulo está bloqueado. Completa al menos la mitad del módulo anterior para desbloquearlo.')
  }
  return modulo
}

function puntosDelModulo(estado, idModulo) {
  const ej = estado.ejercicios.filter((e) => e.id_modulo === idModulo).reduce((s, e) => s + e.puntos, 0)
  const lec = estado.lecciones.filter((l) => l.id_modulo === idModulo).reduce((s, l) => s + l.puntos, 0)
  return ej + lec
}

export async function listarModulos(idUsuario) {
  const estado = await estadoCurso(idUsuario)
  return estado.modulos.map((m) => ({
    ...m,
    puntos_totales: puntosDelModulo(estado, m.id_modulo),
    lecciones: estado.lecciones
      .filter((l) => l.id_modulo === m.id_modulo)
      .map((l) => ({ id_contenido: l.id_contenido, titulo: l.titulo, completada: estado.leccionesHechas.has(l.id_contenido) })),
  }))
}

export async function obtenerModulo(idUsuario, idModulo) {
  const [estado, intentos] = await Promise.all([estadoCurso(idUsuario), curso.obtenerResumenIntentos(idUsuario)])
  const modulo = exigirModuloAbierto(estado, idModulo)
  const intentados = new Set(intentos.map((i) => i.id_ejercicio))

  return {
    ...modulo,
    puntos_totales: puntosDelModulo(estado, idModulo),
    lecciones: estado.lecciones
      .filter((l) => l.id_modulo === idModulo)
      .map((l) => ({ ...l, completada: estado.leccionesHechas.has(l.id_contenido) })),
    ejercicios: estado.ejercicios
      .filter((e) => e.id_modulo === idModulo)
      .map((e) => ({
        ...e,
        estado: estado.aciertos.has(e.id_ejercicio) ? 'resuelto' : intentados.has(e.id_ejercicio) ? 'intentado' : 'pendiente',
      })),
  }
}

export async function obtenerLeccion(idUsuario, idContenido) {
  const [leccion, estado] = await Promise.all([curso.obtenerLeccion(idContenido), estadoCurso(idUsuario)])
  if (!leccion) throw new HttpError(404, 'Lección no encontrada')
  const modulo = exigirModuloAbierto(estado, leccion.id_modulo)

  const delModulo = estado.lecciones.filter((l) => l.id_modulo === leccion.id_modulo)
  const idx = delModulo.findIndex((l) => l.id_contenido === idContenido)
  const primerEjercicio = estado.ejercicios.find((e) => e.id_modulo === leccion.id_modulo)

  return {
    ...leccion,
    completada: estado.leccionesHechas.has(idContenido),
    modulo: { id_modulo: modulo.id_modulo, titulo: modulo.titulo, orden: modulo.orden },
    posicion: idx + 1,
    total_lecciones: delModulo.length,
    pasos: delModulo.map((l) => ({ id_contenido: l.id_contenido, titulo: l.titulo, completada: estado.leccionesHechas.has(l.id_contenido) })),
    anterior: delModulo[idx - 1]?.id_contenido ?? null,
    siguiente: delModulo[idx + 1]?.id_contenido ?? null,
    primer_ejercicio: primerEjercicio?.id_ejercicio ?? null,
  }
}

export async function completarLeccion(idUsuario, idContenido) {
  const [leccion, estado] = await Promise.all([curso.obtenerLeccion(idContenido), estadoCurso(idUsuario)])
  if (!leccion) throw new HttpError(404, 'Lección no encontrada')
  exigirModuloAbierto(estado, leccion.id_modulo)
  const resultado = await curso.completarLeccion(idUsuario, idContenido)
  const logros_nuevos = resultado.nuevo ? await sincronizarLogros(idUsuario, { puntos: resultado.puntos_totales }) : []
  return { ...resultado, logros_nuevos }
}
