import { supabase } from '@/services/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

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
  return body as T
}
