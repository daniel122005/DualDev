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
      'RUNNER=local no está permitido en producción: no aísla CPU, hilos ni el sistema. Usa RUNNER=contenedor dentro de la imagen Docker del backend.',
    )
  }
  if (env.RUNNER === 'contenedor') {
    // El contenedor es la barrera exterior: fuera de Linux no hay contenedor, y como root un
    // fallo de la Guardia daría control total de la imagen.
    if (process.platform !== 'linux') throw new Error('RUNNER=contenedor solo funciona dentro de la imagen Docker (Linux).')
    if (process.getuid?.() === 0) throw new Error('RUNNER=contenedor no puede correr como root: usa el usuario sin privilegios de la imagen.')
    // El código del estudiante debe correr con OTRO usuario Linux, nunca con el del backend: así,
    // aunque rompa la Guardia, no puede leer /proc/<pid>/environ del backend ni sus archivos.
    if (env.RUNNER_SANDBOX_UID === undefined || env.RUNNER_SANDBOX_GID === undefined) {
      throw new Error('RUNNER=contenedor necesita RUNNER_SANDBOX_UID y RUNNER_SANDBOX_GID (el usuario "sandbox" de la imagen).')
    }
    if (env.RUNNER_SANDBOX_UID === process.getuid?.()) {
      throw new Error('RUNNER_SANDBOX_UID no puede ser el mismo usuario que corre el backend.')
    }
  }
}

// Si la plataforma no deja cambiar de usuario Linux (Render: setgroups → EPERM aunque sandboxexec
// tenga cap_setuid/cap_setgid), el código del estudiante corre con el usuario del backend y la
// Guardia (Security Manager) queda como barrera principal. Nunca se usa el usuario sandbox sin
// haber verificado que de verdad funciona.
let sandboxDisponible = env.RUNNER === 'contenedor'
let aislamiento = env.RUNNER === 'contenedor' ? 'sin verificar' : 'no aplica (desarrollo)'

function crearEjecutor(conSandbox) {
  return crearEjecutorLocal({
    javaHome: env.JAVA_HOME,
    limites: {
      casosEnParalelo: env.RUNNER_CASOS_EN_PARALELO,
      compilacionMs: env.RUNNER_COMPILACION_MS,
      ejecucionMs: env.RUNNER_EJECUCION_MS,
    },
    usuarioSandbox: conSandbox ? { uid: env.RUNNER_SANDBOX_UID, gid: env.RUNNER_SANDBOX_GID } : null,
  })
}

function obtenerEjecutor() {
  if (ejecutor) return ejecutor
  validarConfiguracionEjecutor()
  if (env.RUNNER !== 'local' && env.RUNNER !== 'contenedor') throw new Error(`Ejecutor desconocido: ${env.RUNNER}`)
  ejecutor = crearEjecutor(sandboxDisponible)
  return ejecutor
}

// Prepara el ejecutor al arrancar el servidor (compila la Guardia) para que el primer estudiante no
// pague ese segundo extra. Si falla, se reintenta en la primera ejecución.
export async function calentarEjecutor() {
  await obtenerEjecutor().preparar?.()
}

// Se corre al arrancar, antes de aceptar tráfico. Falla cerrada: si el usuario sandbox no funciona,
// lanza (y server.js no arranca), salvo que RUNNER_PERMITIR_SIN_SANDBOX=true lo permita de forma
// explícita. Nunca se finge un aislamiento que no existe.
export async function verificarAislamientoEjecutor() {
  if (!sandboxDisponible) return aislamiento
  try {
    await obtenerEjecutor().verificarAislamiento?.()
    aislamiento = 'usuario sandbox activo'
  } catch (e) {
    // Solo el caso conocido (la plataforma niega el cambio de usuario: EPERM en setgroups/setres*id).
    // Cualquier otra falla (p. ej. el archivo compilado quedó con otro uid) no se tolera.
    const permisoNegado = /(setgroups|setresgid|setresuid): Operation not permitted/.test(e.message)
    if (!env.RUNNER_PERMITIR_SIN_SANDBOX || !permisoNegado) throw e
    sandboxDisponible = false
    ejecutor = crearEjecutor(false)
    aislamiento = 'sin usuario sandbox (la plataforma no permite cambiar de usuario); solo la Guardia'
    console.warn(`[ejecutor] El usuario sandbox no funciona aquí, se sigue sin él: ${e.message}`)
  }
  return aislamiento
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
