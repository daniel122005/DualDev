import { useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'

type Modo = 'login' | 'register'

const ETIQUETA = 'font-display mb-2 block text-xs font-bold'
const ANIO = new Date().getFullYear()

export default function AuthScreen({ modo }: { modo: Modo }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function cambiarModo(nuevo: Modo) {
    setError(null)
    navigate(nuevo === 'login' ? '/login' : '/register')
  }

  async function onSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)

    if (modo === 'register') {
      if (nombre.trim().length < 2) return setError('Escribe tu nombre completo (mínimo 2 letras).')
      if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    }

    setEnviando(true)
    const msg =
      modo === 'login' ? await login(correo.trim(), password) : await register(nombre.trim(), correo.trim(), password)
    setEnviando(false)
    if (msg) return setError(msg)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '8%',
          left: '8%',
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, rgba(30,212,138,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '8%',
          width: 360,
          height: 360,
          background: 'radial-gradient(circle, rgba(182,255,60,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="page-enter relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="float-slow" style={{ marginBottom: 20, filter: 'drop-shadow(0 12px 36px rgba(30,212,138,0.45))' }}>
            <LogoMark size={104} />
          </div>
          <p className="font-display mb-1 text-4xl font-black">
            <span style={{ color: '#ffffff' }}>DUAL</span>
            <span
              style={{
                background: 'linear-gradient(90deg,#7af0b4,#b6ff3c)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              DEV
            </span>
          </p>
          <p className="font-display text-xs font-semibold" style={{ color: 'var(--color-muted)', letterSpacing: '0.2em' }}>
            APRENDE · PRACTICA · AVANZA
          </p>
        </div>

        <div className="card-border p-8" style={{ background: 'var(--color-surface)', borderColor: 'rgba(30,212,138,0.2)' }}>
          <div className="mb-6 flex gap-2 rounded-xl p-1" role="tablist" style={{ background: 'var(--color-card)' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={modo === m}
                className={`font-display flex-1 rounded-lg py-2 text-sm font-bold ${modo === m ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => cambiarModo(m)}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
            {modo === 'register' && (
              <div>
                <label htmlFor="nombre" className={ETIQUETA} style={{ color: 'var(--color-muted)' }}>
                  NOMBRE COMPLETO
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Juan García"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
            )}
            <div>
              <label htmlFor="correo" className={ETIQUETA} style={{ color: 'var(--color-muted)' }}>
                CORREO
              </label>
              <input
                id="correo"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className={ETIQUETA} style={{ color: 'var(--color-muted)' }}>
                CONTRASEÑA
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                placeholder={modo === 'login' ? '••••••••' : 'Mínimo 8 caracteres'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm"
              />
            </div>

            {modo === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled
                  title="Próximamente"
                  className="text-xs"
                  style={{ color: '#7af0b4', background: 'none', border: 'none', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {modo === 'register' && (
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: 'rgba(30,212,138,0.1)', border: '1px solid rgba(30,212,138,0.3)', color: '#7af0b4' }}
              >
                🎓 Plataforma para estudiantes del <strong>Instituto Técnico Industrial</strong> — Semillero de Programación Java
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm" style={{ color: 'var(--color-red)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary mt-1 w-full py-3 text-base" disabled={enviando}>
              {enviando
                ? modo === 'login'
                  ? 'Entrando…'
                  : 'Creando cuenta…'
                : modo === 'login'
                  ? 'Entrar al Semillero →'
                  : 'Crear mi cuenta →'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
          ITI · Semillero de Programación Java · {ANIO}
        </p>
      </div>
    </div>
  )
}
