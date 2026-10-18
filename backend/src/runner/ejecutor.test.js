// Pruebas de integración: compilan y ejecutan Java de verdad. Requieren JAVA_HOME (JDK 17) en backend/.env.
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const sinJdk = !process.env.JAVA_HOME
const { ejecutarJava } = sinJdk ? {} : await import('./index.js')

const programa = (cuerpo, clase = 'Main') =>
  `public class ${clase} {\n    public static void main(String[] args) {\n${cuerpo}\n    }\n}\n`

const SUMA = programa(`        int suma = 0;
        for (int i = 1; i <= 10; i++) {
            suma += i;
        }
        System.out.println("Suma = " + suma);`)

describe('ejecutor Java (local)', { skip: sinJdk && 'JAVA_HOME no configurado', concurrency: false }, () => {
  test('programa correcto coincide con la salida esperada', async () => {
    const r = await ejecutarJava(SUMA, [{ entrada: '', salida: 'Suma = 55' }])
    assert.equal(r.compilo, true)
    assert.equal(r.casos[0].correcto, true)
    assert.equal(r.casos[0].error, null)
  })

  test('el nombre de la clase pública define el archivo (como en el diseño: Ejercicio.java)', async () => {
    const r = await ejecutarJava(SUMA.replace('class Main', 'class Ejercicio'), [{ entrada: '', salida: 'Suma = 55' }])
    assert.equal(r.casos[0].correcto, true)
  })

  test('falta punto y coma: error con línea 7 y explicación', async () => {
    const r = await ejecutarJava(SUMA.replace('suma);', 'suma)'), [{ entrada: '', salida: 'Suma = 55' }])
    assert.equal(r.compilo, false)
    assert.equal(r.errores_compilacion[0].linea, 7)
    assert.match(r.errores_compilacion[0].explicacion, /punto y coma/)
  })

  test('división entre cero: excepción con su línea', async () => {
    const r = await ejecutarJava(programa('        int x = 0;\n        System.out.println(10 / x);'), [{ entrada: '' }])
    assert.equal(r.casos[0].error.tipo, 'excepcion')
    assert.equal(r.casos[0].error.excepcion, 'ArithmeticException')
    assert.equal(r.casos[0].error.linea, 4)
  })

  test('ciclo infinito: se corta por tiempo y se explica', async () => {
    const r = await ejecutarJava(programa('        int i = 0;\n        while (i < 10) {\n        }'), [{ entrada: '', salida: '' }])
    assert.equal(r.casos[0].error.tipo, 'tiempo_agotado')
    assert.match(r.casos[0].error.explicacion, /ciclo infinito/)
    assert.equal(r.casos[0].correcto, false)
  })

  test('salida descontrolada: se corta', async () => {
    const r = await ejecutarJava(programa('        while (true) System.out.println("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");'), [{ entrada: '' }])
    assert.equal(r.casos[0].error.tipo, 'salida_excesiva')
  })

  test('no puede leer los secretos del backend', async () => {
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env').replace(/\\/g, '/')
    const codigo = `import java.nio.file.*;\n${programa(`        try { System.out.println(Files.readString(Paths.get("${envPath}"))); } catch (Exception e) { throw new RuntimeException(e); }`)}`
    const r = await ejecutarJava(codigo, [{ entrada: '' }])
    assert.equal(r.casos[0].error?.tipo, 'excepcion')
    assert.doesNotMatch(r.casos[0].salida, /SUPABASE/)
    assert.match(r.casos[0].error.explicacion, /no está permitido/)
  })

  test('no puede leer variables de entorno', async () => {
    const r = await ejecutarJava(programa('        System.out.println(System.getenv("SUPABASE_SERVICE_ROLE_KEY"));'), [{ entrada: '' }])
    assert.equal(r.casos[0].error?.tipo, 'excepcion')
  })

  test('bomba de hilos: se corta enseguida y sin agotar la memoria', async () => {
    const { freemem } = await import('node:os')
    const bomba = programa(`        while (true) {
            Thread t = new Thread(() -> { try { Thread.sleep(60000); } catch (Exception e) {} });
            t.setDaemon(true);
            t.start();
        }`)
    const libreAntes = freemem()
    let minimo = libreAntes
    const vigia = setInterval(() => (minimo = Math.min(minimo, freemem())), 50)
    const inicio = Date.now()
    const r = await ejecutarJava(bomba, [{ entrada: '' }])
    clearInterval(vigia)
    assert.equal(r.casos[0].error?.tipo, 'excepcion')
    assert.match(r.casos[0].error.explicacion, /demasiados hilos/)
    assert.ok(Date.now() - inicio < 2500, 'debe cortarse antes del límite de tiempo')
    assert.ok(libreAntes - minimo < 300 * 1024 * 1024, `consumió ${Math.round((libreAntes - minimo) / 2 ** 20)} MB`)
    assert.doesNotMatch(r.casos[0].salida, /\[warning\]/)
  })

  test('un programa con pocos hilos sigue funcionando', async () => {
    const codigo = programa(`        Thread[] hs = new Thread[4];
        int[] suma = new int[1];
        for (int i = 0; i < 4; i++) { hs[i] = new Thread(() -> { synchronized (suma) { suma[0]++; } }); hs[i].start(); }
        for (Thread h : hs) { try { h.join(); } catch (InterruptedException e) {} }
        System.out.println(suma[0]);`)
    const r = await ejecutarJava(codigo, [{ entrada: '', salida: '4' }])
    assert.equal(r.casos[0].correcto, true, JSON.stringify(r.casos[0]))
  })

  test('no se puede suplantar la Guardia con una clase del mismo nombre', async () => {
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env').replace(/\\/g, '/')
    const codigo = `package dualdev.seguridad;
import java.nio.file.*;
class Guardia extends SecurityManager {
    @Override public void checkPermission(java.security.Permission p) { }
}
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println(Files.readString(Paths.get("${envPath}")));
    }
}
`
    const r = await ejecutarJava(codigo, [{ entrada: '' }])
    assert.doesNotMatch(r.casos[0]?.salida ?? '', /SUPABASE/)
    assert.ok(r.casos[0]?.error, 'debe fallar (no puede leer el .env)')
  })

  test('lee la entrada con Scanner y respeta tildes', async () => {
    const codigo = `import java.util.Scanner;\n${programa('        Scanner sc = new Scanner(System.in);\n        String n = sc.nextLine();\n        System.out.println("Hola, " + n + " ñ");')}`
    const r = await ejecutarJava(codigo, [{ entrada: 'José\n', salida: 'Hola, José ñ' }])
    assert.equal(r.casos[0].correcto, true, JSON.stringify(r.casos[0]))
  })

  test('salida incorrecta: indica la primera línea distinta', async () => {
    const r = await ejecutarJava(programa('        for (int i = 1; i < 3; i++) System.out.println(i);'), [{ entrada: '', salida: '1\n2\n3' }])
    assert.equal(r.casos[0].correcto, false)
    assert.deepEqual(r.casos[0].primera_diferencia, { linea: 3, esperada: '3', obtenida: null })
  })

  test('varios casos de prueba con una sola compilación', async () => {
    const codigo = `import java.util.Scanner;\n${programa('        int n = new Scanner(System.in).nextInt();\n        int s = 0;\n        for (int i = 1; i <= n; i++) s += i;\n        System.out.println(s);')}`
    const r = await ejecutarJava(codigo, [
      { entrada: '3', salida: '6' },
      { entrada: '10', salida: '55' },
      { entrada: '1', salida: '1' },
    ])
    assert.deepEqual(r.casos.map((c) => c.correcto), [true, true, true])
  })

  test('rechaza código vacío o demasiado largo', async () => {
    await assert.rejects(ejecutarJava('   ', [{ entrada: '' }]), /Escribe tu código/)
    await assert.rejects(ejecutarJava('x'.repeat(21 * 1024), [{ entrada: '' }]), /demasiado largo/)
  })

  test('ejecuciones simultáneas terminan todas y no dejan carpetas temporales', async () => {
    const antes = new Set((await readdir(tmpdir())).filter((d) => d.startsWith('dualdev-')))
    const resultados = await Promise.all(Array.from({ length: 5 }, () => ejecutarJava(SUMA, [{ entrada: '', salida: 'Suma = 55' }])))
    assert.ok(resultados.every((r) => r.casos[0].correcto))
    const despues = (await readdir(tmpdir())).filter((d) => d.startsWith('dualdev-') && !antes.has(d))
    assert.deepEqual(despues, [])
  })
})
