import type { ModuloDetalle, TipoEjercicio } from '@/types/api'

// Retroalimentación del resumen de módulo: se arma solo con el estado de cada lección/ejercicio
// (resuelto / intentado / pendiente). El backend decide los puntos; esto solo los explica.

export type Grupo = 'teoria' | 'lectura' | 'codigo'

export const GRUPOS: Record<Grupo, { nombre: string; icono: string; tipos: TipoEjercicio[]; consejo: string }> = {
  teoria: {
    nombre: 'Conceptos',
    icono: '🧠',
    tipos: ['seleccion', 'respuesta_corta'],
    consejo: 'Vuelve a leer la lección y fíjate en la explicación de cada opción incorrecta: ahí está la diferencia.',
  },
  lectura: {
    nombre: 'Leer código (predecir la salida)',
    icono: '🔎',
    tipos: ['salida'],
    consejo: 'Haz una prueba de escritorio: anota en una tabla el valor de cada variable en cada vuelta antes de escribir la salida.',
  },
  codigo: {
    nombre: 'Escribir programas',
    icono: '⌨',
    tipos: ['codigo'],
    consejo: 'Antes de enviar usa ▶ Ejecutar código y compara tu salida con la del ejemplo línea por línea, incluyendo espacios.',
  },
}

export interface EstadisticaGrupo {
  grupo: Grupo
  total: number
  resueltos: number
  intentados: number
}

export interface Mensaje {
  tono: 'bien' | 'mejorar' | 'pendiente'
  texto: string
}

export interface Retroalimentacion {
  insignia: { icono: string; titulo: string; color: string }
  resumen: string
  grupos: EstadisticaGrupo[]
  mensajes: Mensaje[]
  xpGanado: number
  xpTotal: number
}

export function retroalimentar(m: ModuloDetalle): Retroalimentacion {
  const grupos = (Object.keys(GRUPOS) as Grupo[])
    .map((g) => {
      const ej = m.ejercicios.filter((e) => GRUPOS[g].tipos.includes(e.tipo))
      return {
        grupo: g,
        total: ej.length,
        resueltos: ej.filter((e) => e.estado === 'resuelto').length,
        intentados: ej.filter((e) => e.estado === 'intentado').length,
      }
    })
    .filter((g) => g.total > 0)

  const xpGanado =
    m.ejercicios.filter((e) => e.estado === 'resuelto').reduce((s, e) => s + e.puntos, 0) +
    m.lecciones.filter((l) => l.completada).reduce((s, l) => s + l.puntos, 0)

  const insignia =
    m.progreso === 100
      ? { icono: '🏆', titulo: 'Tema dominado', color: '#b6ff3c' }
      : m.progreso >= 75
        ? { icono: '⭐', titulo: 'Muy buen avance', color: '#1ed48a' }
        : m.progreso >= 50
          ? { icono: '👍', titulo: 'Vas por buen camino', color: '#7af0b4' }
          : m.progreso > 0
            ? { icono: '🌱', titulo: 'Estás empezando', color: '#fbbf24' }
            : { icono: '📘', titulo: 'Aún sin empezar', color: '#84b9a2' }

  const mensajes: Mensaje[] = []
  for (const g of grupos) {
    const info = GRUPOS[g.grupo]
    if (g.resueltos === g.total) {
      mensajes.push({ tono: 'bien', texto: `${info.nombre}: resolviste los ${g.total}. ¡Esa parte del tema ya la dominas!` })
    } else if (g.intentados > 0) {
      mensajes.push({
        tono: 'mejorar',
        texto: `${info.nombre}: tienes ${g.intentados} ${g.intentados === 1 ? 'ejercicio intentado' : 'ejercicios intentados'} sin resolver. ${info.consejo}`,
      })
    } else if (g.resueltos / g.total >= 0.5) {
      mensajes.push({ tono: 'bien', texto: `${info.nombre}: llevas ${g.resueltos} de ${g.total}. Buen ritmo, termina los que faltan.` })
    }
  }

  const leccionesFaltan = m.lecciones.filter((l) => !l.completada)
  if (leccionesFaltan.length) {
    mensajes.push({
      tono: 'pendiente',
      texto: `Te ${leccionesFaltan.length === 1 ? 'falta 1 lección' : `faltan ${leccionesFaltan.length} lecciones`}: «${leccionesFaltan[0].titulo}»${leccionesFaltan.length > 1 ? ' y otras' : ''}. Leerlas primero hace más fáciles los ejercicios.`,
    })
  }
  const sinTocar = m.ejercicios.filter((e) => e.estado === 'pendiente').length
  if (sinTocar) {
    mensajes.push({ tono: 'pendiente', texto: `Aún no has intentado ${sinTocar} ${sinTocar === 1 ? 'ejercicio' : 'ejercicios'} de este módulo.` })
  }

  const dificiles = m.ejercicios.filter((e) => e.dificultad === 'dificil')
  const dificilesBien = dificiles.filter((e) => e.estado === 'resuelto').length
  if (dificiles.length && dificilesBien === dificiles.length) {
    mensajes.push({ tono: 'bien', texto: `Resolviste todos los ejercicios difíciles (${dificiles.length}). Eso demuestra que entiendes el tema a fondo.` })
  }

  const resumen =
    m.progreso === 100
      ? `Completaste todo el módulo «${m.titulo}». Revisa abajo qué aprendiste y sigue con el siguiente tema.`
      : m.progreso >= 50
        ? `Llevas el ${m.progreso} % de «${m.titulo}». El siguiente módulo ya está desbloqueado, pero terminar este te dará bases más firmes.`
        : `Llevas el ${m.progreso} % de «${m.titulo}». Te falta llegar al 50 % para desbloquear el siguiente módulo.`

  return { insignia, resumen, grupos, mensajes, xpGanado, xpTotal: m.puntos_totales }
}

// Autoevaluación del estudiante: queda solo en este navegador (comodidad personal, no se envía).
export type Sentimiento = 'costo' | 'bien' | 'domino'

export const SENTIMIENTOS: Record<Sentimiento, { icono: string; texto: string; consejo: string }> = {
  costo: {
    icono: '😕',
    texto: 'Me costó',
    consejo: 'Es normal: los ciclos se entienden practicando. Repasa la lección con la pestaña ▶ Salida y haz una prueba de escritorio del ejemplo antes de volver a los ejercicios.',
  },
  bien: {
    icono: '🙂',
    texto: 'Lo entendí',
    consejo: '¡Bien! Para afianzarlo, intenta los ejercicios difíciles del módulo y luego un reto del día.',
  },
  domino: {
    icono: '😎',
    texto: 'Lo domino',
    consejo: '¡Excelente! Ponte a prueba con los retos semanales y ayuda a un compañero explicándole el tema: enseñar es la mejor forma de aprender.',
  },
}

const claveReflexion = (idModulo: number) => `dualdev:reflexion:${idModulo}`

export function leerReflexion(idModulo: number): { sentimiento: Sentimiento | null; nota: string } {
  try {
    const crudo = localStorage.getItem(claveReflexion(idModulo))
    if (!crudo) return { sentimiento: null, nota: '' }
    const datos = JSON.parse(crudo) as { sentimiento?: string; nota?: string }
    const sentimiento = datos.sentimiento && datos.sentimiento in SENTIMIENTOS ? (datos.sentimiento as Sentimiento) : null
    return { sentimiento, nota: typeof datos.nota === 'string' ? datos.nota.slice(0, 500) : '' }
  } catch {
    return { sentimiento: null, nota: '' }
  }
}

export function guardarReflexion(idModulo: number, sentimiento: Sentimiento | null, nota: string) {
  try {
    localStorage.setItem(claveReflexion(idModulo), JSON.stringify({ sentimiento, nota: nota.slice(0, 500) }))
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
