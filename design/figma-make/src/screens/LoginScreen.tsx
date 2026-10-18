import { useState } from 'react'
import type { Screen } from '../App'
import { LogoMark } from '../components/Logo'

export default function LoginScreen({
  onLogin, mode, onSwitch,
}: {
  onLogin: () => void
  mode: 'login' | 'register'
  onSwitch: (m: Screen) => void
}) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 grid-bg relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '8%', left: '8%',
        width: 480, height: 480,
        background: 'radial-gradient(circle, rgba(30,212,138,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '8%', right: '8%',
        width: 360, height: 360,
        background: 'radial-gradient(circle, rgba(182,255,60,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo hero */}
        <div className="flex flex-col items-center mb-8">
          <div className="float-slow" style={{ marginBottom: 20, filter: 'drop-shadow(0 12px 36px rgba(30,212,138,0.45))' }}><LogoMark size={104} /></div>
          <h1 className="font-display font-black text-4xl mb-1">
            <span style={{ color: '#ffffff' }}>DUAL</span>
            <span style={{ background: 'linear-gradient(90deg,#7af0b4,#b6ff3c)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>DEV</span>
          </h1>
          <p
            className="text-xs font-display font-semibold tracking-widest"
            style={{ color: 'var(--color-muted)', letterSpacing: '0.2em' }}
          >
            APRENDE · PRACTICA · AVANZA
          </p>
        </div>

        {/* Card */}
        <div
          className="card-border p-8"
          style={{ background: 'var(--color-surface)', borderColor: 'rgba(30,212,138,0.2)' }}
        >
          {/* Tabs */}
          <div
            className="flex gap-2 mb-6 p-1 rounded-xl"
            style={{ background: 'var(--color-card)' }}
          >
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-display font-bold transition-all ${mode === 'login' ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => onSwitch('login')}
            >
              Iniciar sesión
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-display font-bold transition-all ${mode === 'register' ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => onSwitch('register')}
            >
              Registrarse
            </button>
          </div>

          {mode === 'login' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-display font-bold mb-2 block" style={{ color: 'var(--color-muted)' }}>
                  USUARIO O CORREO
                </label>
                <input
                  type="text"
                  placeholder="tu_usuario"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-display font-bold mb-2 block" style={{ color: 'var(--color-muted)' }}>
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="text-xs"
                  style={{ color: '#7af0b4', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <button className="btn-primary w-full py-3 text-base mt-1" onClick={onLogin}>
                Entrar al Semillero →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-display font-bold mb-2 block" style={{ color: 'var(--color-muted)' }}>
                  NOMBRE COMPLETO
                </label>
                <input
                  type="text"
                  placeholder="Juan García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-display font-bold mb-2 block" style={{ color: 'var(--color-muted)' }}>
                  CORREO INSTITUCIONAL
                </label>
                <input
                  type="email"
                  placeholder="juan@iti.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-display font-bold mb-2 block" style={{ color: 'var(--color-muted)' }}>
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div
                className="p-3 rounded-xl text-xs"
                style={{ background: 'rgba(30,212,138,0.1)', border: '1px solid rgba(30,212,138,0.3)', color: '#7af0b4' }}
              >
                🎓 Plataforma exclusiva para estudiantes del <strong>Instituto Técnico Industrial</strong> — Semillero de Programación Java
              </div>
              <button className="btn-primary w-full py-3 text-base" onClick={onLogin}>
                Crear mi cuenta →
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
          ITI · Semillero de Programación Java · 2024
        </p>
      </div>
    </div>
  )
}
