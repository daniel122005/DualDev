import assert from 'node:assert/strict'
import { test } from 'node:test'
import { finDelPeriodo, retosVigentes } from './retos.js'

const d = (id_desafio, periodo, extra = {}) => ({ id_desafio, periodo, disponible: true, disponible_desde: null, disponible_hasta: null, ...extra })
const POOL = [d(1, 'diario'), d(2, 'diario'), d(3, 'diario'), d(10, 'semanal'), d(11, 'semanal'), d(20, 'mini'), d(21, 'mini')]

const ids = (lista) => lista.map((x) => x.id_desafio)

test('hay exactamente un diario, un semanal y todos los mini', () => {
  const v = retosVigentes(POOL, new Date('2026-10-17T15:00:00Z'))
  assert.equal(v.filter((x) => x.periodo === 'diario').length, 1)
  assert.equal(v.filter((x) => x.periodo === 'semanal').length, 1)
  assert.deepEqual(ids(v.filter((x) => x.periodo === 'mini')), [20, 21])
})

test('el diario cambia al cambiar el día en Bogotá (no en UTC)', () => {
  // 17 oct 23:00 Bogotá = 18 oct 04:00 UTC: sigue siendo el 17 en Bogotá
  const a = retosVigentes(POOL, new Date('2026-10-17T15:00:00Z')).find((x) => x.periodo === 'diario')
  const b = retosVigentes(POOL, new Date('2026-10-18T04:00:00Z')).find((x) => x.periodo === 'diario')
  const c = retosVigentes(POOL, new Date('2026-10-18T06:00:00Z')).find((x) => x.periodo === 'diario')
  assert.equal(a.id_desafio, b.id_desafio)
  assert.notEqual(a.id_desafio, c.id_desafio)
})

test('el diario recorre todo el grupo en N días', () => {
  const vistos = new Set()
  for (let i = 0; i < 3; i++) {
    const dia = new Date(Date.parse('2026-10-17T15:00:00Z') + i * 86_400_000)
    vistos.add(retosVigentes(POOL, dia).find((x) => x.periodo === 'diario').id_desafio)
  }
  assert.deepEqual([...vistos].sort(), [1, 2, 3])
})

test('el semanal es el mismo de lunes a domingo y cambia el lunes', () => {
  const lunes = retosVigentes(POOL, new Date('2026-10-12T15:00:00Z')).find((x) => x.periodo === 'semanal')
  const domingo = retosVigentes(POOL, new Date('2026-10-18T15:00:00Z')).find((x) => x.periodo === 'semanal')
  const sigLunes = retosVigentes(POOL, new Date('2026-10-19T15:00:00Z')).find((x) => x.periodo === 'semanal')
  assert.equal(lunes.id_desafio, domingo.id_desafio)
  assert.notEqual(lunes.id_desafio, sigLunes.id_desafio)
})

test('un reto programado a mano reemplaza la rotación dentro de su ventana', () => {
  const pool = [...POOL, d(9, 'diario', { disponible_desde: '2026-10-17T05:00:00Z', disponible_hasta: '2026-10-18T05:00:00Z' })]
  const dentro = retosVigentes(pool, new Date('2026-10-17T15:00:00Z')).filter((x) => x.periodo === 'diario')
  assert.deepEqual(ids(dentro), [9])
  assert.equal(dentro[0].termina_en, '2026-10-18T05:00:00Z')
  const fuera = retosVigentes(pool, new Date('2026-10-19T15:00:00Z')).filter((x) => x.periodo === 'diario')
  assert.notDeepEqual(ids(fuera), [9])
})

test('los desactivados no aparecen', () => {
  const pool = POOL.map((x) => (x.id_desafio === 20 ? { ...x, disponible: false } : x))
  assert.ok(!ids(retosVigentes(pool, new Date('2026-10-17T15:00:00Z'))).includes(20))
})

test('fin del periodo: medianoche de Bogotá y lunes siguiente', () => {
  assert.equal(finDelPeriodo('diario', new Date('2026-10-17T15:00:00Z')), '2026-10-18T05:00:00.000Z')
  assert.equal(finDelPeriodo('diario', new Date('2026-10-18T03:00:00Z')), '2026-10-18T05:00:00.000Z')
  assert.equal(finDelPeriodo('semanal', new Date('2026-10-17T15:00:00Z')), '2026-10-19T05:00:00.000Z')
  assert.equal(finDelPeriodo('mini'), null)
})
