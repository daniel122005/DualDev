import type { Diagnostico } from '@/types/api'

// Debe coincidir con FALLOS_PARA_VER_SOLUCION del backend (services/ejercicio.service.js).
export const FALLOS_PARA_SOLUCION = 3

// Líneas del código del estudiante que hay que resaltar según el diagnóstico.
export function lineasConError(d: Diagnostico | null): number[] {
  if (!d) return []
  if (d.tipo === 'compilacion') return d.errores.flatMap((e) => (e.linea ? [e.linea] : []))
  if (d.tipo === 'excepcion' || d.tipo === 'terminacion') return d.error.linea ? [d.error.linea] : []
  return []
}
