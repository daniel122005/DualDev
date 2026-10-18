import type { Screen } from '../App'

const modules = [
  { id: 1, title: 'Intro a los ciclos',  icon: '🔁', color: '#0e9f6e', progress: 100, lessons: 5,  done: true  },
  { id: 2, title: 'Ciclo for',           icon: '🔢', color: '#1ed48a', progress: 75,  lessons: 8,  done: false },
  { id: 3, title: 'Ciclo while',         icon: '♾️', color: '#7af0b4', progress: 30,  lessons: 7,  done: false },
  { id: 4, title: 'Ciclo do-while',      icon: '🔄', color: '#fbbf24', progress: 0,   lessons: 6,  done: false },
]

const achievements = [
  { icon: '🏅', label: 'Primer ciclo',  earned: true  },
  { icon: '⚡', label: 'Racha 7 días',  earned: true  },
  { icon: '🎯', label: '10 ejercicios', earned: true  },
  { icon: '🌟', label: 'Perfección',    earned: false },
  { icon: '🚀', label: 'Nivel 5',       earned: false },
  { icon: '🏆', label: 'Top 3',         earned: false },
]

export default function Dashboard({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="p-6 max-w-5xl mx-auto grid-bg" style={{ minHeight: '100vh' }}>

      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)',
          border: '1px solid rgba(30,212,138,0.35)',
        }}
      >
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 240, height: 240,
          background: 'radial-gradient(circle, rgba(182,255,60,0.18) 0%, transparent 70%)',
        }} />
        <div className="relative z-10">
          <p className="text-sm mb-1 font-display font-semibold" style={{ color: '#7af0b4' }}>
            ¡Bienvenido de vuelta! 👋
          </p>
          <h2 className="font-display font-black text-2xl mb-1">Juan García</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
            Semillero ITI · Grado 10° · Continúas donde lo dejaste
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: '⚡', label: 'Puntos XP', val: '1 240', color: '#fbbf24' },
              { icon: '🎮', label: 'Nivel',     val: 'Nv. 4', color: '#7af0b4' },
              { icon: '🔥', label: 'Racha',     val: '7 días', color: '#fdba74' },
              { icon: '🏆', label: 'Ranking',   val: '#5',    color: '#1ed48a' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}33` }}
              >
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
                  <p className="font-display font-black text-lg" style={{ color: s.color }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="card-border p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="font-display font-bold text-sm" style={{ color: '#7af0b4' }}>Nivel 4</span>
            <span className="mx-2" style={{ color: 'var(--color-border)' }}>→</span>
            <span className="font-display font-bold text-sm" style={{ color: 'var(--color-muted)' }}>Nivel 5</span>
          </div>
          <span className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>1240 / 1500 XP</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: '82%' }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>¡Te faltan 260 XP para subir de nivel!</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Módulos de aprendizaje</h3>
            <button
              className="text-xs font-display font-bold px-3 py-1 rounded-lg"
              style={{ color: '#7af0b4', background: 'rgba(30,212,138,0.12)', border: 'none', cursor: 'pointer' }}
              onClick={() => navigate('modules')}
            >
              Ver todos →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {modules.map((m) => (
              <button
                key={m.id}
                className="card-border p-4 text-left w-full"
                style={{ cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${m.color}33` }}
                onClick={() => navigate('lesson')}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = m.color + '66')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = m.color + '33')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center rounded-xl text-xl"
                    style={{ width: 40, height: 40, background: m.color + '20', border: `1px solid ${m.color}40` }}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-sm">{m.title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{m.lessons} lecciones</p>
                  </div>
                  {m.done && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(30,212,138,0.15)', color: '#1ed48a' }}>
                      ✓ Listo
                    </span>
                  )}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.progress}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}bb)` }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{m.progress}%</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Quick actions */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '⌨', label: 'Practicar',   color: '#1ed48a', screen: 'practice'   as Screen },
                { icon: '⚡', label: 'Reto del día', color: '#fbbf24', screen: 'challenges' as Screen },
                { icon: '◫', label: 'Módulos',      color: '#7af0b4', screen: 'modules'    as Screen },
                { icon: '🏆', label: 'Ranking',      color: '#fdba74', screen: 'ranking'    as Screen },
              ].map((a) => (
                <button
                  key={a.label}
                  className="card-border p-4 flex flex-col items-center gap-2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${a.color}33` }}
                  onClick={() => navigate(a.screen)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = a.color + '15'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-card)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span className="text-xs font-display font-bold" style={{ color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Logros</h3>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>3 / 6 obtenidos</span>
            </div>
            <div className="card-border p-4">
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((a) => (
                  <div
                    key={a.label}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl"
                    style={{
                      background: a.earned ? 'rgba(30,212,138,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${a.earned ? 'rgba(30,212,138,0.35)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: a.earned ? 1 : 0.4,
                    }}
                  >
                    <span style={{ fontSize: 22, filter: a.earned ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                    <span className="text-xs text-center" style={{ color: 'var(--color-muted)', lineHeight: 1.2 }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Actividad reciente</h3>
            <div className="card-border p-4 flex flex-col gap-3">
              {[
                { icon: '✅', text: 'Completaste "Ciclo for básico"',     time: 'Hace 2h',      xp: '+50 XP'  },
                { icon: '⚡', text: 'Reto diario completado',              time: 'Ayer',         xp: '+80 XP'  },
                { icon: '🏅', text: 'Logro "Primer ciclo" desbloqueado',  time: 'Hace 3 días',  xp: '+100 XP' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{item.time}</p>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: '#7af0b4' }}>{item.xp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
