import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluarRespuestaSimple, normalizarTexto } from './evaluacion.js'

test('normalizarTexto quita tildes, mayúsculas y espacios extra', () => {
  assert.equal(normalizarTexto('  Iteración  '), 'iteracion')
  assert.equal(normalizarTexto('i   <=  10'), 'i <= 10')
})

test('selección: correcta, incorrecta y opción inventada', () => {
  const e = { tipo: 'seleccion', opciones: ['a', 'b'], solucion_esperada: 'b' }
  assert.equal(evaluarRespuestaSimple(e, 'b').correcto, true)
  assert.equal(evaluarRespuestaSimple(e, 'a').correcto, false)
  const inventada = evaluarRespuestaSimple(e, 'c')
  assert.equal(inventada.valida, false)
})

test('respuesta corta: alternativas y tolerancia a tildes', () => {
  const e = { tipo: 'respuesta_corta', solucion_esperada: 'iteración|iteracion' }
  assert.equal(evaluarRespuestaSimple(e, 'ITERACION').correcto, true)
  assert.equal(evaluarRespuestaSimple(e, 'vuelta').correcto, false)
  assert.equal(evaluarRespuestaSimple(e, '   ').valida, false)
  const cond = { tipo: 'respuesta_corta', solucion_esperada: 'i <= 10|i<=10|i < 11|i<11' }
  assert.equal(evaluarRespuestaSimple(cond, 'i  <=  10').correcto, true)
})

test('predecir salida: compara líneas y no revela la respuesta', () => {
  const e = { tipo: 'salida', solucion_esperada: '3\n2\n1' }
  assert.equal(evaluarRespuestaSimple(e, '3\r\n2\r\n1\r\n').correcto, true)
  const mal = evaluarRespuestaSimple(e, '3\n2\n0')
  assert.equal(mal.correcto, false)
  assert.deepEqual(mal.diagnostico, { tipo: 'salida_distinta', linea: 3 })
})

test('tipo código no se evalúa aquí', () => {
  assert.throws(() => evaluarRespuestaSimple({ tipo: 'codigo' }, 'x'))
})
