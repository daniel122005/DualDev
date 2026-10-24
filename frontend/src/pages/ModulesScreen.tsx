import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '@/components/ProgressBar'
import { api, leerCache } from '@/services/api'
import type { ModuloListado } from '@/types/api'
import { DIFICULTAD_MODULO, estiloModulo, formatoXp } from '@/utils/disenio'

const CHIPS_VISIBLES = 4

// Lleva a la primera lección pendiente del módulo (o a la primera si ya terminó todas).
function destino(m: ModuloListado): string | null {
  const leccion = m.lecciones.find((l) => !l.completada) ?? m.lecciones[0]
  return leccion ? `/lecciones/${leccion.id_contenido}` : null
}

export default function ModulesScreen() {
  const navigate = useNavigate()
  const [modulos, setModulos] = useState<ModuloListado[] | null>(() => leerCache<ModuloListado[]>('/modules'))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<ModuloListado[]>('/modules')
      .then(setModulos)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="font-display mb-1 text-2xl font-black">Módulos de aprendizaje</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          Aprende ciclos en Java paso a paso, desde lo básico hasta lo avanzado.
        </p>
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          No pudimos cargar los módulos: {error}
        </p>
      )}
      {!modulos && !error && <p style={{ color: 'var(--color-muted)' }}>Cargando…</p>}

      <ol className="flex flex-col gap-4">
        {modulos?.map((mod, idx) => {
          const { icono, color } = estiloModulo(mod.orden)
          const siguiente = modulos[idx + 1]
          const dif = DIFICULTAD_MODULO[mod.dificultad] ?? DIFICULTAD_MODULO.basico
          const hechas = mod.lecciones.filter((l) => l.completada).length
          const ir = destino(mod)
          return (
            <li key={mod.id_modulo} className="flex items-start gap-4">
              {/* Punto de la línea de tiempo */}
              <div className="flex flex-col items-center" style={{ paddingTop: 18 }} aria-hidden="true">
                <div
                  className="font-display flex items-center justify-center rounded-full text-sm font-black"
                  style={{
                    width: 40,
                    height: 40,
                    background: mod.bloqueado ? 'var(--color-card2)' : `${color}20`,
                    border: `2px solid ${mod.bloqueado ? 'var(--color-border)' : color}`,
                    color: mod.bloqueado ? 'var(--color-muted)' : color,
                  }}
                >
                  {mod.completado ? '✓' : mod.bloqueado ? '🔒' : mod.orden}
                </div>
                {siguiente && (
                  <div
                    style={{
                      width: 2,
                      height: 40,
                      marginTop: 4,
                      background: mod.bloqueado
                        ? 'var(--color-border)'
                        : `linear-gradient(${color}, ${estiloModulo(siguiente.orden).color})`,
                    }}
                  />
                )}
              </div>

              <button
                className="card-border flex-1 p-5 text-left"
                style={{ cursor: mod.bloqueado ? 'not-allowed' : 'pointer', opacity: mod.bloqueado ? 0.5 : 1, border: `1px solid ${color}30` }}
                onClick={() => !mod.bloqueado && ir && navigate(ir)}
                aria-disabled={mod.bloqueado}
                title={mod.bloqueado ? 'Completa al menos el 50 % del módulo anterior para desbloquearlo' : undefined}
              >
                <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span style={{ fontSize: 28 }} aria-hidden="true">
                      {icono}
                    </span>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-black">{mod.titulo}</span>
                        <span
                          className="font-display rounded-full px-2 py-0.5 text-xs font-bold"
                          style={{ background: `${dif.color}20`, color: dif.color }}
                        >
                          {dif.etiqueta}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        {mod.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-display text-sm font-black" style={{ color: '#7af0b4' }}>
                      +{formatoXp(mod.puntos_totales)} XP
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {mod.total_lecciones} lecciones · {mod.total_ejercicios} ejercicios
                    </p>
                  </div>
                </div>

                {mod.bloqueado ? (
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    🔒 Completa al menos el 50 % del módulo anterior para desbloquearlo.
                  </p>
                ) : (
                  <>
                    <div className="mb-2">
                      <ProgressBar value={mod.progreso} color={color} label={`Progreso en ${mod.titulo}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {mod.progreso}% completado
                      </p>
                      <span className="text-xs font-bold" style={{ color: mod.completado ? '#1ed48a' : color }}>
                        {mod.completado ? '✓ Completado' : mod.progreso > 0 ? 'Continuar →' : 'Comenzar →'}
                      </span>
                    </div>
                  </>
                )}

                {!mod.bloqueado && mod.progreso > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mod.lecciones.slice(0, CHIPS_VISIBLES).map((l) => (
                      <span
                        key={l.id_contenido}
                        className="rounded-lg px-2 py-1 text-xs"
                        style={{
                          background: l.completada ? `${color}20` : 'rgba(255,255,255,0.04)',
                          color: l.completada ? color : 'var(--color-muted)',
                        }}
                      >
                        {l.completada ? '✓ ' : ''}
                        {l.titulo}
                      </span>
                    ))}
                    {mod.lecciones.length > CHIPS_VISIBLES && (
                      <span className="rounded-lg px-2 py-1 text-xs" style={{ color: 'var(--color-muted)', background: 'rgba(255,255,255,0.04)' }}>
                        +{mod.lecciones.length - CHIPS_VISIBLES} más
                      </span>
                    )}
                    <span className="sr-only">
                      {hechas} de {mod.lecciones.length} lecciones terminadas
                    </span>
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
