import assert from 'node:assert/strict'
import { test } from 'node:test'
import { conTiempoLimite, esTiempoAgotado, MENSAJE_TIEMPO_BD } from './tiempoLimite.js'

// fetch falso que nunca responde: solo termina si alguien aborta la petición.
const nuncaResponde = (_url, opciones) =>
  new Promise((_, rechazar) => opciones.signal.addEventListener('abort', () => rechazar(opciones.signal.reason)))

test('corta la petición cuando se agota el tiempo', async () => {
  const llamar = conTiempoLimite(nuncaResponde, 30)
  const err = await llamar('https://bd/ejemplo').then(() => null, (e) => e)
  assert.ok(esTiempoAgotado(err), `no se reconoció como tiempo agotado: ${err?.message}`)
  assert.match(err.message, new RegExp(MENSAJE_TIEMPO_BD))
})

test('reconoce el tiempo agotado en el error que devuelve supabase-js', () => {
  // postgrest-js envuelve el error de fetch como "Nombre: mensaje".
  assert.ok(esTiempoAgotado({ message: `TimeoutError: ${MENSAJE_TIEMPO_BD} (8000 ms)` }))
  assert.equal(esTiempoAgotado({ message: 'duplicate key value violates unique constraint' }), false)
  assert.equal(esTiempoAgotado(null), false)
})

test('deja pasar la respuesta normal sin tocarla', async () => {
  const llamar = conTiempoLimite(async () => 'respuesta', 1_000)
  assert.equal(await llamar('https://bd/ejemplo'), 'respuesta')
})

test('si quien llama aborta, el error no se confunde con el tiempo agotado', async () => {
  const llamar = conTiempoLimite(nuncaResponde, 5_000)
  const propio = new AbortController()
  const promesa = llamar('https://bd/ejemplo', { signal: propio.signal }).then(() => null, (e) => e)
  propio.abort(new Error('cancelado por quien llama'))
  const err = await promesa
  assert.equal(esTiempoAgotado(err), false)
  assert.equal(err.message, 'cancelado por quien llama')
})
