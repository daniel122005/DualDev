// Datos para logros, ranking y perfil. Las consultas de "todos los estudiantes" se paginan:
// PostgREST devuelve como máximo 1000 filas por petición y cortaría el ranking sin avisar.
import { getSupabaseAdmin } from '../config/supabase.js'
import { memo, TTL_CATALOGO_MS } from '../utils/cache.js'
import { todasLasFilas } from './paginacion.js'

function check({ data, error }) {
  if (error) throw error
  return data
}

const db = () => getSupabaseAdmin()

// --- Un estudiante -----------------------------------------------------------

export function intentosDelUsuario(idUsuario) {
  return todasLasFilas(() =>
    db()
      .from('intento_ejercicio')
      .select('id_ejercicio, es_correcto, puntos_otorgados, created_at, duracion_seg')
      .eq('id_usuario', idUsuario)
      .order('id_intento'),
  )
}

export function leccionesDelUsuario(idUsuario) {
  return todasLasFilas(() =>
    db().from('contenido_completado').select('id_contenido, puntos_otorgados, fecha').eq('id_usuario', idUsuario).order('id_contenido'),
  )
}

export function desafiosDelUsuario(idUsuario) {
  return todasLasFilas(() =>
    db()
      .from('resultado_desafio')
      .select('id_desafio, completado, puntos_otorgados, intentos, updated_at')
      .eq('id_usuario', idUsuario)
      .order('id_resultado'),
  )
}

export async function logrosDelUsuario(idUsuario) {
  return check(await db().from('logro_usuario').select('id_logro, fecha_obtencion').eq('id_usuario', idUsuario))
}

export function catalogoLogros() {
  return memo('logros', TTL_CATALOGO_MS, async () =>
    check(await db().from('logro').select('id_logro, codigo, nombre, descripcion, tipo_criterio, valor_requerido, icono').order('id_logro')),
  )
}

// Inserta solo los que faltan (la PK id_usuario+id_logro evita duplicados aunque haya carreras)
// y devuelve únicamente los realmente insertados.
export async function otorgarLogros(idUsuario, idsLogro) {
  if (idsLogro.length === 0) return []
  return check(
    await db()
      .from('logro_usuario')
      .upsert(
        idsLogro.map((id) => ({ id_usuario: idUsuario, id_logro: id })),
        { onConflict: 'id_usuario,id_logro', ignoreDuplicates: true },
      )
      .select('id_logro, fecha_obtencion'),
  )
}

export async function obtenerUsuario(idUsuario) {
  return check(
    await db().from('usuario').select('id_usuario, nombre, correo, grado, created_at').eq('id_usuario', idUsuario).maybeSingle(),
  )
}

export async function actualizarUsuario(idUsuario, cambios) {
  return check(
    await db()
      .from('usuario')
      .update(cambios)
      .eq('id_usuario', idUsuario)
      .select('id_usuario, nombre, correo, grado, created_at')
      .single(),
  )
}

// --- Todos los estudiantes (ranking) ------------------------------------------

export function progresoDeTodos() {
  return todasLasFilas(() => db().from('progreso').select('id_usuario, puntos_acumulados').order('id_progreso'))
}

export function nombresDeTodos() {
  return todasLasFilas(() => db().from('usuario').select('id_usuario, nombre').order('id_usuario'))
}

// Puntos ganados en ejercicios (solo el acierto que dio puntos), con su módulo.
export function puntosPorEjercicio({ desde } = {}) {
  return todasLasFilas(() => {
    let q = db()
      .from('intento_ejercicio')
      .select('id_usuario, puntos_otorgados, created_at, ejercicio(id_modulo)')
      .gt('puntos_otorgados', 0)
      .order('id_intento')
    if (desde) q = q.gte('created_at', desde)
    return q
  })
}

export function puntosPorLeccion({ desde } = {}) {
  return todasLasFilas(() => {
    let q = db()
      .from('contenido_completado')
      .select('id_usuario, puntos_otorgados, fecha, contenido(id_modulo)')
      .gt('puntos_otorgados', 0)
      .order('id_usuario')
      .order('id_contenido')
    if (desde) q = q.gte('fecha', desde)
    return q
  })
}

export function puntosPorDesafio({ desde } = {}) {
  return todasLasFilas(() => {
    let q = db()
      .from('resultado_desafio')
      .select('id_usuario, puntos_otorgados, updated_at')
      .eq('completado', true)
      .gt('puntos_otorgados', 0)
      .order('id_resultado')
    if (desde) q = q.gte('updated_at', desde)
    return q
  })
}

// Fechas de actividad recientes de todos (para la racha de cada fila del ranking).
// Cuenta lo mismo que la racha del perfil: intentos, lecciones terminadas y desafíos.
export async function actividadDesde(desde) {
  const [intentos, lecciones, desafios] = await Promise.all([
    todasLasFilas(() => db().from('intento_ejercicio').select('id_usuario, created_at').gte('created_at', desde).order('id_intento')),
    todasLasFilas(() =>
      db().from('contenido_completado').select('id_usuario, fecha').gte('fecha', desde).order('id_usuario').order('id_contenido'),
    ),
    todasLasFilas(() => db().from('resultado_desafio').select('id_usuario, updated_at').gte('updated_at', desde).order('id_resultado')),
  ])
  return [
    ...intentos,
    ...lecciones.map((l) => ({ id_usuario: l.id_usuario, created_at: l.fecha })),
    ...desafios.map((d) => ({ id_usuario: d.id_usuario, created_at: d.updated_at })),
  ]
}
