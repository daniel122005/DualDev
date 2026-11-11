import { useState, type ReactNode } from 'react'

// Formato mínimo para las explicaciones del seed (sin librerías ni HTML crudo):
//   párrafos separados por línea en blanco · **negrita** · `código`
//   líneas "- algo" → viñetas · líneas "1. algo" → pasos numerados
//   líneas "| a | b |" → tabla (la primera fila es el encabezado; "|---|" se ignora).
//     Si la primera columna es "Vuelta" o "fila", es una prueba de escritorio y se recorre paso a paso.
//   bloque "? pregunta" + "- opción" + "+ opción correcta" + "> explicación" → pregunta de repaso

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

// Prueba de escritorio: las vueltas aparecen una por una, para pensar la siguiente antes de verla.
function TablaPasoAPaso({ cabeza, cuerpo }: { cabeza: string[]; cuerpo: string[][] }) {
  const [visibles, setVisibles] = useState(1)
  const terminada = visibles >= cuerpo.length
  return (
    <div>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              {cabeza.map((c, i) => (
                <th key={i}>{enLinea(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cuerpo.slice(0, visibles).map((f, i) => (
              <tr key={i} className={i === visibles - 1 && !terminada ? 'fila-actual' : undefined}>
                {f.map((c, j) => (
                  <td key={j}>{enLinea(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="paso-a-paso-controles">
        <button type="button" className="boton-leccion" disabled={terminada} onClick={() => setVisibles(visibles + 1)}>
          Siguiente paso ▶
        </button>
        <button type="button" className="boton-leccion" disabled={terminada} onClick={() => setVisibles(cuerpo.length)}>
          Ver todo
        </button>
        <button type="button" className="boton-leccion" disabled={visibles === 1} onClick={() => setVisibles(1)}>
          ↺ Reiniciar
        </button>
        <span aria-live="polite">
          Paso {visibles} de {cuerpo.length}
        </span>
      </div>
    </div>
  )
}

// Pregunta de repaso: no da puntos ni se guarda. Se puede intentar hasta acertar.
function PreguntaRapida({ lineas }: { lineas: string[] }) {
  const [elegidas, setElegidas] = useState<number[]>([])
  const pregunta = lineas[0].replace(/^\s*\?\s+/, '')
  const opciones = lineas.filter((l) => /^\s*[-+]\s+/.test(l)).map((l) => ({ texto: l.replace(/^\s*[-+]\s+/, ''), correcta: /^\s*\+/.test(l) }))
  const explicacion = lineas.find((l) => /^\s*>\s+/.test(l))?.replace(/^\s*>\s+/, '')
  const acerto = elegidas.some((i) => opciones[i].correcta)
  const ultima = elegidas.at(-1)
  return (
    <div className="pregunta-rapida">
      <p className="font-display text-xs font-bold" style={{ color: '#b6ff3c' }}>
        🧠 COMPRUEBA LO QUE ENTENDISTE
      </p>
      <p className="mt-1">{enLinea(pregunta)}</p>
      <div className="pregunta-rapida-opciones">
        {opciones.map((o, i) => {
          const elegida = elegidas.includes(i)
          return (
            <button
              key={i}
              type="button"
              className={`opcion-rapida ${elegida ? (o.correcta ? 'acierto' : 'fallo') : ''}`}
              disabled={acerto || elegida}
              onClick={() => setElegidas([...elegidas, i])}
            >
              {enLinea(o.texto)}
            </button>
          )
        })}
      </div>
      <div aria-live="polite">
        {acerto ? (
          <p className="mt-3 text-sm">
            <strong>¡Correcto!</strong> {explicacion && enLinea(explicacion)}
          </p>
        ) : (
          ultima !== undefined && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-orange)' }}>
              Todavía no. Revisa la explicación y prueba con otra opción.
            </p>
          )
        )}
      </div>
    </div>
  )
}

function bloque(lineas: string[], clave: number): ReactNode {
  if (/^\s*\?\s+/.test(lineas[0])) return <PreguntaRapida key={clave} lineas={lineas} />
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
    if (/^(vuelta|fila)$/i.test(cabeza[0]) && cuerpo.length > 1) return <TablaPasoAPaso key={clave} cabeza={cabeza} cuerpo={cuerpo} />
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
