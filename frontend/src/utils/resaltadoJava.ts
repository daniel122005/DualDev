// Resaltado de sintaxis Java mínimo (sin librerías): divide el código en fichas y las agrupa por línea.
// Pensado para los programas cortos de los ejercicios; no es un analizador completo de Java.

export type TipoFicha = 'clave' | 'tipo' | 'texto' | 'numero' | 'comentario' | 'clase' | 'normal'

export interface Ficha {
  tipo: TipoFicha
  texto: string
}

const CLAVES = new Set([
  'for', 'while', 'do', 'if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return',
  'new', 'class', 'public', 'private', 'protected', 'static', 'final', 'void', 'import', 'package',
  'try', 'catch', 'finally', 'throw', 'throws', 'this', 'true', 'false', 'null', 'extends', 'implements',
])
const TIPOS = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'String', 'var'])

// Orden importa: comentarios y textos antes que el resto, para que su contenido no se coloree.
const PATRON =
  /(\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?[lLfFdD]?\b)|([A-Za-z_$][\w$]*)/g

function clasificarPalabra(p: string): TipoFicha {
  if (TIPOS.has(p)) return 'tipo'
  if (CLAVES.has(p)) return 'clave'
  if (/^[A-Z]/.test(p)) return 'clase'
  return 'normal'
}

export function fichasJava(codigo: string): Ficha[] {
  const fichas: Ficha[] = []
  let ultimo = 0
  for (const m of codigo.matchAll(PATRON)) {
    if (m.index > ultimo) fichas.push({ tipo: 'normal', texto: codigo.slice(ultimo, m.index) })
    const tipo: TipoFicha = m[1] ? 'comentario' : m[2] ? 'texto' : m[3] ? 'numero' : clasificarPalabra(m[4])
    fichas.push({ tipo, texto: m[0] })
    ultimo = m.index + m[0].length
  }
  if (ultimo < codigo.length) fichas.push({ tipo: 'normal', texto: codigo.slice(ultimo) })
  return fichas
}

// Fichas agrupadas por línea (un comentario /* */ de varias líneas se reparte entre ellas).
export function lineasResaltadas(codigo: string): Ficha[][] {
  const lineas: Ficha[][] = [[]]
  for (const f of fichasJava(codigo)) {
    const partes = f.texto.split('\n')
    partes.forEach((parte, i) => {
      if (i > 0) lineas.push([])
      if (parte) lineas[lineas.length - 1].push({ tipo: f.tipo, texto: parte })
    })
  }
  return lineas
}
