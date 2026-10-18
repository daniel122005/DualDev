import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolverNivel } from './nivel.js'

const niveles = [
  { numero: 3, nombre: 'C', puntos_minimos: 800 },
  { numero: 1, nombre: 'A', puntos_minimos: 0 },
  { numero: 2, nombre: 'B', puntos_minimos: 300 },
]

test('0 puntos es el primer nivel', () => {
  const r = resolverNivel(niveles, 0)
  assert.equal(r.actual.numero, 1)
  assert.equal(r.siguiente.numero, 2)
  assert.equal(r.puntos_para_siguiente, 300)
  assert.equal(r.porcentaje, 0)
})

test('justo en el umbral sube de nivel', () => {
  assert.equal(resolverNivel(niveles, 300).actual.numero, 2)
  assert.equal(resolverNivel(niveles, 299).actual.numero, 1)
})

test('porcentaje dentro del tramo', () => {
  const r = resolverNivel(niveles, 550) // tramo 300..800, avance 250/500
  assert.equal(r.actual.numero, 2)
  assert.equal(r.porcentaje, 50)
  assert.equal(r.puntos_para_siguiente, 250)
})

test('nivel máximo no tiene siguiente', () => {
  const r = resolverNivel(niveles, 5000)
  assert.equal(r.actual.numero, 3)
  assert.equal(r.siguiente, null)
  assert.equal(r.porcentaje, 100)
})
