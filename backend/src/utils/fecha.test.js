import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calcularRacha, diaBogota, inicioSemanaBogota } from './fecha.js'

test('diaBogota usa UTC-5: la 1 am UTC todavía es el día anterior en Bogotá', () => {
  assert.equal(diaBogota('2026-10-17T01:00:00Z'), '2026-10-16')
  assert.equal(diaBogota('2026-10-17T05:00:00Z'), '2026-10-17')
})

test('inicioSemanaBogota devuelve el lunes 00:00 de Bogotá', () => {
  // sábado 17 de octubre de 2026 -> lunes 12 de octubre, 00:00 Bogotá = 05:00 UTC
  assert.equal(inicioSemanaBogota(new Date('2026-10-17T15:00:00Z')), '2026-10-12T05:00:00.000Z')
  // el propio lunes a las 03:00 UTC (todavía domingo en Bogotá) pertenece a la semana anterior
  assert.equal(inicioSemanaBogota(new Date('2026-10-12T03:00:00Z')), '2026-10-05T05:00:00.000Z')
})

test('racha: sin actividad es 0', () => {
  assert.equal(calcularRacha([], new Date('2026-10-17T15:00:00Z')), 0)
})

test('racha: cuenta días consecutivos terminando hoy', () => {
  const fechas = ['2026-10-17T14:00:00Z', '2026-10-16T14:00:00Z', '2026-10-15T14:00:00Z', '2026-10-13T14:00:00Z']
  assert.equal(calcularRacha(fechas, new Date('2026-10-17T15:00:00Z')), 3)
})

test('racha: si hoy no ha practicado pero ayer sí, sigue viva', () => {
  const fechas = ['2026-10-16T14:00:00Z', '2026-10-15T14:00:00Z']
  assert.equal(calcularRacha(fechas, new Date('2026-10-17T15:00:00Z')), 2)
})

test('racha: se rompe si falta ayer y hoy', () => {
  assert.equal(calcularRacha(['2026-10-14T14:00:00Z'], new Date('2026-10-17T15:00:00Z')), 0)
})

test('racha: varias actividades el mismo día cuentan una vez', () => {
  const fechas = ['2026-10-17T13:00:00Z', '2026-10-17T14:00:00Z', '2026-10-17T20:00:00Z']
  assert.equal(calcularRacha(fechas, new Date('2026-10-17T21:00:00Z')), 1)
})
