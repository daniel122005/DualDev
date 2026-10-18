import assert from 'node:assert/strict'
import { test } from 'node:test'
import { limpiarCache, memo } from './cache.js'

test('reutiliza el valor dentro del TTL y comparte la consulta en curso', async () => {
  limpiarCache()
  let llamadas = 0
  const cargar = async () => {
    llamadas += 1
    return [1, 2]
  }
  const [a, b] = await Promise.all([memo('k', 1000, cargar), memo('k', 1000, cargar)])
  assert.deepEqual(a, [1, 2])
  assert.equal(a, b)
  await memo('k', 1000, cargar)
  assert.equal(llamadas, 1)
})

test('vuelve a cargar cuando vence', async () => {
  limpiarCache()
  let llamadas = 0
  await memo('v', 1, async () => ++llamadas)
  await new Promise((r) => setTimeout(r, 5))
  assert.equal(await memo('v', 1, async () => ++llamadas), 2)
})

test('no guarda errores: el siguiente intento vuelve a consultar', async () => {
  limpiarCache()
  await assert.rejects(memo('e', 1000, async () => { throw new Error('caída') }))
  await new Promise((r) => setImmediate(r))
  assert.equal(await memo('e', 1000, async () => 'ok'), 'ok')
})
