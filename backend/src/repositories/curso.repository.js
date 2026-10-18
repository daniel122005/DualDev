// Acceso a módulos, lecciones y ejercicios. Las columnas con soluciones y casos de prueba
// solo se leen donde se evalúa (obtenerEjercicioParaEvaluar); nunca se devuelven al cliente.
import { getSupabaseAdmin } from '../config/supabase.js'
import { memo, TTL_CATALOGO_MS } from '../utils/cache.js'

function check({ data, error }) {
  if (error) throw error
  return data
}

const CAMPOS_EJERCICIO_PUBLICO =
  'id_ejercicio, id_modulo, titulo, enunciado, tipo, dificultad, puntos, opciones, pistas, codigo_inicial, casos_prueba, requiere, orden'

// Catálogo (cacheado TTL_CATALOGO_MS): los llamadores no deben mutar los arreglos devueltos.
export function obtenerModulosCompletos() {
  return memo('modulos', TTL_CATALOGO_MS, async () =>
    check(
      await getSupabaseAdmin()
        .from('modulo')
        .select('id_modulo, titulo, descripcion, orden, dificultad')
        .eq('disponible', true)
        .order('orden'),
    ),
  )
}

export function obtenerLecciones() {
  return memo('lecciones', TTL_CATALOGO_MS, async () =>
    check(
      await getSupabaseAdmin()
        .from('contenido')
        .select('id_contenido, id_modulo, titulo, orden, minutos_estimados, puntos')
        .order('orden'),
    ),
  )
}

export async function obtenerLeccion(idContenido) {
  return check(
    await getSupabaseAdmin()
      .from('contenido')
      .select('id_contenido, id_modulo, titulo, explicacion, codigo_ejemplo, salida_ejemplo, tip, minutos_estimados, puntos, orden')
      .eq('id_contenido', idContenido)
      .maybeSingle(),
  )
}

export async function obtenerLeccionesCompletadas(idUsuario) {
  return check(
    await getSupabaseAdmin().from('contenido_completado').select('id_contenido, fecha').eq('id_usuario', idUsuario),
  )
}

export function obtenerEjerciciosResumen() {
  return memo('ejercicios', TTL_CATALOGO_MS, async () =>
    check(
      await getSupabaseAdmin()
        .from('ejercicio')
        .select('id_ejercicio, id_modulo, titulo, tipo, dificultad, puntos, orden')
        .order('orden'),
    ),
  )
}

// Incluye casos_prueba completos: el servicio filtra los ocultos antes de responder.
export async function obtenerEjercicio(idEjercicio) {
  return check(
    await getSupabaseAdmin().from('ejercicio').select(CAMPOS_EJERCICIO_PUBLICO).eq('id_ejercicio', idEjercicio).maybeSingle(),
  )
}

export async function obtenerEjercicioParaEvaluar(idEjercicio) {
  return check(
    await getSupabaseAdmin()
      .from('ejercicio')
      .select(`${CAMPOS_EJERCICIO_PUBLICO}, solucion_esperada, explicacion`)
      .eq('id_ejercicio', idEjercicio)
      .maybeSingle(),
  )
}

export async function obtenerIntentosDeEjercicio(idUsuario, idEjercicio) {
  return check(
    await getSupabaseAdmin()
      .from('intento_ejercicio')
      .select('es_correcto, puntos_otorgados, created_at')
      .eq('id_usuario', idUsuario)
      .eq('id_ejercicio', idEjercicio),
  )
}

export async function obtenerResumenIntentos(idUsuario) {
  return check(
    await getSupabaseAdmin()
      .from('intento_ejercicio')
      .select('id_ejercicio, es_correcto, puntos_otorgados')
      .eq('id_usuario', idUsuario),
  )
}

export async function registrarIntento({ idUsuario, idEjercicio, respuesta, correcto, feedback, detalle, duracion }) {
  const filas = check(
    await getSupabaseAdmin().rpc('registrar_intento_ejercicio', {
      p_usuario: idUsuario,
      p_ejercicio: idEjercicio,
      p_respuesta: respuesta,
      p_correcto: correcto,
      p_feedback: feedback,
      p_detalle: detalle,
      p_duracion: duracion,
    }),
  )
  return filas[0]
}

export async function completarLeccion(idUsuario, idContenido) {
  const filas = check(
    await getSupabaseAdmin().rpc('completar_contenido', { p_usuario: idUsuario, p_contenido: idContenido }),
  )
  return filas[0]
}
