import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '@/components/ProgressBar'
import StatChip from '@/components/StatChip'
import { usePerfil } from '@/hooks/usePerfil'
import { api } from '@/services/api'
import type { DashboardData } from '@/types/api'
import { ACTIVIDAD_ICONO, estiloModulo, formatoXp, haceCuanto, LOGRO_ICONO, LOGRO_ICONO_POR_DEFECTO } from '@/utils/disenio'

const ACCIONES = [
  { icon: '⌨', label: 'Practicar', color: '#1ed48a', to: '/practica' },
  { icon: '⚡', label: 'Reto del día', color: '#fbbf24', to: '/retos' },
  { icon: '◫', label: 'Módulos', color: '#7af0b4', to: '/modulos' },
  { icon: '🏆', label: 'Ranking', color: '#fdba74', to: '/ranking' },
]

const LOGROS_VISIBLES = 6

export default function Dashboard() {
  const navigate = useNavigate()
  const { perfil, error: errorPerfil } = usePerfil()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<DashboardData>('/dashboard')
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error || errorPerfil) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          No pudimos cargar tu dashboard: {error ?? errorPerfil}
        </p>
      </div>
    )
  }
  if (!data || !perfil) {
    return <div className="mx-auto max-w-5xl p-6 text-sm" style={{ color: 'var(--color-muted)' }}>Cargando…</div>
  }

  const siguiente = data.nivel_siguiente
  const porcentajeNivel = siguiente ? Math.min(100, Math.round((data.puntos_acumulados / siguiente.puntos_minimos) * 100)) : 100
  const obtenidos = data.logros.filter((l) => l.obtenido).length

  return (
    <div className="grid-bg mx-auto max-w-5xl p-6" style={{ minHeight: '100vh' }}>
      {/* Bienvenida */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)', border: '1px solid rgba(30,212,138,0.35)' }}
      >
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 240,
            height: 240,
            background: 'radial-gradient(circle, rgba(182,255,60,0.18) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <p className="font-display mb-1 text-sm font-semibold" style={{ color: '#7af0b4' }}>
            ¡Bienvenido de vuelta! 👋
          </p>
          <h1 className="font-display mb-1 text-2xl font-black break-words">{perfil.nombre}</h1>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-muted)' }}>
            Semillero ITI{perfil.grado ? ` · Grado ${perfil.grado}` : ''} · Continúas donde lo dejaste
          </p>
          <div className="flex flex-wrap gap-4">
            <StatChip icon="⚡" label="Puntos XP" value={formatoXp(data.puntos_acumulados)} color="#fbbf24" />
            <StatChip icon="🎮" label="Nivel" value={`Nv. ${data.nivel.numero}`} color="#7af0b4" />
            <StatChip icon="🔥" label="Racha" value={`${data.racha} ${data.racha === 1 ? 'día' : 'días'}`} color="#fdba74" />
            <StatChip icon="🏆" label="Ranking" value={`#${data.ranking.posicion}`} color="#1ed48a" />
          </div>
        </div>
      </div>

      {/* Progreso de nivel */}
      <div className="card-border mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="font-display text-sm font-bold" style={{ color: '#7af0b4' }}>
              Nivel {data.nivel.numero} · {data.nivel.nombre}
            </span>
            {siguiente && (
              <>
                <span className="mx-2" style={{ color: 'var(--color-border)' }}>
                  →
                </span>
                <span className="font-display text-sm font-bold" style={{ color: 'var(--color-muted)' }}>
                  Nivel {siguiente.numero}
                </span>
              </>
            )}
          </div>
          {siguiente && (
            <span className="font-mono text-sm" style={{ color: 'var(--color-muted)' }}>
              {formatoXp(data.puntos_acumulados)} / {formatoXp(siguiente.puntos_minimos)} XP
            </span>
          )}
        </div>
        <ProgressBar value={porcentajeNivel} height={12} label="Progreso hacia el siguiente nivel" />
        <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
          {siguiente
            ? `¡Te faltan ${formatoXp(data.puntos_para_siguiente)} XP para subir de nivel!`
            : '¡Alcanzaste el nivel máximo!'}
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Módulos */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Módulos de aprendizaje</h2>
            <button
              className="font-display rounded-lg px-3 py-1 text-xs font-bold"
              style={{ color: '#7af0b4', background: 'rgba(30,212,138,0.12)', border: 'none', cursor: 'pointer' }}
              onClick={() => navigate('/modulos')}
            >
              Ver todos →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {data.modulos.map((m) => {
              const { icono, color } = estiloModulo(m.orden)
              return (
                <button
                  key={m.id_modulo}
                  className="card-border w-full p-4 text-left"
                  style={{ cursor: m.bloqueado ? 'not-allowed' : 'pointer', border: `1px solid ${color}33`, opacity: m.bloqueado ? 0.55 : 1 }}
                  onClick={() => !m.bloqueado && navigate('/modulos')}
                  aria-disabled={m.bloqueado}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-xl text-xl"
                      style={{ width: 40, height: 40, background: `${color}20`, border: `1px solid ${color}40` }}
                      aria-hidden="true"
                    >
                      {m.bloqueado ? '🔒' : icono}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold">{m.titulo}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {m.total_lecciones} lecciones · {m.total_ejercicios} ejercicios
                      </p>
                    </div>
                    {m.completado && (
                      <span className="rounded-full px-2 py-1 text-xs" style={{ background: 'rgba(30,212,138,0.15)', color: '#1ed48a' }}>
                        ✓ Listo
                      </span>
                    )}
                  </div>
                  <ProgressBar value={m.progreso} color={color} label={`Progreso en ${m.titulo}`} />
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                    {m.progreso}%
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display mb-4 text-lg font-bold">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {ACCIONES.map((a) => (
                <button
                  key={a.label}
                  className="card-border flex flex-col items-center gap-2 p-4"
                  style={{ cursor: 'pointer', border: `1px solid ${a.color}33` }}
                  onClick={() => navigate(a.to)}
                >
                  <span style={{ fontSize: 24 }} aria-hidden="true">
                    {a.icon}
                  </span>
                  <span className="font-display text-xs font-bold" style={{ color: a.color }}>
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Logros</h2>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {obtenidos} / {data.logros.length} obtenidos
              </span>
            </div>
            <div className="card-border p-4">
              <div className="grid grid-cols-3 gap-3">
                {data.logros.slice(0, LOGROS_VISIBLES).map((l) => (
                  <div
                    key={l.id_logro}
                    title={l.descripcion}
                    className="flex flex-col items-center gap-1 rounded-xl p-2"
                    style={{
                      background: l.obtenido ? 'rgba(30,212,138,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${l.obtenido ? 'rgba(30,212,138,0.35)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: l.obtenido ? 1 : 0.4,
                    }}
                  >
                    <span style={{ fontSize: 22, filter: l.obtenido ? 'none' : 'grayscale(1)' }} aria-hidden="true">
                      {l.icono ?? LOGRO_ICONO[l.codigo] ?? LOGRO_ICONO_POR_DEFECTO}
                    </span>
                    <span className="text-center text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.2 }}>
                      {l.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display mb-4 text-lg font-bold">Actividad reciente</h2>
            <div className="card-border flex flex-col gap-3 p-4">
              {data.actividad_reciente.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Aún no tienes actividad. ¡Empieza con tu primer ejercicio!
                </p>
              )}
              {data.actividad_reciente.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ fontSize: 18 }} aria-hidden="true">
                    {ACTIVIDAD_ICONO[a.tipo]}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{a.texto}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {haceCuanto(a.fecha)}
                    </p>
                  </div>
                  {a.puntos > 0 && (
                    <span className="font-mono text-xs font-bold" style={{ color: '#7af0b4' }}>
                      +{formatoXp(a.puntos)} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
