import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, leerCache } from '@/services/api'
import type { EstadoEjercicio, ModuloDetalle, ModuloListado } from '@/types/api'
import { DIFICULTAD_EJERCICIO, estiloModulo, formatoXp } from '@/utils/disenio'
import {
  GRUPOS,
  guardarReflexion,
  leerReflexion,
  retroalimentar,
  SENTIMIENTOS,
  type Sentimiento,
} from '@/utils/retroalimentacion'

const ESTADO: Record<EstadoEjercicio, { texto: string; color: string; icono: string; accion: string }> = {
  resuelto: { texto: 'Resuelto', color: '#1ed48a', icono: '✓', accion: 'Ver mi respuesta →' },
  intentado: { texto: 'Por corregir', color: '#fbbf24', icono: '↻', accion: 'Seguir intentando →' },
  pendiente: { texto: 'Sin intentar', color: '#84b9a2', icono: '○', accion: 'Empezar →' },
}

const TIPO_TEXTO = { seleccion: 'Selección', respuesta_corta: 'Respuesta corta', salida: 'Predecir salida', codigo: 'Código Java' } as const

const TONO = {
  bien: { icono: '✅', color: '#1ed48a', fondo: 'rgba(30,212,138,0.08)' },
  mejorar: { icono: '🛠', color: '#fbbf24', fondo: 'rgba(251,191,36,0.07)' },
  pendiente: { icono: '📌', color: '#84b9a2', fondo: 'rgba(132,185,162,0.07)' },
} as const

function Anillo({ valor, color }: { valor: number; color: string }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label={`${valor} % del módulo completado`}>
      <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(122,240,180,0.1)" strokeWidth="12" />
      <circle
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - valor / 100)}
        transform="rotate(-90 66 66)"
        style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 8px ${color}88)` }}
      />
      <text x="66" y="64" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="28" fill="#effcf6">
        {valor}%
      </text>
      <text x="66" y="84" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fill="#84b9a2">
        completado
      </text>
    </svg>
  )
}

export default function ModuleSummaryScreen() {
  const { id } = useParams()
  const idModulo = Number(id)
  const navigate = useNavigate()
  const [modulo, setModulo] = useState<ModuloDetalle | null>(() => leerCache<ModuloDetalle>(`/modules/${idModulo}`))
  const [todos, setTodos] = useState<ModuloListado[] | null>(() => leerCache<ModuloListado[]>('/modules'))
  const [error, setError] = useState<string | null>(null)
  const [guardada, setReflexion] = useState(() => ({ id: idModulo, ...leerReflexion(idModulo) }))
  const reflexion = guardada.id === idModulo ? guardada : { id: idModulo, ...leerReflexion(idModulo) }

  useEffect(() => {
    let vigente = true
    Promise.all([api<ModuloDetalle>(`/modules/${idModulo}`), api<ModuloListado[]>('/modules')])
      .then(([m, lista]) => {
        if (!vigente) return
        setModulo(m)
        setTodos(lista)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [idModulo])

  function cambiarReflexion(sentimiento: Sentimiento | null, nota: string) {
    setReflexion({ id: idModulo, sentimiento, nota })
    guardarReflexion(idModulo, sentimiento, nota)
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
  if (!modulo) return <div className="mx-auto max-w-4xl p-6" style={{ color: 'var(--color-muted)' }}>Cargando…</div>

  const { icono, color } = estiloModulo(modulo.orden)
  const r = retroalimentar(modulo)
  const siguiente = todos?.find((m) => m.orden === modulo.orden + 1) ?? null
  const ejercicios = [...modulo.ejercicios].sort((a, b) => a.orden - b.orden)
  const porCorregir = ejercicios.find((e) => e.estado === 'intentado') ?? ejercicios.find((e) => e.estado === 'pendiente')
  const leccionPendiente = modulo.lecciones.find((l) => !l.completada)

  return (
    <div className="page-enter mx-auto max-w-4xl p-6">
      <nav className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }} aria-label="Ruta">
        <Link to="/modulos" style={{ color: 'var(--color-muted)' }}>
          Módulos
        </Link>
        <span aria-hidden="true">›</span>
        <span style={{ color: '#1ed48a' }}>{modulo.titulo}</span>
        <span aria-hidden="true">›</span>
        <span>Resumen</span>
      </nav>

      {/* Cabecera con el avance */}
      <section className="card-border mb-5 p-6" style={{ borderColor: `${color}55`, background: `linear-gradient(135deg, ${color}1f, rgba(3,17,12,0.4))` }}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <Anillo valor={modulo.progreso} color={r.insignia.color} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-display mb-1 text-xs font-bold tracking-wider" style={{ color }}>
              <span aria-hidden="true">{icono}</span> MÓDULO {modulo.orden} · RESUMEN
            </p>
            <h1 className="font-display mb-2 text-2xl font-black">{modulo.titulo}</h1>
            <p
              className="font-display mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: `${r.insignia.color}1a`, color: r.insignia.color, border: `1px solid ${r.insignia.color}44` }}
            >
              <span aria-hidden="true">{r.insignia.icono}</span> {r.insignia.titulo}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {r.resumen}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Lecciones', v: `${modulo.lecciones_completadas}/${modulo.total_lecciones}` },
            { k: 'Ejercicios resueltos', v: `${modulo.ejercicios_resueltos}/${modulo.total_ejercicios}` },
            { k: 'Por corregir', v: String(ejercicios.filter((e) => e.estado === 'intentado').length) },
            { k: 'XP ganado', v: `${formatoXp(r.xpGanado)}/${formatoXp(r.xpTotal)}` },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(2,11,8,0.5)', border: '1px solid var(--color-border)' }}>
              <dt className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {s.k}
              </dt>
              <dd className="font-display mt-1 text-lg font-black">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Retroalimentación */}
          <section className="card-border p-5" aria-labelledby="titulo-retro">
            <h2 id="titulo-retro" className="font-display mb-3 text-base font-black">
              💬 Retroalimentación de tu profe
            </h2>
            {r.mensajes.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Empieza por la primera lección y vuelve aquí para ver cómo vas.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {r.mensajes.map((m, i) => (
                  <li key={i} className="flex gap-3 rounded-xl p-3 text-sm" style={{ background: TONO[m.tono].fondo, border: `1px solid ${TONO[m.tono].color}33`, lineHeight: 1.55 }}>
                    <span aria-hidden="true">{TONO[m.tono].icono}</span>
                    <span>{m.texto}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Habilidades */}
          <section className="card-border p-5" aria-labelledby="titulo-habilidades">
            <h2 id="titulo-habilidades" className="font-display mb-4 text-base font-black">
              📊 Tus habilidades en este tema
            </h2>
            <div className="flex flex-col gap-4">
              {r.grupos.map((g) => {
                const pct = Math.round((g.resueltos / g.total) * 100)
                return (
                  <div key={g.grupo}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>
                        <span aria-hidden="true">{GRUPOS[g.grupo].icono}</span> {GRUPOS[g.grupo].nombre}
                      </span>
                      <span className="font-display font-bold" style={{ color: pct === 100 ? '#b6ff3c' : '#7af0b4' }}>
                        {g.resueltos}/{g.total}
                      </span>
                    </div>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={GRUPOS[g.grupo].nombre}
                    >
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Ejercicios */}
          <section className="card-border p-5" aria-labelledby="titulo-ejercicios">
            <h2 id="titulo-ejercicios" className="font-display mb-3 text-base font-black">
              🧩 Ejercicios del módulo
            </h2>
            <ol className="flex flex-col gap-2">
              {ejercicios.map((e, i) => {
                const est = ESTADO[e.estado]
                const dif = DIFICULTAD_EJERCICIO[e.dificultad]
                return (
                  <li key={e.id_ejercicio}>
                    <Link
                      to={`/practica/${e.id_ejercicio}`}
                      className="fila-ejercicio flex items-center gap-3 rounded-xl p-3"
                      style={{ border: `1px solid ${est.color}26` }}
                    >
                      <span
                        className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                        style={{ background: `${est.color}1f`, color: est.color }}
                        aria-hidden="true"
                      >
                        {e.estado === 'resuelto' ? '✓' : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{e.titulo}</span>
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {TIPO_TEXTO[e.tipo]} · <span style={{ color: dif.color }}>{dif.etiqueta}</span> · {e.puntos} XP
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xs font-bold" style={{ color: est.color }}>
                          {est.texto}
                        </span>
                        {/* Visible, no solo para lectores de pantalla: desde aquí se vuelve al
                            ejercicio y, si ya está resuelto, se ve la respuesta que diste. */}
                        <span className="block text-[11px]" style={{ color: '#7af0b4' }}>
                          {est.accion}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          {/* Qué aprendiste */}
          <section className="card-border p-5" aria-labelledby="titulo-aprendiste">
            <h2 id="titulo-aprendiste" className="font-display mb-3 text-base font-black">
              📚 Lo que viste
            </h2>
            <ul className="flex flex-col gap-2">
              {modulo.lecciones.map((l) => (
                <li key={l.id_contenido}>
                  <Link to={`/lecciones/${l.id_contenido}`} className="fila-ejercicio flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
                    <span aria-hidden="true" style={{ color: l.completada ? '#1ed48a' : 'var(--color-muted)' }}>
                      {l.completada ? '✓' : '○'}
                    </span>
                    <span className="flex-1" style={{ color: l.completada ? 'var(--color-text)' : 'var(--color-muted)' }}>
                      {l.titulo}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {l.completada ? 'Repasar' : 'Pendiente'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Autoevaluación */}
          <section className="card-border p-5" aria-labelledby="titulo-reflexion">
            <h2 id="titulo-reflexion" className="font-display mb-1 text-base font-black">
              🪞 ¿Cómo te fue con este tema?
            </h2>
            <p className="mb-3 text-xs" style={{ color: 'var(--color-muted)' }}>
              Tu autoevaluación te ayuda a decidir qué repasar. Se guarda solo en este navegador.
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="¿Cómo te sentiste?">
              {(Object.keys(SENTIMIENTOS) as Sentimiento[]).map((s) => {
                const activo = reflexion.sentimiento === s
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    className="opcion-sentimiento flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold"
                    data-activo={activo || undefined}
                    onClick={() => cambiarReflexion(activo ? null : s, reflexion.nota)}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {SENTIMIENTOS[s].icono}
                    </span>
                    {SENTIMIENTOS[s].texto}
                  </button>
                )
              })}
            </div>
            {reflexion.sentimiento && (
              <p className="mt-3 rounded-xl p-3 text-sm" style={{ background: 'rgba(182,255,60,0.06)', border: '1px solid rgba(182,255,60,0.2)', lineHeight: 1.55 }}>
                {SENTIMIENTOS[reflexion.sentimiento].consejo}
              </p>
            )}
            <label className="mt-3 block text-xs font-semibold" htmlFor="nota-reflexion" style={{ color: 'var(--color-muted)' }}>
              ¿Qué fue lo más difícil? (opcional)
            </label>
            <textarea
              id="nota-reflexion"
              className="mt-1 w-full p-3 text-sm"
              rows={3}
              maxLength={500}
              placeholder="Ej.: no entiendo cuándo usar < o <="
              value={reflexion.nota}
              onChange={(e) => cambiarReflexion(reflexion.sentimiento, e.target.value)}
            />
          </section>

          {/* Siguiente paso */}
          <section className="card-border flex flex-col gap-3 p-5" aria-labelledby="titulo-siguiente">
            <h2 id="titulo-siguiente" className="font-display text-base font-black">
              🚀 Tu siguiente paso
            </h2>
            {leccionPendiente && (
              <button className="btn-primary py-3 text-sm" onClick={() => navigate(`/lecciones/${leccionPendiente.id_contenido}`)}>
                Leer «{leccionPendiente.titulo}» →
              </button>
            )}
            {!leccionPendiente && porCorregir && (
              <button className="btn-primary py-3 text-sm" onClick={() => navigate(`/practica/${porCorregir.id_ejercicio}`)}>
                {porCorregir.estado === 'intentado' ? 'Corregir' : 'Resolver'} «{porCorregir.titulo}» →
              </button>
            )}
            {siguiente && !siguiente.bloqueado && (
              <button
                className={leccionPendiente || porCorregir ? 'btn-ghost py-3 text-sm' : 'btn-lime py-3 text-sm'}
                onClick={() => {
                  const l = siguiente.lecciones.find((x) => !x.completada) ?? siguiente.lecciones[0]
                  navigate(l ? `/lecciones/${l.id_contenido}` : '/modulos')
                }}
              >
                Ir al módulo {siguiente.orden}: {siguiente.titulo} →
              </button>
            )}
            {siguiente?.bloqueado && (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                🔒 «{siguiente.titulo}» se desbloquea cuando llegues al 50 % de este módulo.
              </p>
            )}
            {!siguiente && modulo.completado && (
              <button className="btn-lime py-3 text-sm" onClick={() => navigate('/retos')}>
                ¡Terminaste el curso! Ir a los retos →
              </button>
            )}
            <Link to="/modulos" className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              ← Volver a los módulos
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
