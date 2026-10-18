import assert from 'node:assert/strict'
import { test } from 'node:test'
import { limitarPorUsuario } from './limiteUso.js'

// Llama al middleware y devuelve el status del error (o null si dejó pasar).
const llamar = (mw, id) => {
  let status = null
  mw({ user: id ? { id } : undefined }, {}, (err) => (status = err?.status ?? null))
  return status
}

test('deja pasar hasta el máximo y luego responde 429', () => {
  const mw = limitarPorUsuario({ nombre: 'prueba', maximo: 3, ventanaMs: 60_000 })
  assert.deepEqual([1, 2, 3, 4].map(() => llamar(mw, 'a')), [null, null, null, 429])
})

test('cada estudiante tiene su propio cupo', () => {
  const mw = limitarPorUsuario({ nombre: 'prueba', maximo: 1, ventanaMs: 60_000 })
  assert.equal(llamar(mw, 'a'), null)
  assert.equal(llamar(mw, 'a'), 429)
  assert.equal(llamar(mw, 'b'), null)
})

test('intervalo mínimo entre llamadas', () => {
  const mw = limitarPorUsuario({ nombre: 'prueba', maximo: 10, ventanaMs: 60_000, intervaloMinimoMs: 1_000 })
  assert.equal(llamar(mw, 'a'), null)
  assert.equal(llamar(mw, 'a'), 429)
})

test('sin sesión responde 401', () => {
  const mw = limitarPorUsuario({ nombre: 'prueba', maximo: 1, ventanaMs: 60_000 })
  assert.equal(llamar(mw, null), 401)
})
