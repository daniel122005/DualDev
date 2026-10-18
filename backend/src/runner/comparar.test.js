import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compararSalidas, estructurasFaltantes } from './comparar.js'

test('ignora \\r\\n, espacios finales y líneas vacías al final', () => {
  assert.equal(compararSalidas('1\n2\n3', '1  \r\n2\r\n3\r\n\r\n').iguales, true)
})

test('señala la primera línea distinta', () => {
  const r = compararSalidas('1\n2\n3', '1\n2\n4')
  assert.equal(r.iguales, false)
  assert.deepEqual(r.primera_diferencia, { linea: 3, esperada: '3', obtenida: '4' })
})

test('detecta líneas que faltan o sobran', () => {
  assert.deepEqual(compararSalidas('1\n2\n3', '1\n2').primera_diferencia, { linea: 3, esperada: '3', obtenida: null })
  assert.deepEqual(compararSalidas('1', '1\n2').primera_diferencia, { linea: 2, esperada: null, obtenida: '2' })
})

test('mayúsculas y espacios internos cuentan', () => {
  assert.equal(compararSalidas('Suma = 55', 'suma = 55').iguales, false)
  assert.equal(compararSalidas('Suma = 55', 'Suma =55').iguales, false)
})

test('estructuras requeridas: ignora comentarios y textos', () => {
  const trampa = 'public class Main { public static void main(String[] a) { // for (\n System.out.println("for (i)"); } }'
  assert.deepEqual(estructurasFaltantes(trampa, ['for']), ['for'])
  const bien = 'public class Main { public static void main(String[] a) { for (int i = 0; i < 3; i++) {} } }'
  assert.deepEqual(estructurasFaltantes(bien, ['for']), [])
})

test('do-while se distingue de while', () => {
  const soloWhile = 'int i = 0; while (i < 3) { i++; }'
  assert.deepEqual(estructurasFaltantes(soloWhile, ['do-while']), ['do-while'])
  assert.deepEqual(estructurasFaltantes('do { i++; } while (i < 3);', ['do-while']), [])
})
