import app from './app.js'
import { env } from './config/env.js'
import { calentarEjecutor, validarConfiguracionEjecutor, verificarAislamientoEjecutor } from './runner/index.js'

// Falla al arrancar (y no en la primera petición) si el ejecutor de código está mal configurado.
validarConfiguracionEjecutor()

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
