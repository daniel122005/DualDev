import { useMemo } from 'react'
import LineaJava from '@/components/LineaJava'
import { lineasResaltadas } from '@/utils/resaltadoJava'

// Bloque de código de solo lectura con números de línea y resaltado de Java (estilo .code-block del diseño).
// lineasError: líneas (desde 1) que se marcan con fondo coral.
export default function CodeBlock({
  codigo,
  lineasError = [],
  color,
  borde,
}: {
  codigo: string
  lineasError?: number[]
  color?: string
  borde?: string
}) {
  const errores = new Set(lineasError)
  const lineas = useMemo(() => lineasResaltadas(codigo), [codigo])
  return (
    <div
      className="code-block"
      style={{ color: color ?? 'var(--color-text)', ...(borde ? { borderColor: borde } : null) }}
    >
      {lineas.map((fichas, i) => {
        const mal = errores.has(i + 1)
        return (
          <div
            key={i}
            className="flex gap-3"
            style={{ background: mal ? 'rgba(251,113,133,0.12)' : 'transparent', borderRadius: 4, margin: '1px 0' }}
          >
            <span
              className="select-none"
              aria-hidden="true"
              style={{ color: mal ? '#fb7185' : 'var(--color-border)', minWidth: 24, textAlign: 'right', fontSize: 11 }}
            >
              {i + 1}
            </span>
            <span style={{ whiteSpace: 'pre' }}>
              <LineaJava fichas={fichas} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
