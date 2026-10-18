import type { LogroNuevo } from '@/types/api'
import { LOGRO_ICONO, LOGRO_ICONO_POR_DEFECTO } from '@/utils/disenio'

// Aviso de "¡Logro desbloqueado!" tras ganar puntos.
export default function LogrosNuevos({ logros }: { logros: LogroNuevo[] }) {
  if (logros.length === 0) return null
  return (
    <div className="mt-4 flex flex-col items-center gap-2" role="status">
      {logros.map((l) => (
        <div
          key={l.id_logro}
          className="glow-yellow flex items-center gap-3 rounded-xl px-4 py-2"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)' }}
        >
          <span style={{ fontSize: 24 }} aria-hidden="true">
            {l.icono ?? LOGRO_ICONO[l.codigo] ?? LOGRO_ICONO_POR_DEFECTO}
          </span>
          <div className="text-left">
            <p className="font-display text-xs font-bold" style={{ color: '#fbbf24' }}>
              ¡Logro desbloqueado!
            </p>
            <p className="text-sm font-semibold">{l.nombre}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
