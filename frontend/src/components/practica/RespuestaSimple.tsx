import type { TipoEjercicio } from '@/types/api'

// Entrada de respuesta para ejercicios y retos que no son de código.
export default function RespuestaSimple({
  tipo,
  opciones,
  grupo,
  valor,
  onChange,
}: {
  tipo: TipoEjercicio
  opciones: string[] | null
  grupo: string // nombre del grupo de radios (único por pregunta)
  valor: string
  onChange: (v: string) => void
}) {
  if (tipo === 'seleccion') {
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="font-display mb-2 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
          ELIGE UNA OPCIÓN
        </legend>
        {(opciones ?? []).map((op) => {
          const elegida = valor === op
          return (
            <label
              key={op}
              className="card-border flex cursor-pointer items-center gap-3 p-3 text-sm"
              style={{
                borderColor: elegida ? 'rgba(30,212,138,0.6)' : 'var(--color-border)',
                background: elegida ? 'rgba(30,212,138,0.12)' : 'var(--color-card)',
              }}
            >
              <input type="radio" name={grupo} value={op} checked={elegida} onChange={() => onChange(op)} style={{ accentColor: '#1ed48a' }} />
              <span className="font-mono">{op}</span>
            </label>
          )
        })}
      </fieldset>
    )
  }

  if (tipo === 'respuesta_corta') {
    return (
      <div>
        <label htmlFor="respuesta" className="font-display mb-2 block text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
          TU RESPUESTA
        </label>
        <input
          id="respuesta"
          className="w-full px-4 py-3 font-mono text-sm"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    )
  }

  // salida: el estudiante escribe lo que cree que imprime el programa.
  return (
    <div>
      <label htmlFor="respuesta" className="font-display mb-2 block text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
        ¿QUÉ IMPRIME? (una línea por cada println)
      </label>
      <textarea
        id="respuesta"
        className="w-full px-4 py-3 font-mono text-sm"
        style={{ minHeight: 140, lineHeight: 1.7, background: '#020b08' }}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}
