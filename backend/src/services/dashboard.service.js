import * as aprendizaje from '../repositories/aprendizaje.repository.js'
import * as gam from '../repositories/gamificacion.repository.js'
import { logrosObtenidos, metricasDe } from './logros.service.js'

const ACTIVIDADES_RECIENTES = 5

export async function obtenerDashboard(idUsuario) {
  // Una sola tanda de consultas en paralelo.
  const [m, catalogo, mios, aciertos, desafios] = await Promise.all([
    metricasDe(idUsuario),
    gam.catalogoLogros(),
    gam.logrosDelUsuario(idUsuario),
    aprendizaje.obtenerAciertos(idUsuario),
    aprendizaje.obtenerDesafiosCompletados(idUsuario),
  ])
  // Logros que dependen del tiempo o de otros (racha, ranking) se revisan también al entrar.
  const obtenidos = await logrosObtenidos(idUsuario, m, catalogo, mios)

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
