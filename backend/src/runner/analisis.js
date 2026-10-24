// Retroalimentación "tono profe": a partir del código del estudiante y de su salida, detecta los
// errores típicos de principiante y explica en qué se equivocó y por qué ("Recuerda que…").
// Todo es puro (sin E/S). Los mensajes nunca citan datos de un caso de prueba: solo describen el
// patrón del error, así que se pueden usar también con casos ocultos.
import { codigoSinComentariosNiTextos, normalizarSalida } from './comparar.js'

// ---------------------------------------------------------------------------
// Salida esperada vs. obtenida
// ---------------------------------------------------------------------------
const MENSAJES_SALIDA = {
  vacia: {
    programa:
      'Tu programa no imprimió nada. Recuerda que solo se ve lo que pasa por System.out.println(...). Revisa que el println no haya quedado dentro de un ciclo que nunca entra: si la condición es falsa desde el inicio, el ciclo no da ni una vuelta.',
  },
  todo_en_una_linea: {
    programa:
      'Todo quedó en una sola línea. Recuerda que print escribe y se queda en la misma línea, mientras que println escribe y salta a la siguiente. Para mostrar un valor por línea usa println.',
    prediccion: 'Recuerda que println salta de línea después de imprimir: cada valor va en su propia línea.',
  },
  saltos_de_mas: {
    programa:
      'Hay saltos de línea de más. Recuerda que println salta de línea cada vez que imprime; si varios valores deben quedar en la misma línea, usa print y haz el salto con println() al terminar la fila.',
    prediccion: 'Recuerda que print NO salta de línea: lo que imprime queda en la misma línea hasta que llegue un println.',
  },
  espacios: {
    programa:
      'Los valores están bien, pero los espacios no coinciden. Recuerda que Java imprime el texto exactamente como lo escribes entre comillas: revisa los espacios alrededor de símbolos como x, = o : según el formato del enunciado.',
    prediccion: 'Los valores están bien, pero revisa los espacios: Java imprime el texto exactamente como está entre comillas.',
  },
  mayusculas: {
    programa:
      'Casi idéntico: solo cambian mayúsculas o tildes. Recuerda que para Java "Hola" y "hola" son textos distintos: copia el texto tal como aparece en el enunciado.',
    prediccion: 'Casi: solo cambian mayúsculas o tildes. Recuerda que Java imprime el texto exactamente como está entre comillas.',
  },
  orden_inverso: {
    programa:
      'Los valores están, pero en orden contrario. Recuerda que el orden lo decide el ciclo: para subir, empieza en el menor y usa ++; para bajar, empieza en el mayor y usa --.',
    prediccion: 'Los valores están, pero en orden contrario. Recuerda mirar dónde empieza la variable y si sube (++) o baja (--).',
  },
  empieza_antes: {
    programa:
      'Sobra un valor al principio: tu ciclo empieza un paso antes. Recuerda revisar la inicialización: ¿la variable debe empezar en 0 o en 1?',
    prediccion: 'Sobra un valor al principio. Recuerda revisar con qué valor empieza la variable del ciclo.',
  },
  vuelta_de_mas: {
    programa:
      'Tu ciclo da una vuelta de más. Recuerda que el límite de la condición decide la última vuelta: <= y >= incluyen el límite; < y > no. Por ejemplo, i <= 5 llega hasta el 5, pero i < 5 se queda en el 4.',
    prediccion:
      'Tu respuesta tiene una vuelta de más. Recuerda revisar la condición en la última vuelta: <= y >= incluyen el límite; < y > no.',
  },
  salta_primero: {
    programa:
      'Falta el primer valor: tu ciclo empieza un paso después. Recuerda revisar con qué valor inicializas la variable y si la actualizas ANTES de imprimir (el orden de las líneas dentro del ciclo importa).',
    prediccion:
      'Falta el primer valor. Recuerda que la condición se revisa antes de la primera vuelta y que, si el println va antes del ++, se imprime el valor inicial.',
  },
  vuelta_de_menos: {
    programa:
      'Tu ciclo se detiene una vuelta antes. Recuerda que < y > no incluyen el límite: i < 5 termina en el 4. Si el último valor debe aparecer, usa <= (o >=) o ajusta el límite.',
    prediccion:
      'Te faltó una vuelta. Recuerda revisar la condición en la última vuelta: con <= o >= el límite también se incluye.',
  },
  print_fuera: {
    programa:
      'Solo se imprimió el último valor. Recuerda que lo que está dentro de las llaves { } del ciclo se repite y lo que está después no: si quieres ver cada valor, el println va dentro del ciclo.',
    prediccion: 'Solo escribiste el último valor. Recuerda que el println está dentro del ciclo: se imprime en cada vuelta, no solo al final.',
  },
  print_dentro: {
    programa:
      'Imprimiste en cada vuelta. Recuerda que lo que está dentro del ciclo se repite: el resultado final se imprime una sola vez, después de cerrar la llave } del ciclo.',
    prediccion: 'Escribiste un valor por vuelta, pero el println está después del ciclo: se ejecuta una sola vez, al final.',
  },
  mismo_valor: {
    programa:
      'Imprimes siempre el mismo valor. Recuerda que lo que muestras debe cambiar en cada vuelta: ¿estás imprimiendo la variable del ciclo (por ejemplo i) o una que nunca se actualiza?',
    prediccion: 'Recuerda que la variable cambia en cada vuelta, así que lo que se imprime también cambia.',
  },
  demasiadas_lineas: {
    programa:
      'Tu programa imprime muchas más líneas de las esperadas: el ciclo no se detiene donde debe. Recuerda revisar el límite de la condición y que use el dato que lees (por ejemplo i <= n) en vez de un número fijo.',
    prediccion: 'Escribiste más líneas de las que imprime el programa. Recuerda revisar en qué vuelta la condición se vuelve falsa.',
  },
  calculo: {
    programa:
      'El formato está perfecto; lo que no da es el cálculo. Recuerda hacer una prueba de escritorio: anota en una hoja el valor de cada variable vuelta por vuelta. Revisa el valor inicial del acumulador (0 para sumar, 1 para multiplicar) y que se actualice en cada vuelta.',
    prediccion:
      'El formato está bien, pero algún número no. Recuerda seguir el código vuelta por vuelta anotando el valor de cada variable en una hoja.',
  },
}

const sinEspacios = (s) => s.replace(/\s+/g, '')
const plano = (s) => sinEspacios(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const plantilla = (s) => s.replace(/-?\d+/g, '#')
const igualesListas = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

// ¿Quitando un elemento de `larga` queda `corta`? Devuelve la posición quitada o -1.
function posicionSobrante(larga, corta) {
  if (larga.length !== corta.length + 1) return -1
  for (let k = 0; k < larga.length; k++) {
    if (igualesListas([...larga.slice(0, k), ...larga.slice(k + 1)], corta)) return k
  }
  return -1
}

// Devuelve el código del patrón detectado o null.
export function patronDeSalida(esperada, obtenida) {
  const a = normalizarSalida(esperada)
  const b = normalizarSalida(obtenida)
  if (igualesListas(a, b) || a.length === 0) return null
  if (b.length === 0) return 'vacia'

  if (a.length > 1 && b.length === 1 && sinEspacios(b[0]) === sinEspacios(a.join(''))) return 'todo_en_una_linea'
  if (b.length > a.length && sinEspacios(b.join('')) === sinEspacios(a.join(''))) return 'saltos_de_mas'
  if (a.length === b.length && b.every((l, i) => sinEspacios(l) === sinEspacios(a[i]))) return 'espacios'
  if (a.length === b.length && b.every((l, i) => plano(l) === plano(a[i]))) return 'mayusculas'
  if (a.length > 1 && igualesListas([...a].reverse(), b)) return 'orden_inverso'

  const sobra = posicionSobrante(b, a)
  if (sobra === 0) return 'empieza_antes'
  if (sobra > 0) return 'vuelta_de_mas'
  const falta = posicionSobrante(a, b)
  if (falta === 0) return 'salta_primero'
  if (falta > 0) return 'vuelta_de_menos'

  if (a.length > 1 && b.length === 1 && b[0] === a[a.length - 1]) return 'print_fuera'
  if (a.length === 1 && b.length > 1 && (b[b.length - 1] === a[0] || b.every((l) => plantilla(l) === plantilla(a[0])))) return 'print_dentro'
  if (a.length > 1 && b.length >= a.length && new Set(b).size === 1 && new Set(a).size > 1) return 'mismo_valor'
  if (b.length >= 2 * a.length + 2 && igualesListas(b.slice(0, a.length), a)) return 'demasiadas_lineas'
  if (a.length === b.length && b.every((l, i) => plantilla(l) === plantilla(a[i]))) return 'calculo'
  return null
}

// modo: 'programa' (código ejecutado) | 'prediccion' (el estudiante escribió la salida que espera).
export function explicarSalida(esperada, obtenida, modo = 'programa') {
  const patron = patronDeSalida(esperada, obtenida)
  if (!patron) return null
  const m = MENSAJES_SALIDA[patron]
  return { patron, texto: m[modo] ?? m.programa }
}

// ---------------------------------------------------------------------------
// Lectura del código: ciclos, cuerpos y declaraciones
// ---------------------------------------------------------------------------
function lineaDe(texto, indice) {
  let n = 1
  for (let i = 0; i < indice; i++) if (texto[i] === '\n') n++
  return n
}

// Índice del cierre que corresponde a la apertura en `i`, o -1.
function cierre(texto, i, abre, cierra) {
  let nivel = 0
  for (let k = i; k < texto.length; k++) {
    if (texto[k] === abre) nivel++
    else if (texto[k] === cierra && --nivel === 0) return k
  }
  return -1
}

// Fin (exclusivo) de una sentencia sin llaves que empieza en `i` (p. ej. el cuerpo de `for (...) x++;`).
function finDeSentencia(texto, i) {
  let parentesis = 0
  let llaves = 0
  for (let k = i; k < texto.length; k++) {
    const c = texto[k]
    if (c === '(') parentesis++
    else if (c === ')') parentesis--
    else if (c === '{') llaves++
    else if (c === '}') {
      llaves--
      if (llaves < 0) return k
      if (llaves === 0 && parentesis === 0 && !/^\s*else\b/.test(texto.slice(k + 1))) return k + 1
    } else if (c === ';' && parentesis === 0 && llaves === 0 && !/^\s*else\b/.test(texto.slice(k + 1))) return k + 1
  }
  return texto.length
}

// { texto, ciclos: [{ tipo, linea, condicion, cabecera:[ini,fin], partes?, vacio, cuerpo:[ini,fin] }] }
export function leerCiclos(codigo) {
  const texto = codigoSinComentariosNiTextos(codigo)
  const ciclos = []
  const cierresDeDo = new Set()

  for (const m of texto.matchAll(/\bdo\s*\{/g)) {
    const abre = m.index + m[0].length - 1
    const fin = cierre(texto, abre, '{', '}')
    if (fin === -1) continue
    const tras = texto.slice(fin + 1).match(/^\s*while\s*\(/)
    if (!tras) continue
    const iWhile = fin + 1 + tras[0].indexOf('while')
    const iParen = fin + tras[0].length
    const finParen = cierre(texto, iParen, '(', ')')
    if (finParen === -1) continue
    cierresDeDo.add(iWhile)
    ciclos.push({
      tipo: 'do-while',
      linea: lineaDe(texto, m.index),
      lineaCondicion: lineaDe(texto, iWhile),
      condicion: texto.slice(iParen + 1, finParen).trim(),
      cabecera: [iWhile, finParen + 1],
      vacio: false,
      cuerpo: [abre + 1, fin],
    })
  }

  for (const m of texto.matchAll(/\b(for|while)\s*\(/g)) {
    if (m[1] === 'while' && cierresDeDo.has(m.index)) continue
    const iParen = m.index + m[0].length - 1
    const finParen = cierre(texto, iParen, '(', ')')
    if (finParen === -1) continue
    const cabecera = texto.slice(iParen + 1, finParen)
    let j = finParen + 1
    while (/\s/.test(texto[j] ?? '')) j++
    const ciclo = { tipo: m[1], linea: lineaDe(texto, m.index), cabecera: [m.index, finParen + 1], vacio: texto[j] === ';' }
    if (m[1] === 'for') {
      const partes = cabecera.split(';')
      ciclo.partes = partes.length === 3 ? partes.map((p) => p.trim()) : null
      ciclo.condicion = ciclo.partes?.[1] ?? ''
    } else ciclo.condicion = cabecera.trim()
    if (ciclo.vacio) ciclo.cuerpo = [j, j]
    else if (texto[j] === '{') ciclo.cuerpo = [j + 1, Math.max(j + 1, cierre(texto, j, '{', '}'))]
    else ciclo.cuerpo = [j, finDeSentencia(texto, j)]
    ciclos.push(ciclo)
  }
  return { texto, ciclos }
}

// El ciclo más interno cuyo cuerpo contiene la posición `i` (o null).
function cicloQueContiene(ciclos, i) {
  let mejor = null
  for (const c of ciclos) {
    if (i >= c.cuerpo[0] && i < c.cuerpo[1] && (!mejor || c.cuerpo[1] - c.cuerpo[0] < mejor.cuerpo[1] - mejor.cuerpo[0])) mejor = c
  }
  return mejor
}

const enCabeceraDeFor = (ciclos, i) => ciclos.some((c) => c.tipo === 'for' && i >= c.cabecera[0] && i < c.cabecera[1])
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const modifica = (v, texto) => new RegExp(`\\b${escapar(v)}\\s*(\\+\\+|--|[-+*/%]?=(?!=))|(\\+\\+|--)\\s*${escapar(v)}\\b`).test(texto)

const RESERVADAS = new Set(['true', 'false', 'null', 'new', 'int', 'long', 'double', 'float', 'char', 'boolean', 'String', 'instanceof'])

// Variables de una condición (sin métodos, propiedades ni palabras reservadas).
function variablesDe(condicion) {
  const vars = new Set()
  for (const m of condicion.matchAll(/\b[A-Za-z_]\w*\b/g)) {
    const antes = condicion[m.index - 1]
    const despues = condicion.slice(m.index + m[0].length)
    if (antes === '.' || /^\s*\(/.test(despues) || /^\s*\./.test(despues) || RESERVADAS.has(m[0])) continue
    vars.add(m[0])
  }
  return [...vars]
}

// ---------------------------------------------------------------------------
// Revisiones del código (se muestran solo cuando el envío falló)
// ---------------------------------------------------------------------------
function puntoYComaTrasCiclo(ciclos) {
  return ciclos
    .filter((c) => c.vacio)
    .map((c) => ({
      linea: c.linea,
      texto:
        c.tipo === 'while'
          ? `Hay un ";" justo después de while (...) en la línea ${c.linea}. Recuerda que ese punto y coma cierra el ciclo ahí mismo: el while queda vacío (si la condición es verdadera, gira para siempre sin hacer nada) y el bloque { } de abajo no forma parte del ciclo. Quita ese ";".`
          : `Hay un ";" justo después de for (...) en la línea ${c.linea}. Recuerda que ese punto y coma cierra el ciclo ahí mismo: el for da sus vueltas sin hacer nada y el bloque { } de abajo se ejecuta una sola vez. Quita ese ";".`,
    }))
}

function direccionContraria(ciclos) {
  const avisos = []
  for (const c of ciclos) {
    if (c.tipo !== 'for' || !c.partes) continue
    const m = c.partes[1].match(/^([A-Za-z_]\w*)\s*(<=|<|>=|>)/)
    if (!m) continue
    const [, v, op] = m
    const act = c.partes[2]
    const sube = new RegExp(`\\b${v}\\s*(\\+\\+|\\+=)|\\+\\+\\s*${v}\\b`).test(act)
    const baja = new RegExp(`\\b${v}\\s*(--|-=)|--\\s*${v}\\b`).test(act)
    if (op.startsWith('<') && baja && !sube) {
      avisos.push({
        linea: c.linea,
        texto: `Recuerda que la condición y la actualización del for deben ir en la misma dirección. En la línea ${c.linea}, "${c.partes[1]}" solo deja de cumplirse si ${v} SUBE, pero "${act}" lo hace bajar: el ciclo nunca termina. Si cuentas hacia adelante usa ${v}++; si cuentas hacia atrás, la condición debe usar > o >=.`,
      })
    } else if (op.startsWith('>') && sube && !baja) {
      avisos.push({
        linea: c.linea,
        texto: `Recuerda que la condición y la actualización del for deben ir en la misma dirección. En la línea ${c.linea}, "${c.partes[1]}" solo deja de cumplirse si ${v} BAJA, pero "${act}" lo hace subir: el ciclo nunca termina. Para contar hacia atrás usa ${v}--.`,
      })
    }
  }
  return avisos
}

// Acumulador/contador declarado dentro del ciclo que lo actualiza: vuelve a su valor inicial en cada vuelta.
function acumuladorReiniciado(texto, ciclos) {
  const avisos = []
  for (const d of texto.matchAll(/\b(?:int|long|double|float)\s+([A-Za-z_]\w*)\s*=\s*([^;,]+);/g)) {
    if (enCabeceraDeFor(ciclos, d.index)) continue
    const ciclo = cicloQueContiene(ciclos, d.index)
    if (!ciclo) continue
    const v = d[1]
    const acumula = new RegExp(`\\b${v}\\s*(\\+=|-=|\\*=)|\\b${v}\\s*=\\s*${v}\\b|\\b${v}\\s*\\+\\+|\\+\\+\\s*${v}\\b`, 'g')
    for (const a of texto.slice(d.index + d[0].length).matchAll(acumula)) {
      const i = d.index + d[0].length + a.index
      if (!enCabeceraDeFor(ciclos, i) && cicloQueContiene(ciclos, i) === ciclo) {
        const linea = lineaDe(texto, d.index)
        avisos.push({
          linea,
          texto: `Declaraste "${v}" dentro del ciclo (línea ${linea}). Recuerda que así vuelve a valer ${d[2].trim()} en CADA vuelta y nunca acumula nada. Decláralo ANTES del ciclo para que conserve lo que va sumando o contando.`,
        })
        break
      }
    }
  }
  return avisos
}

// Revisiones útiles ante cualquier resultado incorrecto.
export function revisarCodigo(codigo) {
  const { texto, ciclos } = leerCiclos(codigo)
  return [...puntoYComaTrasCiclo(ciclos), ...acumuladorReiniciado(texto, ciclos), ...direccionContraria(ciclos)]
}

// Cuando el programa no terminó a tiempo: busca el ciclo cuya condición nunca puede cambiar.
export function explicarCicloInfinito(codigo) {
  const { texto, ciclos } = leerCiclos(codigo)
  const avisos = [...puntoYComaTrasCiclo(ciclos).filter((a) => /while/.test(a.texto)), ...direccionContraria(ciclos)]
  for (const c of ciclos) {
    if (c.vacio || !c.condicion) continue
    const cuerpo = texto.slice(c.cuerpo[0], c.cuerpo[1])
    if (/\bbreak\s*;/.test(cuerpo)) continue
    const actualizacion = c.tipo === 'for' ? (c.partes?.[2] ?? '') : ''
    const vars = variablesDe(c.condicion)
    if (!vars.length || vars.some((v) => modifica(v, cuerpo) || modifica(v, actualizacion))) continue
    const linea = c.lineaCondicion ?? c.linea
    const v = vars[0]
    const ejemplo = /(^|[^<])>/.test(c.condicion) ? `${v}--;` : `${v}++;`
    avisos.push({
      linea,
      texto: `Recuerda que un ciclo solo termina cuando su condición se vuelve falsa. La condición "${c.condicion}" (línea ${linea}) depende de ${vars.map((x) => `"${x}"`).join(' y ')}, pero dentro del ciclo nada ${vars.length > 1 ? 'las cambia' : 'la cambia'}: por eso da vueltas para siempre. Agrega la actualización dentro del ciclo, por ejemplo ${ejemplo}`,
    })
  }
  if (/\bwhile\s*\(\s*true\s*\)/.test(texto) && !/\bbreak\s*;/.test(texto)) {
    avisos.push({ linea: null, texto: 'Recuerda que while (true) nunca termina por sí solo: necesitas un break dentro de un if para salir cuando se cumpla lo que buscas.' })
  }
  return avisos
}

// ---------------------------------------------------------------------------
// Errores de compilación que se explican mejor mirando el código
// ---------------------------------------------------------------------------
export function enriquecerErroresCompilacion(errores, codigo) {
  const { texto, ciclos } = leerCiclos(codigo)
  const lineasCodigo = codigo.replace(/\r\n?/g, '\n').split('\n')
  const tieneImportScanner = /\bimport\s+java\.util\.(Scanner|\*)\s*;/.test(texto)

  return errores.map((e) => {
    const lineaCod = e.linea ? (lineasCodigo[e.linea - 1] ?? e.codigo ?? '') : (e.codigo ?? '')
    const simbolo = e.mensaje?.match(/^cannot find symbol/) && e.simbolo
    let explicacion = null

    if (simbolo?.tipo === 'variable') {
      const v = simbolo.nombre
      const enFor = ciclos.find((c) => c.tipo === 'for' && new RegExp(`\\b(?:int|long|double)\\s+${escapar(v)}\\b`).test(texto.slice(c.cabecera[0], c.cabecera[1])))
      if (enFor && e.linea > lineaDe(texto, enFor.cuerpo[1])) {
        explicacion = `Recuerda que la variable "${v}" que declaras en el for (línea ${enFor.linea}) solo existe dentro de ese for. Después de cerrarlo, Java ya no la conoce. Si necesitas su valor después, declárala antes del ciclo.`
      } else {
        for (const d of texto.matchAll(new RegExp(`\\b(?:int|long|double|float|String|boolean|char)\\s+${escapar(v)}\\b`, 'g'))) {
          const c = cicloQueContiene(ciclos, d.index)
          if (c && e.linea > lineaDe(texto, c.cuerpo[1])) {
            explicacion = `Recuerda que una variable solo existe dentro de las llaves { } donde la declaras. "${v}" se declaró dentro del ciclo de la línea ${c.linea}, así que después de cerrarlo Java ya no la conoce. Declárala ANTES del ciclo (por ejemplo: int ${v} = 0;) y dentro solo actualízala.`
            break
          }
        }
      }
    } else if (simbolo?.tipo === 'class' && simbolo.nombre === 'Scanner' && !tieneImportScanner) {
      explicacion = 'Recuerda que para usar Scanner hay que importarlo: escribe import java.util.Scanner; en la primera línea, antes de public class.'
    } else if (/^';' expected$/.test(e.mensaje ?? '') && /\bfor\s*\([^;]*,/.test(lineaCod)) {
      explicacion = 'Recuerda que las tres partes del for se separan con punto y coma, no con coma: for (int i = 1; i <= 5; i++).'
    } else if (/cannot be converted to boolean$/.test(e.mensaje ?? '') && /\b(if|while|for)\s*\(.*[^=!<>]=[^=]/.test(lineaCod)) {
      explicacion = 'Recuerda que = guarda un valor y == compara. En una condición necesitas comparar, así que usa == (dos signos igual).'
    }
    return explicacion ? { ...e, explicacion } : e
  })
}

// ---------------------------------------------------------------------------
// Errores comunes escritos para cada ejercicio (columna errores_comunes)
// [{ salida?: "...", respuesta?: "...", patron?: "regex", mensaje: "..." }]
// ---------------------------------------------------------------------------
export function errorComunPorSalida(errores, obtenida) {
  const b = normalizarSalida(obtenida)
  return (errores ?? []).find((e) => e.salida != null && igualesListas(normalizarSalida(e.salida), b))?.mensaje ?? null
}

export function errorComunPorCodigo(errores, codigo) {
  const texto = codigoSinComentariosNiTextos(codigo)
  for (const e of errores ?? []) {
    if (!e.patron) continue
    try {
      if (new RegExp(e.patron).test(texto)) return e.mensaje
    } catch {
      // un patrón mal escrito en el seed no debe romper la evaluación
    }
  }
  return null
}
