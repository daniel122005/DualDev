import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function Cargando() {
  return <div className="flex min-h-screen items-center justify-center text-text-muted">Cargando…</div>
}

// Solo deja pasar a usuarios con sesión.
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Cargando />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Rutas de acceso (login/registro): si ya hay sesión, va al dashboard.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Cargando />
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
