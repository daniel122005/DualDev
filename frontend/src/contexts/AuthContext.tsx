import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { asignarDueñoCache } from '@/services/api'
import { supabase } from '@/services/supabaseClient'
import { mensajeErrorAuth } from '@/utils/authErrors'

// Cada método devuelve null si salió bien, o el mensaje de error para mostrar.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recupera la sesión persistida por Supabase al recargar.
    supabase.auth.getSession().then(({ data }) => {
      asignarDueñoCache(data.session?.user.id ?? null)
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Antes de pintar nada del nuevo usuario: la caché de respuestas nunca se comparte entre cuentas.
      asignarDueñoCache(nextSession?.user.id ?? null)
      setSession(nextSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      async register(nombre, correo, password) {
        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password,
          options: { data: { nombre } },
        })
        if (error) return mensajeErrorAuth(error)
        // Con "Confirm email" activo no llega sesión; con identities vacías el correo ya existía.
        if (data.user && data.user.identities?.length === 0) return 'Ya existe una cuenta con ese correo.'
        if (!data.session) return 'Cuenta creada. Revisa tu correo para confirmarla e inicia sesión.'
        return null
      },
      async login(correo, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: correo, password })
        return error ? mensajeErrorAuth(error) : null
      },
      async logout() {
        await supabase.auth.signOut()
        asignarDueñoCache(null)
        setSession(null)
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
