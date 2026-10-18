import type { Screen } from '../App'
import Logo from './Logo'

const navItems: { icon: string; label: string; screen: Screen }[] = [
  { icon: '⊞', label: 'Dashboard', screen: 'dashboard' },
  { icon: '◫', label: 'Módulos', screen: 'modules' },
  { icon: '⌨', label: 'Práctica', screen: 'practice' },
  { icon: '⚡', label: 'Retos', screen: 'challenges' },
  { icon: '🏆', label: 'Ranking', screen: 'ranking' },
  { icon: '◉', label: 'Mi Perfil', screen: 'profile' },
]

export default function AppShell({
  children, current, navigate, onLogout,
}: {
  children: React.ReactNode
  current: Screen
  navigate: (s: Screen) => void
  onLogout: () => void
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col gap-1 p-4"
        style={{
          width: 228,
          minHeight: '100vh',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="px-2 py-4 mb-3"><Logo size={40} /></div>

        {navItems.map((item) => (
          <button
            key={item.screen}
            className={`nav-item ${current === item.screen ? 'active' : ''}`}
            onClick={() => navigate(item.screen)}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="mt-auto">
          {/* Weekly progress */}
          <div
            className="card-border p-3 mb-3"
            style={{ background: 'rgba(30,212,138,0.08)', borderColor: 'rgba(30,212,138,0.25)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Progreso semanal</p>
            <div className="progress-bar mb-1">
              <div className="progress-fill" style={{ width: '65%' }} />
            </div>
            <p className="text-xs" style={{ color: '#7af0b4' }}>65% completado</p>
          </div>

          <button
            onClick={onLogout}
            className="nav-item"
            style={{ color: '#fb7185' }}
          >
            <span style={{ fontSize: 18 }}>⏻</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <Logo size={30} />
        <div className="flex gap-1">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              style={{
                background: current === item.screen ? 'rgba(30,212,138,0.25)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                padding: '5px 8px',
                fontSize: 16,
                cursor: 'pointer',
                color: 'white',
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
