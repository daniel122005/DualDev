import { execSync } from 'node:child_process'
import app from './app.js'
import { env } from './config/env.js'
import { calentarEjecutor, validarConfiguracionEjecutor, verificarAislamientoEjecutor } from './runner/index.js'

// Falla al arrancar (y no en la primera petición) si el ejecutor de código está mal configurado.
validarConfiguracionEjecutor()

// DIAGNÓSTICO TEMPORAL (quitar tras diagnosticar el fallo de setgroups en Render, 2026-10-27):
// confirma si el contenedor realmente tiene CAP_SETUID/CAP_SETGID en su bounding set antes de que
// la autoprueba de aislamiento falle y tape el resto de la información.
if (env.RUNNER === 'contenedor') {
  try {
    const status = execSync('cat /proc/self/status').toString()
    console.log('[diagnostico-temporal] getcap sandboxexec:', execSync('getcap /usr/local/bin/sandboxexec || true').toString().trim())
    console.log('[diagnostico-temporal] mount root:', execSync("mount | grep \" / \" || true").toString().trim())
    for (const linea of status.split('\n')) {
      if (linea.startsWith('Cap')) console.log('[diagnostico-temporal]', linea.trim())
    }
    const capBnd = status.match(/CapBnd:\s*(\S+)/)?.[1]
    if (capBnd) console.log('[diagnostico-temporal] CapBnd decoded:', execSync(`capsh --decode=${capBnd}`).toString().trim())
  } catch (e) {
    console.log('[diagnostico-temporal] fallo el diagnóstico:', e.message)
  }
}

// En producción, confirma que el código del estudiante de verdad corre con otro usuario Linux antes
// de aceptar tráfico: si esto no funciona, es mejor que el servicio no arranque a que arranque con
// menos aislamiento del que se cree.
try {
  await verificarAislamientoEjecutor()
} catch (e) {
  console.error('El aislamiento del ejecutor de Java no funciona, no se puede arrancar:', e.message)
  process.exit(1)
}

app.listen(env.PORT, () => {
  console.log(`API DUALDEV escuchando en http://localhost:${env.PORT}`)
  calentarEjecutor().catch((e) => console.error('No se pudo preparar el ejecutor de Java:', e.message))
})
