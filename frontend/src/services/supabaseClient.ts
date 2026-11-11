import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en frontend/.env')
}

export const supabase = createClient(url, anonKey)

// Solo para crear cuentas: no guarda la sesión que devuelve signUp, así registrarse no deja la
// sesión abierta y el estudiante entra después con su correo y contraseña.
export const crearClienteRegistro = () =>
  createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'dualdev-registro' },
  })
