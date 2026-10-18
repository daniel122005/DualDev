// Punto de entrada del ejecutor de código: elige la implementación, limita la concurrencia y traduce
// los resultados crudos a un diagnóstico que el estudiante pueda entender.
import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'
import { compararSalidas } from './comparar.js'
import {
  EXPLICACION_SALIDA_EXCESIVA,
  EXPLICACION_TIEMPO_AGOTADO,
  limpiarStderr,
  parsearErrorEjecucion,
  parsearErroresCompilacion,
} from './diagnosticos.js'
import { crearEjecutorLocal } from './javaLocal.js'

export const MAX_CODIGO_BYTES = 20 * 1024
const MAX_EN_COLA = 20

let ejecutor = null

export function validarConfiguracionEjecutor() {
  if (env.RUNNER === 'local' && env.NODE_ENV === 'production') {
    throw new Error(
      'RUNNER=local no está permitido en producción: no aísla CPU, hilos ni el sistema. Configura un ejecutor con contenedor.',
    )
  }
}

function obtenerEjecutor() {
  if (ejecutor) return ejecutor
  validarConfiguracionEjecutor()
  if (env.RUNNER === 'local') ejecutor = crearEjecutorLocal({ javaHome: env.JAVA_HOME })
  else throw new Error(`Ejecutor desconocido: ${env.RUNNER}`)
  return ejecutor
}

// Prepara el ejecutor al arrancar el servidor (compila la Guardia) para que el primer estudiante no
// pague ese segundo extra. Si falla, se reintenta en la primera ejecución.
export async function calentarEjecutor() {
  await obtenerEjecutor().preparar?.()
}

// Semáforo: cada envío levanta hasta LIMITES.casosEnParalelo JVM; no se permiten más de
// RUNNER_CONCURRENCIA envíos a la vez.
let activos = 0
const cola = []

async function conTurno(fn) {
  if (activos >= env.RUNNER_CONCURRENCIA) {
    if (cola.length >= MAX_EN_COLA) throw new HttpError(503, 'El servidor está ocupado ejecutando otros programas. Intenta en unos segundos.')
    // Al despertar heredamos la ranura de quien terminó (activos no cambia), así nadie se cuela.
    await new Promise((resolve) => cola.push(resolve))
  } else {
    activos += 1
  }
  try {
    return await fn()
  } finally {
    const siguiente = cola.shift()
    if (siguiente) siguiente()
    else activos -= 1
  }
}

function diagnosticarEjecucion(ej, archivo) {
  const stderr = limpiarStderr(ej.stderr)
  if (ej.tiempoAgotado) return { tipo: 'tiempo_agotado', explicacion: EXPLICACION_TIEMPO_AGOTADO }
  if (ej.truncada) return { tipo: 'salida_excesiva', explicacion: EXPLICACION_SALIDA_EXCESIVA }
  if (ej.codigo !== 0) {
    const error = parsearErrorEjecucion(stderr, archivo)
    if (error) return { tipo: 'excepcion', ...error }
    return {
      tipo: 'terminacion',
      explicacion: `El programa terminó con código ${ej.codigo}.`,
      detalle: stderr || null,
    }
  }
  return null
}

// Ejecuta el código con cada entrada. Si se pasan salidas esperadas, compara cada caso.
// casos: [{ entrada, salida? }]
export async function ejecutarJava(codigo, casos) {
  if (typeof codigo !== 'string' || codigo.trim() === '') throw new HttpError(400, 'Escribe tu código antes de ejecutarlo.')
  if (Buffer.byteLength(codigo, 'utf8') > MAX_CODIGO_BYTES) throw new HttpError(400, 'El código es demasiado largo (máximo 20 KB).')

  const runner = obtenerEjecutor()
  const crudo = await conTurno(() => runner.ejecutar(codigo, casos.map((c) => c.entrada ?? '')))

  const c = crudo.compilacion
  if (c.codigo !== 0 || c.tiempoAgotado) {
    const stderr = limpiarStderr(c.stderr)
    const errores = parsearErroresCompilacion(stderr)
    return {
      compilo: false,
      ms_compilacion: c.ms,
      errores_compilacion: errores.length
        ? errores
        : [{ linea: null, columna: null, tipo: 'Compilación', mensaje: stderr, explicacion: c.tiempoAgotado ? 'La compilación tardó demasiado.' : 'Java no pudo compilar el programa.' }],
      casos: [],
    }
  }

  return {
    compilo: true,
    ms_compilacion: c.ms,
    errores_compilacion: [],
    casos: crudo.ejecuciones.map((ej, i) => {
      const error = diagnosticarEjecucion(ej, crudo.archivo)
      const esperada = casos[i].salida
      const comparacion = esperada === undefined || error ? null : compararSalidas(esperada, ej.stdout)
      return {
        entrada: ej.entrada,
        salida: ej.stdout,
        ms: ej.ms,
        error,
        correcto: esperada === undefined ? null : !error && comparacion.iguales,
        primera_diferencia: comparacion?.primera_diferencia ?? null,
      }
    }),
  }
}
