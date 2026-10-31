// Auditoría de TODOS los ejercicios y retos contra el ejecutor Java real y el evaluador del backend.
// Comprueba, según el tipo:
//  - código: la solución pasa todos los casos; el código inicial compila y NO resuelve; ningún
//    patrón de "errores comunes" se activa con la solución; coherencia entre entradas y Scanner.
//  - salida: el código del enunciado, ejecutado de verdad, imprime exactamente la solución esperada.
//  - selección: la solución es una de las opciones y los errores comunes apuntan a opciones reales.
//  - respuesta corta: ninguna alternativa aceptada coincide con un "error común" (se daría por mala).
import { getSupabaseAdmin } from '../src/config/supabase.js'
import { ejecutarJava } from '../src/runner/index.js'
import { evaluarRespuestaSimple } from '../src/utils/evaluacion.js'
import { compararSalidas } from '../src/runner/comparar.js'

const db = getSupabaseAdmin()
const problemas = []
const anota = (item, texto) => problemas.push(`[${item.donde}] ${item.titulo}: ${texto}`)

const CLASE = /public\s+class\s+\w+/

// Para los de tipo "salida": el enunciado trae el fragmento de código que hay que seguir a mano.
function codigoDelEnunciado(enunciado) {
  const lineas = enunciado.replace(/\r/g, '').split('\n')
  const esCodigo = (l) => /[;{}]\s*$/.test(l) || /^\s*(int|long|double|boolean|char|String|for|while|do|if|else|System\.)\b/.test(l)
  const ini = lineas.findIndex(esCodigo)
  if (ini === -1) return null
  const cuerpo = lineas.slice(ini).filter((l) => l.trim() !== '').join('\n')
  if (CLASE.test(cuerpo)) return cuerpo
  return `public class Ejercicio {\n    public static void main(String[] args) {\n${cuerpo}\n    }\n}`
}

async function revisarCodigo(item) {
  const casos = item.casos_prueba ?? []
  if (!casos.length) return anota(item, 'ejercicio de código sin casos de prueba')
  const sol = await ejecutarJava(item.solucion_esperada, casos)
  if (!sol.compilo) {
    return anota(item, `la solución NO compila: ${sol.errores_compilacion.map((e) => e.mensaje).join(' / ')}`)
  }
  const fallan = sol.casos.map((c, i) => (c.correcto ? null : i + 1)).filter(Boolean)
  if (fallan.length) anota(item, `la solución falla los casos ${fallan.join(', ')}`)

  if (item.codigo_inicial) {
    const ini = await ejecutarJava(item.codigo_inicial, casos)
    if (!ini.compilo) anota(item, 'el código inicial NO compila (el estudiante arranca con un error)')
    else if (ini.casos.every((c) => c.correcto)) anota(item, 'el código inicial YA resuelve el ejercicio')
  } else {
    anota(item, 'ejercicio de código sin código inicial')
  }

  for (const e of item.errores_comunes ?? []) {
    if (e.patron && new RegExp(e.patron).test(item.solucion_esperada)) {
      anota(item, `el patrón de error "${e.patron}" se activa con la propia solución`)
    }
    if (e.salida != null && compararSalidas(e.salida, sol.casos[0]?.salida ?? '').iguales) {
      anota(item, 'un "error común" tiene la misma salida que la solución correcta')
    }
  }

  const pideDatos = casos.some((c) => (c.entrada ?? '') !== '')
  const solLee = /sc\.next|new Scanner/.test(item.solucion_esperada)
  if (pideDatos && !solLee) anota(item, 'los casos traen entrada pero la solución no lee nada')
  if (!pideDatos && solLee) anota(item, 'la solución crea un Scanner pero ningún caso trae entrada')
}

async function revisarSalida(item) {
  const codigo = codigoDelEnunciado(item.enunciado)
  if (!codigo) return anota(item, 'no se encontró el código dentro del enunciado')
  const r = await ejecutarJava(codigo, [{ entrada: '' }])
  if (!r.compilo) return anota(item, `el código del enunciado no compila: ${r.errores_compilacion.map((e) => e.mensaje).join(' / ')}`)
  const real = r.casos[0]?.salida ?? ''
  const esperada = item.solucion_esperada.split('|')[0]
  if (!compararSalidas(esperada, real).iguales) {
    anota(item, `la salida real es ${JSON.stringify(real.trim())} y la esperada ${JSON.stringify(esperada.trim())}`)
  }
  for (const e of item.errores_comunes ?? []) {
    if (e.salida != null && compararSalidas(e.salida, real).iguales) anota(item, 'un "error común" coincide con la salida correcta')
  }
}

function revisarSeleccion(item) {
  const opciones = item.opciones ?? []
  if (opciones.length < 2) return anota(item, 'menos de 2 opciones')
  if (!opciones.includes(item.solucion_esperada)) anota(item, 'la solución no está entre las opciones')
  for (const e of item.errores_comunes ?? []) {
    if (e.respuesta != null && !opciones.includes(e.respuesta)) anota(item, `el error común "${e.respuesta}" no es una opción`)
    if (e.respuesta === item.solucion_esperada) anota(item, 'un error común apunta a la opción correcta')
  }
  const sinExplicacion = opciones.filter((o) => o !== item.solucion_esperada && !(item.errores_comunes ?? []).some((e) => e.respuesta === o))
  if (sinExplicacion.length) anota(item, `opciones incorrectas sin explicación: ${sinExplicacion.join(' / ')}`)
}

function revisarRespuestaCorta(item) {
  const alternativas = item.solucion_esperada.split('|').filter((a) => a.trim() !== '')
  if (!alternativas.length) return anota(item, 'sin respuesta esperada')
  for (const alt of alternativas) {
    const r = evaluarRespuestaSimple({ ...item, tipo: 'respuesta_corta' }, alt)
    if (!r.correcto) anota(item, `la alternativa aceptada "${alt}" se evalúa como incorrecta`)
    for (const e of item.errores_comunes ?? []) {
      const choca = (e.respuesta ?? '').split('|').some((x) => x.trim().toLowerCase().replace(/\s+/g, '') === alt.trim().toLowerCase().replace(/\s+/g, ''))
      if (choca) anota(item, `la alternativa correcta "${alt}" también figura como error común`)
    }
  }
}

const { data: ejercicios, error: e1 } = await db
  .from('ejercicio')
  .select('id_ejercicio, titulo, tipo, enunciado, opciones, solucion_esperada, codigo_inicial, casos_prueba, errores_comunes, orden, modulo:modulo(orden)')
  .order('id_ejercicio')
if (e1) throw e1
const { data: desafios, error: e2 } = await db
  .from('desafio')
  .select('id_desafio, titulo, tipo, enunciado, opciones, solucion_esperada, codigo_inicial, casos_prueba, errores_comunes, periodo')
  .order('id_desafio')
if (e2) throw e2

const items = [
  ...ejercicios.map((e) => ({ ...e, donde: `M${e.modulo.orden}·${e.orden}` })),
  ...desafios.map((d) => ({ ...d, donde: `reto ${d.periodo}` })),
]

console.log(`Auditando ${items.length} items (${ejercicios.length} ejercicios + ${desafios.length} retos)…\n`)
let n = 0
for (const item of items) {
  n++
  process.stdout.write(`\r${n}/${items.length}  ${item.donde} ${item.titulo.slice(0, 40).padEnd(42)}`)
  if (item.tipo === 'codigo') await revisarCodigo(item)
  else if (item.tipo === 'salida') await revisarSalida(item)
  else if (item.tipo === 'seleccion') revisarSeleccion(item)
  else if (item.tipo === 'respuesta_corta') revisarRespuestaCorta(item)
}
console.log('\n')
if (!problemas.length) console.log('✓ Sin problemas: todas las soluciones, códigos iniciales, salidas y explicaciones son coherentes.')
else {
  console.log(`${problemas.length} problemas encontrados:\n`)
  for (const p of problemas) console.log(' -', p)
}
