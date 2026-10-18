// Ranking del semillero: global (puntos totales), de la semana o de un módulo.
import * as aprendizaje from '../repositories/aprendizaje.repository.js'
import * as curso from '../repositories/curso.repository.js'
import * as gam from '../repositories/gamificacion.repository.js'
import { calcularRacha, inicioSemanaBogota } from '../utils/fecha.js'
import { HttpError } from '../utils/httpError.js'
import { resolverNivel } from '../utils/nivel.js'
import { nombrePublico, ordenarRanking, puntosParaSubir } from '../utils/ranking.js'

const TOP = 50
const DIAS_RACHA_RANKING = 60

function iniciales(nombre) {
  const p = nombre.replace(/\./g, '').split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?'
}

function sumarPorUsuario(...listas) {
  const total = new Map()
  for (const lista of listas) for (const { id_usuario, puntos } of lista) total.set(id_usuario, (total.get(id_usuario) ?? 0) + puntos)
  return total
}

async function puntosDelPeriodo({ periodo, idModulo, ahora }) {
  if (periodo === 'global' && !idModulo) {
    const progreso = await gam.progresoDeTodos()
    return new Map(progreso.map((p) => [p.id_usuario, p.puntos_acumulados]))
  }

  const desde = periodo === 'semana' ? inicioSemanaBogota(ahora) : undefined
  const [ejercicios, lecciones, desafios] = await Promise.all([
    gam.puntosPorEjercicio({ desde }),
    gam.puntosPorLeccion({ desde }),
    idModulo ? Promise.resolve([]) : gam.puntosPorDesafio({ desde }), // los desafíos no pertenecen a un módulo
  ])
  const delModulo = (fila, rel) => !idModulo || fila[rel]?.id_modulo === idModulo
  return sumarPorUsuario(
    ejercicios.filter((f) => delModulo(f, 'ejercicio')).map((f) => ({ id_usuario: f.id_usuario, puntos: f.puntos_otorgados })),
    lecciones.filter((f) => delModulo(f, 'contenido')).map((f) => ({ id_usuario: f.id_usuario, puntos: f.puntos_otorgados })),
    desafios.map((f) => ({ id_usuario: f.id_usuario, puntos: f.puntos_otorgados })),
  )
}

export async function obtenerRanking(idUsuario, { periodo = 'global', idModulo = null } = {}, ahora = new Date()) {
  const modulos = await curso.obtenerModulosCompletos()
  if (idModulo && !modulos.some((m) => m.id_modulo === idModulo)) throw new HttpError(404, 'Módulo no encontrado')

  const desdeRacha = new Date(ahora.getTime() - DIAS_RACHA_RANKING * 86_400_000).toISOString()
  const [puntos, progreso, nombres, niveles, actividad] = await Promise.all([
    puntosDelPeriodo({ periodo, idModulo, ahora }),
    gam.progresoDeTodos(),
    gam.nombresDeTodos(),
    aprendizaje.obtenerNiveles(),
    gam.actividadDesde(desdeRacha),
  ])

  const filtrado = periodo !== 'global' || idModulo
  // En rankings filtrados solo aparece quien sumó puntos en ese filtro (y siempre el propio estudiante).
  const filas = progreso
    .filter((p) => !filtrado || (puntos.get(p.id_usuario) ?? 0) > 0 || p.id_usuario === idUsuario)
    .map((p) => ({ id_usuario: p.id_usuario, puntos: puntos.get(p.id_usuario) ?? 0 }))
  const ranking = ordenarRanking(filas)

  const nombrePor = new Map(nombres.map((n) => [n.id_usuario, n.nombre]))
  const totalPor = new Map(progreso.map((p) => [p.id_usuario, p.puntos_acumulados]))
  const fechasPor = new Map()
  for (const a of actividad) {
    if (!fechasPor.has(a.id_usuario)) fechasPor.set(a.id_usuario, [])
    fechasPor.get(a.id_usuario).push(a.created_at)
  }

  // Nunca se envía el id de otros estudiantes; solo un indicador de "soy yo".
  const aFila = (f) => {
    const esYo = f.id_usuario === idUsuario
    const nombre = esYo ? (nombrePor.get(f.id_usuario) ?? 'Tú') : nombrePublico(nombrePor.get(f.id_usuario))
    return {
      posicion: f.posicion,
      nombre,
      iniciales: iniciales(nombre),
      puntos: f.puntos,
      nivel: resolverNivel(niveles, totalPor.get(f.id_usuario) ?? 0).actual.numero,
      racha: calcularRacha(fechasPor.get(f.id_usuario) ?? [], ahora),
      es_yo: esYo,
    }
  }

  const yo = ranking.find((f) => f.id_usuario === idUsuario)
  return {
    periodo,
    id_modulo: idModulo,
    total_estudiantes: progreso.length,
    participantes: ranking.length,
    filas: ranking.slice(0, TOP).map(aFila),
    yo: yo ? { ...aFila(yo), puntos_para_subir: puntosParaSubir(ranking, idUsuario) } : null,
    modulos: modulos.map((m) => ({ id_modulo: m.id_modulo, titulo: m.titulo, orden: m.orden })),
  }
}
