import { useState } from 'react'
import type { Screen } from '../App'

const allStudents = [
  { rank: 1,  name: 'Valentina Torres', xp: 2840, level: 7, streak: 21, badge: '👑', avatar: 'VT', color: '#fbbf24'  },
  { rank: 2,  name: 'Sebastián Molina', xp: 2510, level: 6, streak: 14, badge: '🥈', avatar: 'SM', color: '#c0c0d0'  },
  { rank: 3,  name: 'Camila Ríos',      xp: 2280, level: 6, streak: 10, badge: '🥉', avatar: 'CR', color: '#cd7f32'  },
  { rank: 4,  name: 'Andrés Ospina',    xp: 1950, level: 5, streak: 7,  badge: '⭐', avatar: 'AO', color: '#7af0b4'  },
  { rank: 5,  name: 'Juan García',      xp: 1240, level: 4, streak: 7,  badge: '⚡', avatar: 'JG', color: '#1ed48a', isMe: true },
  { rank: 6,  name: 'María López',      xp: 1180, level: 4, streak: 3,  badge: '',   avatar: 'ML', color: '#0e9f6e'  },
  { rank: 7,  name: 'Diego Sánchez',    xp: 980,  level: 3, streak: 5,  badge: '',   avatar: 'DS', color: '#0e9f6e'  },
  { rank: 8,  name: 'Luisa Vargas',     xp: 870,  level: 3, streak: 2,  badge: '',   avatar: 'LV', color: '#0e9f6e'  },
  { rank: 9,  name: 'Carlos Meza',      xp: 760,  level: 2, streak: 4,  badge: '',   avatar: 'CM', color: '#0e9f6e'  },
  { rank: 10, name: 'Paula Castillo',   xp: 640,  level: 2, streak: 1,  badge: '',   avatar: 'PC', color: '#0e9f6e'  },
]

const filters = ['Global', 'Esta semana', 'Módulo for', 'Módulo while']

export default function RankingScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [filter, setFilter] = useState('Global')
  const top3 = allStudents.slice(0, 3)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl mb-1">Ranking del Semillero 🏆</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          ITI · Semillero de Programación Java · 28 estudiantes activos
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${filter === f ? 'tab-active' : 'tab-inactive'}`}
            style={{ border: '1px solid', borderColor: filter === f ? 'transparent' : 'var(--color-border)', cursor: 'pointer' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)', border: '1px solid rgba(30,212,138,0.3)' }}
      >
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 200,
          background: 'radial-gradient(circle, rgba(182,255,60,0.12) 0%, transparent 70%)',
        }} />
        <p className="text-xs font-display font-bold text-center mb-6" style={{ color: 'var(--color-muted)' }}>TOP 3 — {filter.toUpperCase()}</p>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full flex items-center justify-center font-display font-black text-lg" style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #c0c0d0, #888)', color: '#07071a' }}>
              {top3[1].avatar}
            </div>
            <p className="text-xs font-display font-semibold text-center" style={{ maxWidth: 80 }}>{top3[1].name.split(' ')[0]}</p>
            <p className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>{top3[1].xp.toLocaleString()} XP</p>
            <div className="flex items-center justify-center font-display font-black text-2xl rounded-t-xl"
              style={{ width: 60, height: 80, background: 'rgba(192,192,208,0.2)', border: '1px solid rgba(192,192,208,0.3)', borderBottom: 'none', color: '#c0c0d0' }}>
              2
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <span style={{ fontSize: 24 }}>👑</span>
            <div className="rounded-full flex items-center justify-center font-display font-black text-xl"
              style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #fbbf24, #ff9f00)', color: '#03110c', boxShadow: '0 0 24px rgba(251,191,36,0.5)' }}>
              {top3[0].avatar}
            </div>
            <p className="text-sm font-display font-bold text-center" style={{ maxWidth: 90 }}>{top3[0].name.split(' ')[0]}</p>
            <p className="font-mono text-sm font-bold" style={{ color: '#fbbf24' }}>{top3[0].xp.toLocaleString()} XP</p>
            <div className="flex items-center justify-center font-display font-black text-2xl rounded-t-xl"
              style={{ width: 60, height: 110, background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.4)', borderBottom: 'none', color: '#fbbf24' }}>
              1
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full flex items-center justify-center font-display font-black text-lg"
              style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #cd7f32, #8b4513)', color: '#fff' }}>
              {top3[2].avatar}
            </div>
            <p className="text-xs font-display font-semibold text-center" style={{ maxWidth: 80 }}>{top3[2].name.split(' ')[0]}</p>
            <p className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>{top3[2].xp.toLocaleString()} XP</p>
            <div className="flex items-center justify-center font-display font-black text-2xl rounded-t-xl"
              style={{ width: 60, height: 60, background: 'rgba(205,127,50,0.2)', border: '1px solid rgba(205,127,50,0.3)', borderBottom: 'none', color: '#cd7f32' }}>
              3
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 text-xs font-display font-bold"
          style={{ color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-card2)' }}>
          <span style={{ width: 32, textAlign: 'center' }}>#</span>
          <span className="flex-1">Estudiante</span>
          <span style={{ width: 80, textAlign: 'center' }}>Nivel</span>
          <span style={{ width: 80, textAlign: 'right' }}>XP</span>
          <span style={{ width: 70, textAlign: 'right' }}>Racha</span>
        </div>
        {allStudents.map((s) => (
          <div
            key={s.rank}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: s.isMe ? 'rgba(30,212,138,0.08)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!s.isMe) e.currentTarget.style.background = 'rgba(30,212,138,0.04)' }}
            onMouseLeave={(e) => { if (!s.isMe) e.currentTarget.style.background = 'transparent' }}
          >
            <div className="font-display font-black text-sm flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: '50%', background: s.rank <= 3 ? `${s.color}20` : 'transparent', color: s.rank <= 3 ? s.color : 'var(--color-muted)', flexShrink: 0 }}>
              {s.rank <= 3 ? s.badge : s.rank}
            </div>
            <div className="rounded-full flex items-center justify-center font-display font-black text-xs flex-shrink-0"
              style={{ width: 34, height: 34, background: `${s.color}20`, border: `2px solid ${s.color}50`, color: s.color }}>
              {s.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-semibold truncate">{s.name}</span>
                {s.isMe && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(30,212,138,0.2)', color: '#1ed48a' }}>
                    Tú
                  </span>
                )}
              </div>
            </div>
            <div style={{ width: 80, textAlign: 'center' }}>
              <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: `${s.color}20`, color: s.color }}>
                Nv. {s.level}
              </span>
            </div>
            <div style={{ width: 80, textAlign: 'right' }}>
              <span className="font-mono text-sm font-bold" style={{ color: s.isMe ? '#1ed48a' : 'var(--color-text)' }}>
                {s.xp.toLocaleString()}
              </span>
            </div>
            <div style={{ width: 70, textAlign: 'right' }}>
              <span className="text-xs font-bold" style={{ color: s.streak >= 7 ? '#fbbf24' : 'var(--color-muted)' }}>
                {s.streak >= 7 ? '🔥' : '📅'} {s.streak}d
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* My position */}
      <div className="mt-4 p-4 rounded-2xl flex items-center justify-between"
        style={{ background: 'rgba(30,212,138,0.08)', border: '1px solid rgba(30,212,138,0.3)' }}>
        <div>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Tu posición actual</p>
          <p className="font-display font-black text-xl" style={{ color: '#1ed48a' }}>#5 de 28 estudiantes</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Para subir al #4 te faltan</p>
          <p className="font-display font-black text-xl" style={{ color: '#fbbf24' }}>710 XP ⚡</p>
        </div>
        <button className="btn-primary py-2 px-4 text-sm" onClick={() => navigate('challenges')}>
          ¡A practicar! →
        </button>
      </div>
    </div>
  )
}
