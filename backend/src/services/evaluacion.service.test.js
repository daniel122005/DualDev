import assert from 'node:assert/strict'
import { test } from 'node:test'
import { entradaParaEjecutar } from './evaluacion.service.js'

const casos = [
  { entrada: '4', salida: '1\n2\n3\n4', visible: true },
  { entrada: '9', salida: '…', visible: false },
]

test('usa la entrada que escribió el estudiante', () => {
  assert.equal(entradaParaEjecutar(casos, '7'), '7')
  assert.equal(entradaParaEjecutar(casos, '5\n3\n0'), '5\n3\n0')
})

test('una entrada vacía escrita a propósito se respeta (probar sin datos también es probar)', () => {
  assert.equal(entradaParaEjecutar(casos, ''), '')
})

test('sin entrada escrita, usa la del primer ejemplo visible y nunca la de un caso oculto', () => {
  assert.equal(entradaParaEjecutar(casos, undefined), '4')
  assert.equal(entradaParaEjecutar([{ entrada: '9', salida: '…', visible: false }], undefined), '')
})

test('un ejercicio sin casos no rompe', () => {
  assert.equal(entradaParaEjecutar([], undefined), '')
  assert.equal(entradaParaEjecutar(null, undefined), '')
})
