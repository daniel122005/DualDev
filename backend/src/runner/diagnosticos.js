// Convierte la salida de javac / de la JVM en errores con línea y explicación en español para principiantes.
// javac se ejecuta con -J-Duser.language=en, así que los mensajes de entrada siempre están en inglés.

const REGLAS_COMPILACION = [
  { patron: /^'(;)' expected$/, tipo: 'Sintaxis', explicar: () => 'Falta punto y coma ";" al final de la instrucción.' },
  { patron: /^'([)\]}])' expected$/, tipo: 'Sintaxis', explicar: (m) => `Falta cerrar con "${m[1]}". Revisa que cada apertura tenga su cierre.` },
  { patron: /^'([(\[{])' expected$/, tipo: 'Sintaxis', explicar: (m) => `Se esperaba "${m[1]}" aquí. Revisa la estructura de la instrucción.` },
  {
    patron: /^reached end of file while parsing$/,
    tipo: 'Sintaxis',
    explicar: () => 'El archivo terminó antes de tiempo: falta cerrar una llave "}".',
  },
  {
    patron: /^class, interface, enum, or record expected$/,
    tipo: 'Sintaxis',
    explicar: () => 'Hay código fuera de la clase o sobra una llave "}" que cerró la clase antes de tiempo.',
  },
  { patron: /^not a statement$/, tipo: 'Sintaxis', explicar: () => 'Esta línea no es una instrucción válida de Java.' },
  {
    patron: /^illegal start of (expression|type)$/,
    tipo: 'Sintaxis',
    explicar: () => 'Java no esperaba esto aquí. Suele deberse a una llave, paréntesis o punto y coma mal puesto en la línea anterior.',
  },
  { patron: /^<identifier> expected$/, tipo: 'Sintaxis', explicar: () => 'Se esperaba un nombre (de variable, método o clase) en esta posición.' },
  { patron: /^unclosed string literal$/, tipo: 'Sintaxis', explicar: () => 'Un texto entre comillas no se cerró. Falta la comilla doble final ".' },
  { patron: /^unclosed character literal$/, tipo: 'Sintaxis', explicar: () => "Un carácter entre comillas simples no se cerró. Falta la comilla ' final." },
  { patron: /^'else' without 'if'$/, tipo: 'Sintaxis', explicar: () => 'Hay un "else" sin un "if" justo antes. Revisa las llaves del if.' },
  {
    patron: /^cannot find symbol$/,
    tipo: 'Símbolo',
    explicar: (_m, extra) => {
      const s = extra.simbolo
      if (!s) return 'Usas algo que Java no conoce. Revisa que esté declarado y bien escrito (mayúsculas incluidas).'
      if (s.tipo === 'variable') return `La variable "${s.nombre}" no está declarada o está mal escrita. Declárala antes de usarla (por ejemplo: int ${s.nombre} = 0;) y revisa que esté dentro del mismo bloque { }.`
      if (s.tipo === 'method') return `El método "${s.nombre}" no existe. Revisa cómo está escrito (por ejemplo, System.out.println).`
      if (s.tipo === 'class') return `La clase "${s.nombre}" no existe. Revisa mayúsculas (String, Scanner, System…) o si falta un import.`
      return `"${s.nombre}" no está declarado o está mal escrito.`
    },
  },
  {
    patron: /^incompatible types: (.+) cannot be converted to (.+)$/,
    tipo: 'Tipos',
    explicar: (m) => `Tipos incompatibles: intentas usar un valor ${m[1]} donde se necesita ${m[2]}.`,
  },
  {
    patron: /^incompatible types: possible lossy conversion from (\w+) to (\w+)$/,
    tipo: 'Tipos',
    explicar: (m) => `Guardar un ${m[1]} en un ${m[2]} puede perder información. Usa una variable ${m[1]} o convierte con (${m[2]}).`,
  },
  {
    patron: /^variable (\w+) might not have been initialized$/,
    tipo: 'Variables',
    explicar: (m) => `La variable "${m[1]}" se usa sin tener un valor inicial. Dale un valor al declararla (por ejemplo: int ${m[1]} = 0;).`,
  },
  {
    patron: /^variable (\w+) is already defined in .+$/,
    tipo: 'Variables',
    explicar: (m) => `La variable "${m[1]}" ya fue declarada antes. Usa otro nombre o quita el tipo (int, String…) si solo quieres cambiar su valor.`,
  },
  {
    patron: /^unreachable statement$/,
    tipo: 'Lógica',
    explicar: () => 'Esta instrucción nunca se ejecuta: está después de un break/return o de un ciclo que nunca termina.',
  },
  { patron: /^missing return statement$/, tipo: 'Lógica', explicar: () => 'El método debe devolver un valor con return en todos los caminos.' },
  {
    patron: /^bad operand types? for (binary|unary) operator '(.+)'$/,
    tipo: 'Tipos',
    explicar: (m) => `El operador "${m[2]}" no se puede usar con esos tipos de datos.`,
  },
  {
    patron: /^incomparable types: (.+) and (.+)$/,
    tipo: 'Tipos',
    explicar: (m) => `No se puede comparar ${m[1]} con ${m[2]}.`,
  },
  {
    patron: /^class (\w+) is public, should be declared in a file named .+$/,
    tipo: 'Estructura',
    explicar: () => 'Solo puede haber una clase public en el programa.',
  },
]

const REGLAS_EJECUCION = [
  { patron: /ArithmeticException: \/ by zero/, explicar: () => 'División entre cero. Revisa que el divisor nunca valga 0 dentro del ciclo.' },
  {
    patron: /ArrayIndexOutOfBoundsException/,
    explicar: () => 'Intentaste usar una posición que no existe en el arreglo. Revisa la condición del ciclo: ¿debería ser < en vez de <=?',
  },
  {
    patron: /StringIndexOutOfBoundsException/,
    explicar: () => 'Intentaste leer una posición que no existe en el texto. Revisa los límites del ciclo (los índices van de 0 a length()-1).',
  },
  { patron: /NullPointerException/, explicar: () => 'Usaste una variable que no tiene valor (null).' },
  {
    patron: /InputMismatchException/,
    explicar: () => 'El programa esperaba leer un tipo de dato (por ejemplo un número) y recibió otro.',
  },
  {
    patron: /NoSuchElementException/,
    explicar: () => 'El programa intentó leer más datos de los que hay en la entrada. Revisa cuántas veces lees con Scanner.',
  },
  { patron: /NumberFormatException/, explicar: () => 'Intentaste convertir a número un texto que no es un número.' },
  { patron: /StackOverflowError/, explicar: () => 'Un método se llama a sí mismo sin fin (recursión infinita).' },
  {
    patron: /OutOfMemoryError/,
    explicar: () => 'El programa usó demasiada memoria. ¿Hay un ciclo que agrega elementos sin parar?',
  },
  {
    patron: /demasiados hilos/,
    explicacion: null,
    explicar: () => 'Tu programa creó demasiados hilos y se detuvo. Para los ejercicios de ciclos no necesitas hilos: usa for, while o do-while.',
  },
  {
    patron: /SecurityException|AccessControlException/,
    explicar: () => 'Tu programa intentó hacer algo que no está permitido aquí (leer archivos, usar la red, etc.).',
  },
]

const ERROR_JAVAC = /^(?:.*[\\/])?([\w$]+\.java):(\d+): error: (.+)$/

// Avisos de la JVM que no son del estudiante.
export function limpiarStderr(stderr) {
  return stderr
    .split(/\r?\n/)
    .filter((l) => !/^WARNING: .*Security Manager/.test(l))
    .join('\n')
    .trim()
}

export function parsearErroresCompilacion(stderr) {
  const lineas = stderr.split(/\r?\n/)
  const errores = []

  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(ERROR_JAVAC)
    if (!m) continue

    const mensaje = m[3].trim()
    // javac imprime: línea de código, línea con "^" bajo la columna y, a veces, "symbol:" / "location:".
    const codigo = lineas[i + 1] ?? ''
    const caret = lineas[i + 2] ?? ''
    const columna = caret.trim() === '^' ? caret.indexOf('^') + 1 : null

    let simbolo = null
    for (let j = i + 1; j < Math.min(i + 6, lineas.length); j++) {
      const s = lineas[j].match(/^\s*symbol:\s+(variable|method|class)\s+([\w$]+)/)
      if (s) {
        simbolo = { tipo: s[1], nombre: s[2] }
        break
      }
      if (ERROR_JAVAC.test(lineas[j])) break
    }

    let tipo = 'Compilación'
    let explicacion = `Java no pudo compilar esta línea: ${mensaje}`
    for (const regla of REGLAS_COMPILACION) {
      const r = mensaje.match(regla.patron)
      if (r) {
        tipo = regla.tipo
        explicacion = regla.explicar(r, { simbolo })
        break
      }
    }

    errores.push({ linea: Number(m[2]), columna, tipo, mensaje, explicacion, codigo: codigo.trimEnd() })
  }
  return errores
}

export function parsearErrorEjecucion(stderr, archivo) {
  const limpio = limpiarStderr(stderr)
  const cabecera = limpio.match(/Exception in thread "[^"]*" ([\w.$]+)(?::\s*(.*))?/)
  if (!cabecera) return null

  const excepcion = cabecera[1].split('.').pop()
  const enArchivo = limpio.match(new RegExp(`\\(${archivo.replace('.', '\\.')}:(\\d+)\\)`))
  let explicacion = 'El programa se detuvo por un error mientras se ejecutaba.'
  for (const regla of REGLAS_EJECUCION) {
    if (regla.patron.test(limpio)) {
      explicacion = regla.explicar()
      break
    }
  }

  return {
    excepcion,
    mensaje: cabecera[2]?.trim() || null,
    linea: enArchivo ? Number(enArchivo[1]) : null,
    explicacion,
  }
}

// En un caso de prueba OCULTO el error no puede llevar texto producido por el programa: el
// estudiante podría poner la entrada oculta en el mensaje de una excepción o en System.err
// (o codificarla en el código de salida) y así descubrir los casos de prueba.
export function sanitizarErrorOculto(error) {
  if (!error) return error
  const seguro = { tipo: error.tipo, explicacion: error.explicacion }
  if (error.tipo === 'excepcion') {
    seguro.excepcion = error.excepcion
    seguro.linea = error.linea ?? null
  }
  if (error.tipo === 'terminacion') {
    seguro.explicacion = 'El programa terminó antes de tiempo con un error.'
  }
  return seguro
}

export const EXPLICACION_TIEMPO_AGOTADO =
  'Tu programa tardó demasiado y se detuvo. Probablemente hay un ciclo infinito: revisa que la variable de control cambie en cada vuelta y que la condición llegue a ser falsa.'

export const EXPLICACION_SALIDA_EXCESIVA =
  'Tu programa imprimió demasiado texto y se detuvo. ¿Hay un ciclo que imprime sin parar?'
