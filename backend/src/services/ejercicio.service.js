// Ejercicios: consulta (sin soluciones), ejecución libre y envío con evaluación en el servidor.
// El cliente nunca decide si acertó ni cuántos puntos gana: aquí se evalúa y la base de datos
// otorga los puntos en una transacción (registrar_intento_ejercicio).
import * as curso from '../repositories/curso.repository.js'
import { HttpError } from '../utils/httpError.js'
import { estadoCurso, exigirModuloAbierto } from './curso.service.js'
import { casosVisibles, ejecutarConEjemplo, evaluar, FALLOS_PARA_VER_SOLUCION, pistaTrasFallos } from './evaluacion.service.js'
import { sincronizarLogros } from './logros.service.js'

export { FALLOS_PARA_VER_SOLUCION }

async function cargarEjercicioAbierto(idUsuario, idEjercicio, { paraEvaluar = false } = {}) {
  const [ejercicio, estado] = await Promise.all([
    paraEvaluar ? curso.obtenerEjercicioParaEvaluar(idEjercicio) : curso.obtenerEjercicio(idEjercicio),
    estadoCurso(idUsuario),
  ])
  if (!ejercicio) throw new HttpError(404, 'Ejercicio no encontrado')
  const modulo = exigirModuloAbierto(estado, ejercicio.id_modulo)
  return { ejercicio, estado, modulo }
}

export async function obtenerEjercicio(idUsuario, idEjercicio) {
  const [{ ejercicio, estado, modulo }, intentos] = await Promise.all([
    cargarEjercicioAbierto(idUsuario, idEjercicio, { paraEvaluar: true }),
    curso.obtenerIntentosDeEjercicio(idUsuario, idEjercicio),
  ])
  const resuelto = estado.aciertos.has(idEjercicio)
  const fallidos = intentos.filter((i) => !i.es_correcto).length
  const { casos_prueba, solucion_esperada, explicacion, errores_comunes: _errores, ...publico } = ejercicio

  return {
    ...publico,
    ejemplos: casosVisibles(casos_prueba),
    total_casos: casos_prueba?.length ?? 0,
    modulo: { id_modulo: modulo.id_modulo, titulo: modulo.titulo, orden: modulo.orden },
    primera_leccion: estado.lecciones.find((l) => l.id_modulo === ejercicio.id_modulo)?.id_contenido ?? null,
    ejercicios_del_modulo: estado.ejercicios
      .filter((e) => e.id_modulo === ejercicio.id_modulo)
      .map((e) => ({ ...e, resuelto: estado.aciertos.has(e.id_ejercicio) })),
    resuelto,
    intentos: intentos.length,
    intentos_fallidos: fallidos,
    // La solución solo se entrega cuando ya no sirve para "cobrar" sin pensar.
    solucion: resuelto || fallidos >= FALLOS_PARA_VER_SOLUCION ? solucion_esperada : null,
    explicacion: resuelto ? explicacion : null,
  }
}

// "Ejecutar código": compila y corre con la entrada del primer ejemplo visible. No da puntos.
export async function ejecutarCodigo(idUsuario, { codigo, idEjercicio }) {
  let casos = []
  if (idEjercicio) casos = (await cargarEjercicioAbierto(idUsuario, idEjercicio)).ejercicio.casos_prueba
  return ejecutarConEjemplo(codigo, casos)
}

export async function enviarRespuesta(idUsuario, idEjercicio, { respuesta, duracionSeg }) {
  const { ejercicio } = await cargarEjercicioAbierto(idUsuario, idEjercicio, { paraEvaluar: true })
  const evaluacion = await evaluar(ejercicio, respuesta)

  const registro = await curso.registrarIntento({
    idUsuario,
    idEjercicio,
    respuesta,
    correcto: evaluacion.correcto,
    feedback: evaluacion.feedback,
    detalle: { diagnostico: evaluacion.diagnostico, casos: evaluacion.casos },
    duracion: duracionSeg ?? null,
  })

  // RF-11: solo un acierto que dio puntos puede desbloquear logros nuevos.
  const [intentos, logrosNuevos] = await Promise.all([
    curso.obtenerIntentosDeEjercicio(idUsuario, idEjercicio),
    registro.primer_acierto ? sincronizarLogros(idUsuario, { puntos: registro.puntos_totales }) : Promise.resolve([]),
  ])
  const fallidos = intentos.filter((i) => !i.es_correcto).length
  const resuelto = intentos.some((i) => i.es_correcto)

  return {
    correcto: evaluacion.correcto,
    feedback: evaluacion.feedback,
    diagnostico: evaluacion.diagnostico,
    casos: evaluacion.casos,
    salida: evaluacion.salida,
    puntos_otorgados: registro.puntos_otorgados,
    primer_acierto: registro.primer_acierto,
    ya_resuelto: evaluacion.correcto && !registro.primer_acierto,
    puntos_totales: registro.puntos_totales,
    nivel: registro.nivel,
    intentos: intentos.length,
    intentos_fallidos: fallidos,
    pista: evaluacion.correcto ? null : pistaTrasFallos(ejercicio.pistas, fallidos),
    explicacion: evaluacion.correcto ? ejercicio.explicacion : null,
    solucion: resuelto || fallidos >= FALLOS_PARA_VER_SOLUCION ? ejercicio.solucion_esperada : null,
    logros_nuevos: logrosNuevos,
  }
}
