import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  enriquecerErroresCompilacion,
  errorComunPorCodigo,
  errorComunPorSalida,
  explicarCicloInfinito,
  explicarSalida,
  leerCiclos,
  patronDeSalida,
  revisarCodigo,
} from './analisis.js'

const programa = (cuerpo) => `public class Ejercicio {\n    public static void main(String[] args) {\n${cuerpo}\n    }\n}`

test('patrones de salida típicos de principiante', () => {
  assert.equal(patronDeSalida('1\n2\n3\n4\n5', '1\n2\n3\n4\n5\n6'), 'vuelta_de_mas')
  assert.equal(patronDeSalida('1\n2\n3\n4\n5', '1\n2\n3\n4'), 'vuelta_de_menos')
  assert.equal(patronDeSalida('1\n2\n3', '0\n1\n2\n3'), 'empieza_antes')
  assert.equal(patronDeSalida('1\n2\n3', '2\n3'), 'salta_primero')
  assert.equal(patronDeSalida('3\n2\n1\n¡Despegue!', '3\n2\n1\n0\n¡Despegue!'), 'vuelta_de_mas')
  assert.equal(patronDeSalida('1\n2\n3', '123'), 'todo_en_una_linea')
  assert.equal(patronDeSalida('1 2 3\n2 4 6', '1\n2\n3\n2\n4\n6'), 'saltos_de_mas')
  assert.equal(patronDeSalida('3 x 1 = 3', '3x1=3'), 'espacios')
  assert.equal(patronDeSalida('¡Despegue!', '¡despegue!'), 'mayusculas')
  assert.equal(patronDeSalida('1\n2\n3', '3\n2\n1'), 'orden_inverso')
  assert.equal(patronDeSalida('Suma = 55', ''), 'vacia')
  assert.equal(patronDeSalida('1\n2\n3', '3'), 'print_fuera')
  assert.equal(patronDeSalida('Suma = 55', 'Suma = 1\nSuma = 3\nSuma = 6'), 'print_dentro')
  assert.equal(patronDeSalida('1\n2\n3', '1\n1\n1'), 'mismo_valor')
  assert.equal(patronDeSalida('Suma = 55', 'Suma = 45'), 'calculo')
  assert.equal(patronDeSalida('1\n2', '1\n2\n3\n4\n5\n6\n7'), 'demasiadas_lineas')
  assert.equal(patronDeSalida('1\n2\n3', '1\n2\n3'), null)
  assert.equal(patronDeSalida('hola', 'chao amigo'), null)
})

test('los mensajes de salida tienen tono de profe y versión para predicción', () => {
  const p = explicarSalida('1\n2\n3', '1\n2\n3\n4')
  assert.match(p.texto, /^Tu ciclo da una vuelta de más\. Recuerda/)
  assert.match(explicarSalida('1\n2\n3', '1\n2\n3\n4', 'prediccion').texto, /Tu respuesta/)
})

test('lee for, while y do-while con sus cuerpos', () => {
  const { ciclos } = leerCiclos(
    programa(`int i = 0;\nfor (int j = 0; j < 3; j++) x++;\nwhile (i < 3) { i++; }\ndo { i--; } while (i > 0);`),
  )
  assert.deepEqual(
    ciclos.map((c) => [c.tipo, c.condicion]).sort(),
    [
      ['do-while', 'i > 0'],
      ['for', 'j < 3'],
      ['while', 'i < 3'],
    ],
  )
})

test('punto y coma después del for o del while', () => {
  const [a] = revisarCodigo(programa('for (int i = 1; i <= 5; i++); {\n    System.out.println(i);\n}'))
  assert.equal(a.linea, 3)
  assert.match(a.texto, /";" justo después de for/)
  const [b] = revisarCodigo(programa('int n = 3;\nwhile (n > 0); {\n n--;\n}'))
  assert.match(b.texto, /while queda vacío/)
  // el while de cierre de un do-while NO es un error
  assert.deepEqual(revisarCodigo(programa('int n = 3;\ndo { n--; } while (n > 0);')), [])
})

test('acumulador declarado dentro del ciclo', () => {
  const avisos = revisarCodigo(programa('for (int i = 1; i <= 10; i++) {\n    int suma = 0;\n    suma += i;\n    System.out.println(suma);\n}'))
  assert.equal(avisos.length, 1)
  assert.match(avisos[0].texto, /"suma" dentro del ciclo \(línea 4\)/)
  assert.match(avisos[0].texto, /ANTES del ciclo/)
})

test('acumulador que se reinicia a propósito en el ciclo externo NO es error (números perfectos)', () => {
  const perfectos = programa(
    'for (int i = 2; i <= n; i++) {\n int suma = 0;\n for (int d = 1; d < i; d++) {\n  if (i % d == 0) suma += d;\n }\n if (suma == i) System.out.println(i);\n}',
  )
  assert.deepEqual(revisarCodigo(perfectos), [])
  const sinLlaves = programa('for (int i = 2; i <= n; i++) {\n int suma = 0;\n for (int d = 1; d < i; d++) if (i % d == 0) suma += d;\n}')
  assert.deepEqual(revisarCodigo(sinLlaves), [])
  const pares = programa('for (int k = 0; k < 3; k++) {\n for (int i = 2; i <= n; i += 2) System.out.println(i);\n}')
  assert.deepEqual(revisarCodigo(pares), [])
})

test('for con dirección contraria', () => {
  const [a] = revisarCodigo(programa('for (int i = 10; i >= 0; i++) {\n System.out.println(i);\n}'))
  assert.match(a.texto, /BAJA/)
  assert.match(a.texto, /i--/)
  const [b] = revisarCodigo(programa('for (int i = 1; i <= 5; i--) {}'))
  assert.match(b.texto, /SUBE/)
})

test('ciclo infinito: señala la variable que nunca cambia', () => {
  const [a] = explicarCicloInfinito(programa('int n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n}'))
  assert.equal(a.linea, 4)
  assert.match(a.texto, /"n"/)
  assert.match(a.texto, /n--;/)
  const [b] = explicarCicloInfinito(programa('int i = 1;\ndo {\n System.out.println(i);\n} while (i <= 5);'))
  assert.match(b.texto, /i\+\+;/)
  // si la variable se lee dentro del ciclo, sí cambia
  assert.deepEqual(explicarCicloInfinito(programa('int x;\ndo { x = sc.nextInt(); } while (x != 0);')), [])
  assert.deepEqual(explicarCicloInfinito(programa('int i = 0;\nwhile (i < 5) { i = i + 1; }')), [])
  const [c] = explicarCicloInfinito(programa('while (true) {\n System.out.println(1);\n}'))
  assert.match(c.texto, /while \(true\)/)
})

test('los comentarios y textos no confunden el análisis', () => {
  assert.deepEqual(revisarCodigo(programa('// for (int i = 0; i < 3; i++);\nSystem.out.println("while (x);");')), [])
})

test('compilación: variable usada fuera del ciclo donde se declaró', () => {
  const codigo = programa('for (int i = 1; i <= 10; i++) {\n    int suma = 0;\n    suma += i;\n}\nSystem.out.println(suma);')
  const [e] = enriquecerErroresCompilacion(
    [{ linea: 7, mensaje: 'cannot find symbol', explicacion: 'x', simbolo: { tipo: 'variable', nombre: 'suma' } }],
    codigo,
  )
  assert.match(e.explicacion, /dentro del ciclo de la línea 3/)
  const conI = programa('for (int i = 1; i <= 3; i++) {\n}\nSystem.out.println(i);')
  const [f] = enriquecerErroresCompilacion([{ linea: 5, mensaje: 'cannot find symbol', explicacion: 'x', simbolo: { tipo: 'variable', nombre: 'i' } }], conI)
  assert.match(f.explicacion, /solo existe dentro de ese for/)
})

test('compilación: comas en el for, = en la condición y Scanner sin import', () => {
  const comas = programa('for (int i = 1, i <= 5, i++) {}')
  assert.match(enriquecerErroresCompilacion([{ linea: 3, mensaje: "';' expected", explicacion: 'x' }], comas)[0].explicacion, /punto y coma, no con coma/)
  const igual = programa('int i = 0;\nwhile (i = 5) {}')
  assert.match(
    enriquecerErroresCompilacion([{ linea: 4, mensaje: 'incompatible types: int cannot be converted to boolean', explicacion: 'x' }], igual)[0].explicacion,
    /== \(dos signos igual\)/,
  )
  const sinImport = programa('Scanner sc = new Scanner(System.in);')
  assert.match(
    enriquecerErroresCompilacion([{ linea: 3, mensaje: 'cannot find symbol', explicacion: 'x', simbolo: { tipo: 'class', nombre: 'Scanner' } }], sinImport)[0]
      .explicacion,
    /import java\.util\.Scanner/,
  )
})

test('errores comunes escritos para el ejercicio', () => {
  const errores = [
    { salida: 'Suma = 45', mensaje: 'Te faltó el 10' },
    { patron: 'i\\s*<\\s*10\\b', mensaje: 'Usaste < 10' },
    { patron: '(', mensaje: 'patrón roto' },
  ]
  assert.equal(errorComunPorSalida(errores, 'Suma = 45\r\n'), 'Te faltó el 10')
  assert.equal(errorComunPorSalida(errores, 'Suma = 44'), null)
  assert.equal(errorComunPorCodigo(errores, 'for (int i = 1; i < 10; i++)'), 'Usaste < 10')
  assert.equal(errorComunPorCodigo(errores, '// i < 10\nfor (int i = 1; i <= 10; i++)'), null)
})
