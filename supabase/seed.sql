-- DUALDEV · Datos iniciales del catálogo (niveles, módulos, lecciones, ejercicios, desafíos, logros).
-- Requiere las migraciones 0001 a 0007. Es idempotente y AUTORITATIVO para el catálogo:
-- volver a ejecutarlo actualiza los textos/puntos sin duplicar filas ni tocar datos de estudiantes.
-- Nivel "semillero": estudiantes de colegio técnico que recién empiezan. Pasos pequeños, contexto
-- cotidiano y, en cada error típico, una explicación de profe ("Recuerda que…") en errores_comunes.

-- ---------------------------------------------------------------------------
-- Niveles (escala del diseño)
-- ---------------------------------------------------------------------------
insert into public.nivel (numero, nombre, puntos_minimos) values
  (1, 'Inicial',                  0),
  (2, 'Aprendiz',               300),
  (3, 'Explorador',             800),
  (4, 'Programador Junior',    1100),
  (5, 'Programador Intermedio', 1500),
  (6, 'Programador Avanzado',   2100),
  (7, 'Maestro de ciclos',      2700)
on conflict (numero) do nothing;

-- ---------------------------------------------------------------------------
-- Módulos
-- ---------------------------------------------------------------------------
insert into public.modulo (titulo, descripcion, orden, dificultad) values
  ('Introducción a ciclos', 'Entiende qué es un ciclo, sus partes y cómo leer datos con Scanner.', 1, 'basico'),
  ('Ciclo for', 'Domina el ciclo for: contadores, rangos, acumuladores y el operador %.', 2, 'basico'),
  ('Ciclo while', 'Repite mientras se cumpla una condición y aprende a evitar ciclos infinitos.', 3, 'intermedio'),
  ('Ciclo do-while', 'Ciclos que siempre se ejecutan al menos una vez: menús y validaciones.', 4, 'intermedio'),
  ('Ciclos combinados', 'Combina ciclos con break, continue y ciclos anidados.', 5, 'avanzado')
on conflict (orden) do update
  set titulo = excluded.titulo, descripcion = excluded.descripcion, dificultad = excluded.dificultad;

-- ---------------------------------------------------------------------------
-- Lecciones (contenido)
-- ---------------------------------------------------------------------------
insert into public.contenido
  (id_modulo, titulo, explicacion, codigo_ejemplo, salida_ejemplo, tip, minutos_estimados, puntos, orden)
select m.id_modulo, c.titulo, c.explicacion, c.codigo, c.salida, c.tip, c.minutos, 50, c.orden
from (values
  -- Módulo 1 · Introducción
  (1, '¿Por qué necesitamos ciclos?',
   $t$Imagina que tienes que imprimir "Hola" tres veces. Podrías copiar la misma línea tres veces, pero ¿y si fueran mil? Un ciclo (también llamado bucle) repite un bloque de instrucciones por ti, sin copiar y pegar. Cada repetición se llama iteración (de forma informal, una "vuelta"). En el ejemplo, los dos bloques hacen lo mismo y por eso "Hola" sale seis veces: tres del bloque sin ciclo y tres del ciclo. La diferencia es que el ciclo sirve igual para 3, para 100 o para 1000 repeticiones: solo cambias un número.$t$,
   $j$// Sin ciclo: una línea por cada "Hola"
System.out.println("Hola");
System.out.println("Hola");
System.out.println("Hola");

// Con ciclo: la línea se escribe una sola vez
for (int i = 0; i < 3; i++) {
    System.out.println("Hola");
}$j$,
   E'Hola\nHola\nHola\nHola\nHola\nHola',
   'Si te encuentras copiando y pegando la misma línea muchas veces, probablemente necesitas un ciclo.', 5, 1),
  (1, 'Partes de un ciclo',
   $t$Piensa en dar vueltas a la cancha del colegio: empiezas en la vuelta 1, sigues corriendo mientras no hayas completado 3, corres una vuelta y la cuentas. Todo ciclo tiene esas cuatro partes: la inicialización (dónde empieza la variable de control: int i = 1), la condición (mientras sea verdadera, se repite: i <= 3), el cuerpo (lo que se repite, entre llaves { }) y la actualización (cómo cambia la variable en cada vuelta: i++). Si falta la actualización, la condición nunca cambia y el ciclo no termina nunca.$t$,
   $j$int i = 1;                 // inicialización
while (i <= 3) {           // condición
    System.out.println(i); // cuerpo
    i++;                   // actualización (i = i + 1)
}$j$,
   E'1\n2\n3',
   'Antes de escribir un ciclo, responde tres preguntas: ¿desde dónde empiezo?, ¿hasta cuándo repito? y ¿cómo avanzo?', 6, 2),
  (1, 'Leer datos con Scanner',
   $t$Muchos ejercicios dicen "Lee un número n". Para leer datos en Java se usa Scanner, en tres pasos: 1) lo importas, escribiendo import java.util.Scanner; en la primera línea; 2) lo creas dentro del main: Scanner sc = new Scanner(System.in); 3) lees cada número con sc.nextInt(). Cada vez que llamas a nextInt() se toma el SIGUIENTE número de la entrada. En DualDev la entrada la escribe el sistema cuando prueba tu programa: tú solo la lees y la usas. Por eso tu programa debe funcionar con cualquier número, no solo con el del ejemplo.$t$,
   $j$import java.util.Scanner;

public class Saludo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int edad = sc.nextInt();   // lee un número entero
        System.out.println("Tienes " + edad + " años");
    }
}$j$,
   'Tienes 16 años',
   'La salida de ejemplo corresponde a la entrada 16. El signo + une textos y variables: lo que va entre comillas se imprime tal cual y la variable se reemplaza por su valor.', 7, 3),
  (1, 'Los tres ciclos de Java',
   $t$Java tiene tres ciclos: for (cuando sabes cuántas veces vas a repetir), while (repite mientras una condición sea verdadera) y do-while (como while, pero da al menos una vuelta). Los tres pueden resolver los mismos problemas; elegir el adecuado hace que tu código se entienda mejor. En el ejemplo, los tres cuentan del 1 al 3.$t$,
   $j$for (int i = 1; i <= 3; i++) {
    System.out.println("for " + i);
}

int j = 1;
while (j <= 3) {
    System.out.println("while " + j);
    j++;
}

int k = 1;
do {
    System.out.println("do-while " + k);
    k++;
} while (k <= 3);$j$,
   E'for 1\nfor 2\nfor 3\nwhile 1\nwhile 2\nwhile 3\ndo-while 1\ndo-while 2\ndo-while 3',
   'No te preocupes si todavía no entiendes los tres: cada uno tiene su propio módulo.', 6, 4),

  -- Módulo 2 · for
  (2, 'Estructura del for',
   $t$El for reúne las tres partes del ciclo en una sola línea: for (inicio; condición; actualización). Así se ejecuta: 1) int i = 1 se hace una sola vez, al empezar. 2) Se revisa la condición i <= 5: si es verdadera, entra. 3) Se ejecuta el cuerpo. 4) Se hace i++ y se vuelve al paso 2. Cuando i llega a 6, la condición es falsa y el programa sigue con lo que está después del ciclo.$t$,
   $j$public class ContadorFor {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Número: " + i);
        }
        System.out.println("¡Ciclo terminado!");
    }
}$j$,
   E'Número: 1\nNúmero: 2\nNúmero: 3\nNúmero: 4\nNúmero: 5\n¡Ciclo terminado!',
   'Las tres partes del for se separan con punto y coma, nunca con coma. El nombre i viene de "índice"; puedes usar el nombre que quieras.', 8, 1),
  (2, 'Contar hacia atrás y de a dos',
   $t$Cambiando el inicio, la condición y la actualización puedes contar hacia atrás (i--) o saltar de a varios (i += 2, que es lo mismo que i = i + 2). La condición debe ir en la misma dirección que la actualización: si la variable baja, la condición suele usar >= o >; si sube, usa <= o <.$t$,
   $j$for (int i = 10; i >= 0; i -= 2) {
    System.out.println(i);
}$j$,
   E'10\n8\n6\n4\n2\n0',
   'Si cuentas hacia atrás con i++ en vez de i--, la condición i >= 0 nunca se vuelve falsa: ciclo infinito.', 7, 2),
  (2, 'Acumuladores y contadores',
   $t$Un contador cuenta cuántas veces pasa algo (contador++). Un acumulador guarda un resultado que crece en cada vuelta, como una suma (suma += i). Los dos se declaran ANTES del ciclo con un valor inicial (0 para contar o sumar, 1 para multiplicar) y se actualizan DENTRO del ciclo. El resultado se imprime DESPUÉS del ciclo, cuando ya terminó de acumular.$t$,
   $j$int suma = 0;                  // antes del ciclo
for (int i = 1; i <= 10; i++) {
    suma += i;                 // igual a: suma = suma + i;
}
System.out.println("Suma = " + suma);   // después del ciclo$j$,
   'Suma = 55',
   'Ojo: suma = i REEMPLAZA el valor; suma += i lo AGREGA. Y si declaras el acumulador dentro del ciclo, vuelve a 0 en cada vuelta.', 8, 3),
  (2, 'El operador % (residuo)',
   $t$El operador % da el residuo de una división entera: 7 % 2 es 1 (porque 7 = 2·3 + 1) y 8 % 2 es 0. Dentro de un ciclo es muy útil: un número es par si n % 2 == 0, es múltiplo de 3 si n % 3 == 0, y n % 10 te da su último dígito (4096 % 10 es 6). Combinado con un if dentro del ciclo, te deja escoger en qué vueltas se hace algo.$t$,
   $j$for (int i = 1; i <= 10; i++) {
    if (i % 3 == 0) {
        System.out.println(i + " es múltiplo de 3");
    }
}$j$,
   E'3 es múltiplo de 3\n6 es múltiplo de 3\n9 es múltiplo de 3',
   'Recuerda que == compara y = asigna: la condición es i % 3 == 0, con dos signos igual.', 7, 4),

  -- Módulo 3 · while
  (3, 'Estructura del while',
   $t$El while revisa la condición ANTES de cada vuelta: while (condición) { cuerpo }. Si desde el principio la condición es falsa, el cuerpo no se ejecuta ni una vez. Es ideal cuando no sabes cuántas vueltas vas a dar, por ejemplo al ir quitando dígitos a un número hasta que llegue a 0. A diferencia del for, la inicialización va antes del while y la actualización va dentro del cuerpo.$t$,
   $j$int n = 3;           // inicialización
while (n > 0) {      // condición
    System.out.println(n);
    n--;             // actualización
}$j$,
   E'3\n2\n1',
   'Cuando n llega a 0, la condición 0 > 0 es falsa y el ciclo termina sin imprimir el 0.', 7, 1),
  (3, 'Ciclos infinitos',
   $t$Si la condición nunca se vuelve falsa, el ciclo no termina. Los errores más comunes: olvidar actualizar la variable dentro del cuerpo, actualizarla en la dirección contraria (n++ cuando la condición espera que baje) o poner un punto y coma justo después de while (...). En DualDev, si tu programa tarda demasiado se detiene y te mostramos qué variable no está cambiando.$t$,
   $j$int n = 3;
while (n > 0) {
    System.out.println(n);
    // falta n--; -> n siempre vale 3 y el ciclo nunca termina
}$j$,
   null,
   'Pregúntate siempre: ¿qué línea dentro del ciclo hace que la condición termine siendo falsa?', 6, 2),
  (3, 'while vs for',
   $t$Usa for cuando sabes de antemano cuántas vueltas darás (contar del 1 al 10). Usa while cuando la cantidad depende de algo que pasa durante el ciclo. Ejemplo: para contar los dígitos de un número, lo divides entre 10 (n = n / 10 quita el último dígito) hasta que llegue a 0; no sabes cuántas vueltas serán hasta que lo haces.$t$,
   $j$int numero = 4096;
int digitos = 0;
while (numero > 0) {
    numero = numero / 10;   // 4096 -> 409 -> 40 -> 4 -> 0
    digitos++;
}
System.out.println("Dígitos: " + digitos);$j$,
   'Dígitos: 4',
   'En Java, dividir dos enteros descarta los decimales: 409 / 10 es 40.', 7, 3),

  -- Módulo 4 · do-while
  (4, 'Estructura del do-while',
   $t$El do-while revisa la condición DESPUÉS de ejecutar el cuerpo, por eso siempre da al menos una vuelta. Piensa en probar la sopa: primero la pruebas (cuerpo) y después decides si le falta sal (condición). Se escribe do { cuerpo } while (condición); y es el único ciclo que termina con punto y coma.$t$,
   $j$int x = 10;
do {
    System.out.println(x);
    x++;
} while (x < 10);$j$,
   '10',
   'Aunque la condición 10 < 10 es falsa desde el inicio, el cuerpo se ejecuta una vez.', 7, 1),
  (4, 'Cuándo usar do-while',
   $t$El do-while es perfecto para menús y validaciones: primero pides o muestras algo, y luego decides si hay que repetir. Por ejemplo, pedir números hasta que el usuario escriba 0, o pedir una edad hasta que sea válida. La variable que usa la condición se declara ANTES del do, para que exista también en el while del final.$t$,
   $j$Scanner sc = new Scanner(System.in);
int numero;            // declarada antes del do
int suma = 0;
do {
    numero = sc.nextInt();
    suma += numero;
} while (numero != 0);
System.out.println("Total = " + suma);$j$,
   'Total = 8',
   'La salida de ejemplo corresponde a la entrada 5, 3 y 0. La condición dice cuándo REPETIR: mientras el número sea distinto de 0.', 8, 2),

  -- Módulo 5 · Ciclos combinados
  (5, 'break y continue',
   $t$break termina el ciclo inmediatamente y el programa sigue con lo que está después del ciclo. continue se salta lo que falta de la vuelta actual y pasa a la siguiente (en un for, primero hace el i++). En el ejemplo, continue salta los pares y break corta el ciclo cuando i pasa de 7.$t$,
   $j$for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue; // salta los pares
    if (i > 7) break;         // termina el ciclo al pasar de 7
    System.out.println(i);
}$j$,
   E'1\n3\n5\n7',
   'Una forma de recordarlo: break "rompe" el ciclo; continue "continúa" con la siguiente vuelta.', 8, 1),
  (5, 'Ciclos anidados',
   $t$Un ciclo puede ir dentro de otro. Por cada vuelta del ciclo externo, el interno da TODAS sus vueltas. Es como un reloj: por cada hora, el minutero da 60 vueltas. Se usan para tablas, cuadrículas y figuras con asteriscos: el externo recorre las filas y el interno lo que va en cada fila. Usa print para quedarte en la misma línea y println() al terminar cada fila.$t$,
   $j$for (int fila = 1; fila <= 3; fila++) {
    for (int col = 1; col <= fila; col++) {
        System.out.print("*");
    }
    System.out.println();   // salto de línea al terminar la fila
}$j$,
   E'*\n**\n***',
   'Usa nombres claros (fila, col) en vez de i y j cuando anides ciclos: te ayudan a no confundirlos.', 9, 2)
) as c(modulo_orden, titulo, explicacion, codigo, salida, tip, minutos, orden)
join public.modulo m on m.orden = c.modulo_orden
on conflict (id_modulo, orden) do update
  set titulo = excluded.titulo, explicacion = excluded.explicacion, codigo_ejemplo = excluded.codigo_ejemplo,
      salida_ejemplo = excluded.salida_ejemplo, tip = excluded.tip,
      minutos_estimados = excluded.minutos_estimados, puntos = excluded.puntos;

-- ---------------------------------------------------------------------------
-- Ejercicios
-- tipo: seleccion | respuesta_corta | salida (predecir la salida) | codigo (Java real con casos de prueba)
-- puntos: fácil 30–40, media 60, difícil 100.
-- errores_comunes: [{ respuesta | salida | patron, mensaje }] (ver migración 0007).
-- ---------------------------------------------------------------------------
insert into public.ejercicio
  (id_modulo, titulo, enunciado, tipo, dificultad, puntos, opciones, solucion_esperada,
   pistas, explicacion, codigo_inicial, casos_prueba, requiere, errores_comunes, orden)
select m.id_modulo, e.titulo, e.enunciado, e.tipo, e.dificultad, e.puntos, e.opciones::jsonb, e.solucion,
       e.pistas::jsonb, e.explicacion, e.codigo_inicial, e.casos::jsonb, coalesce(e.requiere, '[]')::jsonb,
       coalesce(e.errores, '[]')::jsonb, e.orden
from (values
  -- =========================== Módulo 1 · Introducción ===========================
  (1, 'Qué es un ciclo', '¿Qué hace un ciclo en un programa?', 'seleccion', 'facil', 30,
   '["Repite un bloque de instrucciones","Guarda datos en disco","Declara una clase","Detiene el programa"]',
   'Repite un bloque de instrucciones',
   '["Piensa en la palabra \"repetir\"."]',
   'Un ciclo ejecuta varias veces el mismo bloque de instrucciones, sin que tengas que copiarlas.', null, null, null,
   $e$[
    {"respuesta":"Guarda datos en disco","mensaje":"Guardar datos es tarea de archivos o bases de datos. Recuerda que un ciclo sirve para REPETIR instrucciones sin copiarlas."},
    {"respuesta":"Declara una clase","mensaje":"Las clases se declaran con la palabra class. Recuerda que un ciclo repite un bloque de instrucciones, como dar vueltas a una cancha."},
    {"respuesta":"Detiene el programa","mensaje":"Es al revés: un ciclo hace que algo se ejecute varias veces. Recuerda la idea de dar vueltas: se repite hasta que la condición deja de cumplirse."}
   ]$e$, 1),
  (1, 'Encuentra la condición', $t$En este ciclo, ¿cuál es la CONDICIÓN (la parte que decide si se da otra vuelta)?

for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}$t$, 'seleccion', 'facil', 30,
   '["int i = 1","i <= 5","i++","System.out.println(i)"]',
   'i <= 5',
   '["La condición es una pregunta que se responde con sí o no."]',
   'Las partes del for van en orden: inicialización; condición; actualización. La condición i <= 5 se revisa antes de cada vuelta.', null, null, null,
   $e$[
    {"respuesta":"int i = 1","mensaje":"Esa es la inicialización: se ejecuta una sola vez, al empezar. Recuerda que la condición es la pregunta de sí o no que se hace antes de cada vuelta."},
    {"respuesta":"i++","mensaje":"Esa es la actualización: cambia i al final de cada vuelta. Recuerda que la condición es la que pregunta si se sigue repitiendo."},
    {"respuesta":"System.out.println(i)","mensaje":"Ese es el cuerpo: lo que se repite. Recuerda que la condición va dentro de los paréntesis del for, entre los dos punto y coma."}
   ]$e$, 2),
  (1, 'Ciclo que no existe', '¿Cuál de estos NO es un ciclo en Java?', 'seleccion', 'facil', 30,
   '["for","while","do-while","repeat-until"]',
   'repeat-until',
   '["Java tiene exactamente tres ciclos."]',
   'Java no tiene repeat-until (existe en otros lenguajes, como Pascal); sus ciclos son for, while y do-while.', null, null, null,
   $e$[
    {"respuesta":"for","mensaje":"for sí es un ciclo de Java: es el que usas cuando sabes cuántas vueltas dar. Recuerda que Java tiene exactamente tres: for, while y do-while."},
    {"respuesta":"while","mensaje":"while sí es un ciclo de Java: repite mientras la condición sea verdadera. Recuerda que Java tiene exactamente tres: for, while y do-while."},
    {"respuesta":"do-while","mensaje":"do-while sí es un ciclo de Java: da al menos una vuelta. Recuerda que Java tiene exactamente tres: for, while y do-while."}
   ]$e$, 3),
  (1, 'Nombre de cada repetición', '¿Cómo se llama cada repetición del cuerpo de un ciclo? Escribe una palabra.', 'respuesta_corta', 'facil', 30,
   null, 'iteración|iteracion',
   '["Empieza con \"i\" y termina en \"ción\"."]',
   'Cada vuelta del ciclo se llama iteración. Por eso a la variable del ciclo se le suele llamar i.', null, null, null,
   $e$[
    {"respuesta":"vuelta|una vuelta|repeticion|repetición","mensaje":"¡Casi! Así le decimos de forma informal. Recuerda que el nombre técnico empieza con i: ite…"},
    {"respuesta":"ciclo|bucle|loop","mensaje":"El ciclo (o bucle) es la estructura completa. Recuerda que aquí buscamos el nombre de CADA repetición."}
   ]$e$, 4),
  (1, 'Saludo con tu edad', $t$Lee la edad de una persona (un número entero) y muestra un saludo con este formato exacto:
Tienes 16 años

Este ejercicio todavía no usa ciclos: sirve para practicar cómo leer datos con Scanner, algo que usarás en casi todos los demás.$t$, 'codigo', 'facil', 30,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int edad = sc.nextInt();
        System.out.println("Tienes " + edad + " años");
    }
}$j$,
   '["Primero lee la edad: int edad = sc.nextInt();","Une el texto y la variable con +","Ojo con los espacios: \"Tienes \" + edad + \" años\""]',
   'sc.nextInt() lee el número de la entrada y el + une el texto con el valor de la variable.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: lee la edad con sc.nextInt() y muestra "Tienes ... años"

    }
}$j$,
   '[{"entrada":"16","salida":"Tienes 16 años","visible":true},{"entrada":"12","salida":"Tienes 12 años","visible":false},{"entrada":"18","salida":"Tienes 18 años","visible":false}]',
   null,
   $e$[
    {"salida":"Tienes edad años","mensaje":"Pusiste edad dentro de las comillas, así que Java imprime la palabra edad. Recuerda que lo que va entre comillas se imprime tal cual; la variable va fuera: \"Tienes \" + edad + \" años\"."},
    {"patron":"^(?![\\s\\S]*nextInt)","mensaje":"Recuerda leer la edad con sc.nextInt(): cada vez que se prueba tu programa llega una edad distinta, y tu programa debe usarla."}
   ]$e$, 5),

  -- =========================== Módulo 2 · for ===========================
  (2, 'Imprimir de 1 a 3', $t$¿Qué imprime este código? Escribe la salida tal como aparecería, un valor por línea.

for (int i = 1; i <= 3; i++) {
    System.out.println(i);
}$t$, 'salida', 'facil', 30,
   null, E'1\n2\n3',
   '["La variable i empieza en 1 y sube de uno en uno.","¿Qué pasa cuando i vale 3? ¿3 <= 3 es verdadero?"]',
   'i vale 1, 2 y 3; cuando vale 4 la condición 4 <= 3 es falsa y el ciclo termina.', null, null, null,
   $e$[
    {"salida":"1\n2","mensaje":"Te faltó el 3. Recuerda que <= significa \"menor O IGUAL\": cuando i vale 3, 3 <= 3 es verdadero y también se imprime."},
    {"salida":"1\n2\n3\n4","mensaje":"Sobra el 4. Recuerda que después de i++ se revisa la condición: con i = 4, 4 <= 3 es falso y el ciclo termina sin imprimir."},
    {"salida":"0\n1\n2\n3","mensaje":"Sobra el 0. Recuerda que la inicialización int i = 1 hace que la primera vuelta imprima 1."}
   ]$e$, 1),
  (2, 'Cuántas vueltas', $t$¿Cuántas veces se ejecuta el cuerpo de este ciclo?

for (int i = 0; i < 5; i++) {
    System.out.println("Hola");
}$t$, 'seleccion', 'facil', 30,
   '["4","5","6","Infinitas"]',
   '5',
   '["Escribe los valores que toma i: 0, 1, 2…","¿Cuál es el último valor de i que cumple i < 5?"]',
   'i toma los valores 0, 1, 2, 3 y 4: son 5 vueltas. Empezar en 0 con < 5 es la forma clásica de repetir 5 veces.', null, null, null,
   $e$[
    {"respuesta":"4","mensaje":"Recuerda que i empieza en 0, no en 1: i vale 0, 1, 2, 3 y 4. Cuéntalos: son cinco valores."},
    {"respuesta":"6","mensaje":"Recuerda que < no incluye el límite: cuando i vale 5, 5 < 5 es falso y no hay vuelta. Los valores son 0, 1, 2, 3 y 4."},
    {"respuesta":"Infinitas","mensaje":"i++ hace que i suba en cada vuelta, así que tarde o temprano llega a 5 y la condición i < 5 se vuelve falsa. Recuerda que un ciclo es infinito solo si su condición nunca cambia."}
   ]$e$, 2),
  (2, 'Completa la condición', $t$Queremos imprimir los números del 1 al 10. Escribe SOLO lo que va en el espacio en blanco (la condición):

for (int i = 1; ______; i++) {
    System.out.println(i);
}$t$, 'respuesta_corta', 'media', 60,
   null, 'i <= 10|i < 11',
   '["La condición debe ser verdadera mientras quieras seguir imprimiendo.","El 10 también debe imprimirse."]',
   'Con i <= 10 el ciclo incluye el 10; i < 11 es equivalente.', null, null, null,
   $e$[
    {"respuesta":"i < 10|i <= 9","mensaje":"Así el ciclo se detiene en el 9. Recuerda que < no incluye el límite: para que el 10 también se imprima usa i <= 10 (o i < 11)."},
    {"respuesta":"i <= 11|i < 12","mensaje":"Así se imprime también el 11. Recuerda que la condición marca el ÚLTIMO valor permitido, que aquí es 10."},
    {"respuesta":"i > 10|i >= 10|i > 1","mensaje":"Como i empieza en 1, esa condición es falsa desde el principio y el ciclo no da ni una vuelta. Recuerda que la condición debe ser verdadera mientras quieras seguir repitiendo."},
    {"respuesta":"i = 10|i == 10","mensaje":"Recuerda que la condición pregunta \"¿sigo?\": con i = 1, i == 10 es falso y el ciclo ni empieza (y un solo = ni siquiera compara, asigna). Necesitas \"mientras i sea menor o igual a 10\"."},
    {"respuesta":"10|<= 10|<=10","mensaje":"Falta la variable: la condición compara i con el límite. Recuerda la forma completa: i <= 10."}
   ]$e$, 3),
  (2, 'Contar del 1 al 5', 'Escribe un programa que use un ciclo for para imprimir los números del 1 al 5, uno por línea.', 'codigo', 'facil', 30,
   null,
   $j$public class Ejercicio {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println(i);
        }
    }
}$j$,
   '["Empieza en 1: int i = 1","La condición debe incluir el 5: i <= 5","Usa println para que cada número quede en su línea"]',
   'El for va de 1 a 5 (i <= 5) e imprime i en cada vuelta.',
   $j$public class Ejercicio {
    public static void main(String[] args) {
        // TODO: imprime los números del 1 al 5 con un ciclo for

    }
}$j$,
   '[{"entrada":"","salida":"1\n2\n3\n4\n5","visible":true}]', '["for"]',
   $e$[
    {"salida":"1\n2\n3\n4","mensaje":"Te faltó el 5. Recuerda que i < 5 se detiene en el 4: para incluir el 5 usa i <= 5."},
    {"salida":"0\n1\n2\n3\n4","mensaje":"Empezaste en 0 y te faltó el 5. Recuerda que el enunciado pide del 1 al 5: inicializa con int i = 1 y usa i <= 5."},
    {"salida":"i\ni\ni\ni\ni","mensaje":"Imprimiste la letra i. Recuerda que lo que va entre comillas se imprime tal cual: para mostrar el VALOR de la variable escribe System.out.println(i); sin comillas."}
   ]$e$, 4),
  (2, 'Del 1 al n', $t$Lee un número n e imprime los números del 1 al n, uno por línea.

Ejemplo: si la entrada es 4, la salida es
1
2
3
4$t$, 'codigo', 'facil', 30,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            System.out.println(i);
        }
    }
}$j$,
   '["El número n ya está leído en el código inicial","La condición compara i con n, no con un número fijo","i <= n incluye al propio n"]',
   'Usar n en la condición hace que el programa funcione con cualquier número, no solo con el del ejemplo.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime del 1 al n con un ciclo for

    }
}$j$,
   '[{"entrada":"4","salida":"1\n2\n3\n4","visible":true},{"entrada":"7","salida":"1\n2\n3\n4\n5\n6\n7","visible":false},{"entrada":"1","salida":"1","visible":false}]',
   '["for"]',
   $e$[
    {"patron":"i\\s*<=?\\s*[45]\\s*;","mensaje":"Usaste un número fijo en la condición. Recuerda que n cambia en cada prueba: la condición debe ser i <= n para que funcione con cualquier número."},
    {"salida":"1\n2\n3","mensaje":"Te faltó el último número. Recuerda que i < n se detiene en n - 1: usa i <= n."}
   ]$e$, 5),
  (2, 'Suma de números', $t$Don Pedro vende pan: el día 1 vende 1 pan, el día 2 vende 2, y así hasta el día 10. Usa un ciclo for para sumar los números del 1 al 10 y muestra el total con este formato exacto:
Suma = 55$t$, 'codigo', 'facil', 40,
   null,
   $j$public class Ejercicio {
    public static void main(String[] args) {
        int suma = 0;
        for (int i = 1; i <= 10; i++) {
            suma += i;
        }
        System.out.println("Suma = " + suma);
    }
}$j$,
   '["Usa una variable acumuladora declarada ANTES del ciclo: int suma = 0;","Dentro del ciclo agrega i a la suma: suma += i;","Imprime el resultado DESPUÉS de cerrar el ciclo"]',
   'El acumulador suma empieza en 0 y en cada vuelta se le agrega i. Se imprime al final, una sola vez.',
   $j$public class Ejercicio {
    public static void main(String[] args) {
        // TODO: Escribe un ciclo for que sume
        // todos los números del 1 al 10.

    }
}$j$,
   '[{"entrada":"","salida":"Suma = 55","visible":true}]', '["for"]',
   $e$[
    {"salida":"Suma = 45","mensaje":"Te faltó sumar el 10 (45 + 10 = 55). Recuerda que i < 10 se detiene en el 9: usa i <= 10."},
    {"salida":"Suma = 10","mensaje":"El resultado es solo el último número: parece que escribes suma = i, que REEMPLAZA el valor. Recuerda que para acumular se usa suma += i, que lo AGREGA a lo que ya había."},
    {"salida":"Suma = 0","mensaje":"La suma quedó en 0: el acumulador nunca recibió nada. Recuerda poner suma += i; DENTRO de las llaves del ciclo."},
    {"patron":"\\bsuma\\s*=\\s*i\\s*;","mensaje":"Recuerda que suma = i REEMPLAZA el valor de suma por i. Para acumular se usa suma += i (que es lo mismo que suma = suma + i)."}
   ]$e$, 6),
  (2, 'Tabla de multiplicar', $t$Lee un número n y muestra su tabla de multiplicar del 1 al 10, una multiplicación por línea, con este formato exacto:
n x i = resultado

Ejemplo: si la entrada es 3, la primera línea es 3 x 1 = 3 y la última es 3 x 10 = 30.$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
    }
}$j$,
   '["El ciclo va de 1 a 10: for (int i = 1; i <= 10; i++)","En cada vuelta multiplica n * i","Cuida los espacios: n + \" x \" + i + \" = \" + (n * i)"]',
   'El ciclo recorre i de 1 a 10 e imprime n * i en cada vuelta; n no cambia.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime la tabla de n del 1 al 10

    }
}$j$,
   '[{"entrada":"3","salida":"3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30","visible":true},{"entrada":"7","salida":"7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70","visible":false}]',
   '["for"]',
   $e$[
    {"patron":"\"\\s*\\+\\s*n\\s*\\+\\s*i\\s*\\)","mensaje":"Recuerda que después de un texto el + UNE en vez de sumar o multiplicar. Para que Java calcule, escribe la operación entre paréntesis: \" = \" + (n * i)."},
    {"patron":"\\bi\\s*\\*\\s*i\\b","mensaje":"Multiplicaste i * i. Recuerda que la tabla es del número leído: cada línea es n * i, donde n no cambia."}
   ]$e$, 7),
  (2, 'Solo los pares', $t$¿Qué imprime este código? Escribe la salida, un valor por línea.

for (int i = 1; i <= 6; i++) {
    if (i % 2 == 0) {
        System.out.println(i);
    }
}$t$, 'salida', 'facil', 40,
   null, E'2\n4\n6',
   '["i % 2 es el residuo de dividir i entre 2.","Solo se imprime cuando el residuo es 0."]',
   'i % 2 == 0 es verdadero para 2, 4 y 6, que son los pares entre 1 y 6.', null, null, null,
   $e$[
    {"salida":"1\n3\n5","mensaje":"Esos son los impares. Recuerda que i % 2 == 0 es verdadero cuando el residuo de dividir entre 2 es 0, es decir, cuando i es PAR."},
    {"salida":"1\n2\n3\n4\n5\n6","mensaje":"Recuerda que el println está dentro del if: solo se imprime cuando la condición i % 2 == 0 se cumple."},
    {"salida":"2\n4","mensaje":"Te faltó el 6. Recuerda que i <= 6 incluye el 6, y 6 % 2 es 0."},
    {"salida":"0\n0\n0","mensaje":"Recuerda que se imprime i (el número), no i % 2 (el residuo)."}
   ]$e$, 8),
  (2, 'Números pares', $t$Lee un número n y muestra todos los números pares desde 2 hasta n (incluido, si es par), uno por línea. Si n es menor que 2, no se imprime nada.

Ejemplo: si la entrada es 10, la salida es
2
4
6
8
10$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 2; i <= n; i += 2) {
            System.out.println(i);
        }
    }
}$j$,
   '["Puedes empezar en 2 y avanzar de a 2 con i += 2","O recorrer todos los números y usar if (i % 2 == 0)","Si n es menor que 2, la condición es falsa desde el inicio y no se imprime nada"]',
   'Empezando en 2 y avanzando de a 2 solo se visitan los pares. Usar i % 2 == 0 también funciona.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime los pares desde 2 hasta n

    }
}$j$,
   '[{"entrada":"10","salida":"2\n4\n6\n8\n10","visible":true},{"entrada":"7","salida":"2\n4\n6","visible":false},{"entrada":"1","salida":"","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"1\n3\n5\n7\n9","mensaje":"Esos son los impares. Recuerda: par significa i % 2 == 0, o empezar en 2 y avanzar de a 2."},
    {"salida":"0\n2\n4\n6\n8\n10","mensaje":"Sobra el 0. Recuerda que el enunciado pide desde el 2: empieza con int i = 2."},
    {"salida":"2\n4\n6\n8","mensaje":"Te faltó el 10. Recuerda que \"hasta n incluido\" se escribe i <= n."},
    {"patron":";\\s*i\\s*\\+\\s*2\\s*\\)","mensaje":"Recuerda que i + 2 solo calcula un valor, no lo guarda. Para avanzar de a 2 escribe i += 2 (que es lo mismo que i = i + 2)."}
   ]$e$, 9),

  -- =========================== Módulo 3 · while ===========================
  (3, 'Cuenta regresiva', $t$¿Qué imprime este código? Escribe la salida, un valor por línea.

int n = 3;
while (n > 0) {
    System.out.println(n);
    n--;
}$t$, 'salida', 'facil', 30,
   null, E'3\n2\n1',
   '["n baja de uno en uno en cada vuelta.","¿Qué pasa cuando n vale 0? ¿0 > 0 es verdadero?"]',
   'n vale 3, 2 y 1; cuando llega a 0 la condición 0 > 0 es falsa y el ciclo termina.', null, null, null,
   $e$[
    {"salida":"3\n2\n1\n0","mensaje":"Sobra el 0. Recuerda que cuando n vale 0, la condición 0 > 0 es falsa y el ciclo termina antes de imprimir."},
    {"salida":"3\n2","mensaje":"Te faltó el 1. Cuando n vale 1, la condición 1 > 0 es verdadera, así que se imprime."},
    {"salida":"2\n1\n0","mensaje":"Recuerda el orden dentro del cuerpo: primero se imprime y DESPUÉS se resta (n--). La primera vuelta imprime 3."}
   ]$e$, 1),
  (3, 'Olvidar actualizar', 'Si dentro de un while se olvida modificar la variable de la condición (y la condición empieza siendo verdadera), ¿qué ocurre?', 'seleccion', 'facil', 30,
   '["Se produce un ciclo infinito","El ciclo no se ejecuta","Java corrige el error solo","El programa termina de inmediato"]',
   'Se produce un ciclo infinito',
   '["Si la variable no cambia, ¿puede cambiar la condición?"]',
   'Si la condición siempre es verdadera, el ciclo nunca termina. Por eso cada ciclo necesita una actualización.', null, null, null,
   $e$[
    {"respuesta":"El ciclo no se ejecuta","mensaje":"Si la condición es verdadera al inicio, el ciclo sí entra. El problema es que nunca sale. Recuerda: sin actualizar la variable, la condición no cambia."},
    {"respuesta":"Java corrige el error solo","mensaje":"Java hace exactamente lo que escribes, aunque sea un error. Recuerda que eres tú quien debe cambiar la variable dentro del ciclo."},
    {"respuesta":"El programa termina de inmediato","mensaje":"Es al revés: el programa nunca termina. Recuerda que si la condición siempre es verdadera, el ciclo se repite sin fin."}
   ]$e$, 2),
  (3, 'Suma acumulada', $t$¿Qué imprime este código?

int s = 0;
int i = 1;
while (i <= 4) {
    s += i;
    i++;
}
System.out.println(s);$t$, 'salida', 'media', 60,
   null, '10',
   '["Anota en una hoja cuánto vale s después de cada vuelta.","El println está después del ciclo: se imprime una sola vez."]',
   's acumula 1, 3, 6 y 10 (1 + 2 + 3 + 4). Se imprime solo el valor final.', null, null, null,
   $e$[
    {"salida":"6","mensaje":"Te faltó sumar el 4. Recuerda que i <= 4 incluye el 4: s vale 1, 3, 6 y 10."},
    {"salida":"1\n3\n6\n10","mensaje":"Recuerda que el println está DESPUÉS del ciclo: se imprime una sola vez, con el valor final."},
    {"salida":"4","mensaje":"Recuerda que s += i suma el valor de i a lo que ya tenía s; no lo reemplaza."}
   ]$e$, 3),
  (3, 'Despegue', $t$Lee un número n y usa un ciclo while para imprimir la cuenta regresiva desde n hasta 1. Al final imprime ¡Despegue!

Ejemplo: si la entrada es 3, la salida es
3
2
1
¡Despegue!$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        while (n > 0) {
            System.out.println(n);
            n--;
        }
        System.out.println("¡Despegue!");
    }
}$j$,
   '["La condición es n > 0","Resta 1 a n dentro del ciclo: n--;","El mensaje ¡Despegue! va DESPUÉS de cerrar el ciclo"]',
   'Mientras n sea mayor que 0 se imprime y se resta 1; al salir del ciclo se imprime el mensaje una sola vez.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: cuenta regresiva con while y luego "¡Despegue!"

    }
}$j$,
   '[{"entrada":"3","salida":"3\n2\n1\n¡Despegue!","visible":true},{"entrada":"5","salida":"5\n4\n3\n2\n1\n¡Despegue!","visible":false},{"entrada":"1","salida":"1\n¡Despegue!","visible":false}]',
   '["while"]',
   $e$[
    {"salida":"3\n¡Despegue!\n2\n¡Despegue!\n1\n¡Despegue!","mensaje":"El ¡Despegue! salió en cada vuelta. Recuerda que todo lo que está dentro de las llaves del while se repite: el mensaje va DESPUÉS de cerrar el ciclo."},
    {"salida":"3\n2\n1\n0\n¡Despegue!","mensaje":"Sobra el 0. Recuerda que la condición debe ser n > 0: con n >= 0 el ciclo da una vuelta más cuando n vale 0."}
   ]$e$, 4),
  (3, 'Contar dígitos', $t$¿Cuántos dígitos tiene un número? Lee un número entero positivo y usa un ciclo while para contarlos: en cada vuelta quita el último dígito con n = n / 10 y suma 1 a un contador, hasta que n llegue a 0. Imprime solo la cantidad.

Ejemplo: si la entrada es 4096, la salida es 4$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int contador = 0;
        while (n > 0) {
            n = n / 10;
            contador++;
        }
        System.out.println(contador);
    }
}$j$,
   '["Declara un contador en 0 antes del ciclo","Dentro del while: n = n / 10; y contador++;","Repite mientras n > 0 e imprime el contador al final"]',
   'Cada división entre 10 quita un dígito (4096 → 409 → 40 → 4 → 0), así que el contador termina en la cantidad de dígitos.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: cuenta los dígitos de n con un ciclo while

    }
}$j$,
   '[{"entrada":"4096","salida":"4","visible":true},{"entrada":"7","salida":"1","visible":false},{"entrada":"100000","salida":"6","visible":false}]',
   '["while"]',
   $e$[
    {"patron":"while\\s*\\(\\s*n\\s*>=\\s*0\\s*\\)","mensaje":"Recuerda que 0 / 10 sigue siendo 0: con n >= 0 la condición nunca se vuelve falsa y el ciclo no termina. Usa n > 0."},
    {"patron":"\\bn\\s*=\\s*n\\s*%\\s*10","mensaje":"Recuerda que n % 10 te da el último dígito, pero no lo quita. Para quitarlo se usa n = n / 10; con n = n % 10, n nunca llega a 0."},
    {"salida":"0","mensaje":"El contador quedó en 0. Recuerda sumar 1 al contador (contador++;) DENTRO del ciclo."},
    {"salida":"4096","mensaje":"Imprimiste el número, no la cantidad de dígitos. Recuerda imprimir el contador, después del ciclo."},
    {"salida":"3","mensaje":"Te faltó contar un dígito. Recuerda que el ciclo debe seguir mientras n > 0: el último dígito también cuenta."}
   ]$e$, 5),
  (3, 'Suma de dígitos', $t$Lee un número entero positivo y usa un ciclo while para calcular la suma de sus dígitos. Imprime solo el resultado.

Ejemplo: para 1234 imprime 10 (porque 1 + 2 + 3 + 4 = 10).$t$, 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int suma = 0;
        while (n > 0) {
            suma += n % 10;
            n = n / 10;
        }
        System.out.println(suma);
    }
}$j$,
   '["n % 10 te da el último dígito (1234 % 10 = 4)","n / 10 quita el último dígito (1234 / 10 = 123)","Acumula: suma += n % 10; y repite mientras n > 0"]',
   'En cada vuelta se suma el último dígito (n % 10) y se elimina (n / 10), hasta que no quedan dígitos.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: suma los dígitos de n con un ciclo while

    }
}$j$,
   '[{"entrada":"1234","salida":"10","visible":true},{"entrada":"9","salida":"9","visible":false},{"entrada":"1005","salida":"6","visible":false}]',
   '["while"]',
   $e$[
    {"patron":"while\\s*\\(\\s*n\\s*>=\\s*0\\s*\\)","mensaje":"Recuerda que 0 / 10 sigue siendo 0: con n >= 0 la condición nunca se vuelve falsa y el ciclo no termina. Usa n > 0."},
    {"patron":"\\bn\\s*=\\s*n\\s*%\\s*10","mensaje":"Recuerda que n % 10 te da el último dígito, pero no lo quita. Para quitarlo se usa n = n / 10; con n = n % 10, n nunca llega a 0."},
    {"salida":"1","mensaje":"Solo quedó un dígito: parece que escribes suma = n % 10, que REEMPLAZA el valor. Recuerda acumular con suma += n % 10."},
    {"salida":"0","mensaje":"La suma quedó en 0. Recuerda sumar el último dígito (suma += n % 10;) DENTRO del ciclo, antes de quitarlo."}
   ]$e$, 6),

  -- =========================== Módulo 4 · do-while ===========================
  (4, 'Diferencia clave', '¿Cuál es la diferencia principal entre while y do-while?', 'seleccion', 'facil', 30,
   '["do-while se ejecuta al menos una vez","do-while es más rápido","while no usa condición","No hay diferencia"]',
   'do-while se ejecuta al menos una vez',
   '["Mira DÓNDE se revisa la condición en cada uno."]',
   'En do-while la condición se revisa al final, así que el cuerpo corre al menos una vez.', null, null, null,
   $e$[
    {"respuesta":"do-while es más rápido","mensaje":"Los dos son igual de rápidos. Recuerda que la diferencia está en CUÁNDO se revisa la condición: do-while la revisa al final."},
    {"respuesta":"while no usa condición","mensaje":"Ambos usan condición. Recuerda que while la revisa ANTES de cada vuelta y do-while DESPUÉS."},
    {"respuesta":"No hay diferencia","mensaje":"Sí la hay: do-while siempre da al menos una vuelta, porque revisa la condición al final. Un while con la condición falsa no da ninguna."}
   ]$e$, 1),
  (4, 'Una sola vuelta', $t$¿Qué imprime este código? (Si crees que no imprime nada, escribe: nada)

int x = 10;
do {
    System.out.println(x);
    x++;
} while (x < 10);$t$, 'salida', 'media', 60,
   null, '10',
   '["En do-while la condición se revisa DESPUÉS de imprimir.","Después de la primera vuelta, ¿cuánto vale x? ¿Se cumple x < 10?"]',
   'Imprime 10 una vez; luego x vale 11 y la condición 11 < 10 es falsa, así que el ciclo termina.', null, null, null,
   $e$[
    {"salida":"nada","mensaje":"Recuerda que en do-while el cuerpo se ejecuta ANTES de revisar la condición: aunque 10 < 10 sea falso, el 10 ya se imprimió una vez."},
    {"salida":"10\n11","mensaje":"Después de imprimir 10, x pasa a 11 y se revisa 11 < 10: es falso, así que el ciclo termina. Recuerda que solo hay una vuelta."},
    {"salida":"11","mensaje":"Recuerda el orden dentro del cuerpo: primero println(x) con x = 10 y después x++."}
   ]$e$, 2),
  (4, 'Cierre del do-while', $t$Completa el símbolo que falta al final de este do-while:

do {
    x++;
} while (x < 5)__$t$, 'respuesta_corta', 'facil', 30,
   null, ';|punto y coma',
   '["Es un signo de puntuación que termina instrucciones en Java."]',
   'La instrucción do-while termina con punto y coma: es el único ciclo que lo lleva al final.', null, null, null,
   $e$[
    {"respuesta":"}|llave","mensaje":"La llave } cierra el bloque do { }, pero después de while (condición) va otro símbolo. Recuerda: el do-while es el único ciclo que termina en punto y coma."},
    {"respuesta":")|parentesis|paréntesis","mensaje":"El paréntesis ya cierra la condición; después de él va el punto y coma."},
    {"respuesta":":|dos puntos|.|punto","mensaje":"¡Casi! Es punto y coma (;), el mismo signo que termina cada instrucción en Java."}
   ]$e$, 3),
  (4, 'Edad válida', $t$Un formulario pide la edad y no acepta valores menores o iguales a 0. Lee edades (una por línea) usando un ciclo do-while:
- por cada edad inválida (0 o negativa) imprime Edad inválida
- cuando llegue una edad válida (mayor que 0), sal del ciclo e imprime Edad registrada: seguida de la edad.

Ejemplo: si las entradas son -3, 0 y 15, la salida es
Edad inválida
Edad inválida
Edad registrada: 15$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int edad;
        do {
            edad = sc.nextInt();
            if (edad <= 0) {
                System.out.println("Edad inválida");
            }
        } while (edad <= 0);
        System.out.println("Edad registrada: " + edad);
    }
}$j$,
   '["Declara int edad; ANTES del do, para poder usarla en la condición del while","Dentro del do: lee la edad y, si es <= 0, imprime Edad inválida","El ciclo se repite mientras la edad sea inválida: while (edad <= 0);"]',
   'El do-while pide la edad al menos una vez y la vuelve a pedir mientras sea inválida: es el patrón típico de validación.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: pide edades con do-while hasta que llegue una mayor que 0

    }
}$j$,
   '[{"entrada":"-3\n0\n15","salida":"Edad inválida\nEdad inválida\nEdad registrada: 15","visible":true},{"entrada":"16","salida":"Edad registrada: 16","visible":false},{"entrada":"-1\n-20\n8","salida":"Edad inválida\nEdad inválida\nEdad registrada: 8","visible":false}]',
   '["do-while"]',
   $e$[
    {"patron":"while\\s*\\(\\s*edad\\s*>=?\\s*0\\s*\\)\\s*;","mensaje":"Recuerda que la condición del do-while dice cuándo REPETIR: hay que repetir mientras la edad sea inválida, es decir, while (edad <= 0);"},
    {"salida":"Edad inválida\nEdad inválida\nEdad inválida\nEdad registrada: 15","mensaje":"Imprimiste Edad inválida también para la edad válida. Recuerda que ese mensaje solo va cuando edad <= 0: ponlo dentro de un if."}
   ]$e$, 4),
  (4, 'Suma hasta cero', $t$Lee números enteros (uno por línea) hasta que llegue un 0. Usa un ciclo do-while y al final imprime la suma con este formato:
Total = suma

Ejemplo: si las entradas son 5, 3 y 0, la salida es Total = 8$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int numero;
        int suma = 0;
        do {
            numero = sc.nextInt();
            suma += numero;
        } while (numero != 0);
        System.out.println("Total = " + suma);
    }
}$j$,
   '["Declara int numero; y int suma = 0; antes del do","Dentro del do: lee un número y súmalo","La condición es while (numero != 0);"]',
   'El cuerpo lee y suma; la condición se revisa después, así que el 0 también se lee (y suma 0, que no cambia nada).',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: lee números con do-while hasta que llegue un 0

    }
}$j$,
   '[{"entrada":"5\n3\n0","salida":"Total = 8","visible":true},{"entrada":"0","salida":"Total = 0","visible":false},{"entrada":"10\n-4\n2\n0","salida":"Total = 8","visible":false}]',
   '["do-while"]',
   $e$[
    {"patron":"while\\s*\\(\\s*numero\\s*==\\s*0\\s*\\)","mensaje":"Recuerda que la condición dice cuándo REPETIR: hay que seguir leyendo mientras el número sea distinto de 0, es decir, while (numero != 0);"},
    {"salida":"Total = 0","mensaje":"La suma quedó en 0. Recuerda sumar cada número que lees (suma += numero;) DENTRO del do, y declarar suma = 0 ANTES del ciclo."},
    {"salida":"Total = 3","mensaje":"Solo quedó el último número: parece que escribes suma = numero, que REEMPLAZA el valor. Recuerda acumular con suma += numero."}
   ]$e$, 5),

  -- =========================== Módulo 5 · Ciclos combinados ===========================
  (5, 'Para qué sirve break', '¿Qué hace break dentro de un ciclo?', 'seleccion', 'facil', 30,
   '["Termina el ciclo inmediatamente","Salta a la siguiente vuelta","Reinicia el ciclo","Termina el programa"]',
   'Termina el ciclo inmediatamente',
   '["Piensa en la palabra \"romper\"."]',
   'break sale del ciclo en el que está y el programa sigue con lo que viene después del ciclo.', null, null, null,
   $e$[
    {"respuesta":"Salta a la siguiente vuelta","mensaje":"Eso lo hace continue. Recuerda: break ROMPE el ciclo y sale de él; continue solo salta la vuelta actual."},
    {"respuesta":"Reinicia el ciclo","mensaje":"Ninguna instrucción reinicia un ciclo. Recuerda que break sale del ciclo y el programa sigue con lo que está después."},
    {"respuesta":"Termina el programa","mensaje":"break solo sale del ciclo donde está; el programa continúa con la siguiente instrucción después del ciclo."}
   ]$e$, 1),
  (5, 'Para qué sirve continue', '¿Qué hace continue dentro de un ciclo?', 'seleccion', 'facil', 30,
   '["Termina el ciclo inmediatamente","Salta a la siguiente vuelta del ciclo","Repite la vuelta actual","Termina el programa"]',
   'Salta a la siguiente vuelta del ciclo',
   '["El ciclo continúa, pero esta vuelta no."]',
   'continue se salta el resto del cuerpo y pasa a la siguiente vuelta (en un for, primero hace la actualización).', null, null, null,
   $e$[
    {"respuesta":"Termina el ciclo inmediatamente","mensaje":"Eso lo hace break. Recuerda: continue NO sale del ciclo, solo se salta lo que falta de esta vuelta y pasa a la siguiente."},
    {"respuesta":"Repite la vuelta actual","mensaje":"No la repite: la salta. Recuerda que con continue el ciclo pasa a la SIGUIENTE vuelta (en un for, primero hace el i++)."},
    {"respuesta":"Termina el programa","mensaje":"continue no termina nada: el ciclo sigue con la siguiente vuelta."}
   ]$e$, 2),
  (5, 'Saltar los múltiplos de 3', $t$En un juego, los jugadores cuentan del 1 al n, pero deben quedarse callados en los múltiplos de 3. Lee n e imprime los números del 1 al n, uno por línea, saltando los múltiplos de 3. Usa continue para saltarlos.

Ejemplo: si la entrada es 7, la salida es
1
2
4
5
7$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0) {
                continue;
            }
            System.out.println(i);
        }
    }
}$j$,
   '["Recorre del 1 al n con un for","i % 3 == 0 indica que i es múltiplo de 3","El if con continue va ANTES del println"]',
   'Cuando i es múltiplo de 3, continue salta el println y el ciclo sigue con el siguiente número.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime del 1 al n saltando los múltiplos de 3 con continue

    }
}$j$,
   '[{"entrada":"7","salida":"1\n2\n4\n5\n7","visible":true},{"entrada":"10","salida":"1\n2\n4\n5\n7\n8\n10","visible":false},{"entrada":"2","salida":"1\n2","visible":false}]',
   '["for","continue"]',
   $e$[
    {"salida":"1\n2","mensaje":"El ciclo se detuvo en el primer múltiplo de 3. Recuerda que break TERMINA el ciclo completo; para saltar solo esa vuelta y seguir contando se usa continue."},
    {"salida":"3\n6","mensaje":"Esos son justo los que había que saltar. Recuerda que continue salta la vuelta cuando la condición se cumple: así se imprimen los que NO son múltiplos de 3."},
    {"salida":"1\n2\n3\n4\n5\n6\n7","mensaje":"No se saltó ningún número. Recuerda que el if con continue debe ir ANTES del println: si va después, el número ya se imprimió."}
   ]$e$, 3),
  (5, 'Primer múltiplo de 7', $t$Lee un número n y busca, contando desde n hacia arriba, el primer número que sea múltiplo de 7 (puede ser el mismo n). Imprime ese número. Usa break para detener el ciclo apenas lo encuentres.

Ejemplo: si la entrada es 10, la salida es 14$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = n; i <= n + 6; i++) {
            if (i % 7 == 0) {
                System.out.println(i);
                break;
            }
        }
    }
}$j$,
   '["Empieza a buscar desde n: for (int i = n; …)","i % 7 == 0 indica que i es múltiplo de 7","Al encontrarlo, imprímelo y usa break para salir"]',
   'Entre n y n + 6 siempre hay un múltiplo de 7. break detiene el ciclo en el primero que aparece.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: busca el primer múltiplo de 7 desde n y usa break

    }
}$j$,
   '[{"entrada":"10","salida":"14","visible":true},{"entrada":"21","salida":"21","visible":false},{"entrada":"1","salida":"7","visible":false}]',
   '["break"]',
   $e$[
    {"patron":"^(?![\\s\\S]*\\bbreak\\b)","mensaje":"Recuerda que sin break el ciclo sigue buscando después de encontrar el múltiplo. Apenas lo imprimas, escribe break; para salir del ciclo."},
    {"salida":"28","mensaje":"Recuerda que el número buscado puede ser el mismo n: si n ya es múltiplo de 7, la respuesta es n. Empieza a buscar desde n, no desde n + 1."}
   ]$e$, 4),
  (5, '¿Cuántos asteriscos?', $t$¿Qué imprime este código?

for (int fila = 1; fila <= 2; fila++) {
    for (int col = 1; col <= 3; col++) {
        System.out.print("*");
    }
    System.out.println();
}$t$, 'salida', 'media', 60,
   null, E'***\n***',
   '["Por cada vuelta del ciclo externo, el interno da TODAS sus vueltas.","print no salta de línea; println() sí."]',
   'El externo da 2 vueltas (filas) y en cada una el interno imprime 3 asteriscos seguidos; println() salta de línea al terminar cada fila.', null, null, null,
   $e$[
    {"salida":"*****","mensaje":"Recuerda que el ciclo interno da TODAS sus vueltas (3) por cada vuelta del externo (2): son 2 filas de 3 asteriscos."},
    {"salida":"**\n**\n**","mensaje":"Cambiaste filas por columnas: el ciclo externo (fila) da 2 vueltas y el interno (col) da 3. Cada fila tiene 3 asteriscos."},
    {"salida":"******","mensaje":"Recuerda que System.out.println() vacío, después del ciclo interno, salta de línea al terminar cada fila."},
    {"salida":"*\n*\n*\n*\n*\n*","mensaje":"Recuerda que print (sin ln) NO salta de línea: los 3 asteriscos de cada fila quedan juntos."}
   ]$e$, 5),
  (5, 'Rectángulo de asteriscos', $t$Lee dos números: primero la cantidad de filas y luego la de columnas. Imprime un rectángulo de asteriscos con esas medidas.

Ejemplo: si la entrada es 2 y 4, la salida es
****
****$t$, 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int filas = sc.nextInt();
        int columnas = sc.nextInt();
        for (int fila = 1; fila <= filas; fila++) {
            for (int col = 1; col <= columnas; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}$j$,
   '["Un ciclo externo para las filas y uno interno para las columnas","Dentro del interno usa print(\"*\") para quedarte en la misma línea","Después del ciclo interno, System.out.println(); salta a la siguiente fila"]',
   'El ciclo externo recorre las filas; en cada una, el interno imprime tantos asteriscos como columnas.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int filas = sc.nextInt();
        int columnas = sc.nextInt();
        // TODO: imprime el rectángulo con dos ciclos for anidados

    }
}$j$,
   '[{"entrada":"2\n4","salida":"****\n****","visible":true},{"entrada":"3\n1","salida":"*\n*\n*","visible":false},{"entrada":"1\n5","salida":"*****","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"**\n**\n**\n**","mensaje":"Cambiaste filas por columnas. Recuerda: el ciclo externo recorre las filas y el interno imprime los asteriscos de cada fila (las columnas)."},
    {"salida":"********","mensaje":"Todo quedó en una línea. Recuerda escribir System.out.println(); después del ciclo interno, para saltar de línea al terminar cada fila."}
   ]$e$, 6),
  (5, 'Triángulo de asteriscos', $t$Lee un número n e imprime un triángulo de n filas: la fila 1 tiene un asterisco, la fila 2 tiene dos, y así sucesivamente.

Ejemplo: si la entrada es 3, la salida es
*
**
***$t$, 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int fila = 1; fila <= n; fila++) {
            for (int col = 1; col <= fila; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}$j$,
   '["Es como el rectángulo, pero cada fila tiene distinta cantidad de asteriscos","La fila número 3 tiene 3 asteriscos: el ciclo interno llega hasta fila","for (int col = 1; col <= fila; col++)"]',
   'El ciclo externo recorre las filas y el interno imprime tantos asteriscos como el número de la fila.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime el triángulo de n filas

    }
}$j$,
   '[{"entrada":"3","salida":"*\n**\n***","visible":true},{"entrada":"5","salida":"*\n**\n***\n****\n*****","visible":false},{"entrada":"1","salida":"*","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"***\n***\n***","mensaje":"Te salió un cuadrado. Recuerda que en el triángulo cada fila tiene tantos asteriscos como su número: el ciclo interno debe llegar hasta fila (col <= fila), no hasta n."},
    {"salida":"*\n*\n*","mensaje":"Cada fila tiene un solo asterisco. Recuerda que el ciclo interno debe repetirse fila veces: for (int col = 1; col <= fila; col++)."}
   ]$e$, 7),
  (5, 'Cuadrícula de multiplicar', $t$Lee un número n e imprime una cuadrícula de n filas y n columnas: en la fila i y la columna j va el resultado de i * j. Separa los números con un espacio.

Ejemplo: si la entrada es 3, la salida es
1 2 3
2 4 6
3 6 9$t$, 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                System.out.print(i * j + " ");
            }
            System.out.println();
        }
    }
}$j$,
   '["Un ciclo para las filas (i) y otro dentro para las columnas (j)","Usa print para quedarte en la misma línea: System.out.print(i * j + \" \");","Los espacios al final de la línea no importan; el salto de línea sí"]',
   'El ciclo externo recorre filas y el interno columnas, imprimiendo i * j en cada casilla.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime la cuadrícula n x n

    }
}$j$,
   '[{"entrada":"3","salida":"1 2 3\n2 4 6\n3 6 9","visible":true},{"entrada":"4","salida":"1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"1 1 1\n2 2 2\n3 3 3","mensaje":"Imprimiste solo el número de fila. Recuerda que cada casilla es fila por columna: i * j."},
    {"patron":"print\\(\\s*i\\s*\\+\\s*j\\b","mensaje":"Recuerda que i + j SUMA; la cuadrícula de multiplicar necesita i * j."}
   ]$e$, 8)
) as e(modulo_orden, titulo, enunciado, tipo, dificultad, puntos, opciones, solucion, pistas, explicacion,
       codigo_inicial, casos, requiere, errores, orden)
join public.modulo m on m.orden = e.modulo_orden
on conflict (id_modulo, orden) do update
  set titulo = excluded.titulo, enunciado = excluded.enunciado, tipo = excluded.tipo,
      dificultad = excluded.dificultad, puntos = excluded.puntos, opciones = excluded.opciones,
      solucion_esperada = excluded.solucion_esperada, pistas = excluded.pistas,
      explicacion = excluded.explicacion, codigo_inicial = excluded.codigo_inicial,
      casos_prueba = excluded.casos_prueba, requiere = excluded.requiere,
      errores_comunes = excluded.errores_comunes;

-- ---------------------------------------------------------------------------
-- Desafíos
-- periodo: diario (rota cada día, hora de Bogotá) | semanal (rota cada lunes) | mini (siempre disponible).
-- Para programar uno a mano, darle disponible_desde/disponible_hasta: reemplaza a la rotación en esa ventana.
-- ---------------------------------------------------------------------------
insert into public.desafio
  (titulo, enunciado, tipo, dificultad, solucion_esperada, pistas, puntos_recompensa, periodo,
   minutos_estimados, codigo_inicial, casos_prueba, requiere, errores_comunes)
values
  -- Mini-retos
  ('Suma del 1 al 100', $t$¿Qué imprime este código?

int s = 0;
for (int i = 1; i <= 100; i++) {
    s += i;
}
System.out.println(s);$t$,
   'salida', 'media', '5050', '["Es la suma de los primeros 100 números.","Truco: 1 + 100 = 101, 2 + 99 = 101… y hay 50 parejas."]', 50, 'mini', 5, null, null, '[]',
   $e$[
    {"salida":"4950","mensaje":"Te faltó sumar el 100. Recuerda que i <= 100 incluye el 100: 4950 + 100 = 5050."},
    {"salida":"100","mensaje":"Recuerda que s += i va acumulando: s no termina valiendo el último i, sino la suma de todos."}
   ]$e$),
  ('Contar pares', $t$¿Qué imprime este código?

int c = 0;
for (int i = 0; i < 4; i++) {
    if (i % 2 == 0) c++;
}
System.out.println(c);$t$,
   'salida', 'media', '2', '["Escribe los valores de i: 0, 1, 2 y 3.","¿Cuáles de ellos son pares?"]', 50, 'mini', 5, null, null, '[]',
   $e$[
    {"salida":"1","mensaje":"Recuerda que el 0 también es par: 0 % 2 es 0. Entre 0 y 3 los pares son 0 y 2."},
    {"salida":"4","mensaje":"Recuerda que c++ está dentro del if: solo cuenta cuando i es par."},
    {"salida":"3","mensaje":"Recuerda que i < 4 no incluye el 4: i vale 0, 1, 2 y 3, y los pares son solo 0 y 2."}
   ]$e$),
  ('Factorial de 5', $t$¿Qué imprime este código?

int f = 1;
int n = 5;
while (n > 1) {
    f *= n;
    n--;
}
System.out.println(f);$t$,
   'salida', 'dificil', '120', '["f *= n es lo mismo que f = f * n.","Multiplica 5 · 4 · 3 · 2."]', 80, 'mini', 5, null, null, '[]',
   $e$[
    {"salida":"20","mensaje":"Recuerda que el ciclo sigue mientras n > 1: multiplica 5, 4, 3 y 2, no solo los dos primeros."},
    {"salida":"14","mensaje":"Recuerda que f *= n MULTIPLICA, no suma: 5 · 4 · 3 · 2 = 120."},
    {"salida":"15","mensaje":"Recuerda que f *= n MULTIPLICA, no suma: 5 · 4 · 3 · 2 · 1 = 120."},
    {"salida":"0","mensaje":"f empieza en 1, no en 0. Recuerda que para multiplicar el acumulador empieza en 1: si empezara en 0, todo daría 0."}
   ]$e$),
  ('Menú de opciones', $t$Construye un menú con un ciclo do-while. Lee números (uno por línea) hasta que llegue un 3:
- con 1 imprime Hola
- con 2 imprime Adiós
- con cualquier otro número distinto de 3 imprime Opción inválida
Al salir del ciclo imprime Fin.

Ejemplo: si las entradas son 1, 2 y 3, la salida es
Hola
Adiós
Fin$t$,
   'codigo', 'facil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int opcion;
        do {
            opcion = sc.nextInt();
            if (opcion == 1) {
                System.out.println("Hola");
            } else if (opcion == 2) {
                System.out.println("Adiós");
            } else if (opcion != 3) {
                System.out.println("Opción inválida");
            }
        } while (opcion != 3);
        System.out.println("Fin");
    }
}$j$,
   '["Declara int opcion; antes del do y léela dentro","Usa if / else if para cada opción; el 3 no imprime nada","La condición del while es opcion != 3"]',
   80, 'mini', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: menú con do-while hasta que llegue un 3

    }
}$j$,
   '[{"entrada":"1\n2\n3","salida":"Hola\nAdiós\nFin","visible":true},{"entrada":"5\n3","salida":"Opción inválida\nFin","visible":false},{"entrada":"3","salida":"Fin","visible":false}]',
   '["do-while"]',
   $e$[
    {"salida":"Hola\nAdiós\nOpción inválida\nFin","mensaje":"El 3 imprimió Opción inválida. Recuerda que el 3 es la opción para salir: el último else if debe excluirlo (opcion != 3)."},
    {"salida":"Hola\nAdiós","mensaje":"Falta Fin. Recuerda imprimirlo DESPUÉS de cerrar el do-while, para que salga una sola vez al terminar."}
   ]$e$),

  -- Retos diarios
  ('Números primos', $t$Lee un número n e imprime, uno por línea, todos los números primos desde 2 hasta n. Un número es primo si solo es divisible entre 1 y sí mismo (2, 3, 5, 7, 11…).

Tip: para cada número usa una variable boolean primo = true y cámbiala a false si encuentras algún divisor entre 2 y el número - 1.

Ejemplo: si la entrada es 10, la salida es
2
3
5
7$t$,
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 2; i <= n; i++) {
            boolean primo = true;
            for (int d = 2; d < i; d++) {
                if (i % d == 0) {
                    primo = false;
                    break;
                }
            }
            if (primo) {
                System.out.println(i);
            }
        }
    }
}$j$,
   '["Recorre los números de 2 a n con un for","Para cada uno, busca divisores entre 2 y el número - 1 con otro for","Si encuentras un divisor, no es primo: primo = false (y puedes usar break)"]',
   150, 'diario', 20,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime los primos desde 2 hasta n

    }
}$j$,
   '[{"entrada":"10","salida":"2\n3\n5\n7","visible":true},{"entrada":"20","salida":"2\n3\n5\n7\n11\n13\n17\n19","visible":false},{"entrada":"2","salida":"2","visible":false},{"entrada":"1","salida":"","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"2\n3","mensaje":"Después del 4 ya no salió ningún primo: la variable primo se quedó en false. Recuerda volver a ponerla en true al empezar a revisar CADA número (declárala dentro del ciclo externo)."},
    {"salida":"1\n2\n3\n5\n7","mensaje":"El 1 no es primo: un primo tiene exactamente dos divisores (1 y él mismo). Empieza a revisar desde el 2."},
    {"salida":"","mensaje":"No salió ningún primo. Recuerda buscar divisores solo hasta el número - 1 (d < i): todo número es divisible entre sí mismo."}
   ]$e$),
  ('FizzBuzz', $t$Lee un número n e imprime los números del 1 al n, uno por línea, pero:
- si es múltiplo de 3 y de 5 a la vez, imprime FizzBuzz
- si solo es múltiplo de 3, imprime Fizz
- si solo es múltiplo de 5, imprime Buzz

Ejemplo: si la entrada es 5, la salida es
1
2
Fizz
4
Buzz$t$,
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) {
                System.out.println("FizzBuzz");
            } else if (i % 3 == 0) {
                System.out.println("Fizz");
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
            } else {
                System.out.println(i);
            }
        }
    }
}$j$,
   '["Revisa PRIMERO el caso de 3 y 5 a la vez (i % 15 == 0)","i % 3 == 0 indica múltiplo de 3","Usa if / else if / else para que en cada vuelta se imprima una sola cosa"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: FizzBuzz del 1 al n

    }
}$j$,
   '[{"entrada":"5","salida":"1\n2\nFizz\n4\nBuzz","visible":true},{"entrada":"15","salida":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz","visible":false},{"entrada":"30","salida":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizz","mensaje":"El 15 imprimió Fizz en vez de FizzBuzz. Recuerda que if / else if se detiene en la PRIMERA condición verdadera: revisa primero el caso de 3 y 5 a la vez (i % 15 == 0)."}
   ]$e$),
  ('Potencias de 2', $t$Lee un número n e imprime las potencias de 2 desde 2^0 hasta 2^n con este formato:
2^i = valor

No uses Math.pow: calcula cada potencia multiplicando por 2 dentro del ciclo.

Ejemplo: si la entrada es 3, la salida es
2^0 = 1
2^1 = 2
2^2 = 4
2^3 = 8$t$,
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int potencia = 1;
        for (int i = 0; i <= n; i++) {
            System.out.println("2^" + i + " = " + potencia);
            potencia *= 2;
        }
    }
}$j$,
   '["Empieza con int potencia = 1; (2^0 es 1)","En cada vuelta: primero imprime y DESPUÉS multiplica por 2","El ciclo va de 0 a n, incluido"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime 2^0 hasta 2^n

    }
}$j$,
   '[{"entrada":"3","salida":"2^0 = 1\n2^1 = 2\n2^2 = 4\n2^3 = 8","visible":true},{"entrada":"0","salida":"2^0 = 1","visible":false},{"entrada":"10","salida":"2^0 = 1\n2^1 = 2\n2^2 = 4\n2^3 = 8\n2^4 = 16\n2^5 = 32\n2^6 = 64\n2^7 = 128\n2^8 = 256\n2^9 = 512\n2^10 = 1024","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"2^0 = 2\n2^1 = 4\n2^2 = 8\n2^3 = 16","mensaje":"Multiplicaste antes de imprimir. Recuerda que 2^0 = 1: primero imprime la potencia y DESPUÉS multiplica por 2."},
    {"salida":"2^0 = 0\n2^1 = 0\n2^2 = 0\n2^3 = 0","mensaje":"Recuerda que para multiplicar, el acumulador empieza en 1, no en 0: 0 por cualquier número es 0."}
   ]$e$),
  ('Invertir un número', $t$Lee un número entero positivo e imprímelo con sus dígitos al revés, usando un ciclo while.
Por ejemplo, 1234 se convierte en 4321, y 1200 en 21 (los ceros de adelante no se escriben).$t$,
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int invertido = 0;
        while (n > 0) {
            invertido = invertido * 10 + n % 10;
            n = n / 10;
        }
        System.out.println(invertido);
    }
}$j$,
   '["n % 10 te da el último dígito","invertido = invertido * 10 + digito lo pone al final del número nuevo","n / 10 quita el último dígito"]',
   150, 'diario', 20,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: invierte los dígitos de n con while

    }
}$j$,
   '[{"entrada":"1234","salida":"4321","visible":true},{"entrada":"1200","salida":"21","visible":false},{"entrada":"7","salida":"7","visible":false}]',
   '["while"]',
   $e$[
    {"salida":"0021","mensaje":"Imprimiste los dígitos uno por uno, así que los ceros del final quedaron adelante. Recuerda construir el número: invertido = invertido * 10 + n % 10, e imprimirlo al final."},
    {"patron":"\\bn\\s*=\\s*n\\s*%\\s*10","mensaje":"Recuerda que n % 10 te da el último dígito, pero no lo quita. Para quitarlo se usa n = n / 10."}
   ]$e$),
  ('Contar vocales', $t$Lee una línea de texto y cuenta cuántas vocales tiene (a, e, i, o, u, en mayúscula o minúscula). Imprime solo el número.

Herramientas que necesitas:
- sc.nextLine() lee la línea completa
- texto.length() dice cuántos caracteres tiene
- texto.charAt(i) da el carácter en la posición i (la primera es la 0)
- texto.toLowerCase() convierte todo a minúsculas

Ejemplo: para Hola Mundo imprime 4$t$,
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String texto = sc.nextLine().toLowerCase();
        int vocales = 0;
        for (int i = 0; i < texto.length(); i++) {
            char c = texto.charAt(i);
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
                vocales++;
            }
        }
        System.out.println(vocales);
    }
}$j$,
   '["Convierte el texto a minúsculas con toLowerCase() para no revisar mayúsculas","Recorre el texto con for (int i = 0; i < texto.length(); i++)","Compara texto.charAt(i) con cada vocal usando ||"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String texto = sc.nextLine();
        // TODO: cuenta las vocales del texto

    }
}$j$,
   '[{"entrada":"Hola Mundo","salida":"4","visible":true},{"entrada":"Programacion en Java","salida":"8","visible":false},{"entrada":"xyz","salida":"0","visible":false},{"entrada":"AEIOU aeiou","salida":"10","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"5","mensaje":"Parece que contaste solo las minúsculas. Recuerda que texto.toLowerCase() convierte todo a minúsculas antes de revisar."},
    {"patron":"i\\s*<=\\s*texto\\.length\\(\\)","mensaje":"Recuerda que las posiciones van de 0 a length() - 1: el ciclo debe usar i < texto.length(), no <=."}
   ]$e$),

  -- Retos semanales
  ('Adivina el número', $t$Simula un juego de adivinanza. Primero lee el número secreto; luego lee intentos (uno por línea) hasta que el jugador acierte. Por cada intento imprime:
- Mayor si el secreto es mayor que el intento
- Menor si el secreto es menor que el intento
- ¡Correcto! cuando acierta
Al final imprime Intentos: seguido de cuántos intentos hizo.

Ejemplo: si las entradas son 50, 25, 75 y 50 (el secreto es 50), la salida es
Mayor
Menor
¡Correcto!
Intentos: 3$t$,
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int secreto = sc.nextInt();
        int intento;
        int intentos = 0;
        do {
            intento = sc.nextInt();
            intentos++;
            if (secreto > intento) {
                System.out.println("Mayor");
            } else if (secreto < intento) {
                System.out.println("Menor");
            } else {
                System.out.println("¡Correcto!");
            }
        } while (intento != secreto);
        System.out.println("Intentos: " + intentos);
    }
}$j$,
   '["Lee el secreto ANTES del ciclo; los intentos se leen dentro","Un do-while encaja perfecto: siempre hay al menos un intento","Cuenta cada intento con un contador y repite mientras intento != secreto"]',
   400, 'semanal', 45,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int secreto = sc.nextInt();
        // TODO: lee intentos hasta acertar

    }
}$j$,
   '[{"entrada":"50\n25\n75\n50","salida":"Mayor\nMenor\n¡Correcto!\nIntentos: 3","visible":true},{"entrada":"7\n7","salida":"¡Correcto!\nIntentos: 1","visible":false},{"entrada":"10\n1\n2\n3\n10","salida":"Mayor\nMayor\nMayor\n¡Correcto!\nIntentos: 4","visible":false}]',
   '["while"]',
   $e$[
    {"salida":"Menor\nMayor\n¡Correcto!\nIntentos: 3","mensaje":"Invertiste Mayor y Menor. Recuerda: si el secreto es MAYOR que el intento, la pista es Mayor (el jugador debe subir)."},
    {"salida":"Mayor\nMenor\n¡Correcto!\nIntentos: 4","mensaje":"Contaste un intento de más. Recuerda empezar el contador en 0 y sumar 1 por cada número que el jugador dice."},
    {"salida":"Mayor\nMenor\n¡Correcto!","mensaje":"Falta la línea final. Recuerda imprimir Intentos: después de cerrar el ciclo."}
   ]$e$),
  ('Pirámide centrada', $t$Lee un número n e imprime una pirámide centrada de n filas hecha con asteriscos. La fila número f tiene (n - f) espacios a la izquierda y (2·f - 1) asteriscos.

Ejemplo: si la entrada es 3, la salida es
  *
 ***
*****$t$,
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int fila = 1; fila <= n; fila++) {
            for (int e = 1; e <= n - fila; e++) {
                System.out.print(" ");
            }
            for (int a = 1; a <= 2 * fila - 1; a++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}$j$,
   '["Un ciclo para las filas","Dentro, primero un ciclo que imprime los espacios y después otro que imprime los asteriscos","Los espacios de la izquierda sí cuentan; al final de cada fila va println()"]',
   400, 'semanal', 40,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: pirámide centrada de n filas

    }
}$j$,
   '[{"entrada":"3","salida":"  *\n ***\n*****","visible":true},{"entrada":"1","salida":"*","visible":false},{"entrada":"4","salida":"   *\n  ***\n *****\n*******","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"*\n***\n*****","mensaje":"Faltan los espacios de la izquierda. Recuerda que antes de los asteriscos de cada fila van (n - fila) espacios, impresos con System.out.print(\" \")."},
    {"salida":"  *\n **\n***","mensaje":"Cada fila tiene un asterisco de más que la anterior, pero deben ser dos. Recuerda que la fila f tiene 2·f - 1 asteriscos: 1, 3, 5…"}
   ]$e$),
  ('Números perfectos', $t$Un número es perfecto si es igual a la suma de sus divisores menores que él. Por ejemplo, 6 es perfecto porque 1 + 2 + 3 = 6.
Lee un número n e imprime, uno por línea, todos los números perfectos desde 2 hasta n.

Ejemplo: si la entrada es 30, la salida es
6
28$t$,
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 2; i <= n; i++) {
            int suma = 0;
            for (int d = 1; d < i; d++) {
                if (i % d == 0) {
                    suma += d;
                }
            }
            if (suma == i) {
                System.out.println(i);
            }
        }
    }
}$j$,
   '["Recorre los números de 2 a n","Para cada uno, suma sus divisores menores que él con otro ciclo (d < i)","La suma vuelve a 0 para cada número: declárala dentro del ciclo externo"]',
   400, 'semanal', 40,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime los números perfectos hasta n

    }
}$j$,
   '[{"entrada":"30","salida":"6\n28","visible":true},{"entrada":"500","salida":"6\n28\n496","visible":false},{"entrada":"5","salida":"","visible":false}]',
   '["for"]',
   $e$[
    {"salida":"","mensaje":"No salió ningún número. Recuerda sumar solo los divisores MENORES que el número (d < i): si incluyes el número mismo, la suma siempre se pasa."},
    {"salida":"6","mensaje":"Solo salió el 6: parece que la suma no vuelve a 0 para cada número. Recuerda declarar int suma = 0; dentro del ciclo externo, antes del ciclo de divisores."}
   ]$e$)
on conflict (titulo) do update
  set enunciado = excluded.enunciado, tipo = excluded.tipo, dificultad = excluded.dificultad,
      solucion_esperada = excluded.solucion_esperada, pistas = excluded.pistas,
      puntos_recompensa = excluded.puntos_recompensa, periodo = excluded.periodo,
      minutos_estimados = excluded.minutos_estimados, codigo_inicial = excluded.codigo_inicial,
      casos_prueba = excluded.casos_prueba, requiere = excluded.requiere,
      errores_comunes = excluded.errores_comunes;

-- ---------------------------------------------------------------------------
-- Logros
-- ---------------------------------------------------------------------------
insert into public.logro (codigo, nombre, descripcion, tipo_criterio, valor_requerido, icono) values
  ('primer_paso',    'Primer ciclo',      'Completa tu primer ejercicio.',         'ejercicios_completados', 1,   '🏅'),
  ('constante',      '10 ejercicios',     'Resuelve 10 ejercicios.',               'ejercicios_completados', 10,  '🎯'),
  ('modulo_uno',     'Módulo superado',   'Termina tu primer módulo.',             'modulos_completados',    1,   '🧩'),
  ('maestro_ciclos', 'Maestro de ciclos', 'Termina los 5 módulos.',                'modulos_completados',    5,   '🏆'),
  ('cien_puntos',    'Cien puntos',       'Alcanza 100 puntos.',                   'puntos',                 100, '⚡'),
  ('trescientos',    'En marcha',         'Alcanza 300 puntos.',                   'puntos',                 300, '💪'),
  ('retador',        'Retador',           'Supera tu primer desafío.',             'desafios_completados',   1,   '🚀'),
  ('racha_7',        'Racha 7 días',      '7 días consecutivos practicando.',      'racha_dias',             7,   '🔥'),
  ('racha_30',       'Racha 30 días',     '30 días consecutivos practicando.',     'racha_dias',             30,  '☄️'),
  ('perfeccion',     'Perfección',        'Resuelve 5 ejercicios al primer intento.', 'ejercicios_perfectos', 5,   '🌟'),
  ('nivel_5',        'Nivel 5',           'Alcanza el nivel 5.',                   'nivel',                  5,   '🎓'),
  ('top_3',          'Top 3',             'Entra al top 3 del ranking.',           'top_ranking',            3,   '👑')
on conflict (codigo) do update
  set nombre = excluded.nombre, descripcion = excluded.descripcion, tipo_criterio = excluded.tipo_criterio,
      valor_requerido = excluded.valor_requerido, icono = excluded.icono;
