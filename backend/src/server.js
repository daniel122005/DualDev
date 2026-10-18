import app from './app.js'
import { env } from './config/env.js'
import { calentarEjecutor, validarConfiguracionEjecutor } from './runner/index.js'

// Falla al arrancar (y no en la primera petición) si el ejecutor de código está mal configurado.
validarConfiguracionEjecutor()

app.listen(env.PORT, () => {
  console.log(`API DUALDEV escuchando en http://localhost:${env.PORT}`)
  calentarEjecutor().catch((e) => console.error('No se pudo preparar el ejecutor de Java:', e.message))
})
