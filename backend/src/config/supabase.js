import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'
import { conTiempoLimite } from '../utils/tiempoLimite.js'

// Cliente con service_role: solo uso interno del backend, salta RLS.
export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en backend/.env')
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Ninguna llamada a la base de datos puede quedarse colgada: a los SUPABASE_TIMEOUT_MS se corta
    // y el backend responde 503 en vez de dejar al estudiante esperando.
    global: { fetch: conTiempoLimite(fetch, env.SUPABASE_TIMEOUT_MS) },
  })
}
