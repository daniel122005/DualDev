// Comparación tolerante de salidas: ignora \r, espacios al final de cada línea y líneas vacías al final.
// Mayúsculas, acentos y espacios internos sí cuentan (son parte de lo que el ejercicio pide imprimir).
export function normalizarSalida(texto) {
  const lineas = (texto ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
  while (lineas.length && lineas[lineas.length - 1] === '') lineas.pop()
  return lineas
}

export function compararSalidas(esperada, obtenida) {
  const a = normalizarSalida(esperada)
  const b = normalizarSalida(obtenida)
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      return {
        iguales: false,
        primera_diferencia: { linea: i + 1, esperada: a[i] ?? null, obtenida: b[i] ?? null },
      }
    }
  }
  return { iguales: true, primera_diferencia: null }
}

// Quita comentarios y literales de texto para buscar palabras clave en el código real.
export function codigoSinComentariosNiTextos(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
}

// requiere: ['for', 'while', ...]. Devuelve las estructuras que faltan.
export function estructurasFaltantes(codigo, requiere = []) {
  const limpio = codigoSinComentariosNiTextos(codigo)
  const patrones = {
    for: /\bfor\s*\(/,
    while: /\bwhile\s*\(/,
    'do-while': /\bdo\s*\{[\s\S]*\}\s*while\s*\(/,
    if: /\bif\s*\(/,
    break: /\bbreak\s*;/,
    continue: /\bcontinue\s*;/,
  }
  return requiere.filter((r) => {
    const p = patrones[r] ?? new RegExp(`\\b${r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    return !p.test(limpio)
  })
}
