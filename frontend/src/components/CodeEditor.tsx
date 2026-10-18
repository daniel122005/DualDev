import { useRef, type KeyboardEvent } from 'react'

// Editor del diseño (Ejercicio.java): cabecera con "semáforo", reset, numeración y líneas con error.
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
  const errores = new Set(lineasError)
  const lineas = valor.split('\n').length

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
      <div className="relative">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0 flex flex-col items-end overflow-hidden pt-4 pr-3 select-none"
          style={{ width: 44, background: '#020b08', borderRight: '1px solid rgba(30,212,138,0.1)' }}
        >
          {Array.from({ length: lineas }, (_, i) => (
            <span
              key={i}
              className="font-mono"
              style={{
                color: errores.has(i + 1) ? '#fb7185' : '#2c5c47',
                fontWeight: errores.has(i + 1) ? 700 : 400,
                fontSize: 11,
                lineHeight: '23.8px', // = 14px * 1.7, igual que el textarea
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
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop
          }}
          aria-label={`Editor de código ${archivo}`}
          className="w-full font-mono text-sm"
          style={{
            minHeight: 260,
            paddingLeft: 52,
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 16,
            background: '#020b08',
            border: 'none',
            borderRadius: 0,
            lineHeight: 1.7,
            resize: 'vertical',
            color: 'var(--color-text)',
            whiteSpace: 'pre',
            overflowX: 'auto',
            tabSize: 4,
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
