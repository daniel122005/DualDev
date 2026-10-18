// Disponibilidad de desafíos (RF-12). Funciones puras.
//  - mini: siempre disponibles.
//  - diario / semanal SIN fechas: rotan en un grupo; hoy (o esta semana) toca uno, en hora de Bogotá.
//  - con disponible_desde / disponible_hasta: programados a mano; solo valen dentro de esa ventana y no rotan.
import { diaBogota, inicioSemanaBogota } from './fecha.js'

const DIA_MS = 86_400_000
const SEMANA_MS = 7 * DIA_MS

function programado(d) {
  return Boolean(d.disponible_desde || d.disponible_hasta)
}

function dentroDeVentana(d, ahora) {
  const t = ahora.getTime()
  if (d.disponible_desde && t < Date.parse(d.disponible_desde)) return false
  if (d.disponible_hasta && t >= Date.parse(d.disponible_hasta)) return false
  return true
}

// Índices estables: días desde 1970 (Bogotá) y semanas desde el primer lunes de referencia.
function numeroDeDia(ahora) {
  return Math.floor(Date.parse(`${diaBogota(ahora)}T00:00:00Z`) / DIA_MS)
}
function numeroDeSemana(ahora) {
  return Math.floor(Date.parse(inicioSemanaBogota(ahora)) / SEMANA_MS)
}

// Fin del día / de la semana actual en Bogotá (para "⏳ quedan 18:43:22").
export function finDelPeriodo(periodo, ahora = new Date()) {
  if (periodo === 'diario') {
    const inicioHoy = Date.parse(`${diaBogota(ahora)}T05:00:00Z`) // 00:00 Bogotá = 05:00 UTC
    return new Date(inicioHoy + DIA_MS).toISOString()
  }
  if (periodo === 'semanal') return new Date(Date.parse(inicioSemanaBogota(ahora)) + SEMANA_MS).toISOString()
  return null
}

// desafios: filas con { id_desafio, periodo, disponible, disponible_desde, disponible_hasta }.
// Devuelve los vigentes ahora, cada uno con `termina_en` (ISO) o null si no vence.
export function retosVigentes(desafios, ahora = new Date()) {
  const activos = desafios.filter((d) => d.disponible !== false).sort((a, b) => a.id_desafio - b.id_desafio)
  const vigentes = []

  for (const periodo of ['diario', 'semanal']) {
    const delPeriodo = activos.filter((d) => d.periodo === periodo)
    const manuales = delPeriodo.filter((d) => programado(d) && dentroDeVentana(d, ahora))
    if (manuales.length) {
      vigentes.push(...manuales.map((d) => ({ ...d, termina_en: d.disponible_hasta ?? null })))
      continue // un reto programado a mano tiene prioridad sobre la rotación
    }
    const rotan = delPeriodo.filter((d) => !programado(d))
    if (rotan.length) {
      const n = periodo === 'diario' ? numeroDeDia(ahora) : numeroDeSemana(ahora)
      vigentes.push({ ...rotan[((n % rotan.length) + rotan.length) % rotan.length], termina_en: finDelPeriodo(periodo, ahora) })
    }
  }

  for (const d of activos.filter((d) => d.periodo === 'mini')) {
    if (!programado(d) || dentroDeVentana(d, ahora)) vigentes.push({ ...d, termina_en: d.disponible_hasta ?? null })
  }
  return vigentes
}
