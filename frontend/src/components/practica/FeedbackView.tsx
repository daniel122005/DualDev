import CodeBlock from '@/components/CodeBlock'
import LogrosNuevos from '@/components/LogrosNuevos'
import type { Diagnostico, ResultadoEnvio, TipoEjercicio } from '@/types/api'
import { archivoJava, formatoDuracion, formatoXp } from '@/utils/disenio'
import { FALLOS_PARA_SOLUCION, lineasConError } from './feedback'

const BOTON_SECUNDARIO = {
  background: 'var(--color-card2)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  color: 'var(--color-muted)',
} as const

function ErrorItem({ etiqueta, tipo, texto }: { etiqueta: string; tipo: string; texto: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-3"
      style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
    >
      <span
        className="shrink-0 rounded px-2 py-0.5 font-mono text-xs font-bold"
        style={{ background: 'rgba(251,113,133,0.2)', color: '#fb7185' }}
      >
        {etiqueta}
      </span>
      <div>
        <p className="mb-0.5 text-xs font-bold" style={{ color: '#fb7185' }}>
          {tipo}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {texto}
        </p>
      </div>
    </div>
  )
}

function Errores({ d }: { d: Diagnostico }) {
  if (d.tipo === 'compilacion') {
    return (
      <>
        {d.errores.map((e, i) => (
          <ErrorItem key={i} etiqueta={e.linea ? `L.${e.linea}` : '—'} tipo={e.tipo} texto={e.explicacion} />
        ))}
      </>
    )
  }
  if (d.tipo === 'estructura') return <ErrorItem etiqueta="Ciclo" tipo="Estructura" texto={d.explicacion} />
  if (d.tipo === 'salida_distinta') {
    const dif = d.primera_diferencia
    if (d.visible && d.salida_esperada !== undefined) {
      return (
        <div className="flex flex-col gap-3">
          <ErrorItem
            etiqueta={dif ? `Línea ${dif.linea}` : 'Salida'}
            tipo="Salida distinta"
            texto={
              dif
                ? `En la línea ${dif.linea} se esperaba "${dif.esperada ?? '(nada)'}" y tu programa imprimió "${dif.obtenida ?? '(nada)'}".`
                : 'La salida no coincide con la esperada.'
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-display mb-1 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
                SALIDA ESPERADA{d.entrada ? ` (entrada: ${d.entrada.replace(/\n/g, ' ⏎ ')})` : ''}
              </p>
              <pre className="code-block m-0 whitespace-pre-wrap" style={{ color: '#7af0b4' }}>
                {d.salida_esperada || ' '}
              </pre>
            </div>
            <div>
              <p className="font-display mb-1 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
                TU SALIDA
              </p>
              <pre className="code-block m-0 whitespace-pre-wrap" style={{ color: '#fb7185' }}>
                {d.salida_obtenida || '(nada)'}
              </pre>
            </div>
          </div>
        </div>
      )
    }
    const linea = dif?.linea ?? d.linea
    return (
      <ErrorItem
        etiqueta={linea ? `Línea ${linea}` : 'Salida'}
        tipo={d.caso ? `Caso de prueba ${d.caso} (oculto)` : 'Salida distinta'}
        texto={d.explicacion ?? `Tu respuesta difiere a partir de la línea ${linea}.`}
      />
    )
  }
  // excepción, tiempo agotado, salida excesiva, terminación
  const e = d.error
  return (
    <ErrorItem
      etiqueta={e.linea ? `L.${e.linea}` : d.tipo === 'tiempo_agotado' ? '⏱' : '!'}
      tipo={e.excepcion ?? (d.tipo === 'tiempo_agotado' ? 'Tiempo agotado' : d.tipo === 'salida_excesiva' ? 'Demasiada salida' : 'Ejecución')}
      texto={e.explicacion}
    />
  )
}

interface Accion {
  texto: string
  onClick: () => void
}

// Sirve para ejercicios y desafíos: `nombre` ajusta los textos y `accionExito` / `accionFallo`
// son el botón principal según el resultado.
export default function FeedbackView({
  resultado,
  tipo,
  nombre,
  respuestaEnviada,
  duracionSeg,
  onReintentar,
  accionExito,
  accionFallo,
}: {
  resultado: ResultadoEnvio
  tipo: TipoEjercicio
  nombre: 'ejercicio' | 'reto'
  respuestaEnviada: string
  duracionSeg: number
  onReintentar: () => void
  accionExito: Accion
  accionFallo: Accion
}) {
  const ok = resultado.correcto
  const esCodigo = tipo === 'codigo'
  const superados = resultado.casos.filter((c) => c.correcto).length
  const faltanIntentos = Math.max(0, FALLOS_PARA_SOLUCION - resultado.intentos_fallidos)

  return (
    <div className="mx-auto max-w-3xl p-6" aria-live="polite">
      {/* Banner del resultado */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: ok
            ? 'linear-gradient(135deg, rgba(22,163,74,0.14), rgba(22,163,74,0.05))'
            : 'linear-gradient(135deg, rgba(251,113,133,0.14), rgba(251,113,133,0.05))',
          border: `2px solid ${ok ? 'rgba(30,212,138,0.5)' : 'rgba(251,113,133,0.5)'}`,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${ok ? 'rgba(30,212,138,0.2)' : 'rgba(251,113,133,0.2)'} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          <div style={{ fontSize: 64, marginBottom: 8 }} aria-hidden="true">
            {ok ? '🎉' : '😅'}
          </div>
          <h1 className="font-display mb-2 text-3xl font-black" style={{ color: ok ? '#1ed48a' : '#fb7185' }}>
            {ok ? '¡Correcto!' : 'Casi lo logras'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {resultado.feedback}
          </p>
          {ok && (
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {[
                {
                  icon: '⚡',
                  label: 'XP ganados',
                  val: resultado.puntos_otorgados > 0 ? `+${formatoXp(resultado.puntos_otorgados)} XP` : 'Ya resuelto',
                  color: '#fbbf24',
                },
                ...(esCodigo
                  ? [{ icon: '🎯', label: 'Casos', val: `${superados}/${resultado.casos.length}`, color: '#1ed48a' }]
                  : [{ icon: '🎯', label: 'Intentos', val: String(resultado.intentos), color: '#1ed48a' }]),
                { icon: '⏱', label: 'Tiempo', val: formatoDuracion(duracionSeg), color: '#7af0b4' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl px-4 py-2" style={{ background: `${s.color}18`, border: `1px solid ${s.color}44` }}>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {s.icon} {s.label}
                  </p>
                  <p className="font-display text-lg font-black" style={{ color: s.color }}>
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          )}
          <LogrosNuevos logros={resultado.logros_nuevos ?? []} />
          {ok && resultado.ya_resuelto && (
            <p className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
              Ya habías resuelto este {nombre}: los puntos se otorgan solo la primera vez.
            </p>
          )}
        </div>
      </div>

      {!ok && resultado.diagnostico && (
        <div className="card-border mb-4 p-5" style={{ borderColor: 'rgba(251,113,133,0.35)' }}>
          <p className="font-display mb-3 text-sm font-bold" style={{ color: '#fb7185' }}>
            ❌ Errores encontrados
          </p>
          <div className="flex flex-col gap-2">
            <Errores d={resultado.diagnostico} />
          </div>
          {esCodigo && resultado.casos.length > 0 && (
            <p className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
              Casos de prueba superados: {superados} de {resultado.casos.length}
            </p>
          )}
        </div>
      )}

      {!ok && (resultado.pista || !resultado.solucion) && (
        <div className="card-border mb-4 p-4" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)' }}>
          <p className="font-display mb-2 text-sm font-bold" style={{ color: '#fbbf24' }}>
            💡 Recomendación
          </p>
          {resultado.pista && (
            <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {resultado.pista}
            </p>
          )}
          {!resultado.solucion && faltanIntentos > 0 && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              Si lo necesitas, la solución se mostrará después de {faltanIntentos} {faltanIntentos === 1 ? 'intento fallido más' : 'intentos fallidos más'}.
            </p>
          )}
        </div>
      )}

      {/* Comparación de código / respuestas */}
      {esCodigo ? (
        <div className={`mb-5 grid gap-4 ${!ok && resultado.solucion ? 'md:grid-cols-2' : ''}`}>
          <div>
            <p className="font-display mb-2 text-xs font-bold" style={{ color: ok ? '#1ed48a' : 'var(--color-muted)' }}>
              {ok ? 'TU SOLUCIÓN ✓' : `TU CÓDIGO · ${archivoJava(respuestaEnviada)}`}
            </p>
            <CodeBlock
              codigo={respuestaEnviada}
              lineasError={ok ? [] : lineasConError(resultado.diagnostico)}
              borde={ok ? 'rgba(30,212,138,0.3)' : 'rgba(251,113,133,0.3)'}
            />
          </div>
          {!ok && resultado.solucion && (
            <div>
              <p className="font-display mb-2 text-xs font-bold" style={{ color: '#1ed48a' }}>
                SOLUCIÓN CORRECTA
              </p>
              <CodeBlock codigo={resultado.solucion} borde="rgba(30,212,138,0.3)" />
            </div>
          )}
        </div>
      ) : (
        <div className="card-border mb-5 p-4">
          <p className="font-display mb-1 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
            TU RESPUESTA
          </p>
          <pre className="m-0 font-mono text-sm whitespace-pre-wrap" style={{ color: ok ? '#1ed48a' : '#fb7185' }}>
            {respuestaEnviada}
          </pre>
          {!ok && resultado.solucion && (
            <>
              <p className="font-display mt-3 mb-1 text-xs font-bold" style={{ color: '#1ed48a' }}>
                RESPUESTA CORRECTA
              </p>
              <pre className="m-0 font-mono text-sm whitespace-pre-wrap" style={{ color: '#7af0b4' }}>
                {resultado.solucion.split('|')[0]}
              </pre>
            </>
          )}
        </div>
      )}

      {ok && resultado.explicacion && (
        <div className="card-border mb-5 p-4" style={{ borderColor: 'rgba(30,212,138,0.3)', background: 'rgba(30,212,138,0.06)' }}>
          <p className="font-display mb-2 text-sm font-bold" style={{ color: '#7af0b4' }}>
            📚 ¿Sabías que...?
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
            {resultado.explicacion}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="font-display flex-1 rounded-xl py-3 text-sm font-bold" style={BOTON_SECUNDARIO} onClick={onReintentar}>
          {ok ? `← Volver al ${nombre}` : '↺ Intentar de nuevo'}
        </button>
        {ok ? (
          <button className="btn-primary flex-1 py-3 text-sm" onClick={accionExito.onClick}>
            {accionExito.texto}
          </button>
        ) : (
          <button className="btn-lime flex-1 py-3 text-sm" onClick={accionFallo.onClick}>
            {accionFallo.texto}
          </button>
        )}
      </div>
    </div>
  )
}
