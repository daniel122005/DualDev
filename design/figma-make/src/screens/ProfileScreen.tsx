import type { Screen } from '../App'
import { LogoMark } from '../components/Logo'

const achievements = [
  { icon: '🏅', label: 'Primer ciclo',  desc: 'Completaste tu primer ejercicio',    earned: true,  date: 'Hace 3 semanas' },
  { icon: '⚡', label: 'Racha 7 días',  desc: '7 días consecutivos practicando',    earned: true,  date: 'Esta semana'    },
  { icon: '🎯', label: '10 ejercicios', desc: 'Resolviste 10 ejercicios',           earned: true,  date: 'Hace 1 semana'  },
  { icon: '🌟', label: 'Perfección',    desc: 'Obtén 100% en 5 ejercicios',         earned: false, date: null             },
  { icon: '🚀', label: 'Nivel 5',       desc: 'Alcanza el nivel 5',                 earned: false, date: null             },
  { icon: '🏆', label: 'Top 3',         desc: 'Entra al top 3 del ranking',         earned: false, date: null             },
  { icon: '🔥', label: 'Racha 30 días', desc: '30 días consecutivos',               earned: false, date: null             },
  { icon: '💡', label: 'Sin pistas',    desc: 'Resuelve 5 retos sin pistas',        earned: false, date: null             },
]

const modules = [
  { title: 'Intro a los ciclos', xp: 250, progress: 100, color: '#0e9f6e' },
  { title: 'Ciclo for',          xp: 320, progress: 75,  color: '#1ed48a' },
  { title: 'Ciclo while',        xp: 80,  progress: 30,  color: '#7af0b4' },
  { title: 'Ciclo do-while',     xp: 0,   progress: 0,   color: '#fbbf24' },
]

export default function ProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)',
          border: '1px solid rgba(30,212,138,0.35)',
        }}
      >
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(182,255,60,0.15) 0%, transparent 70%)',
        }} />
        <div className="flex items-start gap-5 relative z-10">
          {/* Avatar with logo watermark */}
          <div className="relative flex-shrink-0">
            <div
              className="flex items-center justify-center rounded-2xl font-display font-black text-3xl"
              style={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, #0e9f6e, #7af0b4)',
                boxShadow: '0 0 30px rgba(30,212,138,0.5)',
                color: '#03110c',
              }}
            >
              JG
            </div>
            <div style={{ position: 'absolute', bottom: -6, right: -6 }}><LogoMark size={28} /></div>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-black text-2xl mb-0.5">Juan García</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
              🎓 Instituto Técnico Industrial · Grado 10° · Semillero Java
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'XP Total', val: '1 240', color: '#fbbf24', icon: '⚡' },
                { label: 'Nivel',    val: '4',     color: '#7af0b4', icon: '🎮' },
                { label: 'Racha',    val: '7 días', color: '#fdba74', icon: '🔥' },
                { label: 'Ranking',  val: '#5',    color: '#1ed48a', icon: '🏆' },
                { label: 'Logros',   val: '3/8',   color: '#fbbf24', icon: '🏅' },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2 rounded-xl" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.icon} {s.label}</p>
                  <p className="font-display font-black text-base" style={{ color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            className="py-2 px-4 rounded-xl text-xs font-display font-bold flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-muted)' }}
          >
            ✏️ Editar
          </button>
        </div>

        {/* Level bar */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-display font-bold" style={{ color: '#7af0b4' }}>Nivel 4 · Programador Junior</span>
            <span className="font-mono" style={{ color: 'var(--color-muted)' }}>1240 / 1500 XP</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: '82%' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>260 XP para Nivel 5 · Programador Intermedio</p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Module progress */}
        <div>
          <h3 className="font-display font-bold text-lg mb-4">Progreso en módulos</h3>
          <div className="card-border p-4 flex flex-col gap-4">
            {modules.map((m) => (
              <div key={m.title}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-display font-semibold">{m.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: '#7af0b4' }}>+{m.xp} XP</span>
                    <span className="text-xs" style={{ color: m.progress === 100 ? '#1ed48a' : 'var(--color-muted)' }}>{m.progress}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.progress}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}aa)` }} />
                </div>
              </div>
            ))}
            <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted)' }}>Progreso general</span>
                <span className="font-display font-bold" style={{ color: '#7af0b4' }}>51%</span>
              </div>
              <div className="progress-bar mt-1" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: '51%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Logros</h3>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>3 / 8 desbloqueados</span>
          </div>
          <div className="card-border p-4">
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.label}
                  className="p-3 rounded-xl"
                  style={{
                    background: a.earned ? 'rgba(30,212,138,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${a.earned ? 'rgba(30,212,138,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: a.earned ? 1 : 0.45,
                  }}
                >
                  <div className="text-2xl mb-1" style={{ filter: a.earned ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                  <p className="text-xs font-display font-bold mb-0.5">{a.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.3 }}>{a.desc}</p>
                  {a.earned && a.date && <p className="text-xs mt-1" style={{ color: '#7af0b4' }}>{a.date}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="font-display font-bold text-lg mb-4">Estadísticas</h3>
          <div className="card-border p-4 flex flex-col gap-3">
            {[
              { label: 'Ejercicios resueltos', val: '23',    icon: '✅', color: '#1ed48a' },
              { label: 'Retos completados',    val: '5',     icon: '⚡', color: '#fbbf24' },
              { label: 'Lecciones vistas',     val: '14',    icon: '📖', color: '#7af0b4' },
              { label: 'Precisión promedio',   val: '78%',   icon: '🎯', color: '#fb7185' },
              { label: 'Tiempo de práctica',   val: '4.5 h', icon: '⏱', color: '#1ed48a' },
              { label: 'Días activo',           val: '18',    icon: '📅', color: '#fbbf24' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{s.label}</span>
                </div>
                <span className="font-display font-black text-base" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full py-3 mt-4 text-sm" onClick={() => navigate('ranking')}>
            Ver mi posición en el ranking →
          </button>
        </div>
      </div>
    </div>
  )
}
