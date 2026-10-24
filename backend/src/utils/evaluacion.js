import { explicarSalida } from '../runner/analisis.js'
import { compararSalidas, normalizarSalida } from '../runner/comparar.js'

// Para respuestas cortas: sin tildes, minúsculas y espacios colapsados ("Iteración" == "iteracion").
export function normalizarTexto(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Igual que normalizarTexto pero sin ningún espacio: "i<=10" == "i <= 10".
const compacto = (s) => normalizarTexto(s).replace(/\s+/g, '')

// errores_comunes: [{ respuesta?, salida?, mensaje }]. Devuelve el mensaje que corresponde a la respuesta.
function errorComun(ejercicio, texto) {
  const lista = Array.isArray(ejercicio.errores_comunes) ? ejercicio.errores_comunes : []
  if (ejercicio.tipo === 'seleccion') return lista.find((e) => e.respuesta === texto)?.mensaje ?? null
  if (ejercicio.tipo === 'respuesta_corta') {
    return lista.find((e) => e.respuesta != null && e.respuesta.split('|').some((alt) => compacto(alt) === compacto(texto)))?.mensaje ?? null
  }
  const lineas = normalizarSalida(texto).join('\n')
  return lista.find((e) => e.salida != null && normalizarSalida(e.salida).join('\n') === lineas)?.mensaje ?? null
}

const recuerdaDe = (...textos) => textos.filter(Boolean).slice(0, 2).map((texto) => ({ linea: null, texto }))

// Evalúa ejercicios que no requieren ejecutar código. solucion_esperada admite alternativas con "|".
export function evaluarRespuestaSimple(ejercicio, respuesta) {
  const texto = String(respuesta ?? '')

  if (ejercicio.tipo === 'seleccion') {
    const opciones = Array.isArray(ejercicio.opciones) ? ejercicio.opciones : []
    if (!opciones.includes(texto)) {
      return { valida: false, correcto: false, motivo: 'Elige una de las opciones.' }
    }
    const correcto = texto === ejercicio.solucion_esperada
    const recuerda = correcto ? [] : recuerdaDe(errorComun(ejercicio, texto))
    return { valida: true, correcto, diagnostico: recuerda.length ? { tipo: 'respuesta', recuerda } : null }
  }

  if (ejercicio.tipo === 'respuesta_corta') {
    if (texto.trim() === '') return { valida: false, correcto: false, motivo: 'Escribe tu respuesta.' }
    const correcto = ejercicio.solucion_esperada.split('|').some((alt) => compacto(alt) === compacto(texto))
    const recuerda = correcto ? [] : recuerdaDe(errorComun(ejercicio, texto))
    return { valida: true, correcto, diagnostico: recuerda.length ? { tipo: 'respuesta', recuerda } : null }
  }

  if (ejercicio.tipo === 'salida') {
    if (texto.trim() === '') return { valida: false, correcto: false, motivo: 'Escribe la salida que crees que imprime el programa.' }
    const comparacion = compararSalidas(ejercicio.solucion_esperada, texto)
    if (comparacion.iguales) return { valida: true, correcto: true, diagnostico: null }
    return {
      valida: true,
      correcto: false,
      // Solo se dice en qué línea empieza la diferencia y qué tipo de error parece, sin revelar la salida correcta.
      diagnostico: {
        tipo: 'salida_distinta',
        linea: comparacion.primera_diferencia.linea,
        recuerda: recuerdaDe(errorComun(ejercicio, texto) ?? explicarSalida(ejercicio.solucion_esperada, texto, 'prediccion')?.texto),
      },
    }
  }

  throw new Error(`Tipo de ejercicio no soportado por evaluarRespuestaSimple: ${ejercicio.tipo}`)
}
