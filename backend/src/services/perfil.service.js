// RF-09: perfil y progreso del estudiante.
import * as gam from '../repositories/gamificacion.repository.js'
import { diaBogota } from '../utils/fecha.js'
import { HttpError } from '../utils/httpError.js'
import { metricasDe, sincronizarLogros } from './logros.service.js'

export async function obtenerPerfil(idUsuario) {
  const m = await metricasDe(idUsuario)
  await sincronizarLogros(idUsuario, { metricas: m }) // por si un logro por tiempo (racha, ranking) quedó pendiente

  const [usuario, catalogo, mios] = await Promise.all([
    gam.obtenerUsuario(idUsuario),
    gam.catalogoLogros(),
    gam.logrosDelUsuario(idUsuario),
  ])
  if (!usuario) throw new HttpError(404, 'Perfil no encontrado')
  const obtenidos = new Map(mios.map((l) => [l.id_logro, l.fecha_obtencion]))

  // Puntos ganados en cada módulo (ejercicios + lecciones).
  const moduloDeEjercicio = new Map(m.estado.ejercicios.map((e) => [e.id_ejercicio, e.id_modulo]))
  const moduloDeLeccion = new Map(m.estado.lecciones.map((l) => [l.id_contenido, l.id_modulo]))
  const xpModulo = new Map()
  const sumar = (idModulo, pts) => idModulo && xpModulo.set(idModulo, (xpModulo.get(idModulo) ?? 0) + pts)
  for (const i of m.intentos) if (i.puntos_otorgados > 0) sumar(moduloDeEjercicio.get(i.id_ejercicio), i.puntos_otorgados)
  for (const l of m.lecciones) sumar(moduloDeLeccion.get(l.id_contenido), l.puntos_otorgados)

  const totalTareas = m.estado.ejercicios.length + m.estado.lecciones.length
  const hechas = m.estado.aciertos.size + m.estado.leccionesHechas.size
  const aciertos = m.intentos.filter((i) => i.es_correcto).length
  const dias = new Set([...m.intentos.map((i) => i.created_at), ...m.lecciones.map((l) => l.fecha)].map(diaBogota))

  return {
    ...usuario,
    ...m.nivel,
    racha: m.resumen.racha_dias,
    ranking: m.ranking,
    progreso_general: totalTareas === 0 ? 0 : Math.round((hechas / totalTareas) * 100),
    modulos: m.estado.modulos.map((mod) => ({ ...mod, puntos_ganados: xpModulo.get(mod.id_modulo) ?? 0 })),
    modulos_completados: m.resumen.modulos_completados,
    modulos_pendientes: m.estado.modulos.length - m.resumen.modulos_completados,
    logros: catalogo.map((l) => ({
      id_logro: l.id_logro,
      codigo: l.codigo,
      nombre: l.nombre,
      descripcion: l.descripcion,
      icono: l.icono,
      obtenido: obtenidos.has(l.id_logro),
      fecha_obtencion: obtenidos.get(l.id_logro) ?? null,
    })),
    estadisticas: {
      ejercicios_resueltos: m.resumen.ejercicios_completados,
      desafios_completados: m.resumen.desafios_completados,
      lecciones_vistas: m.resumen.lecciones_completadas,
      precision: m.intentos.length === 0 ? null : Math.round((aciertos / m.intentos.length) * 100),
      tiempo_practica_seg: m.intentos.reduce((s, i) => s + (i.duracion_seg ?? 0), 0),
      dias_activo: dias.size,
      ejercicios_perfectos: m.resumen.ejercicios_perfectos,
    },
  }
}

export async function actualizarPerfil(idUsuario, { nombre, grado }) {
  const cambios = {}
  if (nombre !== undefined) cambios.nombre = nombre
  if (grado !== undefined) cambios.grado = grado || null
  if (Object.keys(cambios).length === 0) throw new HttpError(400, 'No hay cambios para guardar.')
  return gam.actualizarUsuario(idUsuario, cambios)
}
