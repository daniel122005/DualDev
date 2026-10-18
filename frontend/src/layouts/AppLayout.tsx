import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'
import type { Perfil, PerfilOutletContext } from '@/types/api'

function mensaje(e: unknown) {
  return e instanceof Error ? e.message : 'No se pudo cargar tu perfil'
}

export default function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Para refrescar después de ganar puntos (lo usan las pantallas de práctica y retos).
  const recargarPerfil = useCallback(async () => {
    try {
      setPerfil(await api<Perfil>('/me'))
      setError(null)
    } catch (e) {
      setError(mensaje(e))
    }
  }, [])

  useEffect(() => {
    api<Perfil>('/me')
      .then(setPerfil)
      .catch((e) => setError(mensaje(e)))
  }, [])

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const contexto: PerfilOutletContext = { perfil, error, recargarPerfil }

  return (
    <AppShell semanal={perfil?.progreso_semanal ?? null} onLogout={onLogout}>
      <div key={location.pathname} className="page-enter">
        <Outlet context={contexto} />
      </div>
    </AppShell>
  )
}
