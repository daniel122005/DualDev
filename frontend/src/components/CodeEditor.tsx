import { useMemo, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import LineaJava from '@/components/LineaJava'
import { lineasResaltadas } from '@/utils/resaltadoJava'

// 14px * 1.7. La numeración, la capa resaltada y el textarea deben usar exactamente estas medidas.
const ALTO_LINEA = '23.8px'
const MEDIDAS: CSSProperties = {
  fontSize: 14,
  lineHeight: ALTO_LINEA,
  paddingLeft: 52,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  whiteSpace: 'pre',
  tabSize: 4,
  letterSpacing: 'normal',
}

// Editor del diseño (Ejercicio.java): cabecera con "semáforo", reset, numeración, resaltado de Java y
// líneas con error. El textarea es transparente y deja ver la capa resaltada que va debajo.
export default function CodeEditor({
  valor,
  onChange,
  onReset,
  archivo,
  lineasError = [],
  deshabilitado = false,
}: {
  valor: string
  onChange: (v: string) => void
  onReset: () => void
  archivo: string
  lineasError?: number[]
  deshabilitado?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const capaRef = useRef<HTMLPreElement>(null)
  const errores = new Set(lineasError)
  const resaltado = useMemo(() => lineasResaltadas(valor), [valor])
  const lineas = resaltado.length

  // Tab inserta 4 espacios en lugar de saltar al siguiente control (Esc + Tab sigue sirviendo para salir).
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab' || e.shiftKey) return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart: ini, selectionEnd: fin } = el
    const nuevo = `${valor.slice(0, ini)}    ${valor.slice(fin)}`
    onChange(nuevo)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = ini + 4
    })
  }

  return (
    <div className="card-border overflow-hidden" style={{ border: '1px solid rgba(30,212,138,0.25)' }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(30,212,138,0.08)', borderBottom: '1px solid rgba(30,212,138,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full" style={{ background: '#fb7185' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#fbbf24' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#1ed48a' }} />
          </div>
          <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
            {archivo}
          </span>
        </div>
        <button
          type="button"
          className="font-display rounded-lg px-3 py-1 text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-muted)', cursor: 'pointer' }}
          onClick={onReset}
          disabled={deshabilitado}
        >
          ↺ Reset
        </button>
      </div>
      <div className="relative" style={{ background: '#020b08' }}>
        {/* Capa con el código resaltado, debajo del textarea transparente (mismas medidas y scroll). */}
        <pre
          ref={capaRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden font-mono"
          style={{ ...MEDIDAS, color: 'var(--color-text)' }}
        >
          {resaltado.map((fichas, i) => (
            <div key={i} style={{ background: errores.has(i + 1) ? 'rgba(251,113,133,0.12)' : undefined, height: ALTO_LINEA }}>
              <LineaJava fichas={fichas} />
            </div>
          ))}
        </pre>
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0 flex flex-col items-end overflow-hidden pt-4 pr-3 select-none"
          style={{ width: 44, background: '#020b08', borderRight: '1px solid rgba(30,212,138,0.1)', zIndex: 2 }}
        >
          {Array.from({ length: lineas }, (_, i) => (
            <span
              key={i}
              className="font-mono"
              style={{
                color: errores.has(i + 1) ? '#fb7185' : '#2c5c47',
                fontWeight: errores.has(i + 1) ? 700 : 400,
                fontSize: 11,
                lineHeight: ALTO_LINEA,
              }}
            >
              {errores.has(i + 1) ? '●' : i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={ref}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={(e) => {
            const { scrollTop, scrollLeft } = e.currentTarget
            if (gutterRef.current) gutterRef.current.scrollTop = scrollTop
            if (capaRef.current) {
              capaRef.current.scrollTop = scrollTop
              capaRef.current.scrollLeft = scrollLeft
            }
          }}
          aria-label={`Editor de código ${archivo}`}
          className="editor-codigo relative block w-full font-mono"
          style={{
            ...MEDIDAS,
            minHeight: 260,
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            resize: 'vertical',
            overflowX: 'auto',
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={deshabilitado}
        />
      </div>
    </div>
  )
}
