import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { ModuloDetalle, ModuloListado } from '@/types/api'

// "Práctica" del menú: lleva al primer ejercicio sin resolver del primer módulo abierto que no esté terminado.
export default function PracticaInicio() {
  const [destino, setDestino] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    ;(async () => {
      const modulos = await api<ModuloListado[]>('/modules')
      const abiertos = modulos.filter((m) => !m.bloqueado && m.total_ejercicios > 0)
      const modulo = abiertos.find((m) => m.ejercicios_resueltos < m.total_ejercicios) ?? abiertos[0]
      if (!modulo) return '/modulos'
      const detalle = await api<ModuloDetalle>(`/modules/${modulo.id_modulo}`)
      const ejercicio = detalle.ejercicios.find((e) => e.estado !== 'resuelto') ?? detalle.ejercicios[0]
      return ejercicio ? `/practica/${ejercicio.id_ejercicio}` : '/modulos'
    })()
      .then((d) => vigente && setDestino(d))
      .catch((e: Error) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [])

  if (destino) return <Navigate to={destino} replace />
  return (
    <div className="mx-auto max-w-5xl p-6" style={{ color: error ? 'var(--color-red)' : 'var(--color-muted)' }}>
      {error ? `No pudimos abrir la práctica: ${error}` : 'Buscando tu siguiente ejercicio…'}
    </div>
  )
}
