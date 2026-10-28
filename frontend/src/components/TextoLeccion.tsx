import type { ReactNode } from 'react'

// Formato mínimo para las explicaciones del seed (sin librerías ni HTML crudo):
//   párrafos separados por línea en blanco · **negrita** · `código`
//   líneas "- algo" → viñetas · líneas "1. algo" → pasos numerados
//   líneas "| a | b |" → tabla (la primera fila es el encabezado; "|---|" se ignora)

function enLinea(texto: string): ReactNode[] {
  const partes: ReactNode[] = []
  let ultimo = 0
  for (const m of texto.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`/g)) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index))
    partes.push(m[1] !== undefined ? <strong key={m.index}>{m[1]}</strong> : <code key={m.index}>{m[2]}</code>)
    ultimo = m.index + m[0].length
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return partes
}

const celdas = (linea: string) =>
  linea
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

function bloque(lineas: string[], clave: number): ReactNode {
  if (lineas.every((l) => /^\s*-\s+/.test(l))) {
    return (
      <ul key={clave}>
        {lineas.map((l, i) => (
          <li key={i}>{enLinea(l.replace(/^\s*-\s+/, ''))}</li>
        ))}
      </ul>
    )
  }
  if (lineas.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
    return (
      <ol key={clave}>
        {lineas.map((l, i) => (
          <li key={i}>{enLinea(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>
        ))}
      </ol>
    )
  }
  if (lineas.every((l) => l.trim().startsWith('|'))) {
    const filas = lineas.filter((l) => !/^\s*\|[\s|:-]+\|\s*$/.test(l)).map(celdas)
    const [cabeza, ...cuerpo] = filas
    return (
      <div key={clave} className="tabla-scroll">
        <table>
          <thead>
            <tr>
              {cabeza.map((c, i) => (
                <th key={i}>{enLinea(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cuerpo.map((f, i) => (
              <tr key={i}>
                {f.map((c, j) => (
                  <td key={j}>{enLinea(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return <p key={clave}>{lineas.flatMap((l, i) => (i ? [<br key={`br${i}`} />, ...enLinea(l)] : enLinea(l)))}</p>
}

export default function TextoLeccion({ texto }: { texto: string }) {
  const bloques = texto
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').filter((l) => l.trim() !== ''))
    .filter((b) => b.length)
  return <div className="texto-leccion">{bloques.map((b, i) => bloque(b, i))}</div>
}
