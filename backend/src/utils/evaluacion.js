import { compararSalidas } from '../runner/comparar.js'

// Para respuestas cortas: sin tildes, minúsculas y espacios colapsados ("Iteración" == "iteracion").
export function normalizarTexto(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Evalúa ejercicios que no requieren ejecutar código. solucion_esperada admite alternativas con "|".
export function evaluarRespuestaSimple(ejercicio, respuesta) {
  const texto = String(respuesta ?? '')

  if (ejercicio.tipo === 'seleccion') {
    const opciones = Array.isArray(ejercicio.opciones) ? ejercicio.opciones : []
    if (!opciones.includes(texto)) {
      return { valida: false, correcto: false, motivo: 'Elige una de las opciones.' }
    }
    return { valida: true, correcto: texto === ejercicio.solucion_esperada, diagnostico: null }
  }

  if (ejercicio.tipo === 'respuesta_corta') {
    if (texto.trim() === '') return { valida: false, correcto: false, motivo: 'Escribe tu respuesta.' }
    const alternativas = ejercicio.solucion_esperada.split('|').map(normalizarTexto)
    return { valida: true, correcto: alternativas.includes(normalizarTexto(texto)), diagnostico: null }
  }

  if (ejercicio.tipo === 'salida') {
    if (texto.trim() === '') return { valida: false, correcto: false, motivo: 'Escribe la salida que crees que imprime el programa.' }
    const comparacion = compararSalidas(ejercicio.solucion_esperada, texto)
    return {
      valida: true,
      correcto: comparacion.iguales,
      // Solo se dice en qué línea empieza la diferencia, sin revelar la salida correcta.
      diagnostico: comparacion.iguales ? null : { tipo: 'salida_distinta', linea: comparacion.primera_diferencia.linea },
    }
  }

  throw new Error(`Tipo de ejercicio no soportado por evaluarRespuestaSimple: ${ejercicio.tipo}`)
}
