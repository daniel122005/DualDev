import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CodeBlock from '@/components/CodeBlock'
import CodeEditor from '@/components/CodeEditor'
import Consola from '@/components/practica/Consola'
import FeedbackView from '@/components/practica/FeedbackView'
import { lineasConError } from '@/components/practica/feedback'
import RespuestaSimple from '@/components/practica/RespuestaSimple'
import { formatoRestante, useAhora } from '@/hooks/useCuentaRegresiva'
import { usePerfil } from '@/hooks/usePerfil'
import { api } from '@/services/api'
import type { ResultadoEjecucion, ResultadoEnvio, RetoDetalle } from '@/types/api'
import { archivoJava, DIFICULTAD_RETO, formatoXp, PERIODO_RETO } from '@/utils/disenio'

// Borrador del código por reto: comodidad local del navegador (puede no estar disponible).
const claveBorrador = (id: number) => `dualdev:borrador-reto:${id}`
function leerBorrador(id: number) {
  try {
    return localStorage.getItem(claveBorrador(id))
  } catch {
    return null
  }
}
function guardarBorrador(id: number, codigo: string) {
  try {
    localStorage.setItem(claveBorrador(id), codigo)
  } catch {
    /* sin almacenamiento: se ignora */
  }
}

export default function ChallengeSolveScreen() {
  const { id } = useParams()
  const idReto = Number(id)
  const navigate = useNavigate()
  const { recargarPerfil } = usePerfil()

  const [reto, setReto] = useState<RetoDetalle | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [ejecucion, setEjecucion] = useState<ResultadoEjecucion | null>(null)
  const [ejecutando, setEjecutando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null)
  const [enviado, setEnviado] = useState({ texto: '', segundos: 0 })
  // Lo que leerá el Scanner al ejecutar: empieza con el ejemplo del reto y se puede cambiar.
  const [entradaConsola, setEntradaConsola] = useState('')
  const inicio = useRef(0)
  const ahora = useAhora(Boolean(reto?.termina_en))

  useEffect(() => {
    let vigente = true
    api<RetoDetalle>(`/challenges/${idReto}`)
      .then((r) => {
        if (!vigente) return
        setReto(r)
        setCodigo(leerBorrador(r.id_desafio) ?? r.codigo_inicial ?? '')
        setEntradaConsola(r.ejemplos[0]?.entrada ?? '')
        inicio.current = Date.now()
      })
      .catch((e: Error) => vigente && setErrorCarga(e.message))
    return () => {
      vigente = false
    }
  }, [idReto])

  async function ejecutar() {
    setEjecutando(true)
    setError(null)
    try {
      setEjecucion(await api<ResultadoEjecucion>(`/challenges/${idReto}/run`, { method: 'POST', body: JSON.stringify({ codigo, entrada: entradaConsola }) }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo ejecutar')
    } finally {
      setEjecutando(false)
    }
  }

  async function enviar() {
    if (!reto) return
    const texto = reto.tipo === 'codigo' ? codigo : respuesta
    const segundos = Math.round((Date.now() - inicio.current) / 1000)
    setEnviando(true)
    setError(null)
    try {
      const r = await api<ResultadoEnvio>(`/challenges/${idReto}/submit`, {
        method: 'POST',
        body: JSON.stringify({ respuesta: texto, duracion_seg: segundos }),
      })
      setEnviado({ texto, segundos })
      setResultado(r)
      setReto({ ...reto, estado: r.correcto ? 'completado' : reto.estado === 'completado' ? 'completado' : 'intentado', intentos: r.intentos, solucion: r.solucion })
      if (r.puntos_otorgados > 0) recargarPerfil()
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          {errorCarga}
        </p>
        <Link to="/retos" className="mt-3 inline-block text-sm" style={{ color: '#7af0b4' }}>
          ← Volver a los retos
        </Link>
      </div>
    )
  }
  if (!reto) return <div className="mx-auto max-w-4xl p-6" style={{ color: 'var(--color-muted)' }}>Cargando…</div>

  if (resultado) {
    return (
      <FeedbackView
        resultado={resultado}
        tipo={reto.tipo}
        nombre="reto"
        respuestaEnviada={enviado.texto}
        duracionSeg={enviado.segundos}
        onReintentar={() => setResultado(null)}
        accionExito={{ texto: 'Ver más retos →', onClick: () => navigate('/retos') }}
        accionFallo={{ texto: 'Volver a los retos →', onClick: () => navigate('/retos') }}
      />
    )
  }

  const p = PERIODO_RETO[reto.periodo]
  const dif = DIFICULTAD_RETO[reto.dificultad]
  const restante = formatoRestante(reto.termina_en, ahora)
  const esCodigo = reto.tipo === 'codigo'
  const ocupado = ejecutando || enviando
  const listo = esCodigo ? codigo.trim() !== '' : respuesta.trim() !== ''
  const erroresEnEditor =
    ejecucion && !ejecucion.compilo
      ? lineasConError({ tipo: 'compilacion', errores: ejecucion.errores_compilacion })
      : ejecucion?.error?.linea
        ? [ejecucion.error.linea]
        : []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <nav className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }} aria-label="Ruta">
        <Link to="/retos" style={{ color: 'var(--color-muted)' }}>
          Retos
        </Link>
        <span aria-hidden="true">›</span>
        <span style={{ color: p.color }}>{p.nombre}</span>
      </nav>

      <div className="card-border mb-5 p-5" style={{ borderColor: `${p.color}66`, background: `${p.color}0a` }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ width: 52, height: 52, background: `${p.color}18`, border: `2px solid ${p.color}44` }}
              aria-hidden="true"
            >
              {p.icono}
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-display text-xs font-bold" style={{ color: p.color }}>
                  {p.nombre.toUpperCase()}
                </span>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${dif.color}20`, color: dif.color }}>
                  {dif.etiqueta}
                </span>
                {reto.estado === 'completado' && (
                  <span className="text-xs font-bold" style={{ color: '#1ed48a' }}>
                    ✓ Completado
                  </span>
                )}
              </div>
              <h1 className="font-display mb-2 text-xl font-black">{reto.titulo}</h1>
              <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
                {reto.enunciado}
              </p>
              {reto.ejemplos[0] && (
                <p className="mt-2 text-xs" style={{ color: '#7af0b4' }}>
                  {reto.ejemplos[0].entrada && (
                    <>
                      Entrada de ejemplo: <span className="font-mono">{reto.ejemplos[0].entrada.replace(/\n/g, ' ⏎ ')}</span>
                      {' · '}
                    </>
                  )}
                  Resultado esperado: <span className="font-mono whitespace-pre-wrap">{reto.ejemplos[0].salida.replace(/\n/g, ' ⏎ ')}</span>
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-black" style={{ color: '#fbbf24' }}>
              +{formatoXp(reto.puntos)} XP
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              ⏱ {reto.minutos_estimados} min
            </p>
            {restante && (
              <p className="mt-1 text-xs font-bold" style={{ color: '#7af0b4' }}>
                ⏳ {restante}
              </p>
            )}
          </div>
        </div>
        {reto.pistas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {reto.pistas.map((pista) => (
              <span key={pista} className="rounded-lg px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)' }}>
                💡 {pista}
              </span>
            ))}
          </div>
        )}
        {esCodigo && reto.total_casos > reto.ejemplos.length && (
          <p className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
            Al enviar, tu programa se probará con {reto.total_casos} casos (algunos ocultos).
          </p>
        )}
      </div>

      {!reto.vigente ? (
        <div className="card-border p-5">
          <p className="mb-3 text-sm" style={{ color: 'var(--color-muted)' }}>
            Este reto ya cerró. Lo completaste: aquí está la solución de referencia para repasar.
          </p>
          {reto.solucion && (esCodigo ? <CodeBlock codigo={reto.solucion} /> : <pre className="code-block m-0">{reto.solucion}</pre>)}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {esCodigo ? (
            <CodeEditor
              valor={codigo}
              onChange={(v) => {
                setCodigo(v)
                guardarBorrador(idReto, v)
              }}
              onReset={() => {
                setCodigo(reto.codigo_inicial ?? '')
                guardarBorrador(idReto, reto.codigo_inicial ?? '')
                setEjecucion(null)
              }}
              archivo={archivoJava(codigo)}
              lineasError={erroresEnEditor}
              deshabilitado={ocupado}
            />
          ) : (
            <RespuestaSimple tipo={reto.tipo} opciones={reto.opciones} grupo={`reto-${reto.id_desafio}`} valor={respuesta} onChange={setRespuesta} />
          )}

          {error && (
            <p role="alert" className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {esCodigo && (
              <button className="btn-lime flex flex-1 items-center justify-center gap-2 py-3 text-sm" onClick={ejecutar} disabled={ocupado || !listo}>
                {ejecutando ? <span className="font-mono">Ejecutando...</span> : <>▶ Ejecutar código</>}
              </button>
            )}
            <button className="btn-primary flex-1 py-3 text-sm" onClick={enviar} disabled={ocupado || !listo}>
              {enviando ? 'Evaluando…' : 'Enviar respuesta ✓'}
            </button>
          </div>

          {esCodigo && (
            <Consola
              resultado={ejecucion}
              ejecutando={ejecutando}
              archivo={archivoJava(codigo)}
              onLimpiar={() => setEjecucion(null)}
              pideEntrada={Boolean(reto.ejemplos.some((e) => e.entrada))}
              entrada={entradaConsola}
              onEntrada={setEntradaConsola}
            />
          )}
        </div>
      )}
    </div>
  )
}
