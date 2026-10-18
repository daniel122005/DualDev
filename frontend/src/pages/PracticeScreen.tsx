import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CodeEditor from '@/components/CodeEditor'
import Consola from '@/components/practica/Consola'
import ExerciseList from '@/components/practica/ExerciseList'
import FeedbackView from '@/components/practica/FeedbackView'
import { lineasConError } from '@/components/practica/feedback'
import RespuestaSimple from '@/components/practica/RespuestaSimple'
import { usePerfil } from '@/hooks/usePerfil'
import { api, ApiError } from '@/services/api'
import type { Ejercicio, ResultadoEjecucion, ResultadoEnvio } from '@/types/api'
import { archivoJava, DIFICULTAD_EJERCICIO } from '@/utils/disenio'

// Borrador del código por ejercicio: solo comodidad local de este navegador (puede no existir).
const claveBorrador = (id: number) => `dualdev:borrador:${id}`
function leerBorrador(id: number): string | null {
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
    /* almacenamiento no disponible: se ignora */
  }
}
function borrarBorrador(id: number) {
  try {
    localStorage.removeItem(claveBorrador(id))
  } catch {
    /* idem */
  }
}

function mensajeError(e: unknown) {
  if (e instanceof ApiError && e.status === 429) return e.message
  return e instanceof Error ? e.message : 'Algo salió mal. Inténtalo de nuevo.'
}

export default function PracticeScreen() {
  const { id } = useParams()
  const idEjercicio = Number(id)
  const navigate = useNavigate()
  const { recargarPerfil } = usePerfil()

  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [ejecucion, setEjecucion] = useState<ResultadoEjecucion | null>(null)
  const [ejecutando, setEjecutando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null)
  const [enviado, setEnviado] = useState({ texto: '', segundos: 0 })
  // Momento en que se abrió el ejercicio (se fija al cargarlo) para medir la duración del intento.
  const inicio = useRef(0)

  useEffect(() => {
    let vigente = true
    api<Ejercicio>(`/exercises/${idEjercicio}`)
      .then((ej) => {
        if (!vigente) return
        setEjercicio(ej)
        setCodigo(leerBorrador(ej.id_ejercicio) ?? ej.codigo_inicial ?? '')
        setRespuesta('')
        setEjecucion(null)
        setResultado(null)
        setError(null)
        setErrorCarga(null)
        inicio.current = Date.now()
      })
      .catch((e: Error) => vigente && setErrorCarga(e.message))
    return () => {
      vigente = false
    }
  }, [idEjercicio])

  function cambiarCodigo(v: string) {
    setCodigo(v)
    guardarBorrador(idEjercicio, v)
  }

  function reiniciarCodigo() {
    if (!ejercicio) return
    setCodigo(ejercicio.codigo_inicial ?? '')
    borrarBorrador(idEjercicio)
    setEjecucion(null)
  }

  async function ejecutar() {
    setEjecutando(true)
    setError(null)
    try {
      setEjecucion(
        await api<ResultadoEjecucion>('/code/run', {
          method: 'POST',
          body: JSON.stringify({ codigo, id_ejercicio: idEjercicio }),
        }),
      )
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setEjecutando(false)
    }
  }

  async function enviar() {
    if (!ejercicio) return
    const texto = ejercicio.tipo === 'codigo' ? codigo : respuesta
    const segundos = Math.round((Date.now() - inicio.current) / 1000)
    setEnviando(true)
    setError(null)
    try {
      const r = await api<ResultadoEnvio>(`/exercises/${idEjercicio}/submit`, {
        method: 'POST',
        body: JSON.stringify({ respuesta: texto, duracion_seg: segundos }),
      })
      setEnviado({ texto, segundos })
      setResultado(r)
      if (r.correcto) {
        setEjercicio({
          ...ejercicio,
          resuelto: true,
          solucion: r.solucion,
          ejercicios_del_modulo: ejercicio.ejercicios_del_modulo.map((e) =>
            e.id_ejercicio === idEjercicio ? { ...e, resuelto: true } : e,
          ),
        })
        if (r.puntos_otorgados > 0) recargarPerfil()
      }
      window.scrollTo(0, 0)
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setEnviando(false)
    }
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          {errorCarga}
        </p>
        <Link to="/modulos" className="mt-3 inline-block text-sm" style={{ color: '#7af0b4' }}>
          ← Volver a los módulos
        </Link>
      </div>
    )
  }
  if (!ejercicio) return <div className="mx-auto max-w-5xl p-6" style={{ color: 'var(--color-muted)' }}>Cargando…</div>

  if (resultado) {
    const lista = ejercicio.ejercicios_del_modulo
    const idx = lista.findIndex((e) => e.id_ejercicio === idEjercicio)
    const siguiente = [...lista.slice(idx + 1), ...lista.slice(0, idx)].find((e) => !e.resuelto)
    return (
      <FeedbackView
        resultado={resultado}
        tipo={ejercicio.tipo}
        nombre="ejercicio"
        respuestaEnviada={enviado.texto}
        duracionSeg={enviado.segundos}
        onReintentar={() => setResultado(null)}
        accionExito={
          siguiente
            ? { texto: 'Siguiente ejercicio →', onClick: () => navigate(`/practica/${siguiente.id_ejercicio}`) }
            : { texto: 'Volver a los módulos →', onClick: () => navigate('/modulos') }
        }
        accionFallo={{
          texto: 'Repasar la lección →',
          onClick: () => navigate(ejercicio.primera_leccion ? `/lecciones/${ejercicio.primera_leccion}` : '/modulos'),
        }}
      />
    )
  }

  const dif = DIFICULTAD_EJERCICIO[ejercicio.dificultad]
  const esCodigo = ejercicio.tipo === 'codigo'
  const ocupado = ejecutando || enviando
  const listoParaEnviar = esCodigo ? codigo.trim() !== '' : respuesta.trim() !== ''
  const erroresEnEditor = ejecucion && !ejecucion.compilo
    ? lineasConError({ tipo: 'compilacion', errores: ejecucion.errores_compilacion })
    : ejecucion?.error?.linea
      ? [ejecucion.error.linea]
      : []

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="font-display mb-1 text-2xl font-black">Zona de Práctica ⌨</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          Módulo {ejercicio.modulo.orden} · {ejercicio.modulo.titulo} · Ejercicios
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        {/* En móvil el editor va primero; en escritorio la lista queda a la izquierda como en el diseño. */}
        <div className="order-2 md:order-1">
          <ExerciseList ejercicios={ejercicio.ejercicios_del_modulo} actual={idEjercicio} />
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 md:order-2">
          {/* Enunciado */}
          <div className="card-border p-4" style={{ borderColor: 'rgba(30,212,138,0.35)', background: 'rgba(30,212,138,0.06)' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display mb-1 text-base font-black">
                  Ejercicio {ejercicio.orden}: {ejercicio.titulo}
                  {ejercicio.resuelto && (
                    <span className="ml-2 align-middle text-xs font-bold" style={{ color: '#1ed48a' }}>
                      ✓ Resuelto
                    </span>
                  )}
                </h2>
                <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  {ejercicio.enunciado}
                </p>
                {ejercicio.ejemplos[0] && (
                  <p className="mt-2 text-xs" style={{ color: '#7af0b4' }}>
                    {ejercicio.ejemplos[0].entrada && (
                      <>
                        Entrada de ejemplo: <span className="font-mono">{ejercicio.ejemplos[0].entrada.replace(/\n/g, ' ⏎ ')}</span>
                        {' · '}
                      </>
                    )}
                    Resultado esperado: <span className="font-mono whitespace-pre-wrap">{ejercicio.ejemplos[0].salida.replace(/\n/g, ' ⏎ ')}</span>
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full px-2 py-1 text-xs font-bold" style={{ background: `${dif.color}26`, color: dif.color }}>
                {dif.etiqueta} · +{ejercicio.puntos} XP
              </span>
            </div>
            {ejercicio.pistas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {ejercicio.pistas.map((p) => (
                  <span key={p} className="rounded-lg px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)' }}>
                    💡 {p}
                  </span>
                ))}
              </div>
            )}
            {esCodigo && ejercicio.total_casos > ejercicio.ejemplos.length && (
              <p className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                Al enviar, tu programa se probará con {ejercicio.total_casos} casos (algunos ocultos).
              </p>
            )}
          </div>

          {esCodigo ? (
            <CodeEditor
              valor={codigo}
              onChange={cambiarCodigo}
              onReset={reiniciarCodigo}
              archivo={archivoJava(codigo)}
              lineasError={erroresEnEditor}
              deshabilitado={ocupado}
            />
          ) : (
            <RespuestaSimple
              tipo={ejercicio.tipo}
              opciones={ejercicio.opciones}
              grupo={`ejercicio-${ejercicio.id_ejercicio}`}
              valor={respuesta}
              onChange={setRespuesta}
            />
          )}

          {error && (
            <p role="alert" className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {esCodigo && (
              <button className="btn-lime flex flex-1 items-center justify-center gap-2 py-3 text-sm" onClick={ejecutar} disabled={ocupado || !listoParaEnviar}>
                {ejecutando ? <span className="font-mono">Ejecutando...</span> : <>▶ Ejecutar código</>}
              </button>
            )}
            <button className="btn-primary flex-1 py-3 text-sm" onClick={enviar} disabled={ocupado || !listoParaEnviar}>
              {enviando ? 'Evaluando…' : 'Enviar respuesta ✓'}
            </button>
          </div>

          {esCodigo && <Consola resultado={ejecucion} ejecutando={ejecutando} />}
        </div>
      </div>
    </div>
  )
}
