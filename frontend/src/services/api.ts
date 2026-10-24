import { supabase } from '@/services/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Caché en memoria de las últimas respuestas GET, para pintar al instante una pantalla ya visitada
// mientras se pide la versión fresca (las pantallas siempre vuelven a pedir los datos).
// Es solo de esta pestaña y de un usuario: se vacía si cambia el usuario y tras cualquier envío o cambio
// (POST/PATCH), porque puede haber cambiado puntos, progreso o logros.
const cache = new Map<string, unknown>()
let dueñoCache: string | null = null

export function leerCache<T>(path: string): T | null {
  return (cache.get(path) as T | undefined) ?? null
}

export function asignarDueñoCache(idUsuario: string | null) {
  if (idUsuario !== dueñoCache) cache.clear()
  dueñoCache = idUsuario
}

// "Ejecutar código" no cambia nada guardado: no hace falta vaciar la caché.
const NO_CAMBIA_DATOS = /\/(code\/)?run$/

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const metodo = (options.method ?? 'GET').toUpperCase()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    // El backend ya no acepta la sesión (expiró, se revocó o la cuenta se eliminó): se cierra aquí y
    // AuthContext + ProtectedRoute llevan al login, en vez de dejar al estudiante en una pantalla de error.
    if (res.status === 401 && token) await supabase.auth.signOut({ scope: 'local' })
    throw new ApiError(body?.error?.message ?? 'Error de red', res.status)
  }
  if (metodo === 'GET') {
    if (data.session?.user.id === dueñoCache) cache.set(path, body)
  } else if (!NO_CAMBIA_DATOS.test(path)) cache.clear()
  return body as T
}
