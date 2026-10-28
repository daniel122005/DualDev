// Plantillas tipo IDE: escribir la palabra y presionar Tab arma la estructura completa.
// En el cuerpo, `\t` es un nivel de sangría y ${n:texto} es un campo (Tab salta al siguiente).
// ${0} marca dónde termina el cursor.

export interface Plantilla {
  atajo: string
  etiqueta: string
  descripcion: string
  cuerpo: string
}

export const PLANTILLAS: Plantilla[] = [
  { atajo: 'for', etiqueta: 'for', descripcion: 'Ciclo for que cuenta', cuerpo: 'for (int i = ${1:0}; i < ${2:10}; i++) {\n\t${0}\n}' },
  { atajo: 'forr', etiqueta: 'for ↓', descripcion: 'Ciclo for hacia atrás', cuerpo: 'for (int i = ${1:10}; i >= ${2:1}; i--) {\n\t${0}\n}' },
  { atajo: 'while', etiqueta: 'while', descripcion: 'Ciclo while', cuerpo: 'while (${1:condicion}) {\n\t${0}\n}' },
  { atajo: 'do', etiqueta: 'do-while', descripcion: 'Ciclo do-while', cuerpo: 'do {\n\t${1}\n} while (${2:condicion});${0}' },
  { atajo: 'if', etiqueta: 'if', descripcion: 'Condicional if', cuerpo: 'if (${1:condicion}) {\n\t${0}\n}' },
  { atajo: 'ifelse', etiqueta: 'if-else', descripcion: 'if con else', cuerpo: 'if (${1:condicion}) {\n\t${2}\n} else {\n\t${0}\n}' },
  { atajo: 'else', etiqueta: 'else', descripcion: 'Bloque else', cuerpo: 'else {\n\t${0}\n}' },
  { atajo: 'sout', etiqueta: 'println', descripcion: 'Imprimir con salto de línea', cuerpo: 'System.out.println(${0});' },
  { atajo: 'print', etiqueta: 'print', descripcion: 'Imprimir sin salto de línea', cuerpo: 'System.out.print(${0});' },
  { atajo: 'scan', etiqueta: 'Scanner', descripcion: 'Crear el Scanner', cuerpo: 'Scanner sc = new Scanner(System.in);${0}' },
  { atajo: 'leer', etiqueta: 'leer int', descripcion: 'Leer un número entero', cuerpo: 'int ${1:n} = sc.nextInt();${0}' },
  { atajo: 'main', etiqueta: 'main', descripcion: 'Método main', cuerpo: 'public static void main(String[] args) {\n\t${0}\n}' },
]

// Alias que usan los IDE más comunes (NetBeans, Eclipse, IntelliJ).
const ALIAS: Record<string, string> = { fori: 'for', syso: 'sout', psvm: 'main' }

export function buscarPlantilla(palabra: string): Plantilla | null {
  const atajo = ALIAS[palabra] ?? palabra
  return PLANTILLAS.find((p) => p.atajo === atajo) ?? null
}

export interface Expansion {
  texto: string
  // Campos en orden de salto, como posiciones relativas al inicio del texto insertado.
  campos: { ini: number; fin: number }[]
}

const SANGRIA = '    '

// Convierte el cuerpo de la plantilla en texto real con la sangría de la línea donde se escribe.
export function expandirPlantilla(p: Plantilla, sangriaBase: string): Expansion {
  const conSangria = p.cuerpo.replace(/\n/g, `\n${sangriaBase}`).replace(/\t/g, SANGRIA)
  const marcas: { n: number; ini: number; fin: number }[] = []
  let texto = ''
  let ultimo = 0
  for (const m of conSangria.matchAll(/\$\{(\d+)(?::([^}]*))?\}/g)) {
    texto += conSangria.slice(ultimo, m.index)
    const relleno = m[2] ?? ''
    marcas.push({ n: Number(m[1]), ini: texto.length, fin: texto.length + relleno.length })
    texto += relleno
    ultimo = m.index + m[0].length
  }
  texto += conSangria.slice(ultimo)
  // ${1}, ${2}… primero; ${0} siempre al final.
  marcas.sort((a, b) => (a.n === 0 ? 1 : b.n === 0 ? -1 : a.n - b.n))
  return { texto, campos: marcas.map(({ ini, fin }) => ({ ini, fin })) }
}
