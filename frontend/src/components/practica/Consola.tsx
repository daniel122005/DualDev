import type { ResultadoEjecucion } from '@/types/api'

// Consola de salida de "Ejecutar código": muestra salida, errores de compilación o de ejecución.
export default function Consola({ resultado, ejecutando }: { resultado: ResultadoEjecucion | null; ejecutando: boolean }) {
  return (
    <div className="code-block" style={{ minHeight: 80, color: 'var(--color-muted)' }} aria-live="polite">
      <p className="mb-2 text-xs" style={{ color: '#2c5c47' }}>
        ▶ Consola de salida
        {resultado && !ejecutando && <span className="ml-2">· {(resultado.ms / 1000).toFixed(1)} s</span>}
      </p>

      {ejecutando && <p className="text-xs italic">Compilando y ejecutando…</p>}
      {!ejecutando && !resultado && <p className="text-xs italic">Ejecuta tu código para ver el resultado...</p>}

      {!ejecutando && resultado && !resultado.compilo && (
        <div className="flex flex-col gap-2">
          {resultado.errores_compilacion.map((e, i) => (
            <div key={i} className="text-xs" style={{ color: '#fb7185' }}>
              <span className="font-bold">{e.linea ? `L.${e.linea}` : 'Error'} · {e.tipo}:</span>{' '}
              <span style={{ color: 'var(--color-text)' }}>{e.explicacion}</span>
            </div>
          ))}
        </div>
      )}

      {!ejecutando && resultado?.compilo && (
        <>
          {resultado.entrada && (
            <p className="mb-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              Entrada de ejemplo: <span className="font-mono">{resultado.entrada.replace(/\n/g, ' ⏎ ')}</span>
            </p>
          )}
          <pre className="m-0 font-mono text-sm whitespace-pre-wrap" style={{ color: '#7af0b4' }}>
            {resultado.salida || (resultado.error ? '' : '(el programa no imprimió nada)')}
          </pre>
          {resultado.error && (
            <p className="mt-2 text-xs" style={{ color: '#fb7185' }}>
              <span className="font-bold">
                {resultado.error.linea ? `L.${resultado.error.linea} · ` : ''}
                {resultado.error.excepcion ?? (resultado.error.tipo === 'tiempo_agotado' ? 'Tiempo agotado' : 'Error')}:
              </span>{' '}
              <span style={{ color: 'var(--color-text)' }}>{resultado.error.explicacion}</span>
            </p>
          )}
        </>
      )}
    </div>
  )
}
