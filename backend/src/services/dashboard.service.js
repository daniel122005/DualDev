import * as aprendizaje from '../repositories/aprendizaje.repository.js'
import * as gam from '../repositories/gamificacion.repository.js'
import { metricasDe, sincronizarLogros } from './logros.service.js'

const ACTIVIDADES_RECIENTES = 5

export async function obtenerDashboard(idUsuario) {
  const m = await metricasDe(idUsuario)
  // Logros que dependen del tiempo o de otros (racha, ranking) se revisan también al entrar.
  await sincronizarLogros(idUsuario, { metricas: m })

  const [aciertos, desafios, catalogo, mios] = await Promise.all([
    aprendizaje.obtenerAciertos(idUsuario),
    aprendizaje.obtenerDesafiosCompletados(idUsuario),
    gam.catalogoLogros(),
    gam.logrosDelUsuario(idUsuario),
  ])
  const obtenidos = new Map(mios.map((l) => [l.id_logro, l.fecha_obtencion]))

  const actividad = [
    ...aciertos.map((a) => ({
      tipo: 'ejercicio',
      texto: `Completaste "${a.ejercicio.titulo}"`,
      puntos: a.puntos_otorgados,
      fecha: a.created_at,
    })),
    ...desafios.map((d) => ({
      tipo: 'desafio',
      texto: `Reto completado: "${d.desafio.titulo}"`,
      puntos: d.puntos_otorgados,
      fecha: d.updated_at,
    })),
    ...catalogo
      .filter((l) => obtenidos.has(l.id_logro))
      .map((l) => ({ tipo: 'logro', texto: `Logro "${l.nombre}" desbloqueado`, puntos: 0, fecha: obtenidos.get(l.id_logro) })),
  ]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, ACTIVIDADES_RECIENTES)

  return {
    ...m.nivel,
    racha: m.resumen.racha_dias,
    ranking: m.ranking,
    modulos: m.estado.modulos,
    logros: catalogo.map((l) => ({
      id_logro: l.id_logro,
      codigo: l.codigo,
      nombre: l.nombre,
      descripcion: l.descripcion,
      icono: l.icono,
      obtenido: obtenidos.has(l.id_logro),
      fecha_obtencion: obtenidos.get(l.id_logro) ?? null,
    })),
    actividad_reciente: actividad,
  }
}
