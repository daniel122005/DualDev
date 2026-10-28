import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import LineaJava from '@/components/LineaJava'
import { buscarPlantilla, expandirPlantilla, PLANTILLAS, type Plantilla } from '@/utils/plantillasJava'
import { lineasResaltadas } from '@/utils/resaltadoJava'

// 14px * 1.7. La numeración, la capa resaltada y el textarea deben usar exactamente estas medidas.
const ALTO_LINEA_PX = 23.8
const ALTO_LINEA = `${ALTO_LINEA_PX}px`
const RELLENO = 16
const MEDIDAS: CSSProperties = {
  fontSize: 14,
  lineHeight: ALTO_LINEA,
  paddingLeft: 56,
  paddingTop: RELLENO,
  paddingRight: RELLENO,
  paddingBottom: RELLENO,
  whiteSpace: 'pre',
  tabSize: 4,
  letterSpacing: 'normal',
}
const SANGRIA = '    '
const ATAJOS_VISIBLES = ['for', 'while', 'do', 'if', 'sout', 'scan', 'leer']

// Sesión de campos tras expandir una plantilla: Tab salta al siguiente campo (como en un IDE).
interface Sesion {
  campos: { ini: number; fin: number }[]
  idx: number
  largo: number
}

function inicioDeLinea(texto: string, pos: number) {
  return texto.lastIndexOf('\n', pos - 1) + 1
}

// Inserta texto conservando el historial de deshacer (Ctrl+Z) cuando el navegador lo permite.
function reemplazar(el: HTMLTextAreaElement, ini: number, fin: number, texto: string, onChange: (v: string) => void) {
  el.focus()
  el.setSelectionRange(ini, fin)
  const ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, texto)
  if (!ok) onChange(el.value.slice(0, ini) + texto + el.value.slice(fin))
}

function seleccionar(el: HTMLTextAreaElement, ini: number, fin: number) {
  el.setSelectionRange(ini, fin)
  // Si el cambio fue por estado de React (sin execCommand), la selección se pierde al repintar.
  requestAnimationFrame(() => el.setSelectionRange(ini, fin))
}

export default function CodeEditor({
  valor,
  onChange,
  onReset,
  archivo,
  lineasError = [],
  deshabilitado = false,
}: {
  valor: string
  onChange: (v: string) => void
  onReset: () => void
  archivo: string
  lineasError?: number[]
  deshabilitado?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const capaRef = useRef<HTMLPreElement>(null)
  const sesion = useRef<Sesion | null>(null)
  // Esc y luego Tab sale del editor (si no, Tab nunca dejaría salir con el teclado).
  const salirConTab = useRef(false)
  const [lineaActual, setLineaActual] = useState<number | null>(null)
  const errores = new Set(lineasError)
  const resaltado = useMemo(() => lineasResaltadas(valor), [valor])
  const lineas = resaltado.length
  const alto = Math.max(280, lineas * ALTO_LINEA_PX + RELLENO * 2 + 8)

  function actualizarLinea(el: HTMLTextAreaElement) {
    setLineaActual(el.value.slice(0, el.selectionStart).split('\n').length)
  }

  function insertarPlantilla(el: HTMLTextAreaElement, ini: number, fin: number, p: Plantilla) {
    const texto = el.value
    const linea = texto.slice(inicioDeLinea(texto, ini), ini)
    const sangria = linea.match(/^\s*/)?.[0] ?? ''
    const exp = expandirPlantilla(p, sangria)
    const largo = texto.length - (fin - ini) + exp.texto.length
    reemplazar(el, ini, fin, exp.texto, onChange)
    const campos = exp.campos.map((c) => ({ ini: ini + c.ini, fin: ini + c.fin }))
    if (!campos.length) {
      seleccionar(el, ini + exp.texto.length, ini + exp.texto.length)
      return
    }
    seleccionar(el, campos[0].ini, campos[0].fin)
    sesion.current = campos.length > 1 ? { campos, idx: 0, largo } : null
  }

  // Tab dentro de una plantilla recién insertada: salta al siguiente campo.
  function saltarCampo(el: HTMLTextAreaElement): boolean {
    const s = sesion.current
    if (!s) return false
    const delta = el.value.length - s.largo
    const actual = s.campos[s.idx]
    if (el.selectionStart < actual.ini || el.selectionEnd > actual.fin + delta) {
      sesion.current = null
      return false
    }
    const campos = s.campos.map((c, j) => (j > s.idx ? { ini: c.ini + delta, fin: c.fin + delta } : c))
    const idx = s.idx + 1
    seleccionar(el, campos[idx].ini, campos[idx].fin)
    sesion.current = idx < campos.length - 1 ? { campos, idx, largo: el.value.length } : null
    return true
  }

  // Sangra (o quita sangría a) todas las líneas tocadas por la selección.
  function sangrarLineas(el: HTMLTextAreaElement, quitar: boolean) {
    const texto = el.value
    const ini = inicioDeLinea(texto, el.selectionStart)
    const finSel = el.selectionEnd > el.selectionStart && texto[el.selectionEnd - 1] === '\n' ? el.selectionEnd - 1 : el.selectionEnd
    const finLinea = texto.indexOf('\n', finSel)
    const fin = finLinea === -1 ? texto.length : finLinea
    const bloque = texto.slice(ini, fin)
    const nuevo = bloque
      .split('\n')
      .map((l) => (quitar ? l.replace(/^ {1,4}/, '') : SANGRIA + l))
      .join('\n')
    if (nuevo === bloque) return
    reemplazar(el, ini, fin, nuevo, onChange)
    seleccionar(el, ini, ini + nuevo.length)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (deshabilitado) return
    const el = e.currentTarget
    const texto = el.value
    const { selectionStart: ini, selectionEnd: fin } = el

    if (e.key === 'Escape') {
      salirConTab.current = true
      sesion.current = null
      return
    }

    if (e.key === 'Tab') {
      if (salirConTab.current) {
        salirConTab.current = false
        return
      }
      e.preventDefault()
      if (!e.shiftKey && saltarCampo(el)) return
      const varias = texto.slice(ini, fin).includes('\n')
      if (e.shiftKey || varias) {
        sangrarLineas(el, e.shiftKey)
        return
      }
      const antes = texto.slice(inicioDeLinea(texto, ini), ini)
      const palabra = ini === fin ? antes.match(/(?:^|[^\w$.])([a-z]+)$/)?.[1] : undefined
      const plantilla = palabra ? buscarPlantilla(palabra) : null
      if (plantilla && palabra) {
        insertarPlantilla(el, ini - palabra.length, fin, plantilla)
        return
      }
      reemplazar(el, ini, fin, SANGRIA, onChange)
      seleccionar(el, ini + SANGRIA.length, ini + SANGRIA.length)
      return
    }
    salirConTab.current = false

    // Enter conserva la sangría; después de "{" agrega un nivel y, si falta, cierra la llave.
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      sesion.current = null
      const inicio = inicioDeLinea(texto, ini)
      const linea = texto.slice(inicio, ini)
      const sangria = linea.match(/^\s*/)?.[0] ?? ''
      const abre = /\{\s*$/.test(linea)
      const resto = texto.slice(fin)
      const cierraJunto = /^[ \t]*\}/.test(resto)
      const balance = (texto.match(/\{/g)?.length ?? 0) - (texto.match(/\}/g)?.length ?? 0)
      let insertar = `\n${sangria}`
      let cursor = insertar.length
      if (abre && (cierraJunto || balance > 0)) {
        insertar = `\n${sangria}${SANGRIA}\n${sangria}${cierraJunto ? '' : '}'}`
        cursor = 1 + sangria.length + SANGRIA.length
        if (cierraJunto) {
          // La llave que ya estaba queda en su propia línea con la sangría del bloque.
          const espacios = resto.match(/^[ \t]*/)?.[0].length ?? 0
          reemplazar(el, ini, fin + espacios, insertar, onChange)
          seleccionar(el, ini + cursor, ini + cursor)
          return
        }
      } else if (abre) {
        insertar = `\n${sangria}${SANGRIA}`
        cursor = insertar.length
      }
      reemplazar(el, ini, fin, insertar, onChange)
      seleccionar(el, ini + cursor, ini + cursor)
      return
    }

    // "}" en una línea vacía vuelve un nivel de sangría hacia atrás.
    if (e.key === '}' && ini === fin) {
      const inicio = inicioDeLinea(texto, ini)
      const linea = texto.slice(inicio, ini)
      if (/^ +$/.test(linea)) {
        e.preventDefault()
        const quitar = Math.min(SANGRIA.length, linea.length)
        reemplazar(el, ini - quitar, ini, '}', onChange)
        seleccionar(el, ini - quitar + 1, ini - quitar + 1)
      }
    }
  }

  function clicPlantilla(p: Plantilla) {
    const el = ref.current
    if (!el || deshabilitado) return
    insertarPlantilla(el, el.selectionStart, el.selectionEnd, p)
  }

  const visibles = ATAJOS_VISIBLES.map((a) => PLANTILLAS.find((p) => p.atajo === a)).filter((p): p is Plantilla => !!p)

  return (
    <div className="editor-marco overflow-hidden">
      <div className="editor-cabecera flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full" style={{ background: '#fb7185' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#fbbf24' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#1ed48a' }} />
          </div>
          <span className="truncate font-mono text-xs" style={{ color: 'var(--color-green-bright)' }}>
            {archivo}
          </span>
        </div>
        <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={onReset} disabled={deshabilitado} title="Volver al código inicial">
          ↺ Reiniciar
        </button>
      </div>

      <div className="editor-atajos flex flex-wrap items-center gap-1.5 px-3 py-2" role="toolbar" aria-label="Insertar estructura">
        <span className="mr-1 text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-muted)' }}>
          Insertar
        </span>
        {visibles.map((p) => (
          <button
            key={p.atajo}
            type="button"
            className="chip-atajo font-mono"
            title={`${p.descripcion} · escribe "${p.atajo}" y presiona Tab`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => clicPlantilla(p)}
            disabled={deshabilitado}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div className="relative" style={{ background: 'var(--color-editor)', height: alto }}>
        {/* Capa con el código resaltado, debajo del textarea transparente (mismas medidas y scroll). */}
        <pre
          ref={capaRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden font-mono"
          style={{ ...MEDIDAS, color: 'var(--color-text)' }}
        >
          {resaltado.map((fichas, i) => (
            <div
              key={i}
              style={{
                height: ALTO_LINEA,
                marginLeft: -56,
                paddingLeft: 56,
                marginRight: -RELLENO,
                background: errores.has(i + 1)
                  ? 'rgba(251,113,133,0.14)'
                  : lineaActual === i + 1
                    ? 'rgba(122,240,180,0.05)'
                    : undefined,
              }}
            >
              <LineaJava fichas={fichas} />
            </div>
          ))}
        </pre>
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0 flex flex-col items-end overflow-hidden pr-3 select-none"
          style={{ width: 46, paddingTop: RELLENO, background: 'var(--color-editor-gutter)', borderRight: '1px solid rgba(30,212,138,0.1)', zIndex: 2 }}
        >
          {Array.from({ length: lineas }, (_, i) => (
            <span
              key={i}
              className="font-mono"
              style={{
                color: errores.has(i + 1) ? '#fb7185' : lineaActual === i + 1 ? 'var(--color-green-bright)' : '#3d6f59',
                fontWeight: errores.has(i + 1) || lineaActual === i + 1 ? 700 : 400,
                fontSize: 11,
                lineHeight: ALTO_LINEA,
              }}
            >
              {errores.has(i + 1) ? '●' : i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={ref}
          value={valor}
          onChange={(e) => {
            onChange(e.target.value)
            actualizarLinea(e.target)
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => actualizarLinea(e.currentTarget)}
          onClick={(e) => {
            sesion.current = null
            actualizarLinea(e.currentTarget)
          }}
          onBlur={() => setLineaActual(null)}
          onScroll={(e) => {
            if (capaRef.current) capaRef.current.scrollLeft = e.currentTarget.scrollLeft
          }}
          aria-label={`Editor de código ${archivo}`}
          aria-describedby="ayuda-editor"
          className="editor-codigo relative block h-full w-full font-mono"
          style={{
            ...MEDIDAS,
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            resize: 'none',
            overflowX: 'auto',
            overflowY: 'hidden',
            boxShadow: 'none',
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={deshabilitado}
        />
      </div>
      <p id="ayuda-editor" className="editor-pie px-4 py-2 text-[11px]">
        <kbd>for</kbd> + <kbd>Tab</kbd> arma el ciclo · <kbd>Tab</kbd> siguiente campo · <kbd>Shift</kbd>+<kbd>Tab</kbd> quita sangría · <kbd>Esc</kbd>, <kbd>Tab</kbd> sale
      </p>
    </div>
  )
}
