import { getSupabaseAdmin } from '../config/supabase.js'

// Consulta mínima a la BD. Además de comprobar la conexión, cuenta como actividad para que
// Supabase (plan gratis) no pause el proyecto cuando nadie usa la app.
export async function consultarBaseDeDatos() {
  const { error } = await getSupabaseAdmin().from('nivel').select('numero').limit(1)
  if (error) throw error
}
