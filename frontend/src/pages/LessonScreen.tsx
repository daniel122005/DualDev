import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CodeBlock from '@/components/CodeBlock'
import LogrosNuevos from '@/components/LogrosNuevos'
import TextoLeccion from '@/components/TextoLeccion'
import { usePerfil } from '@/hooks/usePerfil'
import { api, leerCache } from '@/services/api'
import type { Leccion, LogroNuevo, ResultadoPuntos } from '@/types/api'

type Pestana = 'explain' | 'code' | 'output'

const PAUSA_PREMIO_MS = 1200

const BOTON_SECUNDARIO = {
  background: 'var(--color-card2)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  color: 'var(--color-muted)',
} as const

export default function LessonScreen() {
  const { id } = useParams()
  const idLeccion = Number(id)
  const navigate = useNavigate()
  const { recargarPerfil } = usePerfil()
  const [leccion, setLeccion] = useState<Leccion | null>(() => leerCache<Leccion>(`/lessons/${idLeccion}`))
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Pestana>('explain')
  const [guardando, setGuardando] = useState(false)
  const [premio, setPremio] = useState<number | null>(null)
  const [logros, setLogros] = useState<LogroNuevo[]>([])

  useEffect(() => {
    let vigente = true
    api<Leccion>(`/lessons/${idLeccion}`)
      .then((l) => {
        if (!vigente) return
        setLeccion(l)
        setTab('explain')
        setPremio(null)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [idLeccion])

  // Marca la lección (el servidor da los puntos solo la primera vez) y continúa.
  async function completarY(ir: string) {
    if (!leccion) return
    setGuardando(true)
    try {
      if (!leccion.completada) {
        const r = await api<ResultadoPuntos>(`/lessons/${leccion.id_contenido}/complete`, { method: 'POST' })
        setLeccion({ ...leccion, completada: true })
        if (r.puntos_otorgados > 0) {
          setPremio(r.puntos_otorgados)
          setLogros(r.logros_nuevos ?? [])
          await recargarPerfil()
          // Deja ver la recompensa (y los logros, si hay) antes de continuar.
          const pausa = r.logros_nuevos?.length ? PAUSA_PREMIO_MS * 2 : PAUSA_PREMIO_MS
          await new Promise((resolve) => setTimeout(resolve, pausa))
        }
      }
      navigate(ir)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar tu avance')
    } finally {
      setGuardando(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          {error}
        </p>
        <Link to="/modulos" className="mt-3 inline-block text-sm" style={{ color: '#7af0b4' }}>
          ← Volver a los módulos
        </Link>
      </div>
    )
  }
  if (!leccion) return <div className="mx-auto max-w-4xl p-6" style={{ color: 'var(--color-muted)' }}>Cargando…</div>

  const destinoSiguiente = leccion.siguiente
    ? `/lecciones/${leccion.siguiente}`
    : leccion.primer_ejercicio
      ? `/practica/${leccion.primer_ejercicio}`
      : '/modulos'

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Migas */}
      <nav className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }} aria-label="Ruta">
        <Link to="/modulos" style={{ color: 'var(--color-muted)' }}>
          Módulos
        </Link>
        <span aria-hidden="true">›</span>
        <span style={{ color: '#1ed48a' }}>{leccion.modulo.titulo}</span>
        <span aria-hidden="true">›</span>
        <span>Lección {leccion.posicion}</span>
      </nav>

      {/* Cabecera */}
      <div className="card-border mb-5 p-5" style={{ borderColor: 'rgba(30,212,138,0.4)', background: 'rgba(30,212,138,0.06)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display mb-1 text-xs font-bold" style={{ color: '#1ed48a' }}>
              MÓDULO {leccion.modulo.orden} · LECCIÓN {leccion.posicion} DE {leccion.total_lecciones}
            </p>
            <h1 className="font-display text-xl font-black">{leccion.titulo}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Tiempo estimado
            </p>
            <p className="font-display font-bold" style={{ color: '#1ed48a' }}>
              ⏱ ~{leccion.minutos_estimados} min
            </p>
          </div>
        </div>
        <ol className="mt-3 flex gap-2" aria-label="Lecciones del módulo">
          {leccion.pasos.map((p, i) => {
            const actual = p.id_contenido === leccion.id_contenido
            return (
              <li key={p.id_contenido} className="flex flex-1 items-center gap-1">
                <Link
                  to={`/lecciones/${p.id_contenido}`}
                  title={p.titulo}
                  aria-current={actual ? 'step' : undefined}
                  className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    width: 24,
                    height: 24,
                    background: p.completada ? '#1ed48a' : actual ? 'rgba(30,212,138,0.25)' : 'var(--color-border)',
                    color: p.completada ? '#03110c' : actual ? '#1ed48a' : 'var(--color-muted)',
                    border: actual ? '2px solid #1ed48a' : 'none',
                  }}
                >
                  {p.completada ? '✓' : i + 1}
                </Link>
                {i < leccion.pasos.length - 1 && (
                  <div className="h-0.5 flex-1" style={{ background: p.completada ? '#1ed48a' : 'var(--color-border)' }} />
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Izquierda: contenido */}
        <div>
          <div className="mb-4 flex gap-2 rounded-xl p-1" role="tablist" style={{ background: 'var(--color-card)' }}>
            {(['explain', 'code', 'output'] as const).map((t) => {
              const deshabilitada = (t === 'code' && !leccion.codigo_ejemplo) || (t === 'output' && !leccion.salida_ejemplo)
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  disabled={deshabilitada}
                  className={`font-display flex-1 rounded-lg py-2 text-xs font-bold ${tab === t ? 'tab-active' : 'tab-inactive'}`}
                  style={deshabilitada ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                  onClick={() => setTab(t)}
                >
                  {t === 'explain' ? '📖 Explicación' : t === 'code' ? '💻 Código' : '▶ Salida'}
                </button>
              )
            })}
          </div>

          {tab === 'explain' && (
            <div className="card-border flex flex-col gap-4 p-5">
              <TextoLeccion texto={leccion.explicacion} />
              {leccion.tip && (
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
                >
                  💡 <strong>Tip:</strong> {leccion.tip}
                </div>
              )}
            </div>
          )}
          {tab === 'code' && leccion.codigo_ejemplo && <CodeBlock codigo={leccion.codigo_ejemplo} />}
          {tab === 'output' && leccion.salida_ejemplo && (
            <div className="code-block" style={{ color: '#7af0b4' }}>
              <p className="mb-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                ▶ Resultado de ejecución:
              </p>
              <pre className="m-0 font-mono whitespace-pre-wrap">{leccion.salida_ejemplo}</pre>
            </div>
          )}
        </div>

        {/* Derecha: verificación, recompensa y navegación */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.18), rgba(122,240,180,0.12))', border: '1px solid rgba(30,212,138,0.3)' }}
            aria-live="polite"
          >
            {premio !== null ? (
              <>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  ¡Lección completada!
                </p>
                <p className="font-display text-2xl font-black" style={{ color: '#fbbf24' }}>
                  +{premio} XP ⚡
                </p>
                <LogrosNuevos logros={logros} />
              </>
            ) : leccion.completada ? (
              <>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Ya completaste esta lección
                </p>
                <p className="font-display text-2xl font-black" style={{ color: '#1ed48a' }}>
                  ✓ Completada
                </p>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Completar esta lección
                </p>
                <p className="font-display text-2xl font-black" style={{ color: '#fbbf24' }}>
                  +{leccion.puntos} XP ⚡
                </p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              className="font-display flex-1 rounded-xl py-2 text-sm font-bold"
              style={BOTON_SECUNDARIO}
              onClick={() => navigate(leccion.anterior ? `/lecciones/${leccion.anterior}` : '/modulos')}
            >
              ← Anterior
            </button>
            <button
              className="btn-lime flex-1 py-2 text-sm"
              disabled={!leccion.primer_ejercicio || guardando}
              onClick={() => leccion.primer_ejercicio && completarY(`/practica/${leccion.primer_ejercicio}`)}
            >
              Practicar →
            </button>
          </div>
          <button className="btn-primary w-full py-3 text-sm" disabled={guardando} onClick={() => completarY(destinoSiguiente)}>
            {guardando ? 'Guardando…' : leccion.siguiente ? 'Siguiente lección →' : 'Terminar e ir a practicar →'}
          </button>
        </div>
      </div>
    </div>
  )
}
