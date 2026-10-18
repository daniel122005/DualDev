import { useState } from 'react'
import type { Screen } from '../App'

const codeExample = `// Ejemplo: Contar del 1 al 10 usando for
public class ContadorFor {
    public static void main(String[] args) {

        // Estructura: for(inicio; condición; incremento)
        for (int i = 1; i <= 10; i++) {
            System.out.println("Número: " + i);
        }

        System.out.println("¡Ciclo terminado!");
    }
}`

const codeOutput = `Número: 1
Número: 2
Número: 3
...
Número: 10
¡Ciclo terminado!`

const steps = [
  { title: '¿Qué es el ciclo for?', done: true },
  { title: 'Partes del for',        done: true },
  { title: 'Nuestro primer for',    done: false, current: true },
  { title: 'Contador descendente',  done: false },
  { title: 'For con condiciones',   done: false },
]

export default function LessonScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [tab, setTab] = useState<'explain' | 'code' | 'output'>('explain')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-muted)' }}>
        <button onClick={() => navigate('modules')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
          Módulos
        </button>
        <span>›</span>
        <span style={{ color: '#1ed48a' }}>Ciclo for</span>
        <span>›</span>
        <span>Lección 3</span>
      </div>

      {/* Header */}
      <div className="card-border p-5 mb-5" style={{ borderColor: 'rgba(30,212,138,0.4)', background: 'rgba(30,212,138,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-display font-bold mb-1" style={{ color: '#1ed48a' }}>MÓDULO 2 · LECCIÓN 3 DE 8</p>
            <h2 className="font-display font-black text-xl">Nuestro primer ciclo for</h2>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Tiempo estimado</p>
            <p className="font-display font-bold" style={{ color: '#1ed48a' }}>⏱ ~8 min</p>
          </div>
        </div>
        {/* Step indicators */}
        <div className="mt-3 flex gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div
                className="rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  width: 24, height: 24, flexShrink: 0,
                  background: s.done ? '#1ed48a' : s.current ? 'rgba(30,212,138,0.25)' : 'var(--color-border)',
                  color: s.done ? '#03110c' : s.current ? '#1ed48a' : 'var(--color-muted)',
                  border: s.current ? '2px solid #1ed48a' : 'none',
                }}
              >
                {s.done ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="h-0.5 flex-1" style={{ background: s.done ? '#1ed48a' : 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left */}
        <div>
          <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--color-card)' }}>
            {(['explain', 'code', 'output'] as const).map((t) => (
              <button
                key={t}
                className={`flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setTab(t)}
              >
                {t === 'explain' ? '📖 Explicación' : t === 'code' ? '💻 Código' : '▶ Salida'}
              </button>
            ))}
          </div>

          {tab === 'explain' && (
            <div className="card-border p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: '#1ed48a' }}>¿Qué hace el ciclo for?</h3>
                <p className="text-sm leading-relaxed">
                  El ciclo{' '}
                  <span className="font-mono px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(30,212,138,0.15)', color: '#1ed48a' }}>for</span>
                  {' '}repite un bloque de código un número determinado de veces. Es perfecto cuando <strong>sabes exactamente cuántas veces</strong> quieres repetir algo.
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(30,212,138,0.08)', border: '1px solid rgba(30,212,138,0.25)' }}>
                <p className="text-xs font-display font-bold mb-2" style={{ color: '#7af0b4' }}>ESTRUCTURA</p>
                <code className="font-mono text-sm">
                  for (<span style={{ color: '#fb7185' }}>inicio</span>; <span style={{ color: '#fbbf24' }}>condición</span>; <span style={{ color: '#7af0b4' }}>incremento</span>) &#123;
                  <br />&nbsp;&nbsp;<span style={{ color: 'var(--color-muted)' }}>// código a repetir</span>
                  <br />&#125;
                </code>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { color: '#fb7185', term: 'inicio',      desc: 'Se ejecuta UNA sola vez al principio. Ej: int i = 1'    },
                  { color: '#fbbf24', term: 'condición',   desc: 'Se evalúa antes de cada repetición. Ej: i <= 10'        },
                  { color: '#7af0b4', term: 'incremento',  desc: 'Se ejecuta al final de cada vuelta. Ej: i++'            },
                ].map((item) => (
                  <div key={item.term} className="flex gap-3 items-start">
                    <span className="rounded px-2 py-0.5 font-mono text-xs font-bold flex-shrink-0" style={{ background: `${item.color}20`, color: item.color }}>
                      {item.term}
                    </span>
                    <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                💡 <strong>Tip:</strong> El nombre <code>i</code> es convencional y viene de "índice". Puedes llamarla como quieras.
              </div>
            </div>
          )}

          {tab === 'code' && (
            <div className="code-block">
              {codeExample.split('\n').map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="select-none" style={{ color: 'var(--color-border)', minWidth: 24, textAlign: 'right', fontSize: 11 }}>{i + 1}</span>
                  <span style={{ color: 'var(--color-text)' }}>{line}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'output' && (
            <div className="code-block" style={{ color: '#7af0b4' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>▶ Resultado de ejecución:</p>
              {codeOutput.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Flow diagram */}
          <div className="card-border p-5">
            <p className="text-xs font-display font-bold mb-3" style={{ color: 'var(--color-muted)' }}>FLUJO DE EJECUCIÓN</p>
            <div className="flex flex-col items-center gap-2 text-sm">
              {[
                { box: '🚦 INICIO',     note: 'int i = 1',  color: '#0e9f6e' },
                { box: '❓ CONDICIÓN',  note: 'i <= 10?',   color: '#fbbf24' },
                { box: '⚙️ CUERPO',    note: 'println(i)', color: '#1ed48a' },
                { box: '↑ INCREMENTO', note: 'i++',         color: '#7af0b4' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 w-full">
                  <div
                    className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-display font-bold"
                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}44`, color: item.color }}
                  >
                    {item.box}
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--color-muted)', minWidth: 80 }}>{item.note}</span>
                </div>
              ))}
              <div className="text-xs py-2 px-4 rounded-xl" style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185' }}>
                🛑 FIN (cuando i &gt; 10)
              </div>
            </div>
          </div>

          {/* Self-check */}
          <div className="card-border p-4">
            <p className="text-xs font-display font-bold mb-3" style={{ color: '#7af0b4' }}>✅ AUTO-VERIFICACIÓN</p>
            <div className="flex flex-col gap-2">
              {[
                '¿Entendí la estructura del for?',
                '¿Sé cuándo usa inicio, condición e incremento?',
                '¿Puedo leer el código del ejemplo?',
              ].map((q, i) => (
                <label key={i} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" style={{ accentColor: '#1ed48a' }} />
                  <span style={{ color: 'var(--color-muted)' }}>{q}</span>
                </label>
              ))}
            </div>
          </div>

          {/* XP reward */}
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.18), rgba(122,240,180,0.12))', border: '1px solid rgba(30,212,138,0.3)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Completar esta lección</p>
            <p className="font-display font-black text-2xl" style={{ color: '#fbbf24' }}>+50 XP ⚡</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              className="flex-1 py-2 rounded-xl text-sm font-display font-bold"
              style={{ background: 'var(--color-card2)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-muted)' }}
              onClick={() => navigate('modules')}
            >
              ← Anterior
            </button>
            <button className="btn-lime flex-1 py-2 text-sm" onClick={() => navigate('practice')}>
              Practicar →
            </button>
          </div>
          <button className="btn-primary w-full py-3 text-sm" onClick={() => navigate('lesson')}>
            Siguiente lección →
          </button>
        </div>
      </div>
    </div>
  )
}
