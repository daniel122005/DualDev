import { getSupabaseAdmin } from '../config/supabase.js'

export async function obtenerPerfil(idUsuario) {
  const { data, error } = await getSupabaseAdmin()
    .from('usuario')
    .select('id_usuario, nombre, correo, grado, created_at, progreso(puntos_acumulados, nivel_actual)')
    .eq('id_usuario', idUsuario)
    .maybeSingle()

  if (error) throw error
  return data
}
