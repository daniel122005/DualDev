import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatoRestante, useAhora } from '@/hooks/useCuentaRegresiva'
import { api, leerCache } from '@/services/api'
import type { RetoResumen, RetosData } from '@/types/api'
import { DIFICULTAD_RETO, formatoXp, haceCuanto, PERIODO_RETO } from '@/utils/disenio'

const BOTON_SECUNDARIO = {
  background: 'var(--color-card2)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  color: 'var(--color-muted)',
} as const

const esLineaDeCodigo = (l: string) =>
  /[;{}]\s*$/.test(l) || /^\s*(int|long|double|boolean|char|String|for|while|do|if|else|System\.)\b/.test(l)

// Separa el enunciado en lo que se cuenta y el código que se muestra. Sin esto, los mini-retos
// ("¿Qué imprime este código?" + el código) se leían todos iguales en la lista, y los demás se
// cortaban en la primera línea, justo donde empiezan las reglas.
function partesDelEnunciado(enunciado: string) {
  const lineas = enunciado.replace(/\r/g, '').split('\n')
  // El texto va hasta donde empieza el código o el ejemplo de entrada/salida (eso es útil al
  // resolver el reto, no al elegirlo en la lista).
  const corte = lineas.findIndex((l) => esLineaDeCodigo(l) || /^ejemplo\b/i.test(l.trim()))
  const texto = lineas
    .slice(0, corte === -1 ? lineas.length : corte)
    .map((l) => l.trim().replace(/^-\s*/, '· '))
    .filter(Boolean)
    .join(' ')
  const inicioCodigo = lineas.findIndex(esLineaDeCodigo)
  const codigo = inicioCodigo === -1 ? [] : lineas.slice(inicioCodigo).filter((l) => l.trim() !== '')
  return { texto: texto.length > 160 ? `${texto.slice(0, 157)}…` : texto, codigo }
}

const LINEAS_VISIBLES = 4

function TarjetaReto({ reto, abierto, onToggle, ahora }: { reto: RetoResumen; abierto: boolean; onToggle: () => void; ahora: number }) {
  const navigate = useNavigate()
  const [verPistas, setVerPistas] = useState(false)
  const p = PERIODO_RETO[reto.periodo]
  const dif = DIFICULTAD_RETO[reto.dificultad]
  const restante = formatoRestante(reto.termina_en, ahora)
  const completado = reto.estado === 'completado'
  const { texto, codigo } = partesDelEnunciado(reto.enunciado)

  return (
    <div
      className="card-border p-5"
      style={{ borderColor: abierto ? `${p.color}88` : `${p.color}30`, background: abierto ? `${p.color}08` : 'var(--color-card)' }}
    >
      {/* En móvil: sin ícono grande y con el XP en una fila debajo, para que la descripción respire. */}
      <button className="flex w-full flex-col items-start gap-3 text-left sm:flex-row sm:gap-4" onClick={onToggle} aria-expanded={abierto}>
        <div
          className="hidden shrink-0 items-center justify-center rounded-2xl text-2xl sm:flex"
          style={{ width: 52, height: 52, background: `${p.color}18`, border: `2px solid ${p.color}44` }}
          aria-hidden="true"
        >
          {p.icono}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-black">{p.nombre}</span>
            <span aria-hidden="true">{p.insignia}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${dif.color}20`, color: dif.color }}>
              {dif.etiqueta}
            </span>
            {completado && (
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(30,212,138,0.15)', color: '#1ed48a' }}>
                ✓ Completado
              </span>
            )}
          </div>
          <p className="font-display mb-1 text-sm font-semibold" style={{ color: p.color }}>
            {reto.titulo}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
            {texto}
          </p>
          {codigo.length > 0 && (
            <pre
              className="code-block mt-2 mb-0 text-xs"
              style={{ padding: '10px 12px', lineHeight: 1.45, color: '#7af0b4' }}
              aria-label="Código del reto"
            >
              {codigo.slice(0, LINEAS_VISIBLES).join('\n')}
              {codigo.length > LINEAS_VISIBLES ? '\n…' : ''}
            </pre>
          )}
        </div>
        <div className="flex shrink-0 items-baseline gap-3 sm:block sm:text-right">
          <p className="font-display text-xl font-black" style={{ color: '#fbbf24' }}>
            +{formatoXp(reto.puntos)} XP
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            ⏱ {reto.minutos_estimados} min
          </p>
          <p className="text-xs font-bold sm:mt-1" style={{ color: restante ? '#7af0b4' : '#1ed48a' }}>
            {restante ? `⏳ ${restante}` : '✓ Disponible'}
          </p>
        </div>
      </button>

      {abierto && (
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${p.color}30` }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {reto.participantes === 0
                ? '¡Sé el primero en intentar este reto!'
                : `${reto.participantes} ${reto.participantes === 1 ? 'estudiante ha' : 'estudiantes han'} intentado este reto`}
            </p>
            <div className="flex gap-2">
              {reto.pistas.length > 0 && (
                <button
                  className="font-display rounded-xl px-4 py-2 text-sm font-bold"
                  style={BOTON_SECUNDARIO}
                  onClick={() => setVerPistas((v) => !v)}
                  aria-expanded={verPistas}
                >
                  {verPistas ? 'Ocultar pistas' : 'Ver pistas'}
                </button>
              )}
              <button className="btn-primary px-5 py-2 text-sm" onClick={() => navigate(`/retos/${reto.id_desafio}`)}>
                {completado ? 'Ver mi solución →' : reto.intentos > 0 ? 'Continuar reto →' : '¡Aceptar reto! →'}
              </button>
            </div>
          </div>
          {verPistas && (
            <ul className="mb-3 flex flex-col gap-1">
              {reto.pistas.map((pista) => (
                <li key={pista} className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  💡 {pista}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {['Ciclos', 'Java', dif.etiqueta, `+${reto.puntos} XP`].map((tag) => (
              <span key={tag} className="rounded-lg px-2 py-1 text-xs" style={{ background: `${p.color}15`, color: p.color }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChallengesScreen() {
  const [datos, setDatos] = useState<RetosData | null>(() => leerCache<RetosData>('/challenges'))
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<number | null>(null)
  const ahora = useAhora(Boolean(datos?.retos.some((r) => r.termina_en)))

  useEffect(() => {
    let vigente = true
    api<RetosData>('/challenges')
      .then((d) => vigente && setDatos(d))
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display mb-1 text-2xl font-black">Retos y Desafíos ⚡</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Supera retos, gana XP y escala en el ranking.</p>
        </div>
        {datos && (
          <div className="rounded-xl px-4 py-2 text-right" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Racha activa
            </p>
            <p className="font-display text-lg font-black" style={{ color: '#fbbf24' }}>
              🔥 {datos.racha} {datos.racha === 1 ? 'día' : 'días'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          No pudimos cargar los retos: {error}
        </p>
      )}
      {!datos && !error && <p style={{ color: 'var(--color-muted)' }}>Cargando…</p>}

      {datos && (
        <>
          <div className="mb-6 flex flex-col gap-4">
            {datos.retos.map((r) => (
              <TarjetaReto
                key={r.id_desafio}
                reto={r}
                ahora={ahora}
                abierto={abierto === r.id_desafio}
                onToggle={() => setAbierto(abierto === r.id_desafio ? null : r.id_desafio)}
              />
            ))}
          </div>

          <section>
            <h2 className="font-display mb-4 text-lg font-bold">Retos completados</h2>
            <div className="card-border p-4">
              {datos.completados.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Todavía no has completado retos. ¡Acepta el reto del día!
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {datos.completados.map((c) => (
                    <li key={c.id_desafio} className="flex items-center gap-3">
                      <span style={{ fontSize: 18 }} aria-hidden="true">
                        ✅
                      </span>
                      <div className="flex-1">
                        <p className="font-display text-sm font-semibold">{c.titulo}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {haceCuanto(c.fecha)}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: '#1ed48a' }}>
                        +{formatoXp(c.puntos)} XP
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
