// Íconos y colores del diseño (Figma Make). Se indexan por orden de módulo y código de logro,
// así el backend no necesita guardar presentación.

export const MODULO_ESTILO: Record<number, { icono: string; color: string }> = {
  1: { icono: '🔁', color: '#0e9f6e' },
  2: { icono: '🔢', color: '#1ed48a' },
  3: { icono: '♾️', color: '#7af0b4' },
  4: { icono: '🔄', color: '#fbbf24' },
  5: { icono: '🔀', color: '#fdba74' },
}
export const MODULO_ESTILO_POR_DEFECTO = { icono: '📘', color: '#1ed48a' }

export const LOGRO_ICONO: Record<string, string> = {
  primer_paso: '🏅',
  constante: '🎯',
  modulo_uno: '🧩',
  maestro_ciclos: '🏆',
  cien_puntos: '⚡',
  trescientos: '🔥',
  retador: '🚀',
}
export const LOGRO_ICONO_POR_DEFECTO = '🌟'

export const ACTIVIDAD_ICONO = { ejercicio: '✅', desafio: '⚡', logro: '🏅' } as const

// Etiquetas y colores de dificultad del diseño.
export const DIFICULTAD_MODULO = {
  basico: { etiqueta: 'Básico', color: '#1ed48a' },
  intermedio: { etiqueta: 'Intermedio', color: '#fbbf24' },
  avanzado: { etiqueta: 'Avanzado', color: '#fb7185' },
} as const

export const DIFICULTAD_EJERCICIO = {
  facil: { etiqueta: 'Fácil', color: '#1ed48a' },
  media: { etiqueta: 'Medio', color: '#fbbf24' },
  dificil: { etiqueta: 'Difícil', color: '#fb7185' },
} as const

// Tarjetas de reto del diseño (Reto Diario ⚡ / Reto Semanal 🏆 / Mini-reto 🎯).
export const PERIODO_RETO = {
  diario: { nombre: 'Reto Diario', icono: '⚡', insignia: '🔥', color: '#fbbf24' },
  semanal: { nombre: 'Reto Semanal', icono: '🏆', insignia: '🌟', color: '#7af0b4' },
  mini: { nombre: 'Mini-reto', icono: '🎯', insignia: '💚', color: '#1ed48a' },
} as const

export const DIFICULTAD_RETO = {
  facil: { etiqueta: 'Básico', color: '#1ed48a' },
  media: { etiqueta: 'Intermedio', color: '#fbbf24' },
  dificil: { etiqueta: 'Avanzado', color: '#fb7185' },
} as const

export function formatoDuracion(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Nombre del archivo que verá el estudiante (la clase pública define el nombre en Java).
export function archivoJava(codigo: string): string {
  const m = codigo.match(/\bpublic\s+(?:final\s+|abstract\s+)*class\s+([A-Za-z_$][\w$]*)/)
  return `${m ? m[1] : 'Main'}.java`
}

export function estiloModulo(orden: number) {
  return MODULO_ESTILO[orden] ?? MODULO_ESTILO_POR_DEFECTO
}

// "Hace 2h", "Ayer", "Hace 3 días"…
export function haceCuanto(fechaIso: string, ahora = new Date()): string {
  const min = Math.max(0, Math.round((ahora.getTime() - new Date(fechaIso).getTime()) / 60000))
  if (min < 1) return 'Ahora mismo'
  if (min < 60) return `Hace ${min} min`
  const horas = Math.round(min / 60)
  if (horas < 24) return `Hace ${horas}h`
  const dias = Math.round(horas / 24)
  if (dias === 1) return 'Ayer'
  if (dias < 30) return `Hace ${dias} días`
  const meses = Math.round(dias / 30)
  return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

export function formatoXp(n: number): string {
  return n.toLocaleString('es-CO')
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}
