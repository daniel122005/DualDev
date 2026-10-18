import { useState } from 'react'
import type { Screen } from '../App'

const starterCode = `public class Ejercicio {
    public static void main(String[] args) {
        // TODO: Escribe un ciclo for que sume
        // todos los números del 1 al 10.

    }
}`

const exercises = [
  { id: 1, title: 'Contar del 1 al 5',      diff: 'Fácil', xp: 30,  done: true  },
  { id: 2, title: 'Suma de números',         diff: 'Fácil', xp: 40,  done: false, active: true },
  { id: 3, title: 'Tabla de multiplicar',    diff: 'Medio', xp: 60,  done: false },
  { id: 4, title: 'Números pares',           diff: 'Medio', xp: 60,  done: false },
  { id: 5, title: 'Triángulo de asteriscos', diff: 'Difícil', xp: 100, done: false },
]

const diffColor: Record<string, string> = { Fácil: '#1ed48a', Medio: '#fbbf24', Difícil: '#fb7185' }

export default function PracticeScreen({ navigate }: { navigate: (s: Screen, o?: { correct?: boolean }) => void }) {
  const [code, setCode] = useState(starterCode)
  const [running, setRunning] = useState(false)

  const handleRun = (correct: boolean) => {
    setRunning(true)
    setTimeout(() => { setRunning(false); navigate('feedback', { correct }) }, 800)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl mb-1">Zona de Práctica ⌨</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Módulo 2 · Ciclo for · Ejercicios</p>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* Exercise list */}
        <div>
          <p className="text-xs font-display font-bold mb-3" style={{ color: 'var(--color-muted)' }}>EJERCICIOS</p>
          <div className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                className="card-border p-3 text-left w-full"
                style={{
                  cursor: 'pointer',
                  borderColor: ex.active ? 'rgba(30,212,138,0.5)' : 'var(--color-border)',
                  background: ex.active ? 'rgba(30,212,138,0.1)' : 'var(--color-card)',
                  transition: 'all 0.18s',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 14 }}>{ex.done ? '✅' : ex.active ? '▶' : '○'}</span>
                  <span className="text-sm font-display font-semibold" style={{ color: ex.done ? 'var(--color-muted)' : 'var(--color-text)' }}>
                    {ex.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${diffColor[ex.diff]}20`, color: diffColor[ex.diff] }}>
                    {ex.diff}
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#7af0b4' }}>+{ex.xp} XP</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-4">
          {/* Exercise description */}
          <div className="card-border p-4" style={{ borderColor: 'rgba(30,212,138,0.35)', background: 'rgba(30,212,138,0.06)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display font-black text-base mb-1">Ejercicio 2: Suma de números</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  Escribe un programa que use un ciclo{' '}
                  <code className="font-mono text-xs px-1 rounded" style={{ background: 'rgba(30,212,138,0.2)', color: '#1ed48a' }}>for</code>
                  {' '}para sumar todos los números del 1 al 10 y muestre el resultado en pantalla.
                </p>
                <p className="text-xs mt-2" style={{ color: '#7af0b4' }}>
                  Resultado esperado: <span className="font-mono">Suma = 55</span>
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                Fácil · +40 XP
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Usa variable acumuladora', 'Inicializa suma = 0', 'Ciclo del 1 al 10', 'Suma en cada vuelta'].map((hint) => (
                <span key={hint} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)' }}>
                  💡 {hint}
                </span>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <div className="card-border overflow-hidden" style={{ border: '1px solid rgba(30,212,138,0.25)' }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(30,212,138,0.08)', borderBottom: '1px solid rgba(30,212,138,0.15)' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#fb7185' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#1ed48a' }} />
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>Ejercicio.java</span>
              </div>
              <button
                className="text-xs px-3 py-1 rounded-lg font-display font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-muted)', cursor: 'pointer' }}
                onClick={() => setCode(starterCode)}
              >
                ↺ Reset
              </button>
            </div>
            <div className="relative">
              <div
                className="absolute left-0 top-0 bottom-0 flex flex-col items-end pt-4 pr-3 select-none"
                style={{ width: 44, background: '#020b08', borderRight: '1px solid rgba(30,212,138,0.1)' }}
              >
                {code.split('\n').map((_, i) => (
                  <span key={i} className="font-mono leading-relaxed" style={{ color: '#17382b', fontSize: 11 }}>{i + 1}</span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-sm"
                style={{
                  minHeight: 240,
                  paddingLeft: 52, paddingTop: 16, paddingRight: 16, paddingBottom: 16,
                  background: '#020b08',
                  border: 'none', borderRadius: 0,
                  lineHeight: 1.7,
                  resize: 'vertical',
                  color: 'var(--color-text)',
                }}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Run buttons */}
          <div className="flex gap-3">
            <button
              className="btn-lime flex-1 py-3 text-sm flex items-center justify-center gap-2"
              onClick={() => handleRun(true)}
              disabled={running}
            >
              {running ? <span className="font-mono">Ejecutando...</span> : <>▶ Ejecutar código</>}
            </button>
            <button className="btn-primary flex-1 py-3 text-sm" onClick={() => handleRun(false)} disabled={running}>
              Enviar respuesta ✓
            </button>
          </div>

          {/* Console */}
          <div className="code-block" style={{ minHeight: 80, color: 'var(--color-muted)' }}>
            <p className="text-xs mb-2" style={{ color: '#17382b' }}>▶ Consola de salida</p>
            <p className="text-xs italic">Ejecuta tu código para ver el resultado...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
