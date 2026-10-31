// Evaluación común a ejercicios y desafíos. Un "ítem" tiene: tipo, opciones, solucion_esperada,
// casos_prueba, requiere, errores_comunes. Nunca se devuelven entradas/salidas de casos ocultos ni texto
// producido por el programa en un caso oculto (ver sanitizarErrorOculto).
// `diagnostico.recuerda` = [{ linea, texto }]: explicaciones "tono profe" de por qué falló (máx. 2).
import {
  enriquecerErroresCompilacion,
  errorComunPorCodigo,
  errorComunPorSalida,
  explicarCicloInfinito,
  explicarSalida,
  revisarCodigo,
} from '../runner/analisis.js'
import { compararSalidas, estructurasFaltantes } from '../runner/comparar.js'
import { sanitizarErrorOculto } from '../runner/diagnosticos.js'
import { ejecutarJava } from '../runner/index.js'
import { evaluarRespuestaSimple } from '../utils/evaluacion.js'
import { HttpError } from '../utils/httpError.js'

// Tras este número de intentos fallidos se muestra la solución (antes se ofrecen pistas).
export const FALLOS_PARA_VER_SOLUCION = 3
const MAX_TEXTO_DETALLE = 2000
const MAX_RECUERDA = 2

const NOMBRE_ESTRUCTURA = { for: 'un ciclo for', while: 'un ciclo while', 'do-while': 'un ciclo do-while', break: 'break', continue: 'continue', if: 'un if' }

const VALOR_FIJO =
  'Con el ejemplo funciona, pero con otro dato tu programa imprime exactamente lo mismo. Recuerda que debe usar el dato que lee (por ejemplo, i <= n en el ciclo), no un valor fijo copiado del ejemplo: así funciona con cualquier entrada.'

function recortar(texto) {
  if (texto == null) return texto
  return texto.length > MAX_TEXTO_DETALLE ? `${texto.slice(0, MAX_TEXTO_DETALLE)}…` : texto
}

// Junta avisos sin repetir texto y deja los más específicos (van primero).
function juntar(...listas) {
  const vistos = new Set()
  const salida = []
  for (const a of listas.flat()) {
    if (!a?.texto || vistos.has(a.texto)) continue
    vistos.add(a.texto)
    salida.push({ linea: a.linea ?? null, texto: a.texto })
  }
  return salida.slice(0, MAX_RECUERDA)
}

const aviso = (texto) => (texto ? { linea: null, texto } : null)

export function casosVisibles(casos) {
  return (casos ?? []).filter((c) => c.visible).map((c) => ({ entrada: c.entrada, salida: c.salida }))
}

// Pista que corresponde tras N fallos (la primera, luego la segunda…, y se queda en la última).
export function pistaTrasFallos(pistas, fallidos) {
  if (!pistas?.length || fallidos < 1) return null
  return pistas[Math.min(fallidos - 1, pistas.length - 1)]
}

// Errores de compilación listos para el estudiante (sin el campo interno `simbolo`). javac suele
// encadenar varios errores en la misma línea a partir de uno solo: se deja el primero de cada línea.
function erroresParaEstudiante(errores, codigo) {
  const vistos = new Set()
  return enriquecerErroresCompilacion(errores, codigo)
    .filter((e) => e.linea == null || (!vistos.has(e.linea) && vistos.add(e.linea)))
    .map(({ simbolo: _s, ...e }) => e)
}

// Evalúa un programa contra TODOS los casos (también los ocultos).
async function evaluarCodigo(item, codigo) {
  const casos = item.casos_prueba ?? []
  const errores = item.errores_comunes ?? []
  const r = await ejecutarJava(codigo, casos)

  if (!r.compilo) {
    const lista = erroresParaEstudiante(r.errores_compilacion, codigo)
    const [primero] = lista
    return {
      correcto: false,
      salida: '',
      feedback: primero?.linea ? `Tu código no compila: revisa la línea ${primero.linea}.` : 'Tu código no compila.',
      diagnostico: { tipo: 'compilacion', errores: lista, recuerda: juntar(aviso(errorComunPorCodigo(errores, codigo))) },
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
    const porCodigo = aviso(errorComunPorCodigo(errores, codigo))
    let diagnostico
    if (caso.error) {
      const recuerda =
        caso.error.tipo === 'tiempo_agotado' || caso.error.tipo === 'salida_excesiva'
          ? juntar(porCodigo, explicarCicloInfinito(codigo))
          : juntar(porCodigo)
      diagnostico = { tipo: caso.error.tipo, ...base, error: visible ? caso.error : sanitizarErrorOculto(caso.error), recuerda }
    } else {
      const ejemplo = casos.find((c) => c.visible)
      const valorFijo =
        !visible && ejemplo && compararSalidas(ejemplo.salida, caso.salida).iguales && !compararSalidas(ejemplo.salida, casos[iFallo].salida).iguales
      const especificos = [aviso(errorComunPorSalida(errores, caso.salida)), porCodigo, aviso(valorFijo ? VALOR_FIJO : null)].filter(Boolean)
      // El patrón genérico de la salida solo cuando no hay una explicación específica: si no, distrae.
      const recuerda = juntar(
        especificos,
        revisarCodigo(codigo),
        especificos.length ? [] : aviso(explicarSalida(casos[iFallo].salida, caso.salida)?.texto),
      )
      diagnostico = visible
        ? {
            tipo: 'salida_distinta',
            ...base,
            entrada: caso.entrada,
            salida_esperada: casos[iFallo].salida,
            salida_obtenida: recortar(caso.salida),
            primera_diferencia: caso.primera_diferencia,
            recuerda,
          }
        : {
            tipo: 'salida_distinta',
            ...base,
            primera_diferencia: { linea: caso.primera_diferencia.linea },
            explicacion:
              'Tu programa funciona con el ejemplo, pero no con otra entrada que probamos. Piensa en casos distintos al ejemplo: valores pequeños o grandes, casos especiales que el enunciado menciona, y que el ciclo use lo que lees en vez de un valor fijo.',
            recuerda,
          }
    }
    const superados = resumen.filter((c) => c.correcto).length
    return {
      correcto: false,
      salida: salidaConsola,
      feedback: caso.error?.linea
        ? `Tu programa se detuvo con un error en la línea ${caso.error.linea}.`
        : caso.error?.tipo === 'tiempo_agotado'
          ? 'Tu programa no terminó a tiempo: parece un ciclo infinito.'
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
        explicacion: `Tu programa imprime lo correcto, pero el objetivo de este ejercicio es practicar ${nombres}. Recuerda que en la práctica no basta con que salga bien: reescríbelo usando ${nombres}.`,
      },
      casos: resumen,
    }
  }

  return { correcto: true, salida: salidaConsola, feedback: 'Superaste todos los casos de prueba.', diagnostico: null, casos: resumen }
}

function evaluarSimple(item, respuesta) {
  const r = evaluarRespuestaSimple(item, respuesta)
  if (!r.valida) throw new HttpError(400, r.motivo)
  let feedback = 'Tu respuesta es correcta.'
  if (!r.correcto) {
    feedback =
      r.diagnostico?.tipo === 'salida_distinta'
        ? `Tu respuesta difiere desde la línea ${r.diagnostico.linea}. Sigue el código vuelta por vuelta.`
        : 'Esa no es la respuesta. Lee la explicación e inténtalo de nuevo.'
  }
  return { correcto: r.correcto, salida: null, feedback, diagnostico: r.diagnostico, casos: [] }
}

// { correcto, salida, feedback, diagnostico, casos }
export function evaluar(item, respuesta) {
  return item.tipo === 'codigo' ? evaluarCodigo(item, respuesta) : Promise.resolve(evaluarSimple(item, respuesta))
}

// Qué lee el programa al pulsar "Ejecutar código": lo que el estudiante escribió en la consola
// (aunque esté vacío: probar sin datos también es una prueba válida) o, si no escribió nada todavía,
// la entrada del primer ejemplo visible del enunciado.
export function entradaParaEjecutar(casos, entradaEscrita) {
  if (typeof entradaEscrita === 'string') return entradaEscrita
  return casosVisibles(casos)[0]?.entrada ?? ''
}

// Corre el programa una vez con esa entrada (botón "Ejecutar código"). No da puntos.
export async function ejecutarConEjemplo(codigo, casos, entradaEscrita) {
  const entrada = entradaParaEjecutar(casos, entradaEscrita)
  const r = await ejecutarJava(codigo, [{ entrada }])
  const caso = r.casos[0]
  const recuerda =
    caso?.error?.tipo === 'tiempo_agotado' || caso?.error?.tipo === 'salida_excesiva' ? juntar(explicarCicloInfinito(codigo)) : []
  return {
    compilo: r.compilo,
    errores_compilacion: erroresParaEstudiante(r.errores_compilacion, codigo),
    entrada,
    salida: caso?.salida ?? '',
    error: caso?.error ? { ...caso.error, recuerda } : null,
    ms: r.ms_compilacion + (caso?.ms ?? 0),
  }
}
