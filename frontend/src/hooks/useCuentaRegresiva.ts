import { useEffect, useState } from 'react'

// Texto "18:43:22" (menos de un día) o "4d 12h" hasta `hasta` (ISO). null si no vence.
export function formatoRestante(hasta: string | null, ahora: number): string | null {
  if (!hasta) return null
  const ms = Date.parse(hasta) - ahora
  if (ms <= 0) return 'Terminó'
  const s = Math.floor(ms / 1000)
  const dias = Math.floor(s / 86400)
  if (dias >= 1) return `${dias}d ${Math.floor((s % 86400) / 3600)}h`
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// Reloj que avanza cada segundo mientras haya algo que contar.
export function useAhora(activo: boolean) {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    if (!activo) return
    const t = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [activo])
  return ahora
}
