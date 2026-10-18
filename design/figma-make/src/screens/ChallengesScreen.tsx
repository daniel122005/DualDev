import { useState } from 'react'
import type { Screen } from '../App'

const challenges = [
  {
    id: 1, icon: '⚡', title: 'Reto Diario', badge: '🔥',
    subtitle: 'Ciclos for: Números primos',
    desc: 'Identifica y muestra todos los números primos entre 1 y 50 usando ciclos for anidados.',
    diff: 'Intermedio', xp: 150, time: '20 min', color: '#fbbf24', timeLeft: '18:43:22', attempts: 234,
  },
  {
    id: 2, icon: '🏆', title: 'Reto Semanal', badge: '🌟',
    subtitle: 'while: Juego de adivinanza',
    desc: 'Crea un juego donde el usuario adivine un número entre 1 y 100 usando ciclo while con contador de intentos.',
    diff: 'Avanzado', xp: 400, time: '45 min', color: '#7af0b4', timeLeft: '4d 12h', attempts: 89,
  },
  {
    id: 3, icon: '🎯', title: 'Mini-reto', badge: '💚',
    subtitle: 'do-while: Menú de opciones',
    desc: 'Construye un menú interactivo que se repita hasta que el usuario elija salir.',
    diff: 'Básico', xp: 80, time: '15 min', color: '#1ed48a', timeLeft: 'Disponible', attempts: 512,
  },
]

const completed = [
  { title: 'Contar pares con for', xp: 60,  date: 'Hace 2 días',   icon: '✅' },
  { title: 'Suma acumulativa',     xp: 40,  date: 'Hace 4 días',   icon: '✅' },
  { title: 'Factorial con while',  xp: 120, date: 'Hace 1 semana', icon: '✅' },
]

const diffColor: Record<string, string> = { Básico: '#1ed48a', Intermedio: '#fbbf24', Avanzado: '#fb7185' }

export default function ChallengesScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl mb-1">Retos y Desafíos ⚡</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Supera retos, gana XP y escala en el ranking.</p>
        </div>
        <div className="px-4 py-2 rounded-xl text-right" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Racha activa</p>
          <p className="font-display font-black text-lg" style={{ color: '#fbbf24' }}>🔥 7 días</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {challenges.map((ch) => (
          <div
            key={ch.id}
            className="card-border p-5 cursor-pointer"
            style={{
              borderColor: selected === ch.id ? `${ch.color}88` : `${ch.color}30`,
              background: selected === ch.id ? `${ch.color}08` : 'var(--color-card)',
              transition: 'all 0.2s',
            }}
            onClick={() => setSelected(selected === ch.id ? null : ch.id)}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center rounded-2xl text-2xl flex-shrink-0"
                style={{ width: 52, height: 52, background: `${ch.color}18`, border: `2px solid ${ch.color}44` }}
              >
                {ch.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-black text-base">{ch.title}</span>
                  <span>{ch.badge}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${diffColor[ch.diff]}20`, color: diffColor[ch.diff] }}>
                    {ch.diff}
                  </span>
                </div>
                <p className="text-sm font-display font-semibold mb-1" style={{ color: ch.color }}>{ch.subtitle}</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>{ch.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-xl" style={{ color: '#fbbf24' }}>+{ch.xp} XP</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>⏱ {ch.time}</p>
                <p className="text-xs mt-1 font-bold" style={{ color: ch.timeLeft === 'Disponible' ? '#1ed48a' : '#7af0b4' }}>
                  {ch.timeLeft === 'Disponible' ? '✓ Disponible' : `⏳ ${ch.timeLeft}`}
                </p>
              </div>
            </div>

            {selected === ch.id && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${ch.color}30` }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{ch.attempts} estudiantes han intentado este reto</p>
                  <div className="flex gap-2">
                    <button
                      className="py-2 px-4 rounded-xl text-sm font-display font-bold"
                      style={{ background: 'var(--color-card2)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-muted)' }}
                    >
                      Ver pistas
                    </button>
                    <button
                      className="btn-primary py-2 px-5 text-sm"
                      onClick={(e) => { e.stopPropagation(); navigate('practice') }}
                    >
                      ¡Aceptar reto! →
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Ciclos', 'Java', ch.diff, `+${ch.xp} XP`].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-lg" style={{ background: `${ch.color}15`, color: ch.color }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display font-bold text-lg mb-4">Retos completados</h3>
        <div className="card-border p-4">
          <div className="flex flex-col gap-3">
            {completed.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-display font-semibold">{c.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.date}</p>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: '#1ed48a' }}>+{c.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
