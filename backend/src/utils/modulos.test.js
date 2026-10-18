import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calcularModulos } from './modulos.js'

const modulos = [
  { id_modulo: 20, orden: 2, titulo: 'for' },
  { id_modulo: 10, orden: 1, titulo: 'intro' },
  { id_modulo: 30, orden: 3, titulo: 'while' },
]
const ejercicios = [
  { id_ejercicio: 1, id_modulo: 10 },
  { id_ejercicio: 2, id_modulo: 10 },
  { id_ejercicio: 3, id_modulo: 20 },
  { id_ejercicio: 4, id_modulo: 20 },
  { id_ejercicio: 5, id_modulo: 20 },
  { id_ejercicio: 6, id_modulo: 20 },
]

test('sin aciertos: el primero abierto, el resto bloqueado', () => {
  const r = calcularModulos(modulos, ejercicios, new Set())
  assert.deepEqual(r.map((m) => m.orden), [1, 2, 3])
  assert.deepEqual(r.map((m) => m.bloqueado), [false, true, true])
  assert.deepEqual(r.map((m) => m.progreso), [0, 0, 0])
})

test('50 % del módulo anterior desbloquea el siguiente', () => {
  const r = calcularModulos(modulos, ejercicios, new Set([1]))
  assert.equal(r[0].progreso, 50)
  assert.equal(r[1].bloqueado, false)
  assert.equal(r[2].bloqueado, true)
})

test('módulo completo al 100 %', () => {
  const r = calcularModulos(modulos, ejercicios, new Set([1, 2]))
  assert.equal(r[0].completado, true)
  assert.equal(r[0].ejercicios_resueltos, 2)
})

test('las lecciones terminadas cuentan en el progreso', () => {
  const lecciones = [
    { id_contenido: 100, id_modulo: 10 },
    { id_contenido: 101, id_modulo: 10 },
  ]
  // 1 de 2 ejercicios + 1 de 2 lecciones = 2 de 4 = 50 %
  const r = calcularModulos(modulos, ejercicios, new Set([1]), lecciones, new Set([100]))
  assert.equal(r[0].progreso, 50)
  assert.equal(r[0].total_lecciones, 2)
  assert.equal(r[0].lecciones_completadas, 1)
  assert.equal(r[1].bloqueado, false)
  // solo lecciones, sin ejercicios: no basta para completar
  const r2 = calcularModulos(modulos, ejercicios, new Set(), lecciones, new Set([100, 101]))
  assert.equal(r2[0].progreso, 50)
  assert.equal(r2[0].completado, false)
})

test('un módulo sin ejercicios no cuenta como completado y no rompe la división', () => {
  const r = calcularModulos(modulos, ejercicios, new Set([1, 2, 3, 4, 5, 6]))
  assert.equal(r[2].total_ejercicios, 0)
  assert.equal(r[2].progreso, 0)
  assert.equal(r[2].completado, false)
})
