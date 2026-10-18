import { useOutletContext } from 'react-router-dom'
import type { PerfilOutletContext } from '@/types/api'

// Perfil del estudiante cargado por AppLayout (una sola vez por sesión).
export function usePerfil() {
  return useOutletContext<PerfilOutletContext>()
}
