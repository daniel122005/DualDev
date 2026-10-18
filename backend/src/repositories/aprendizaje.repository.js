import { getSupabaseAdmin } from '../config/supabase.js'
import { memo, TTL_CATALOGO_MS } from '../utils/cache.js'

function check({ data, error }) {
  if (error) throw error
  return data
}

export function obtenerNiveles() {
  return memo('niveles', TTL_CATALOGO_MS, async () =>
    check(await getSupabaseAdmin().from('nivel').select('numero, nombre, puntos_minimos').order('numero')),
  )
}

export async function obtenerProgreso(idUsuario) {
  return check(
    await getSupabaseAdmin().from('progreso').select('puntos_acumulados').eq('id_usuario', idUsuario).single(),
  )
}

export async function contarEstudiantesConMasPuntos(puntos) {
  const { count, error } = await getSupabaseAdmin()
    .from('progreso')
    .select('*', { count: 'exact', head: true })
    .gt('puntos_acumulados', puntos)
  if (error) throw error
  return count
}

export async function contarEstudiantesConPuntos() {
  const { count, error } = await getSupabaseAdmin()
    .from('progreso')
    .select('*', { count: 'exact', head: true })
    .gt('puntos_acumulados', 0)
  if (error) throw error
  return count
}

export async function contarEstudiantes() {
  const { count, error } = await getSupabaseAdmin().from('progreso').select('*', { count: 'exact', head: true })
  if (error) throw error
  return count
}

export async function obtenerAciertos(idUsuario) {
  return check(
    await getSupabaseAdmin()
      .from('intento_ejercicio')
      .select('id_ejercicio, puntos_otorgados, created_at, ejercicio(titulo)')
      .eq('id_usuario', idUsuario)
      .eq('es_correcto', true)
      // Solo el primer acierto (el que dio puntos): un ejercicio puede tener varios aciertos registrados.
      .gt('puntos_otorgados', 0)
      .order('created_at', { ascending: false }),
  )
}

export async function obtenerFechasIntentos(idUsuario, desde) {
  return check(
    await getSupabaseAdmin()
      .from('intento_ejercicio')
      .select('created_at')
      .eq('id_usuario', idUsuario)
      .gte('created_at', desde),
  )
}

export async function obtenerDesafiosCompletados(idUsuario) {
  return check(
    await getSupabaseAdmin()
      .from('resultado_desafio')
      .select('puntos_otorgados, updated_at, desafio(titulo)')
      .eq('id_usuario', idUsuario)
      .eq('completado', true)
      .order('updated_at', { ascending: false }),
  )
}

export async function obtenerLogros() {
  return check(
    await getSupabaseAdmin()
      .from('logro')
      .select('id_logro, codigo, nombre, descripcion, icono')
      .order('id_logro'),
  )
}

export async function obtenerLogrosDelUsuario(idUsuario) {
  return check(
    await getSupabaseAdmin().from('logro_usuario').select('id_logro, fecha_obtencion').eq('id_usuario', idUsuario),
  )
}
