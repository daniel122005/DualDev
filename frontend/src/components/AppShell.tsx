import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '@/components/Logo'
import type { ProgresoSemanal } from '@/types/api'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
  { icon: '◫', label: 'Módulos', to: '/modulos' },
  { icon: '⌨', label: 'Práctica', to: '/practica' },
  { icon: '⚡', label: 'Retos', to: '/retos' },
  { icon: '🏆', label: 'Ranking', to: '/ranking' },
  { icon: '◉', label: 'Mi Perfil', to: '/perfil' },
]

export default function AppShell({
  children,
  semanal,
  onLogout,
}: {
  children: ReactNode
  semanal: ProgresoSemanal | null
  onLogout: () => void
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 flex-col gap-1 p-4 md:flex"
        style={{ width: 228, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        <div className="mb-3 px-2 py-4">
          <Logo size={40} />
        </div>

        <nav className="flex flex-col gap-1" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: 18 }} aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div
            className="card-border mb-3 p-3"
            style={{ background: 'rgba(30,212,138,0.08)', borderColor: 'rgba(30,212,138,0.25)' }}
          >
            <p className="mb-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              Progreso semanal
            </p>
            <div className="progress-bar mb-1">
              <div className="progress-fill" style={{ width: `${semanal?.porcentaje ?? 0}%` }} />
            </div>
            <p className="text-xs" style={{ color: '#7af0b4' }}>
              {semanal ? `${semanal.porcentaje}% completado` : 'Cargando…'}
            </p>
            {semanal && (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                {semanal.ejercicios} de {semanal.meta} ejercicios
              </p>
            )}
          </div>

          <button onClick={onLogout} className="nav-item" style={{ color: '#fb7185' }}>
            <span style={{ fontSize: 18 }} aria-hidden="true">
              ⏻
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Barra superior móvil */}
      <div
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-2 md:hidden"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <Logo size={30} />
        <nav className="flex gap-1" aria-label="Principal">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="rounded-lg px-2 py-1 text-base"
              style={({ isActive }) => ({ background: isActive ? 'rgba(30,212,138,0.25)' : 'transparent' })}
            >
              {item.icon}
            </NavLink>
          ))}
          <button onClick={onLogout} aria-label="Cerrar sesión" className="rounded-lg px-2 py-1 text-base" style={{ color: '#fb7185' }}>
            ⏻
          </button>
        </nav>
      </div>

      <main className="min-w-0 flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  )
}
