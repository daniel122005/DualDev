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
  assert.equal(mal.diagnostico.tipo, 'salida_distinta')
  assert.equal(mal.diagnostico.linea, 3)
  assert.doesNotMatch(JSON.stringify(mal.diagnostico), /"1"/)
})

test('predecir salida: explica la vuelta de más sin revelar la respuesta', () => {
  const e = { tipo: 'salida', solucion_esperada: '1\n2\n3' }
  const r = evaluarRespuestaSimple(e, '1\n2\n3\n4')
  assert.match(r.diagnostico.recuerda[0].texto, /vuelta de más/)
  const conError = { ...e, errores_comunes: [{ salida: '0\n1\n2', mensaje: 'Recuerda que i empieza en 1.' }] }
  assert.equal(evaluarRespuestaSimple(conError, '0\n1\n2').diagnostico.recuerda[0].texto, 'Recuerda que i empieza en 1.')
})

test('selección: explica por qué la opción elegida es incorrecta', () => {
  const e = {
    tipo: 'seleccion',
    opciones: ['4', '5', '6'],
    solucion_esperada: '5',
    errores_comunes: [{ respuesta: '4', mensaje: 'Recuerda que i empieza en 0.' }],
  }
  assert.deepEqual(evaluarRespuestaSimple(e, '4').diagnostico, { tipo: 'respuesta', recuerda: [{ linea: null, texto: 'Recuerda que i empieza en 0.' }] })
  assert.equal(evaluarRespuestaSimple(e, '6').diagnostico, null)
  assert.equal(evaluarRespuestaSimple(e, '5').diagnostico, null)
})

test('respuesta corta: ignora espacios y reconoce errores comunes', () => {
  const e = { tipo: 'respuesta_corta', solucion_esperada: 'i <= 10', errores_comunes: [{ respuesta: 'i < 10', mensaje: 'Te falta el 10.' }] }
  assert.equal(evaluarRespuestaSimple(e, 'i<=10').correcto, true)
  assert.equal(evaluarRespuestaSimple(e, 'i<10').diagnostico.recuerda[0].texto, 'Te falta el 10.')
})

test('tipo código no se evalúa aquí', () => {
  assert.throws(() => evaluarRespuestaSimple({ tipo: 'codigo' }, 'x'))
})
