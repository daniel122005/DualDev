// Convierte la salida de javac / de la JVM en errores con línea y explicación en español para principiantes,
// con tono de profe: qué pasó, por qué y cómo arreglarlo ("Recuerda que…").
// javac se ejecuta con -J-Duser.language=en, así que los mensajes de entrada siempre están en inglés.

const REGLAS_COMPILACION = [
  {
    patron: /^'(;)' expected$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Falta un punto y coma ";". Recuerda que en Java cada instrucción termina con ";", como el punto final de una oración. Míralo al final de esta línea o de la anterior.',
  },
  {
    patron: /^'([)\]}])' expected$/,
    tipo: 'Sintaxis',
    explicar: (m) => `Falta cerrar con "${m[1]}". Recuerda que todo lo que se abre se cierra: cada "(" necesita su ")" y cada "{" su "}".`,
  },
  {
    patron: /^'([(\[{])' expected$/,
    tipo: 'Sintaxis',
    explicar: (m) => `Java esperaba un "${m[1]}" aquí. Recuerda la forma de cada instrucción: for (...) { }, while (...) { }, if (...) { }.`,
  },
  {
    patron: /^reached end of file while parsing$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'El archivo terminó y Java seguía esperando un "}". Recuerda que cada llave que abres "{" necesita su llave de cierre "}": cuenta las de la clase, las del main y las de cada ciclo.',
  },
  {
    patron: /^class, interface, enum, or record expected$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Hay código fuera de la clase. Recuerda que todo va dentro de public class … { } y las instrucciones dentro del main. Suele pasar cuando sobra una llave "}" que cerró la clase antes de tiempo.',
  },
  {
    patron: /^not a statement$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Esta línea no es una instrucción completa. Recuerda que una instrucción hace algo: declarar (int x = 0;), asignar (x = 5;), imprimir (System.out.println(x);) o actualizar (x++;). Revisa si falta un operador o sobra algo.',
  },
  {
    patron: /^illegal start of (expression|type)$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Java no esperaba esto aquí. Recuerda revisar también la línea anterior: casi siempre es una llave, un paréntesis o un ";" mal puesto justo antes.',
  },
  {
    patron: /^<identifier> expected$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Java esperaba un nombre en esta posición. Recuerda que las instrucciones van dentro del main: si escribiste código directamente dentro de la clase (fuera del main), Java no lo entiende.',
  },
  {
    patron: /^unclosed string literal$/,
    tipo: 'Sintaxis',
    explicar: () => 'Un texto entre comillas no se cerró. Recuerda que todo texto empieza y termina con comillas dobles: "Hola".',
  },
  {
    patron: /^unclosed character literal$/,
    tipo: 'Sintaxis',
    explicar: () => "Un carácter entre comillas simples no se cerró. Recuerda que un solo carácter va así: 'a'. Si es un texto, usa comillas dobles.",
  },
  {
    patron: /^'else' without 'if'$/,
    tipo: 'Sintaxis',
    explicar: () =>
      'Hay un else sin su if. Recuerda que el else va justo después de la llave } que cierra el if; si pusiste ";" después de if (...), el if termina ahí y el else queda solo.',
  },
  {
    patron: /^package (\w+) does not exist$/,
    tipo: 'Símbolo',
    explicar: (m) =>
      m[1] === 'system'
        ? 'Recuerda que System se escribe con S mayúscula: System.out.println(...). Java distingue mayúsculas de minúsculas.'
        : `Java no conoce "${m[1]}". Recuerda que Java distingue mayúsculas de minúsculas: revisa cómo está escrito.`,
  },
  {
    patron: /^cannot find symbol$/,
    tipo: 'Símbolo',
    explicar: (_m, extra) => {
      const s = extra.simbolo
      if (!s) return 'Usas algo que Java no conoce. Recuerda que hay que declararlo antes y escribirlo igual en todos lados (mayúsculas incluidas).'
      if (s.tipo === 'variable')
        return `La variable "${s.nombre}" no existe en este punto. Recuerda que hay que declararla antes de usarla (por ejemplo: int ${s.nombre} = 0;), escribirla igual en todos lados (mayúsculas incluidas) y usarla dentro de las llaves { } donde fue declarada.`
      if (s.tipo === 'method')
        return `El método "${s.nombre}" no existe. Recuerda que Java distingue mayúsculas: se escribe System.out.println(...) (con "ln" para saltar de línea) o System.out.print(...).`
      if (s.tipo === 'class')
        return `Java no conoce "${s.nombre}". Recuerda que las clases van con mayúscula inicial (String, Scanner, System) y que Scanner necesita import java.util.Scanner; al inicio.`
      return `"${s.nombre}" no está declarado o está mal escrito.`
    },
  },
  {
    patron: /^incompatible types: (.+) cannot be converted to (.+)$/,
    tipo: 'Tipos',
    explicar: (m) => {
      if (m[1] === 'String' && /^(int|long|double)$/.test(m[2]))
        return 'Recuerda que lo que va entre comillas es texto (String), no un número: "5" no es lo mismo que 5. Quita las comillas si quieres un número.'
      if (m[2] === 'boolean')
        return 'Aquí Java esperaba una condición (verdadero o falso). Recuerda que para comparar se usa == (dos signos igual) y que un solo = guarda un valor.'
      return `Intentas usar un valor ${m[1]} donde Java espera un ${m[2]}. Recuerda que cada variable solo guarda valores de su tipo.`
    },
  },
  {
    patron: /^incompatible types: possible lossy conversion from (\w+) to (\w+)$/,
    tipo: 'Tipos',
    explicar: (m) =>
      `Guardar un ${m[1]} en un ${m[2]} puede perder información. Recuerda que un ${m[2]} es más "pequeño": usa una variable ${m[1]} o convierte con (${m[2]}).`,
  },
  {
    patron: /^variable (\w+) might not have been initialized$/,
    tipo: 'Variables',
    explicar: (m) =>
      `La variable "${m[1]}" se usa sin tener valor. Recuerda que los acumuladores y contadores necesitan un valor inicial antes del ciclo: int ${m[1]} = 0; para sumar o contar, int ${m[1]} = 1; para multiplicar.`,
  },
  {
    patron: /^variable (\w+) is already defined in .+$/,
    tipo: 'Variables',
    explicar: (m) =>
      `La variable "${m[1]}" ya fue declarada antes. Recuerda que el tipo (int, String…) se escribe solo la primera vez; para cambiarle el valor después basta con ${m[1]} = …;`,
  },
  {
    patron: /^unreachable statement$/,
    tipo: 'Lógica',
    explicar: () =>
      'Esta línea nunca se ejecuta. Recuerda que Java no puede llegar a lo que va después de un break, ni a lo que sigue a un ciclo que nunca termina, como while (true) sin break.',
  },
  { patron: /^missing return statement$/, tipo: 'Lógica', explicar: () => 'El método debe devolver un valor con return en todos los caminos.' },
  {
    patron: /^bad operand types? for (binary|unary) operator '(.+)'$/,
    tipo: 'Tipos',
    explicar: (m) =>
      m[2] === '&&' || m[2] === '||'
        ? `Recuerda que ${m[2]} une condiciones completas: escribe i > 0 && i < 10, no i > 0 && < 10.`
        : `El operador "${m[2]}" no se puede usar con esos tipos de datos. Recuerda que los textos (String) no se restan ni se multiplican.`,
  },
  {
    patron: /^incomparable types: (.+) and (.+)$/,
    tipo: 'Tipos',
    explicar: (m) => `No se puede comparar ${m[1]} con ${m[2]}. Recuerda que solo se comparan valores del mismo tipo.`,
  },
  {
    patron: /^class (\w+) is public, should be declared in a file named .+$/,
    tipo: 'Estructura',
    explicar: () => 'Solo puede haber una clase public. Recuerda: una clase pública por programa, con el main adentro.',
  },
]

const REGLAS_EJECUCION = [
  {
    patron: /ArithmeticException: \/ by zero/,
    explicar: () =>
      'Se intentó dividir entre cero. Recuerda que dividir (o sacar el residuo %) entre 0 detiene el programa: revisa que el divisor nunca valga 0, por ejemplo empezando el ciclo en 1 en vez de 0.',
  },
  {
    patron: /ArrayIndexOutOfBoundsException/,
    explicar: () =>
      'Intentaste usar una posición que no existe en el arreglo. Recuerda que las posiciones van de 0 a length - 1: la condición del ciclo debe ser i < arreglo.length, no <=.',
  },
  {
    patron: /StringIndexOutOfBoundsException/,
    explicar: () =>
      'Intentaste leer una letra que no existe. Recuerda que las posiciones de un texto van de 0 a length() - 1: el ciclo debe usar i < texto.length(), no <=.',
  },
  { patron: /NullPointerException/, explicar: () => 'Usaste una variable que no tiene valor (null). Recuerda darle un valor antes de usarla.' },
  {
    patron: /InputMismatchException/,
    explicar: () => 'El programa esperaba un número y recibió otra cosa. Recuerda que nextInt() solo lee números enteros; para leer una línea de texto se usa nextLine().',
  },
  {
    patron: /NoSuchElementException/,
    explicar: () =>
      'El programa intentó leer más datos de los que hay. Recuerda que cada nextInt() consume un dato: si lees dentro de un ciclo, el ciclo debe detenerse al llegar el dato final (por ejemplo, el 0).',
  },
  { patron: /NumberFormatException/, explicar: () => 'Intentaste convertir a número un texto que no es un número.' },
  { patron: /StackOverflowError/, explicar: () => 'Un método se llama a sí mismo sin fin (recursión infinita).' },
  {
    patron: /OutOfMemoryError/,
    explicar: () => 'El programa usó demasiada memoria. ¿Hay un ciclo que agrega elementos sin parar?',
  },
  {
    patron: /demasiados hilos/,
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

    errores.push({ linea: Number(m[2]), columna, tipo, mensaje, explicacion, codigo: codigo.trimEnd(), simbolo })
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
  'Tu programa no terminó a tiempo: casi seguro hay un ciclo infinito. Recuerda que un ciclo termina solo cuando su condición se vuelve falsa, así que dentro del ciclo algo debe acercarla a ese punto (por ejemplo i++ o n--).'

export const EXPLICACION_SALIDA_EXCESIVA =
  'Tu programa imprimió demasiado texto y se detuvo. Recuerda que un ciclo que no termina imprime sin parar: revisa que la condición llegue a ser falsa.'
