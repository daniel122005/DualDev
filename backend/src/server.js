import app from './app.js'
import { env } from './config/env.js'
import { calentarEjecutor, validarConfiguracionEjecutor, verificarAislamientoEjecutor } from './runner/index.js'

// Falla al arrancar (y no en la primera petición) si el ejecutor de código está mal configurado.
validarConfiguracionEjecutor()

// Antes de aceptar tráfico: si el aislamiento no funciona (y no se permitió seguir sin él de forma
// explícita con RUNNER_PERMITIR_SIN_SANDBOX), es mejor no arrancar.
try {
  console.log(`[ejecutor] Aislamiento: ${await verificarAislamientoEjecutor()}`)
} catch (e) {
  console.error('El aislamiento del ejecutor de Java no funciona, no se puede arrancar:', e.message)
  process.exit(1)
}

app.listen(env.PORT, () => {
  console.log(`API DUALDEV escuchando en http://localhost:${env.PORT}`)
  calentarEjecutor().catch((e) => console.error('No se pudo preparar el ejecutor de Java:', e.message))
})
