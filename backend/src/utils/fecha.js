// Los "días" de los estudiantes se cuentan en hora de Bogotá (UTC-5, sin horario de verano).
const OFFSET_MS = -5 * 60 * 60 * 1000
const DIA_MS = 24 * 60 * 60 * 1000

export function diaBogota(fecha) {
  return new Date(new Date(fecha).getTime() + OFFSET_MS).toISOString().slice(0, 10)
}

function sumarDias(dia, n) {
  return new Date(Date.parse(`${dia}T00:00:00Z`) + n * DIA_MS).toISOString().slice(0, 10)
}

// Instante (ISO UTC) en que empezó el lunes de la semana actual, a las 00:00 de Bogotá.
export function inicioSemanaBogota(ahora = new Date()) {
  const hoy = diaBogota(ahora)
  const diaSemana = new Date(`${hoy}T00:00:00Z`).getUTCDay() // 0 = domingo
  const lunes = sumarDias(hoy, -((diaSemana + 6) % 7))
  return new Date(Date.parse(`${lunes}T00:00:00Z`) - OFFSET_MS).toISOString()
}

// Días consecutivos con actividad que terminan hoy o ayer (si hoy aún no practicó, la racha sigue viva).
export function calcularRacha(fechas, ahora = new Date()) {
  const dias = new Set(fechas.map(diaBogota))
  let dia = diaBogota(ahora)
  if (!dias.has(dia)) dia = sumarDias(dia, -1)

  let racha = 0
  while (dias.has(dia)) {
    racha += 1
    dia = sumarDias(dia, -1)
  }
  return racha
}
