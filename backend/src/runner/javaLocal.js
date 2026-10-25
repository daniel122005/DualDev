// Ejecutor de Java para DESARROLLO. Corre javac/java como procesos hijos con:
//  - entorno vacío (el código no ve variables como SUPABASE_SERVICE_ROLE_KEY),
//  - un Security Manager propio (Guardia) = el estándar de Java 17 sin permisos (bloquea archivos,
//    red, procesos y variables de entorno) + un tope de hilos creados,
//  - límites de tiempo, memoria de heap y tamaño de salida,
//  - una carpeta temporal por ejecución que se borra al terminar.
// NO limita CPU y depende del Security Manager (eliminado desde Java 24):
// en producción debe usarse un ejecutor con contenedor. Ver runner/index.js.
import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { chmod, mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Quien de verdad cambia de usuario antes de ejecutar javac/java (ver crearEjecutorLocal). Viene con
// util-linux (ya está en la imagen); solo necesita que se le dé la capacidad cap_setuid/cap_setgid
// a ÉL, no al runtime de Node (que tiene mucha más superficie: V8 + todas las dependencias npm).
export const SETPRIV = '/usr/bin/setpriv'

export const LIMITES = {
  compilacionMs: 10_000,
  ejecucionMs: 3_000,
  salidaBytes: 64 * 1024,
  heapMb: 64,
  // Hilos que el programa puede crear. Sin tope, un programa creó 17.000 hilos en 3 s y agotó la
  // memoria del equipo (cada hilo reserva su pila fuera del heap). Ningún ejercicio de ciclos los necesita.
  hilos: 64,
  // Casos de prueba que se ejecutan a la vez dentro de un mismo envío (cada uno es una JVM).
  casosEnParalelo: 3,
}

// Security Manager propio: hereda TODAS las restricciones del estándar y además corta la creación
// masiva de hilos. Thread() llama a ThreadGroup.checkAccess() -> checkAccess(ThreadGroup) por cada
// hilo (y por cada ThreadGroup nuevo), así que contar esas llamadas acota las creaciones.
const GUARDIA_JAVA = `package dualdev.seguridad;

import java.util.concurrent.atomic.AtomicInteger;

public final class Guardia extends SecurityManager {
    private static final int MAX_HILOS = ${LIMITES.hilos};
    private static final AtomicInteger CREADOS = new AtomicInteger();

    @Override
    public void checkAccess(ThreadGroup g) {
        super.checkAccess(g);
        if (CREADOS.incrementAndGet() > MAX_HILOS) {
            throw new SecurityException("Tu programa intentó crear demasiados hilos (máximo " + MAX_HILOS + ").");
        }
    }
}
`

// TieredStopAtLevel=1 + un solo hilo de JIT: javac vive menos de un segundo y así gasta ~45 % menos
// CPU (medido), que es lo que cuenta en un servidor pequeño.
const ARGS_JVM_CORTA = ['-XX:TieredStopAtLevel=1', '-XX:CICompilerCount=1', '-XX:+UseSerialGC']

const ARGS_JAVAC = ['-J-Duser.language=en', '-J-Xmx256m', ...ARGS_JVM_CORTA.map((a) => `-J${a}`), '-encoding', 'UTF-8', '-proc:none', '-nowarn', '-Xmaxerrs', '10']

const ARGS_JAVA = [
  '-Djava.security.manager=dualdev.seguridad.Guardia',
  // Sin esto, avisos internos de la JVM (p. ej. "[warning][os,thread]") se mezclan con la salida del programa.
  '-Xlog:disable',
  '-Duser.language=en',
  '-Dfile.encoding=UTF-8',
  '-Dsun.stdout.encoding=UTF-8',
  '-Dsun.stderr.encoding=UTF-8',
  `-Xmx${LIMITES.heapMb}m`,
  '-Xss1m',
  ...ARGS_JVM_CORTA,
  '-XX:-UsePerfData',
  '-XX:+DisableAttachMechanism',
]

// Solo lo imprescindible para que la JVM arranque en Windows.
function entornoVacio() {
  return process.platform === 'win32' ? { SystemRoot: process.env.SystemRoot ?? 'C:\\Windows' } : {}
}

// Antepone setpriv cuando hay que correr como otro usuario (ver crearEjecutorLocal). --clear-groups
// y --no-new-privs son por si acaso: nada de esto debería hacer falta para compilar/ejecutar Java,
// así que quitarlo no le resta nada al estudiante.
function conSandbox(usuarioSandbox, ejecutable, args) {
  if (!usuarioSandbox) return { ejecutable, args }
  return {
    ejecutable: SETPRIV,
    args: [`--reuid=${usuarioSandbox.uid}`, `--regid=${usuarioSandbox.gid}`, '--clear-groups', '--no-new-privs', '--', ejecutable, ...args],
  }
}

// chmod no tiene opción recursiva (a diferencia de rm). Lo usamos para la carpeta de la Guardia:
// que el usuario sandbox pueda LEER sus clases (las necesita en el classpath) pero nunca escribirlas.
async function chmodRecursivo(ruta, modo) {
  await chmod(ruta, modo)
  const info = await stat(ruta)
  if (!info.isDirectory()) return
  const hijos = await readdir(ruta)
  await Promise.all(hijos.map((h) => chmodRecursivo(path.join(ruta, h), modo)))
}

export function nombreClasePrincipal(codigo) {
  const publica = codigo.match(/\bpublic\s+(?:final\s+|abstract\s+)*class\s+([A-Za-z_$][\w$]*)/)
  if (publica) return publica[1]
  const cualquiera = codigo.match(/\bclass\s+([A-Za-z_$][\w$]*)/)
  return cualquiera ? cualquiera[1] : 'Main'
}

function correr(ejecutable, args, { cwd, entrada = '', timeoutMs, maxBytes }) {
  return new Promise((resolve) => {
    const inicio = Date.now()
    const hijo = spawn(ejecutable, args, { cwd, env: entornoVacio(), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })

    const out = []
    const err = []
    let bytes = 0
    let tiempoAgotado = false
    let truncada = false
    let terminado = false

    const matar = () => {
      if (!terminado) hijo.kill('SIGKILL')
    }
    const timer = setTimeout(() => {
      tiempoAgotado = true
      matar()
    }, timeoutMs)

    const recoger = (destino) => (chunk) => {
      bytes += chunk.length
      if (bytes > maxBytes) {
        truncada = true
        matar()
        return
      }
      destino.push(chunk)
    }
    hijo.stdout.on('data', recoger(out))
    hijo.stderr.on('data', recoger(err))

    hijo.on('error', (e) => {
      clearTimeout(timer)
      terminado = true
      resolve({ stdout: '', stderr: String(e.message), codigo: null, tiempoAgotado: false, truncada: false, ms: Date.now() - inicio, fallo: e })
    })
    hijo.on('close', (codigo) => {
      clearTimeout(timer)
      terminado = true
      resolve({
        stdout: Buffer.concat(out).toString('utf8'),
        stderr: Buffer.concat(err).toString('utf8'),
        codigo,
        tiempoAgotado,
        truncada,
        ms: Date.now() - inicio,
      })
    })

    hijo.stdin.on('error', () => {}) // el proceso puede cerrar stdin antes de leerlo todo
    hijo.stdin.end(entrada, 'utf8')
  })
}

// usuarioSandbox: { uid, gid } del usuario Linux que corre el código del estudiante (producción,
// RUNNER=contenedor). null en desarrollo: ahí no hay otro usuario y no tendría sentido.
export function crearEjecutorLocal({ javaHome, limites = {}, usuarioSandbox = null }) {
  if (!javaHome) throw new Error('JAVA_HOME no está configurado: el ejecutor local necesita un JDK 17')
  if (usuarioSandbox && !existsSync(SETPRIV)) {
    throw new Error(`No se encontró ${SETPRIV} (setpriv, de util-linux): es quien cambia al usuario sandbox antes de compilar o ejecutar el código del estudiante.`)
  }
  const lim = { ...LIMITES, ...limites }
  const bin = path.join(javaHome, 'bin')
  const javac = path.join(bin, process.platform === 'win32' ? 'javac.exe' : 'javac')
  const java = path.join(bin, process.platform === 'win32' ? 'java.exe' : 'java')

  // La Guardia se compila una vez por proceso en una carpeta aleatoria (mkdtemp) para que nadie
  // pueda dejar plantada una clase con ese nombre; se borra al salir.
  let guardia = null
  function prepararGuardia() {
    guardia ??= (async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'guardia-dualdev-'))
      process.once('exit', () => rmSync(dir, { recursive: true, force: true }))
      const fuente = path.join(dir, 'src', 'dualdev', 'seguridad')
      await mkdir(fuente, { recursive: true })
      await writeFile(path.join(fuente, 'Guardia.java'), GUARDIA_JAVA, 'utf8')
      const salida = path.join(dir, 'clases')
      const r = await correr(javac, [...ARGS_JAVAC, '-d', salida, path.join(fuente, 'Guardia.java')], {
        cwd: dir,
        timeoutMs: 30_000,
        maxBytes: LIMITES.salidaBytes,
      })
      if (r.fallo || r.codigo !== 0) throw new Error(`No se pudo compilar la Guardia del ejecutor: ${r.stderr || r.fallo?.message}`)
      // La Guardia se carga desde el classpath y, sin esta concesión, se denegaría a sí misma cuando
      // la propia JVM crea sus hilos internos (la JVM se cae). Solo SU carpeta recibe permisos: el
      // código del estudiante vive en otra carpeta y el control de acceso revisa cada marco de la pila.
      const politica = path.join(dir, 'guardia.policy')
      await writeFile(politica, `grant codeBase "${pathToFileURL(salida).href}/" {\n    permission java.security.AllPermission;\n};\n`, 'utf8')
      // El código del estudiante corre como OTRO usuario (usuarioSandbox) y necesita LEER esta
      // carpeta (está en su classpath y lee la política), pero nunca ESCRIBIRLA: solo "node" (dueño)
      // puede modificarla, así que ni rompiendo la Guardia se puede suplantarla para la próxima vez.
      if (usuarioSandbox) await chmodRecursivo(dir, 0o755)
      return { clases: salida, politica }
    })().catch((e) => {
      guardia = null // permitir reintentar
      throw e
    })
    return guardia
  }

  // Compila una vez y ejecuta el programa con cada entrada. Devuelve datos crudos; la interpretación
  // (errores en español, comparación) la hace runner/index.js.
  async function ejecutar(codigo, entradas) {
    const { clases: clasesGuardia, politica } = await prepararGuardia()
    const dir = await mkdtemp(path.join(tmpdir(), 'dualdev-'))
    try {
      const clase = nombreClasePrincipal(codigo)
      const archivo = `${clase}.java`
      await writeFile(path.join(dir, archivo), codigo, 'utf8')
      // javac/java van a correr como usuarioSandbox (otro usuario Linux): necesitan poder escribir
      // aquí (las .class) y leer el .java. La carpeta es de un solo uso, al azar (mkdtemp) y se borra
      // justo después, así que abrirla del todo no expone nada.
      if (usuarioSandbox) await chmod(dir, 0o777)

      const comp = conSandbox(usuarioSandbox, javac, [...ARGS_JAVAC, '-d', dir, '-cp', dir, archivo])
      const compilacion = await correr(comp.ejecutable, comp.args, {
        cwd: dir,
        timeoutMs: lim.compilacionMs,
        maxBytes: lim.salidaBytes,
      })
      if (compilacion.fallo) throw new Error(`No se pudo iniciar javac: ${compilacion.fallo.message}`)
      if (compilacion.codigo !== 0 || compilacion.tiempoAgotado) {
        return { archivo, compilacion, ejecuciones: [] }
      }

      // La Guardia va PRIMERO en el classpath: aunque el estudiante declare una clase
      // dualdev.seguridad.Guardia, la JVM carga la nuestra.
      const classpath = [clasesGuardia, dir].join(path.delimiter)
      const correrCaso = async (entrada) => {
        // "=" (no "==") añade esta política a la estándar de Java en vez de reemplazarla.
        const ej = conSandbox(usuarioSandbox, java, [`-Djava.security.policy=${politica}`, ...ARGS_JAVA, '-cp', classpath, clase])
        const r = await correr(ej.ejecutable, ej.args, {
          cwd: dir,
          entrada,
          timeoutMs: lim.ejecucionMs,
          maxBytes: lim.salidaBytes,
        })
        if (r.fallo) throw new Error(`No se pudo iniciar java: ${r.fallo.message}`)
        return { entrada, ...r }
      }

      // Casos en tandas paralelas (más rápido que uno por uno). Si en una tanda hubo un ciclo
      // infinito, no se lanzan más: el diagnóstico ya está claro y se ahorran JVM.
      const ejecuciones = []
      for (let i = 0; i < entradas.length; i += lim.casosEnParalelo) {
        const tanda = await Promise.all(entradas.slice(i, i + lim.casosEnParalelo).map(correrCaso))
        ejecuciones.push(...tanda)
        if (tanda.some((r) => r.tiempoAgotado)) break
      }
      return { archivo, compilacion, ejecuciones }
    } finally {
      await rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    }
  }

  // Se corre al arrancar (ver runner/index.js). No basta con que setpriv termine en 0: si la
  // capacidad no está bien puesta, podría "funcionar" pero seguir corriendo como "node". Por eso
  // comprobamos de quién quedó el archivo compilado, no solo si hubo error.
  async function verificarAislamiento() {
    if (!usuarioSandbox) return
    const dir = await mkdtemp(path.join(tmpdir(), 'dualdev-autoprueba-'))
    try {
      const archivo = 'Autoprueba.java'
      await writeFile(path.join(dir, archivo), 'public class Autoprueba { public static void main(String[] a) { System.out.println("ok"); } }', 'utf8')
      await chmod(dir, 0o777)
      const comp = conSandbox(usuarioSandbox, javac, [...ARGS_JAVAC, '-d', dir, '-cp', dir, archivo])
      const r = await correr(comp.ejecutable, comp.args, { cwd: dir, timeoutMs: lim.compilacionMs, maxBytes: lim.salidaBytes })
      if (r.fallo || r.codigo !== 0) {
        throw new Error(`no se pudo compilar el programa de prueba (código ${r.codigo}): ${r.stderr || r.fallo?.message}`)
      }
      const propietario = await stat(path.join(dir, 'Autoprueba.class'))
      if (propietario.uid !== usuarioSandbox.uid) {
        throw new Error(
          `el archivo compilado quedó con uid ${propietario.uid}, se esperaba ${usuarioSandbox.uid}: el código del estudiante NO está corriendo como el usuario sandbox. Revisa que ${SETPRIV} tenga cap_setuid/cap_setgid (setcap en el Dockerfile).`,
        )
      }
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }

  return {
    nombre: 'local',
    ejecutar,
    preparar: prepararGuardia,
    verificarAislamiento,
  }
}
