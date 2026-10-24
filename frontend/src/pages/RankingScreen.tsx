import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, leerCache } from '@/services/api'
import type { FilaRanking, RankingData } from '@/types/api'
import { formatoXp } from '@/utils/disenio'

type Filtro = { clave: string; etiqueta: string; query: string }

const PODIO = {
  1: { fondo: 'linear-gradient(135deg, #fbbf24, #ff9f00)', texto: '#03110c', bloque: 'rgba(251,191,36,0.25)', borde: 'rgba(251,191,36,0.4)', color: '#fbbf24', alto: 110 },
  2: { fondo: 'linear-gradient(135deg, #c0c0d0, #888)', texto: '#07071a', bloque: 'rgba(192,192,208,0.2)', borde: 'rgba(192,192,208,0.3)', color: '#c0c0d0', alto: 80 },
  3: { fondo: 'linear-gradient(135deg, #cd7f32, #8b4513)', texto: '#fff', bloque: 'rgba(205,127,50,0.2)', borde: 'rgba(205,127,50,0.3)', color: '#cd7f32', alto: 60 },
} as const
const MEDALLA: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' }

function colorFila(f: FilaRanking) {
  if (f.posicion <= 3) return PODIO[f.posicion as 1 | 2 | 3].color
  return f.es_yo ? '#1ed48a' : '#0e9f6e'
}

function etiquetaModulo(titulo: string) {
  return titulo.replace(/^Ciclo /, 'Módulo ')
}

function Podio({ filas }: { filas: FilaRanking[] }) {
  // Orden visual del diseño: 2.º, 1.º, 3.º
  const orden = [filas[1], filas[0], filas[2]].filter(Boolean)
  return (
    <div className="flex items-end justify-center gap-4">
      {orden.map((f) => {
        const p = PODIO[(f.posicion <= 3 ? f.posicion : 3) as 1 | 2 | 3]
        const primero = f.posicion === 1
        return (
          <div key={`${f.posicion}-${f.nombre}`} className="flex flex-col items-center gap-2">
            {primero && (
              <span style={{ fontSize: 24 }} aria-hidden="true">
                👑
              </span>
            )}
            <div
              className="font-display flex items-center justify-center rounded-full font-black"
              style={{
                width: primero ? 64 : 52,
                height: primero ? 64 : 52,
                fontSize: primero ? 20 : 18,
                background: p.fondo,
                color: p.texto,
                boxShadow: primero ? '0 0 24px rgba(251,191,36,0.5)' : undefined,
              }}
            >
              {f.iniciales}
            </div>
            <p
              className={`font-display truncate text-center ${primero ? 'text-sm font-bold' : 'text-xs font-semibold'}`}
              style={{ maxWidth: 90 }}
              title={f.nombre}
            >
              {f.es_yo ? 'Tú' : f.nombre.split(' ')[0]}
            </p>
            <p className={`font-mono ${primero ? 'text-sm font-bold' : 'text-xs'}`} style={{ color: primero ? '#fbbf24' : 'var(--color-muted)' }}>
              {formatoXp(f.puntos)} XP
            </p>
            <div
              className="font-display flex items-center justify-center rounded-t-xl text-2xl font-black"
              style={{ width: 60, height: p.alto, background: p.bloque, border: `1px solid ${p.borde}`, borderBottom: 'none', color: p.color }}
              aria-label={`Puesto ${f.posicion}`}
            >
              {f.posicion}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function RankingScreen() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('global')
  const [datos, setDatos] = useState<RankingData | null>(() => leerCache<RankingData>('/ranking'))
  const [modulos, setModulos] = useState<RankingData['modulos']>(() => leerCache<RankingData>('/ranking')?.modulos ?? [])
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(() => leerCache('/ranking') === null)

  const filtros: Filtro[] = [
    { clave: 'global', etiqueta: 'Global', query: '' },
    { clave: 'semana', etiqueta: 'Esta semana', query: '?periodo=semana' },
    ...modulos.map((m) => ({ clave: `m${m.id_modulo}`, etiqueta: etiquetaModulo(m.titulo), query: `?modulo=${m.id_modulo}` })),
  ]
  const actual = filtros.find((f) => f.clave === filtro) ?? filtros[0]

  useEffect(() => {
    let vigente = true
    api<RankingData>(`/ranking${actual.query}`)
      .then((d) => {
        if (!vigente) return
        setDatos(d)
        setModulos(d.modulos)
        setError(null)
      })
      .catch((e: Error) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [actual.query])

  function elegir(clave: string) {
    setCargando(true)
    setFiltro(clave)
  }

  const top3 = datos?.filas.filter((f) => f.posicion <= 3).slice(0, 3) ?? []

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="font-display mb-1 text-2xl font-black">Ranking del Semillero 🏆</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          ITI · Semillero de Programación Java{datos ? ` · ${datos.total_estudiantes} estudiantes` : ''}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtro del ranking">
        {filtros.map((f) => (
          <button
            key={f.clave}
            role="tab"
            aria-selected={filtro === f.clave}
            className={`font-display rounded-xl px-4 py-2 text-xs font-bold ${filtro === f.clave ? 'tab-active' : 'tab-inactive'}`}
            style={{ border: '1px solid', borderColor: filtro === f.clave ? 'transparent' : 'var(--color-border)', cursor: 'pointer' }}
            onClick={() => elegir(f.clave)}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          No pudimos cargar el ranking: {error}
        </p>
      )}

      {datos && (
        <div style={{ opacity: cargando ? 0.5 : 1, transition: 'opacity .2s' }} aria-busy={cargando}>
          {top3.length > 0 && (
            <div
              className="relative mb-6 overflow-hidden rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)', border: '1px solid rgba(30,212,138,0.3)' }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 300,
                  height: 200,
                  background: 'radial-gradient(circle, rgba(182,255,60,0.12) 0%, transparent 70%)',
                }}
              />
              <p className="font-display relative mb-6 text-center text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
                TOP 3 — {actual.etiqueta.toUpperCase()}
              </p>
              <div className="relative">
                <Podio filas={top3} />
              </div>
            </div>
          )}

          {datos.filas.length === 0 || (datos.filas.length === 1 && datos.filas[0].puntos === 0) ? (
            <div className="card-border p-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              Nadie ha sumado puntos en este filtro todavía. ¡Sé el primero!
            </div>
          ) : (
            <div className="card-border overflow-hidden" role="table" aria-label="Ranking">
              <div
                role="row"
                className="font-display flex items-center gap-3 px-4 py-3 text-xs font-bold"
                style={{ color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-card2)' }}
              >
                <span role="columnheader" style={{ width: 32, textAlign: 'center' }}>#</span>
                <span role="columnheader" className="flex-1">Estudiante</span>
                <span role="columnheader" className="hidden sm:block" style={{ width: 80, textAlign: 'center' }}>Nivel</span>
                <span role="columnheader" style={{ width: 70, textAlign: 'right' }}>XP</span>
                <span role="columnheader" className="hidden sm:block" style={{ width: 70, textAlign: 'right' }}>Racha</span>
              </div>
              {datos.filas.map((f) => {
                const color = colorFila(f)
                return (
                  <div
                    key={`${f.posicion}-${f.nombre}-${f.es_yo}`}
                    role="row"
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid var(--color-border)', background: f.es_yo ? 'rgba(30,212,138,0.08)' : 'transparent' }}
                  >
                    <div
                      role="cell"
                      className="font-display flex shrink-0 items-center justify-center text-sm font-black"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: f.posicion <= 3 ? `${color}20` : 'transparent', color: f.posicion <= 3 ? color : 'var(--color-muted)' }}
                    >
                      {MEDALLA[f.posicion] ?? f.posicion}
                    </div>
                    <div
                      aria-hidden="true"
                      className="font-display flex shrink-0 items-center justify-center rounded-full text-xs font-black"
                      style={{ width: 34, height: 34, background: `${color}20`, border: `2px solid ${color}50`, color }}
                    >
                      {f.iniciales}
                    </div>
                    <div role="cell" className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display truncate text-sm font-semibold">{f.nombre}</span>
                        {f.es_yo && (
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(30,212,138,0.2)', color: '#1ed48a' }}>
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                    <div role="cell" className="hidden sm:block" style={{ width: 80, textAlign: 'center' }}>
                      <span className="rounded-full px-2 py-1 text-xs font-bold" style={{ background: `${color}20`, color }}>
                        Nv. {f.nivel}
                      </span>
                    </div>
                    <div role="cell" style={{ width: 70, textAlign: 'right' }}>
                      <span className="font-mono text-sm font-bold" style={{ color: f.es_yo ? '#1ed48a' : 'var(--color-text)' }}>
                        {formatoXp(f.puntos)}
                      </span>
                    </div>
                    <div role="cell" className="hidden sm:block" style={{ width: 70, textAlign: 'right' }}>
                      <span className="text-xs font-bold" style={{ color: f.racha >= 7 ? '#fbbf24' : 'var(--color-muted)' }}>
                        {f.racha >= 7 ? '🔥' : '📅'} {f.racha}d
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {datos.yo && (
            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4"
              style={{ background: 'rgba(30,212,138,0.08)', border: '1px solid rgba(30,212,138,0.3)' }}
            >
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Tu posición actual
                </p>
                <p className="font-display text-xl font-black" style={{ color: '#1ed48a' }}>
                  #{datos.yo.posicion} de {datos.participantes} {datos.participantes === 1 ? 'estudiante' : 'estudiantes'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {datos.yo.puntos_para_subir ? 'Para subir de puesto te faltan' : '¡Vas en primer lugar!'}
                </p>
                {datos.yo.puntos_para_subir && (
                  <p className="font-display text-xl font-black" style={{ color: '#fbbf24' }}>
                    {formatoXp(datos.yo.puntos_para_subir)} XP ⚡
                  </p>
                )}
              </div>
              <button className="btn-primary px-4 py-2 text-sm" onClick={() => navigate('/practica')}>
                ¡A practicar! →
              </button>
            </div>
          )}
        </div>
      )}
      {!datos && !error && <p style={{ color: 'var(--color-muted)' }}>Cargando…</p>}
    </div>
  )
}
