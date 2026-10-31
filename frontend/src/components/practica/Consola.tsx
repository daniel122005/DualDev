import { useState } from 'react'
import type { ResultadoEjecucion } from '@/types/api'

type Estado = { etiqueta: string; color: string; icono: string }

function estadoDe(resultado: ResultadoEjecucion | null, ejecutando: boolean): Estado {
  if (ejecutando) return { etiqueta: 'Compilando y ejecutando', color: '#fbbf24', icono: '◌' }
  if (!resultado) return { etiqueta: 'Lista', color: 'var(--color-muted)', icono: '○' }
  if (!resultado.compilo) return { etiqueta: 'Error de compilación', color: '#fb7185', icono: '✕' }
  if (resultado.error?.tipo === 'tiempo_agotado') return { etiqueta: 'Tiempo agotado', color: '#fdba74', icono: '⏱' }
  if (resultado.error?.tipo === 'salida_excesiva') return { etiqueta: 'Salida demasiado larga', color: '#fdba74', icono: '!' }
  if (resultado.error) return { etiqueta: 'Error al ejecutar', color: '#fb7185', icono: '✕' }
  return { etiqueta: 'Ejecutado sin errores', color: '#1ed48a', icono: '✓' }
}

// Consola de "Ejecutar código": salida del programa, errores de compilación o de ejecución.
export default function Consola({
  resultado,
  ejecutando,
  archivo = 'Ejercicio',
  onLimpiar,
  entrada,
  onEntrada,
  pideEntrada = false,
}: {
  resultado: ResultadoEjecucion | null
  ejecutando: boolean
  archivo?: string
  onLimpiar?: () => void
  // Lo que leerá el Scanner del programa: el estudiante puede escribirlo aquí. Viene con el
  // ejemplo del enunciado puesto, para que vea de dónde salen los datos y pueda cambiarlos.
  entrada?: string
  onEntrada?: (v: string) => void
  pideEntrada?: boolean
}) {
  const [copiado, setCopiado] = useState(false)
  const estado = estadoDe(resultado, ejecutando)
  const clase = archivo.replace(/\.java$/, '')
  const lineasSalida = resultado?.compilo && resultado.salida ? resultado.salida.replace(/\n$/, '').split('\n') : []

  async function copiar() {
    if (!resultado?.salida) return
    try {
      await navigator.clipboard.writeText(resultado.salida)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      /* el portapapeles puede no estar disponible */
    }
  }

  return (
    <section className="consola" aria-label="Consola de salida">
      <header className="consola-cabecera">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-green-bright)' }}>
            &gt;_ Consola
          </span>
          <span
            className="consola-estado"
            style={{ color: estado.color, borderColor: `color-mix(in srgb, ${estado.color} 40%, transparent)` }}
            aria-live="polite"
          >
            <span className={ejecutando ? 'girar' : undefined} aria-hidden="true">
              {estado.icono}
            </span>
            {estado.etiqueta}
            {resultado && !ejecutando && <span style={{ color: 'var(--color-muted)' }}>· {(resultado.ms / 1000).toFixed(1)} s</span>}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {lineasSalida.length > 0 && (
            <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={copiar}>
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          )}
          {onLimpiar && resultado && !ejecutando && (
            <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={onLimpiar}>
              Limpiar
            </button>
          )}
        </div>
      </header>

      {pideEntrada && onEntrada && (
        <div className="consola-campo-entrada">
          <label className="font-mono text-xs" htmlFor="entrada-consola" style={{ color: 'var(--color-green-bright)' }}>
            entrada ›
          </label>
          <textarea
            id="entrada-consola"
            className="font-mono"
            rows={Math.min(4, Math.max(1, (entrada ?? '').split('\n').length))}
            value={entrada ?? ''}
            onChange={(e) => onEntrada(e.target.value)}
            disabled={ejecutando}
            spellCheck={false}
            placeholder="Escribe aquí lo que leerá tu programa"
            aria-describedby="ayuda-entrada"
          />
          <p id="ayuda-entrada" className="consola-tenue text-[11px]">
            Esto es lo que lee tu programa con <span className="font-mono">sc.nextInt()</span>: un dato por línea. Cámbialo y vuelve a
            ejecutar para probar con otros números.
          </p>
        </div>
      )}

      <div className="consola-cuerpo font-mono">
        {ejecutando && (
          <>
            <p className="consola-prompt">$ javac {clase}.java &amp;&amp; java {clase}</p>
            <p className="consola-tenue">
              Compilando tu programa<span className="cursor-parpadeo" aria-hidden="true">▋</span>
            </p>
          </>
        )}

        {!ejecutando && !resultado && (
          <div className="consola-vacia">
            <p>Presiona <strong>▶ Ejecutar código</strong> para probar tu programa aquí.</p>
            <p className="mt-1">Ejecutar no da puntos ni cuenta como intento: úsalo cuantas veces quieras.</p>
          </div>
        )}

        {!ejecutando && resultado && !resultado.compilo && (
          <>
            <p className="consola-prompt">$ javac {clase}.java</p>
            <div className="flex flex-col gap-2">
              {resultado.errores_compilacion.map((e, i) => (
                <div key={i} className="consola-error">
                  <p className="font-bold">
                    {e.linea ? `Línea ${e.linea}` : 'Error'} · {e.tipo}
                  </p>
                  <p className="font-body mt-1" style={{ color: 'var(--color-text)' }}>
                    {e.explicacion}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {!ejecutando && resultado?.compilo && (
          <>
            <p className="consola-prompt">$ java {clase}</p>
            {resultado.entrada && (
              <div className="consola-entrada" title="Datos que recibió tu programa con sc.nextInt()">
                <span className="consola-tenue">entrada ›</span> {resultado.entrada.trim().replace(/\n/g, '  ')}
              </div>
            )}
            {lineasSalida.length > 0 ? (
              <ol className="consola-salida" style={{ maxHeight: 280 }}>
                {lineasSalida.map((l, i) => (
                  <li key={i}>
                    <span className="consola-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="consola-texto">{l || ' '}</span>
                  </li>
                ))}
              </ol>
            ) : (
              !resultado.error && <p className="consola-tenue">(el programa terminó sin imprimir nada)</p>
            )}
            {resultado.error && (
              <div className="consola-error mt-3">
                <p className="font-bold">
                  {resultado.error.linea ? `Línea ${resultado.error.linea} · ` : ''}
                  {resultado.error.excepcion ?? estado.etiqueta}
                </p>
                <p className="font-body mt-1" style={{ color: 'var(--color-text)' }}>
                  {resultado.error.explicacion}
                </p>
              </div>
            )}
            {resultado.error?.recuerda?.map((r, i) => (
              <div key={i} className="consola-recuerda mt-2">
                <span className="font-bold">📌 {r.linea ? `Línea ${r.linea} · ` : ''}Recuerda: </span>
                <span className="font-body" style={{ color: 'var(--color-text)' }}>
                  {r.texto}
                </span>
              </div>
            ))}
            {!resultado.error && <p className="consola-tenue mt-2">Proceso terminado · código de salida 0</p>}
          </>
        )}
      </div>
    </section>
  )
}
