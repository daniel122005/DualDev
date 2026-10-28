import CodeBlock from '@/components/CodeBlock'
import type { TipoEjercicio } from '@/types/api'

// Respuesta correcta que el propio estudiante ya envió, para repasarla cuando vuelve al ejercicio.
export default function MiRespuesta({
  tipo,
  respuesta,
  explicacion,
  onCargar,
}: {
  tipo: TipoEjercicio
  respuesta: string
  explicacion: string | null
  onCargar?: () => void
}) {
  return (
    <details className="mi-respuesta card-border p-4" open>
      <summary className="font-display flex cursor-pointer items-center justify-between gap-3 text-sm font-black">
        <span style={{ color: '#1ed48a' }}>✓ Tu respuesta correcta</span>
        <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
          mostrar / ocultar
        </span>
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        {tipo === 'codigo' ? (
          <CodeBlock codigo={respuesta} borde="rgba(30,212,138,0.35)" />
        ) : tipo === 'salida' ? (
          <pre className="code-block m-0 whitespace-pre-wrap" style={{ color: '#7af0b4' }}>
            {respuesta}
          </pre>
        ) : (
          <p
            className="inline-flex w-fit rounded-xl px-3 py-2 font-mono text-sm"
            style={{ background: 'rgba(30,212,138,0.1)', border: '1px solid rgba(30,212,138,0.35)', color: 'var(--color-green-pale)' }}
          >
            {respuesta}
          </p>
        )}
        {explicacion && (
          <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
            💡 {explicacion}
          </p>
        )}
        {onCargar && (
          <button type="button" className="btn-ghost w-fit px-3 py-2 text-xs" onClick={onCargar}>
            ↧ Cargar mi código en el editor
          </button>
        )}
      </div>
    </details>
  )
}
