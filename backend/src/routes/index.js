import { Router } from 'express'
import {
  completarLeccion,
  ejecutarCodigo,
  enviarRespuesta,
  listarModulos,
  obtenerEjercicio,
  obtenerLeccion,
  obtenerModulo,
} from '../controllers/curso.controller.js'
import { dashboard } from '../controllers/dashboard.controller.js'
import { ejecutarReto, enviarReto, listarRetos, obtenerReto } from '../controllers/desafio.controller.js'
import { actualizarPerfil, perfil, ranking } from '../controllers/gamificacion.controller.js'
import { me } from '../controllers/usuario.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { limitarPorUsuario } from '../middleware/limiteUso.js'

const router = Router()

// Límites por estudiante. Ejecutar/enviar levantan JVMs; el resto hace varias consultas a la BD.
const limiteGeneral = limitarPorUsuario({ nombre: 'consulta', maximo: 120, ventanaMs: 60_000 })
const limiteEjecucion = limitarPorUsuario({ nombre: 'ejecución', maximo: 20, ventanaMs: 60_000, intervaloMinimoMs: 1_000 })
const limiteEnvio = limitarPorUsuario({ nombre: 'envío', maximo: 30, ventanaMs: 60_000, intervaloMinimoMs: 1_000 })

// Toda ruta privada: sesión válida + límite general.
const privado = [authenticate, limiteGeneral]

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

router.get('/me', ...privado, me)
router.get('/dashboard', ...privado, dashboard)

router.get('/modules', ...privado, listarModulos)
router.get('/modules/:id', ...privado, obtenerModulo)
router.get('/lessons/:id', ...privado, obtenerLeccion)
router.post('/lessons/:id/complete', ...privado, completarLeccion)
router.get('/exercises/:id', ...privado, obtenerEjercicio)
router.post('/exercises/:id/submit', ...privado, limiteEnvio, enviarRespuesta)
router.post('/code/run', ...privado, limiteEjecucion, ejecutarCodigo)

router.get('/challenges', ...privado, listarRetos)
router.get('/challenges/:id', ...privado, obtenerReto)
router.post('/challenges/:id/run', ...privado, limiteEjecucion, ejecutarReto)
router.post('/challenges/:id/submit', ...privado, limiteEnvio, enviarReto)

router.get('/ranking', ...privado, ranking)
router.get('/profile', ...privado, perfil)
router.patch('/profile', ...privado, actualizarPerfil)

export default router
