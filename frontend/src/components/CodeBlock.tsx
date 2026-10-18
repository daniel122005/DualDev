// Bloque de código de solo lectura con números de línea (estilo .code-block del diseño).
// lineasError: líneas (desde 1) que se resaltan en coral.
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
  return (
    <div className="code-block" style={{ ...(borde ? { borderColor: borde } : null), ...(color ? { color } : null) }}>
      {codigo.split('\n').map((linea, i) => {
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
            <span style={{ color: mal ? '#fb7185' : undefined, whiteSpace: 'pre' }}>{linea || ' '}</span>
          </div>
        )
      })}
    </div>
  )
}
