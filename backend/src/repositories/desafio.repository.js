// Desafíos. La solución y los casos de prueba solo se leen en obtenerDesafioParaEvaluar.
import { getSupabaseAdmin } from '../config/supabase.js'
import { memo, TTL_CATALOGO_MS } from '../utils/cache.js'
import { todasLasFilas } from './paginacion.js'

function check({ data, error }) {
  if (error) throw error
  return data
}

const db = () => getSupabaseAdmin()

// Catálogo cacheado: la vigencia (rotación por día/semana) se calcula después con la hora actual.
export function listarDesafios() {
  return memo('desafios', TTL_CATALOGO_MS, async () =>
    check(
      await db()
        .from('desafio')
        .select(
          'id_desafio, titulo, enunciado, tipo, dificultad, puntos_recompensa, periodo, disponible, disponible_desde, disponible_hasta, minutos_estimados, pistas',
        )
        .order('id_desafio'),
    ),
  )
}

export async function obtenerDesafioParaEvaluar(idDesafio) {
  return check(
    await db()
      .from('desafio')
      .select(
        'id_desafio, titulo, enunciado, tipo, dificultad, puntos_recompensa, periodo, disponible, disponible_desde, disponible_hasta, minutos_estimados, opciones, pistas, codigo_inicial, casos_prueba, requiere, solucion_esperada',
      )
      .eq('id_desafio', idDesafio)
      .maybeSingle(),
  )
}

export async function resultadosDelUsuario(idUsuario) {
  return check(
    await db()
      .from('resultado_desafio')
      .select('id_desafio, completado, intentos, puntos_otorgados, updated_at, desafio(titulo)')
      .eq('id_usuario', idUsuario),
  )
}

// Cuántos estudiantes distintos han intentado cada desafío (dato agregado, sin identidades).
export async function participantesPorDesafio() {
  const filas = await todasLasFilas(() => db().from('resultado_desafio').select('id_desafio').order('id_resultado'))
  const cuenta = new Map()
  for (const f of filas) cuenta.set(f.id_desafio, (cuenta.get(f.id_desafio) ?? 0) + 1)
  return cuenta
}

export async function registrarResultado({ idUsuario, idDesafio, respuesta, correcto, detalle, duracion }) {
  const filas = check(
    await db().rpc('registrar_resultado_desafio', {
      p_usuario: idUsuario,
      p_desafio: idDesafio,
      p_respuesta: respuesta,
      p_correcto: correcto,
      p_detalle: detalle,
      p_duracion: duracion,
    }),
  )
  return filas[0]
}
