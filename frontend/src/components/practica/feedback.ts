import type { Diagnostico } from '@/types/api'

// Debe coincidir con FALLOS_PARA_VER_SOLUCION del backend (services/ejercicio.service.js).
export const FALLOS_PARA_SOLUCION = 3

// Líneas del código del estudiante que hay que resaltar según el diagnóstico.
export function lineasConError(d: Diagnostico | null): number[] {
  if (!d) return []
  const lineas = (d.recuerda ?? []).flatMap((r) => (r.linea ? [r.linea] : []))
  if (d.tipo === 'compilacion') lineas.push(...d.errores.flatMap((e) => (e.linea ? [e.linea] : [])))
  if ((d.tipo === 'excepcion' || d.tipo === 'terminacion') && d.error.linea) lineas.push(d.error.linea)
  return [...new Set(lineas)]
}
