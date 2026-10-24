import assert from 'node:assert/strict'
import { test } from 'node:test'
import { limpiarStderr, parsearErrorEjecucion, parsearErroresCompilacion, sanitizarErrorOculto } from './diagnosticos.js'

test('punto y coma faltante: línea, columna y explicación', () => {
  const stderr = [
    'Main.java:7: error: \';\' expected',
    '        System.out.println("Suma = " + suma)',
    '                                            ^',
    '1 error',
  ].join('\n')
  const [e] = parsearErroresCompilacion(stderr)
  assert.equal(e.linea, 7)
  assert.equal(e.columna, 45)
  assert.equal(e.tipo, 'Sintaxis')
  assert.match(e.explicacion, /punto y coma/)
  assert.equal(e.codigo, '        System.out.println("Suma = " + suma)')
})

test('varios errores, con symbol de variable y tipos incompatibles', () => {
  const stderr = [
    'C:\\tmp\\dualdev-x\\Main.java:3: error: incompatible types: String cannot be converted to int',
    '        int x = "hola";',
    '                ^',
    'C:\\tmp\\dualdev-x\\Main.java:4: error: cannot find symbol',
    '        System.out.println(y);',
    '                           ^',
    '  symbol:   variable y',
    '  location: class Main',
    '2 errors',
  ].join('\r\n')
  const errores = parsearErroresCompilacion(stderr)
  assert.equal(errores.length, 2)
  assert.equal(errores[0].linea, 3)
  assert.equal(errores[0].tipo, 'Tipos')
  assert.match(errores[0].explicacion, /String/)
  assert.equal(errores[1].linea, 4)
  assert.equal(errores[1].tipo, 'Símbolo')
  assert.match(errores[1].explicacion, /variable "y" no existe/)
  assert.deepEqual(errores[1].simbolo, { tipo: 'variable', nombre: 'y' })
})

test('el symbol de un error no se mezcla con el siguiente error', () => {
  const stderr = [
    'Main.java:3: error: cannot find symbol',
    '        foo();',
    '        ^',
    'Main.java:5: error: cannot find symbol',
    '        x = 1;',
    '        ^',
    '  symbol:   variable x',
  ].join('\n')
  const [a, b] = parsearErroresCompilacion(stderr)
  assert.doesNotMatch(a.explicacion, /"x"/)
  assert.match(b.explicacion, /"x"/)
})

test('fin de archivo: falta llave', () => {
  const [e] = parsearErroresCompilacion('Main.java:9: error: reached end of file while parsing\n}\n ^\n1 error')
  assert.match(e.explicacion, /llave/)
})

test('variable sin inicializar (típico en acumuladores)', () => {
  const [e] = parsearErroresCompilacion('Main.java:5: error: variable suma might not have been initialized\n  suma += i;\n  ^')
  assert.equal(e.tipo, 'Variables')
  assert.match(e.explicacion, /int suma = 0/)
})

test('mensaje desconocido: conserva el original', () => {
  const [e] = parsearErroresCompilacion('Main.java:2: error: algo raro que no conocemos\nx\n^')
  assert.equal(e.tipo, 'Compilación')
  assert.match(e.explicacion, /algo raro/)
})

test('excepción en ejecución con línea del archivo del estudiante', () => {
  const stderr = [
    'WARNING: A command line option has enabled the Security Manager',
    'WARNING: The Security Manager is deprecated and will be removed in a future release',
    'Exception in thread "main" java.lang.ArithmeticException: / by zero',
    '\tat Main.main(Main.java:7)',
  ].join('\n')
  const e = parsearErrorEjecucion(stderr, 'Main.java')
  assert.equal(e.excepcion, 'ArithmeticException')
  assert.equal(e.linea, 7)
  assert.match(e.explicacion, /cero/)
})

test('índice fuera de rango sugiere revisar < vs <=', () => {
  const stderr =
    'Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5\n\tat Ejercicio.main(Ejercicio.java:6)'
  const e = parsearErrorEjecucion(stderr, 'Ejercicio.java')
  assert.equal(e.linea, 6)
  assert.match(e.explicacion, /<=/)
})

test('sin excepción devuelve null', () => {
  assert.equal(parsearErrorEjecucion('WARNING: The Security Manager is deprecated', 'Main.java'), null)
})

test('error de un caso oculto: no filtra texto controlado por el programa', () => {
  const excepcion = { tipo: 'excepcion', excepcion: 'RuntimeException', mensaje: 'ENTRADA_SECRETA 1005', linea: 6, explicacion: 'x' }
  assert.deepEqual(sanitizarErrorOculto(excepcion), { tipo: 'excepcion', explicacion: 'x', excepcion: 'RuntimeException', linea: 6 })
  const salida = { tipo: 'terminacion', explicacion: 'El programa terminó con código 42.', detalle: 'ENTRADA_SECRETA' }
  const s = sanitizarErrorOculto(salida)
  assert.equal(s.detalle, undefined)
  assert.doesNotMatch(JSON.stringify(s), /42|SECRETA/)
})

test('limpiarStderr quita solo los avisos del Security Manager', () => {
  assert.equal(limpiarStderr('WARNING: The Security Manager is deprecated\nhola'), 'hola')
})
