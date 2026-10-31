// RF-12: desafíos. Se evalúan igual que los ejercicios (evaluacion.service) y la base de datos
// registra el resultado y otorga los puntos una sola vez (registrar_resultado_desafio).
import * as repo from '../repositories/desafio.repository.js'
import { HttpError } from '../utils/httpError.js'
import { retosVigentes } from '../utils/retos.js'
import { casosVisibles, ejecutarConEjemplo, evaluar, FALLOS_PARA_VER_SOLUCION, pistaTrasFallos } from './evaluacion.service.js'
import { sincronizarLogros } from './logros.service.js'
import { rachaDe } from './progreso.service.js'

function estadoDe(resultado) {
  if (!resultado) return 'nuevo'
  return resultado.completado ? 'completado' : 'intentado'
}

export async function listarRetos(idUsuario, ahora = new Date()) {
  const [todos, mios, participantes, racha] = await Promise.all([
    repo.listarDesafios(),
    repo.resultadosDelUsuario(idUsuario),
    repo.participantesPorDesafio(),
    rachaDe(idUsuario, ahora),
  ])
  const miResultado = new Map(mios.map((r) => [r.id_desafio, r]))

  return {
    racha,
    retos: retosVigentes(todos, ahora).map((d) => ({
      id_desafio: d.id_desafio,
      titulo: d.titulo,
      enunciado: d.enunciado,
      tipo: d.tipo,
      dificultad: d.dificultad,
      puntos: d.puntos_recompensa,
      periodo: d.periodo,
      minutos_estimados: d.minutos_estimados,
      termina_en: d.termina_en,
      participantes: participantes.get(d.id_desafio) ?? 0,
      pistas: d.pistas ?? [], // ayudas, no soluciones: el diseño las muestra en "Ver pistas"
      estado: estadoDe(miResultado.get(d.id_desafio)),
      intentos: miResultado.get(d.id_desafio)?.intentos ?? 0,
    })),
    completados: mios
      .filter((r) => r.completado)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((r) => ({ id_desafio: r.id_desafio, titulo: r.desafio.titulo, puntos: r.puntos_otorgados, fecha: r.updated_at })),
  }
}

// Un reto se puede abrir si está vigente o si el estudiante ya lo completó (para repasarlo).
// Solo se puede ENVIAR/EJECUTAR mientras está vigente.
async function cargarReto(idUsuario, idDesafio, { paraEnviar = false, ahora = new Date() } = {}) {
  const [desafio, todos, mios] = await Promise.all([
    repo.obtenerDesafioParaEvaluar(idDesafio),
    repo.listarDesafios(),
    repo.resultadosDelUsuario(idUsuario),
  ])
  if (!desafio) throw new HttpError(404, 'Reto no encontrado')
  const vigente = retosVigentes(todos, ahora).find((d) => d.id_desafio === idDesafio)
  const resultado = mios.find((r) => r.id_desafio === idDesafio) ?? null
  if (!vigente && (paraEnviar || !resultado?.completado)) {
    throw new HttpError(403, 'Este reto no está disponible ahora. Revisa los retos vigentes.')
  }
  return { desafio, resultado, terminaEn: vigente?.termina_en ?? null, vigente: Boolean(vigente) }
}

export async function obtenerReto(idUsuario, idDesafio) {
  const { desafio, resultado, terminaEn, vigente } = await cargarReto(idUsuario, idDesafio)
  const { casos_prueba, solucion_esperada, errores_comunes: _errores, puntos_recompensa, disponible, disponible_desde, disponible_hasta, ...publico } =
    desafio
  const intentos = resultado?.intentos ?? 0
  const completado = Boolean(resultado?.completado)

  return {
    ...publico,
    puntos: puntos_recompensa,
    ejemplos: casosVisibles(casos_prueba),
    total_casos: casos_prueba?.length ?? 0,
    termina_en: terminaEn,
    vigente,
    estado: estadoDe(resultado),
    intentos,
    solucion: completado || intentos >= FALLOS_PARA_VER_SOLUCION ? solucion_esperada : null,
  }
}

export async function ejecutarReto(idUsuario, idDesafio, { codigo, entrada }) {
  const { desafio } = await cargarReto(idUsuario, idDesafio, { paraEnviar: true })
  if (desafio.tipo !== 'codigo') throw new HttpError(400, 'Este reto no es de código.')
  return ejecutarConEjemplo(codigo, desafio.casos_prueba, entrada)
}

export async function enviarReto(idUsuario, idDesafio, { respuesta, duracionSeg }) {
  const { desafio, resultado: previo } = await cargarReto(idUsuario, idDesafio, { paraEnviar: true })
  const evaluacion = await evaluar(desafio, respuesta)

  const registro = await repo.registrarResultado({
    idUsuario,
    idDesafio,
    respuesta,
    correcto: evaluacion.correcto,
    detalle: { diagnostico: evaluacion.diagnostico, casos: evaluacion.casos },
    duracion: duracionSeg ?? null,
  })
  const logrosNuevos = registro.primera_vez ? await sincronizarLogros(idUsuario, { puntos: registro.puntos_totales }) : []

  const completado = evaluacion.correcto || Boolean(previo?.completado)
  // Antes de completarlo, todos los intentos son fallidos.
  const fallidos = completado ? 0 : registro.intentos

  return {
    correcto: evaluacion.correcto,
    feedback: evaluacion.feedback,
    diagnostico: evaluacion.diagnostico,
    casos: evaluacion.casos,
    salida: evaluacion.salida,
    puntos_otorgados: registro.puntos_otorgados,
    primer_acierto: registro.primera_vez,
    ya_resuelto: evaluacion.correcto && !registro.primera_vez,
    puntos_totales: registro.puntos_totales,
    nivel: registro.nivel,
    intentos: registro.intentos,
    intentos_fallidos: fallidos,
    pista: evaluacion.correcto ? null : pistaTrasFallos(desafio.pistas, fallidos),
    explicacion: null,
    solucion: completado || registro.intentos >= FALLOS_PARA_VER_SOLUCION ? desafio.solucion_esperada : null,
    logros_nuevos: logrosNuevos,
  }
}
