import type { Screen } from '../App'

const modules = [
  {
    id: 1, icon: '🧩', title: 'Introducción a los ciclos', color: '#0e9f6e',
    desc: 'Entiende qué es un ciclo y para qué sirve en programación.',
    lessons: ['¿Qué es un ciclo?', 'Partes de un ciclo', 'Ciclos en la vida real', 'Pseudocódigo', 'Tu primer ciclo Java'],
    xp: 250, progress: 100, level: 'Básico', done: true,
  },
  {
    id: 2, icon: '🔢', title: 'Ciclo for', color: '#1ed48a',
    desc: 'Domina el ciclo for: contadores, rangos y aplicaciones prácticas.',
    lessons: ['Sintaxis del for', 'Contador ascendente', 'Contador descendente', 'For con arreglos', 'For anidado', 'Ejercicios for', 'Proyecto: tablas', 'Reto final'],
    xp: 400, progress: 75, level: 'Básico', done: false,
  },
  {
    id: 3, icon: '♾️', title: 'Ciclo while', color: '#7af0b4',
    desc: 'Aprende cuándo y cómo usar while para ciclos con condición.',
    lessons: ['Sintaxis del while', 'While vs for', 'Ciclos infinitos y break', 'Validación de datos', 'Menús interactivos', 'Ejercicios while', 'Reto final'],
    xp: 350, progress: 30, level: 'Intermedio', done: false,
  },
  {
    id: 4, icon: '🔄', title: 'Ciclo do-while', color: '#fbbf24',
    desc: 'Ciclos que siempre ejecutan al menos una vez.',
    lessons: ['¿Qué lo hace especial?', 'Sintaxis do-while', 'Comparación con while', 'Casos de uso', 'Ejercicios do-while', 'Reto final'],
    xp: 300, progress: 0, level: 'Intermedio', done: false,
  },
  {
    id: 5, icon: '🔀', title: 'Ciclos combinados', color: '#fdba74',
    desc: 'Combina ciclos, break, continue y casos complejos.',
    lessons: ['break y continue', 'Ciclos anidados', 'Patrones con ciclos', 'Algoritmos con ciclos', 'Proyecto final'],
    xp: 500, progress: 0, level: 'Avanzado', done: false,
  },
]

const levelColor: Record<string, string> = {
  Básico: '#1ed48a', Intermedio: '#fbbf24', Avanzado: '#fb7185',
}

export default function ModulesScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl mb-1">Módulos de aprendizaje</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          Aprende ciclos en Java paso a paso, desde lo básico hasta lo avanzado.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((mod, idx) => {
          const locked = idx > 0 && modules[idx - 1].progress < 50
          return (
            <div key={mod.id} className="flex gap-4 items-start">
              {/* Timeline dot */}
              <div className="flex flex-col items-center" style={{ paddingTop: 18 }}>
                <div
                  className="rounded-full flex items-center justify-center font-display font-black text-sm"
                  style={{
                    width: 40, height: 40,
                    background: locked ? 'var(--color-card2)' : `${mod.color}20`,
                    border: `2px solid ${locked ? 'var(--color-border)' : mod.color}`,
                    color: locked ? 'var(--color-muted)' : mod.color,
                  }}
                >
                  {mod.done ? '✓' : locked ? '🔒' : mod.id}
                </div>
                {idx < modules.length - 1 && (
                  <div style={{
                    width: 2, height: 40,
                    background: locked ? 'var(--color-border)' : `linear-gradient(${mod.color}, ${modules[idx + 1].color})`,
                    marginTop: 4,
                  }} />
                )}
              </div>

              {/* Card */}
              <button
                className="card-border p-5 flex-1 text-left"
                style={{
                  cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  transition: 'all 0.2s',
                  border: `1px solid ${mod.color}30`,
                }}
                onClick={() => !locked && navigate('lesson')}
                onMouseEnter={(e) => { if (!locked) e.currentTarget.style.borderColor = mod.color + '70' }}
                onMouseLeave={(e) => { if (!locked) e.currentTarget.style.borderColor = mod.color + '30' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 28 }}>{mod.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-black text-base">{mod.title}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-display font-bold"
                          style={{ background: levelColor[mod.level] + '20', color: levelColor[mod.level] }}
                        >
                          {mod.level}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{mod.desc}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-black text-sm" style={{ color: '#7af0b4' }}>+{mod.xp} XP</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{mod.lessons.length} lecciones</p>
                  </div>
                </div>

                {!locked && (
                  <>
                    <div className="progress-bar mb-2">
                      <div className="progress-fill" style={{ width: `${mod.progress}%`, background: `linear-gradient(90deg, ${mod.color}, ${mod.color}aa)` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{mod.progress}% completado</p>
                      {mod.done ? (
                        <span className="text-xs font-bold" style={{ color: '#1ed48a' }}>✓ Completado</span>
                      ) : mod.progress > 0 ? (
                        <span className="text-xs font-bold" style={{ color: mod.color }}>Continuar →</span>
                      ) : (
                        <span className="text-xs font-bold" style={{ color: mod.color }}>Comenzar →</span>
                      )}
                    </div>
                  </>
                )}

                {!locked && mod.progress > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mod.lessons.slice(0, 4).map((l, li) => (
                      <span
                        key={li}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: li < Math.ceil(mod.lessons.length * mod.progress / 100) ? `${mod.color}20` : 'rgba(255,255,255,0.04)',
                          color: li < Math.ceil(mod.lessons.length * mod.progress / 100) ? mod.color : 'var(--color-muted)',
                        }}
                      >
                        {li < Math.ceil(mod.lessons.length * mod.progress / 100) ? '✓ ' : ''}{l}
                      </span>
                    ))}
                    {mod.lessons.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--color-muted)', background: 'rgba(255,255,255,0.04)' }}>
                        +{mod.lessons.length - 4} más
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
