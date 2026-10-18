// Evaluación común a ejercicios y desafíos. Un "ítem" tiene: tipo, opciones, solucion_esperada,
// casos_prueba, requiere. Nunca se devuelven entradas/salidas de casos ocultos ni texto producido
// por el programa en un caso oculto (ver sanitizarErrorOculto).
import { estructurasFaltantes } from '../runner/comparar.js'
import { sanitizarErrorOculto } from '../runner/diagnosticos.js'
import { ejecutarJava } from '../runner/index.js'
import { evaluarRespuestaSimple } from '../utils/evaluacion.js'
import { HttpError } from '../utils/httpError.js'

// Tras este número de intentos fallidos se muestra la solución (antes se ofrecen pistas).
export const FALLOS_PARA_VER_SOLUCION = 3
const MAX_TEXTO_DETALLE = 2000

const NOMBRE_ESTRUCTURA = { for: 'un ciclo for', while: 'un ciclo while', 'do-while': 'un ciclo do-while', break: 'break', continue: 'continue', if: 'un if' }

function recortar(texto) {
  if (texto == null) return texto
  return texto.length > MAX_TEXTO_DETALLE ? `${texto.slice(0, MAX_TEXTO_DETALLE)}…` : texto
}

export function casosVisibles(casos) {
  return (casos ?? []).filter((c) => c.visible).map((c) => ({ entrada: c.entrada, salida: c.salida }))
}

// Pista que corresponde tras N fallos (la primera, luego la segunda…, y se queda en la última).
export function pistaTrasFallos(pistas, fallidos) {
  if (!pistas?.length || fallidos < 1) return null
  return pistas[Math.min(fallidos - 1, pistas.length - 1)]
}

// Evalúa un programa contra TODOS los casos (también los ocultos).
async function evaluarCodigo(item, codigo) {
  const casos = item.casos_prueba ?? []
  const r = await ejecutarJava(codigo, casos)

  if (!r.compilo) {
    const [primero] = r.errores_compilacion
    return {
      correcto: false,
      salida: '',
      feedback: primero?.linea ? `Error de compilación en la línea ${primero.linea}.` : 'Tu código no compila.',
      diagnostico: { tipo: 'compilacion', errores: r.errores_compilacion },
      casos: [],
    }
  }

  const resumen = r.casos.map((c, i) => ({ visible: Boolean(casos[i].visible), correcto: c.correcto }))
  // Si un caso agotó el tiempo, el ejecutor no corre los siguientes: cuentan como no superados.
  for (let i = r.casos.length; i < casos.length; i++) resumen.push({ visible: Boolean(casos[i].visible), correcto: false })
  // La salida del programa solo se muestra para un caso VISIBLE: con uno oculto el programa podría imprimir la entrada secreta.
  const salidaConsola = casos[0]?.visible ? (r.casos[0]?.salida ?? '') : ''

  const iFallo = r.casos.findIndex((c) => !c.correcto)
  if (iFallo !== -1) {
    const caso = r.casos[iFallo]
    const visible = Boolean(casos[iFallo].visible)
    const base = { caso: iFallo + 1, visible }
    let diagnostico
    if (caso.error) {
      diagnostico = { tipo: caso.error.tipo, ...base, error: visible ? caso.error : sanitizarErrorOculto(caso.error) }
    } else if (visible) {
      diagnostico = {
        tipo: 'salida_distinta',
        ...base,
        entrada: caso.entrada,
        salida_esperada: casos[iFallo].salida,
        salida_obtenida: recortar(caso.salida),
        primera_diferencia: caso.primera_diferencia,
      }
    } else {
      diagnostico = {
        tipo: 'salida_distinta',
        ...base,
        primera_diferencia: { linea: caso.primera_diferencia.linea },
        explicacion:
          'Tu programa funciona con el ejemplo, pero no con otra entrada que probamos. Piensa en casos distintos al ejemplo: valores pequeños o grandes, casos especiales que el enunciado menciona, y que el ciclo use lo que lees en vez de un valor fijo.',
      }
    }
    const superados = resumen.filter((c) => c.correcto).length
    return {
      correcto: false,
      salida: salidaConsola,
      feedback: caso.error?.linea
        ? `Error en la línea ${caso.error.linea}: ${caso.error.excepcion ?? caso.error.tipo}.`
        : `Superaste ${superados} de ${casos.length} casos de prueba.`,
      diagnostico,
      casos: resumen,
    }
  }

  const faltan = estructurasFaltantes(codigo, item.requiere ?? [])
  if (faltan.length) {
    const nombres = faltan.map((f) => NOMBRE_ESTRUCTURA[f] ?? f).join(' y ')
    return {
      correcto: false,
      salida: salidaConsola,
      feedback: `El resultado es correcto, pero aquí se pide usar ${nombres}.`,
      diagnostico: {
        tipo: 'estructura',
        faltan,
        explicacion: `Tu programa imprime lo correcto, pero el objetivo es practicar ${nombres}. Reescríbelo usando ${nombres}.`,
      },
      casos: resumen,
    }
  }

  return { correcto: true, salida: salidaConsola, feedback: 'Superaste todos los casos de prueba.', diagnostico: null, casos: resumen }
}

function evaluarSimple(item, respuesta) {
  const r = evaluarRespuestaSimple(item, respuesta)
  if (!r.valida) throw new HttpError(400, r.motivo)
  let feedback = r.correcto ? 'Tu respuesta es correcta.' : 'No es correcto. Revisa la pista e inténtalo de nuevo.'
  if (!r.correcto && r.diagnostico?.tipo === 'salida_distinta') {
    feedback = `Tu respuesta difiere desde la línea ${r.diagnostico.linea}. Sigue el código vuelta por vuelta.`
  }
  return { correcto: r.correcto, salida: null, feedback, diagnostico: r.diagnostico, casos: [] }
}

// { correcto, salida, feedback, diagnostico, casos }
export function evaluar(item, respuesta) {
  return item.tipo === 'codigo' ? evaluarCodigo(item, respuesta) : Promise.resolve(evaluarSimple(item, respuesta))
}

// Corre el programa una vez con la entrada del primer ejemplo visible (botón "Ejecutar código"). No da puntos.
export async function ejecutarConEjemplo(codigo, casos) {
  const entrada = casosVisibles(casos)[0]?.entrada ?? ''
  const r = await ejecutarJava(codigo, [{ entrada }])
  const caso = r.casos[0]
  return {
    compilo: r.compilo,
    errores_compilacion: r.errores_compilacion,
    entrada,
    salida: caso?.salida ?? '',
    error: caso?.error ?? null,
    ms: r.ms_compilacion + (caso?.ms ?? 0),
  }
}
