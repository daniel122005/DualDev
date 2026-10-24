import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/Logo'
import Modal from '@/components/Modal'
import ProgressBar from '@/components/ProgressBar'
import { usePerfil } from '@/hooks/usePerfil'
import { api, leerCache } from '@/services/api'
import type { PerfilCompleto } from '@/types/api'
import { estiloModulo, formatoXp, iniciales, LOGRO_ICONO, LOGRO_ICONO_POR_DEFECTO, haceCuanto } from '@/utils/disenio'

function formatoTiempo(seg: number) {
  if (seg < 60) return `${seg} s`
  const min = Math.round(seg / 60)
  if (min < 60) return `${min} min`
  return `${(min / 60).toFixed(1).replace('.', ',')} h`
}

function EditarPerfil({ perfil, onCerrar, onGuardado }: { perfil: PerfilCompleto; onCerrar: () => void; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(perfil.nombre)
  const [grado, setGrado] = useState(perfil.grado ?? '')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: SyntheticEvent) {
    e.preventDefault()
    if (nombre.trim().length < 2) return setError('Escribe tu nombre completo (mínimo 2 letras).')
    setGuardando(true)
    setError(null)
    try {
      await api('/profile', { method: 'PATCH', body: JSON.stringify({ nombre: nombre.trim(), grado: grado.trim() }) })
      onGuardado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
      setGuardando(false)
    }
  }

  return (
    <Modal titulo="Editar perfil" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <div>
          <label htmlFor="ed-nombre" className="font-display mb-2 block text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
            NOMBRE COMPLETO
          </label>
          <input id="ed-nombre" className="w-full px-4 py-3 text-sm" value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ed-grado" className="font-display mb-2 block text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
            GRADO
          </label>
          <input
            id="ed-grado"
            className="w-full px-4 py-3 text-sm"
            placeholder="Ej: 10°"
            value={grado}
            maxLength={20}
            onChange={(e) => setGrado(e.target.value)}
          />
        </div>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Tu correo ({perfil.correo}) no se puede cambiar.
        </p>
        {error && (
          <p role="alert" className="text-sm" style={{ color: 'var(--color-red)' }}>
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full py-3 text-sm" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  )
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { recargarPerfil } = usePerfil()
  const [perfil, setPerfil] = useState<PerfilCompleto | null>(() => leerCache<PerfilCompleto>('/profile'))
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)

  const cargar = useCallback(() => api<PerfilCompleto>('/profile').then(setPerfil), [])

  useEffect(() => {
    let vigente = true
    api<PerfilCompleto>('/profile')
      .then((p) => vigente && setPerfil(p))
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p role="alert" style={{ color: 'var(--color-red)' }}>
          No pudimos cargar tu perfil: {error}
        </p>
      </div>
    )
  }
  if (!perfil) return <div className="mx-auto max-w-4xl p-6" style={{ color: 'var(--color-muted)' }}>Cargando…</div>

  const obtenidos = perfil.logros.filter((l) => l.obtenido).length
  const siguiente = perfil.nivel_siguiente
  const pctNivel = siguiente ? Math.min(100, Math.round((perfil.puntos_acumulados / siguiente.puntos_minimos) * 100)) : 100
  const e = perfil.estadisticas

  const chips = [
    { label: 'XP Total', val: formatoXp(perfil.puntos_acumulados), color: '#fbbf24', icon: '⚡' },
    { label: 'Nivel', val: String(perfil.nivel.numero), color: '#7af0b4', icon: '🎮' },
    { label: 'Racha', val: `${perfil.racha} ${perfil.racha === 1 ? 'día' : 'días'}`, color: '#fdba74', icon: '🔥' },
    { label: 'Ranking', val: `#${perfil.ranking.posicion}`, color: '#1ed48a', icon: '🏆' },
    { label: 'Logros', val: `${obtenidos}/${perfil.logros.length}`, color: '#fbbf24', icon: '🏅' },
  ]

  const estadisticas = [
    { label: 'Ejercicios resueltos', val: String(e.ejercicios_resueltos), icon: '✅', color: '#1ed48a' },
    { label: 'Retos completados', val: String(e.desafios_completados), icon: '⚡', color: '#fbbf24' },
    { label: 'Lecciones vistas', val: String(e.lecciones_vistas), icon: '📖', color: '#7af0b4' },
    { label: 'Precisión promedio', val: e.precision === null ? '—' : `${e.precision}%`, icon: '🎯', color: '#fb7185' },
    { label: 'Tiempo de práctica', val: formatoTiempo(e.tiempo_practica_seg), icon: '⏱', color: '#1ed48a' },
    { label: 'Días activo', val: String(e.dias_activo), icon: '📅', color: '#fbbf24' },
  ]

  return (
    <div className="mx-auto max-w-4xl p-6">
      {editando && (
        <EditarPerfil
          perfil={perfil}
          onCerrar={() => setEditando(false)}
          onGuardado={async () => {
            setEditando(false)
            await Promise.all([cargar(), recargarPerfil()])
          }}
        />
      )}

      {/* Héroe */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #0a2219 0%, #04140e 100%)', border: '1px solid rgba(30,212,138,0.35)' }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            background: 'radial-gradient(circle, rgba(182,255,60,0.15) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row">
          <div className="relative shrink-0">
            <div
              className="font-display flex items-center justify-center rounded-2xl text-3xl font-black"
              style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #0e9f6e, #7af0b4)', boxShadow: '0 0 30px rgba(30,212,138,0.5)', color: '#03110c' }}
              aria-hidden="true"
            >
              {iniciales(perfil.nombre)}
            </div>
            <div style={{ position: 'absolute', bottom: -6, right: -6 }}>
              <LogoMark size={28} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display mb-0.5 text-2xl font-black break-words">{perfil.nombre}</h1>
            <p className="mb-3 text-sm" style={{ color: 'var(--color-muted)' }}>
              🎓 Instituto Técnico Industrial{perfil.grado ? ` · Grado ${perfil.grado}` : ''} · Semillero Java
            </p>
            <div className="flex flex-wrap gap-3">
              {chips.map((s) => (
                <div key={s.label} className="rounded-xl px-3 py-2" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {s.icon} {s.label}
                  </p>
                  <p className="font-display text-base font-black" style={{ color: s.color }}>
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            className="font-display shrink-0 rounded-xl px-4 py-2 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-muted)' }}
            onClick={() => setEditando(true)}
          >
            ✏️ Editar
          </button>
        </div>

        <div className="relative z-10 mt-5">
          <div className="mb-1 flex justify-between gap-2 text-xs">
            <span className="font-display font-bold" style={{ color: '#7af0b4' }}>
              Nivel {perfil.nivel.numero} · {perfil.nivel.nombre}
            </span>
            {siguiente && (
              <span className="font-mono" style={{ color: 'var(--color-muted)' }}>
                {formatoXp(perfil.puntos_acumulados)} / {formatoXp(siguiente.puntos_minimos)} XP
              </span>
            )}
          </div>
          <ProgressBar value={pctNivel} height={10} label="Progreso hacia el siguiente nivel" />
          <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
            {siguiente
              ? `${formatoXp(perfil.puntos_para_siguiente)} XP para Nivel ${siguiente.numero} · ${siguiente.nombre}`
              : '¡Alcanzaste el nivel máximo!'}
          </p>
        </div>
      </div>

      {/* Dos columnas: Progreso + Estadísticas a la izquierda y Logros (más alto) a la derecha, sin huecos. */}
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
        {/* Progreso en módulos (RF-09) */}
        <section>
          <h2 className="font-display mb-4 text-lg font-bold">Progreso en módulos</h2>
          <div className="card-border flex flex-col gap-4 p-4">
            {perfil.modulos.map((m) => {
              const { color } = estiloModulo(m.orden)
              return (
                <div key={m.id_modulo}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold">
                      {m.bloqueado ? '🔒 ' : ''}
                      {m.titulo}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: '#7af0b4' }}>
                        +{formatoXp(m.puntos_ganados)} XP
                      </span>
                      <span className="text-xs" style={{ color: m.completado ? '#1ed48a' : 'var(--color-muted)' }}>
                        {m.progreso}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={m.progreso} color={color} label={`Progreso en ${m.titulo}`} />
                </div>
              )
            })}
            <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted)' }}>Progreso general</span>
                <span className="font-display font-bold" style={{ color: '#7af0b4' }}>
                  {perfil.progreso_general}%
                </span>
              </div>
              <div className="mt-1">
                <ProgressBar value={perfil.progreso_general} height={6} label="Progreso general" />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                {perfil.modulos_completados} {perfil.modulos_completados === 1 ? 'módulo terminado' : 'módulos terminados'} ·{' '}
                {perfil.modulos_pendientes} {perfil.modulos_pendientes === 1 ? 'pendiente' : 'pendientes'}
              </p>
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <section>
          <h2 className="font-display mb-4 text-lg font-bold">Estadísticas</h2>
          <div className="card-border flex flex-col gap-3 p-4">
            {estadisticas.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }} aria-hidden="true">
                    {s.icon}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {s.label}
                  </span>
                </div>
                <span className="font-display text-base font-black" style={{ color: s.color }}>
                  {s.val}
                </span>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4 w-full py-3 text-sm" onClick={() => navigate('/ranking')}>
            Ver mi posición en el ranking →
          </button>
        </section>
        </div>

        {/* Logros */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Logros</h2>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {obtenidos} / {perfil.logros.length} desbloqueados
            </span>
          </div>
          <div className="card-border p-4">
            <ul className="grid grid-cols-2 gap-3">
              {perfil.logros.map((l) => (
                <li
                  key={l.id_logro}
                  className="rounded-xl p-3"
                  style={{
                    background: l.obtenido ? 'rgba(30,212,138,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${l.obtenido ? 'rgba(30,212,138,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: l.obtenido ? 1 : 0.45,
                  }}
                >
                  <div className="mb-1 text-2xl" style={{ filter: l.obtenido ? 'none' : 'grayscale(1)' }} aria-hidden="true">
                    {l.icono ?? LOGRO_ICONO[l.codigo] ?? LOGRO_ICONO_POR_DEFECTO}
                  </div>
                  <p className="font-display mb-0.5 text-xs font-bold">
                    {l.nombre}
                    <span className="sr-only">{l.obtenido ? ' (obtenido)' : ' (bloqueado)'}</span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.3 }}>
                    {l.descripcion}
                  </p>
                  {l.obtenido && l.fecha_obtencion && (
                    <p className="mt-1 text-xs" style={{ color: '#7af0b4' }}>
                      {haceCuanto(l.fecha_obtencion)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
