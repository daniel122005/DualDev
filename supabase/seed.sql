-- DUALDEV · Datos iniciales del catálogo (niveles, módulos, lecciones, ejercicios, desafíos, logros).
-- Requiere las migraciones 0001 a 0004. Es idempotente y AUTORITATIVO para el catálogo:
-- volver a ejecutarlo actualiza los textos/puntos sin duplicar filas ni tocar datos de estudiantes.

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
  ('Introducción a ciclos', 'Entiende qué es un ciclo y para qué sirve en programación.', 1, 'basico'),
  ('Ciclo for', 'Domina el ciclo for: contadores, rangos y acumuladores.', 2, 'basico'),
  ('Ciclo while', 'Aprende cuándo y cómo usar while para repetir mientras se cumpla una condición.', 3, 'intermedio'),
  ('Ciclo do-while', 'Ciclos que siempre se ejecutan al menos una vez.', 4, 'intermedio'),
  ('Ciclos combinados', 'Combina ciclos, break, continue y ciclos anidados.', 5, 'avanzado')
on conflict (orden) do update
  set titulo = excluded.titulo, descripcion = excluded.descripcion, dificultad = excluded.dificultad;

-- ---------------------------------------------------------------------------
-- Lecciones (contenido)
-- ---------------------------------------------------------------------------
insert into public.contenido
  (id_modulo, titulo, explicacion, codigo_ejemplo, salida_ejemplo, tip, minutos_estimados, puntos, orden)
select m.id_modulo, c.titulo, c.explicacion, c.codigo, c.salida, c.tip, c.minutos, 50, c.orden
from (values
  (1, '¿Por qué necesitamos ciclos?',
   $t$Imagina que quieres imprimir "Hola" cinco veces. Podrías escribir cinco líneas iguales, pero ¿y si fueran mil? Un ciclo (o bucle) te permite repetir un bloque de instrucciones sin copiarlas. Cada repetición se llama iteración.$t$,
   $j$// Sin ciclo: hay que repetir la línea
System.out.println("Hola");
System.out.println("Hola");
System.out.println("Hola");

// Con ciclo: se escribe una sola vez
for (int i = 0; i < 3; i++) {
    System.out.println("Hola");
}$j$,
   E'Hola\nHola\nHola\nHola\nHola\nHola',
   'Si te encuentras copiando y pegando la misma línea muchas veces, probablemente necesitas un ciclo.', 5, 1),
  (1, 'Partes de un ciclo',
   $t$Todo ciclo tiene cuatro partes: la inicialización (dónde empieza la variable de control), la condición (mientras sea verdadera, se repite), el cuerpo (lo que se repite) y la actualización (cómo cambia la variable en cada vuelta). Si la actualización falta, la condición nunca cambia y el ciclo no termina.$t$,
   $j$int i = 1;            // inicialización
while (i <= 3) {      // condición
    System.out.println(i); // cuerpo
    i++;              // actualización
}$j$,
   E'1\n2\n3',
   'Antes de escribir un ciclo, piensa: ¿desde dónde empiezo, hasta cuándo repito y cómo avanzo?', 6, 2),
  (1, 'Los tres ciclos de Java',
   $t$Java tiene tres ciclos principales: for (cuando sabes cuántas veces repetir), while (repite mientras una condición sea verdadera) y do-while (como while, pero se ejecuta al menos una vez). Los tres pueden resolver los mismos problemas; elegir bien hace el código más claro.$t$,
   $j$for (int i = 1; i <= 3; i++) { System.out.println("for " + i); }

int j = 1;
while (j <= 3) { System.out.println("while " + j); j++; }

int k = 1;
do { System.out.println("do-while " + k); k++; } while (k <= 3);$j$,
   E'for 1\nfor 2\nfor 3\nwhile 1\nwhile 2\nwhile 3\ndo-while 1\ndo-while 2\ndo-while 3',
   null, 6, 3),

  (2, 'Estructura del for',
   $t$El for reúne las tres partes del ciclo en una sola línea: for (inicio; condición; incremento). El inicio se ejecuta una sola vez; la condición se revisa antes de cada vuelta; el incremento se ejecuta al final de cada vuelta.$t$,
   $j$public class ContadorFor {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Número: " + i);
        }
        System.out.println("¡Ciclo terminado!");
    }
}$j$,
   E'Número: 1\nNúmero: 2\nNúmero: 3\nNúmero: 4\nNúmero: 5\n¡Ciclo terminado!',
   'El nombre i es convencional y viene de "índice". Puedes llamarla como quieras.', 8, 1),
  (2, 'Contar hacia atrás y de a dos',
   $t$Cambiando el inicio, la condición y el incremento puedes contar hacia atrás (i--) o saltar de a varios (i += 2). La condición debe ser coherente con la dirección: si bajas, la condición suele usar >= o >.$t$,
   $j$for (int i = 10; i >= 0; i -= 2) {
    System.out.println(i);
}$j$,
   E'10\n8\n6\n4\n2\n0',
   'Si cuentas hacia atrás con i++ en vez de i--, la condición nunca se vuelve falsa: ciclo infinito.', 7, 2),
  (2, 'Acumuladores',
   $t$Un acumulador es una variable que guarda un resultado que crece en cada vuelta, por ejemplo una suma. Se declara ANTES del ciclo con un valor inicial (0 para sumar, 1 para multiplicar) y se actualiza DENTRO del ciclo.$t$,
   $j$int suma = 0;
for (int i = 1; i <= 10; i++) {
    suma += i;   // igual a: suma = suma + i;
}
System.out.println("Suma = " + suma);$j$,
   'Suma = 55',
   'Si declaras el acumulador dentro del ciclo, se reinicia en cada vuelta y nunca acumula.', 8, 3),

  (3, 'Estructura del while',
   $t$El while evalúa la condición ANTES de cada vuelta. Si desde el principio es falsa, el cuerpo nunca se ejecuta. Es ideal cuando no sabes cuántas veces vas a repetir, por ejemplo al leer datos hasta que se cumpla algo.$t$,
   $j$int n = 3;
while (n > 0) {
    System.out.println(n);
    n--;
}$j$,
   E'3\n2\n1',
   null, 7, 1),
  (3, 'Ciclos infinitos',
   $t$Si la condición nunca se vuelve falsa, el ciclo no termina. El error más común es olvidar actualizar la variable de control dentro del cuerpo. En DualDev, si tu programa tarda demasiado, se detiene y te avisamos de un posible ciclo infinito.$t$,
   $j$int n = 3;
while (n > 0) {
    System.out.println(n);
    // falta n--; -> n siempre vale 3
}$j$,
   null,
   'Pregúntate siempre: ¿qué línea dentro del ciclo hace que la condición termine siendo falsa?', 6, 2),
  (3, 'while vs for',
   $t$Usa for cuando conoces de antemano cuántas vueltas darás (contar de 1 a 10). Usa while cuando la cantidad depende de algo que ocurre durante el ciclo (quitar dígitos a un número hasta que llegue a 0).$t$,
   $j$int numero = 4096;
int digitos = 0;
while (numero > 0) {
    numero = numero / 10;
    digitos++;
}
System.out.println("Dígitos: " + digitos);$j$,
   'Dígitos: 4',
   null, 7, 3),

  (4, 'Estructura del do-while',
   $t$El do-while evalúa la condición DESPUÉS de ejecutar el cuerpo, por lo que siempre se ejecuta al menos una vez. Termina con punto y coma después del while (...).$t$,
   $j$int x = 10;
do {
    System.out.println(x);
    x++;
} while (x < 10);$j$,
   '10',
   'Aunque la condición sea falsa desde el inicio, el cuerpo se ejecuta una vez.', 7, 1),
  (4, 'Cuándo usar do-while',
   $t$El do-while es perfecto para menús y validaciones: primero muestras o pides algo, y luego decides si repetir. Por ejemplo, pedir números hasta que el usuario escriba 0.$t$,
   $j$Scanner sc = new Scanner(System.in);
int numero;
int suma = 0;
do {
    numero = sc.nextInt();
    suma += numero;
} while (numero != 0);
System.out.println("Total = " + suma);$j$,
   'Total = 8',
   'La salida de ejemplo corresponde a la entrada 5, 3 y 0.', 8, 2),

  (5, 'break y continue',
   $t$break termina el ciclo inmediatamente. continue salta el resto del cuerpo y pasa a la siguiente vuelta. Úsalos con cuidado: hacen que el flujo sea más difícil de seguir si se abusa de ellos.$t$,
   $j$for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue; // salta los pares
    if (i > 7) break;         // corta al pasar de 7
    System.out.println(i);
}$j$,
   E'1\n3\n5\n7',
   null, 8, 1),
  (5, 'Ciclos anidados',
   $t$Un ciclo puede ir dentro de otro. Por cada vuelta del ciclo externo, el interno da todas sus vueltas. Es útil para tablas, cuadrículas y figuras con asteriscos.$t$,
   $j$for (int fila = 1; fila <= 3; fila++) {
    for (int col = 1; col <= fila; col++) {
        System.out.print("*");
    }
    System.out.println();
}$j$,
   E'*\n**\n***',
   'Usa nombres claros (fila, col) en vez de i y j cuando anides ciclos.', 9, 2)
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
-- ---------------------------------------------------------------------------
insert into public.ejercicio
  (id_modulo, titulo, enunciado, tipo, dificultad, puntos, opciones, solucion_esperada,
   pistas, explicacion, codigo_inicial, casos_prueba, requiere, orden)
select m.id_modulo, e.titulo, e.enunciado, e.tipo, e.dificultad, e.puntos, e.opciones::jsonb, e.solucion,
       e.pistas::jsonb, e.explicacion, e.codigo_inicial, e.casos::jsonb, coalesce(e.requiere, '[]')::jsonb, e.orden
from (values
  -- Módulo 1 · Introducción
  (1, 'Qué es un ciclo', '¿Qué hace un ciclo en un programa?', 'seleccion', 'facil', 30,
   '["Repite un bloque de instrucciones","Guarda datos en disco","Declara una clase","Detiene el programa"]',
   'Repite un bloque de instrucciones', '["Piensa en la palabra \"repetir\"."]',
   'Un ciclo ejecuta varias veces el mismo bloque de instrucciones.', null, null, null, 1),
  (1, 'Ciclo que no existe', '¿Cuál de estos NO es un ciclo en Java?', 'seleccion', 'facil', 30,
   '["for","while","do-while","repeat-until"]',
   'repeat-until', '["Java tiene exactamente tres ciclos."]',
   'Java no tiene repeat-until; sus ciclos son for, while y do-while.', null, null, null, 2),
  (1, 'Nombre de cada repetición', '¿Cómo se llama cada repetición del cuerpo de un ciclo?', 'respuesta_corta', 'facil', 30,
   null, 'iteración|iteracion', '["Empieza con \"i\"."]',
   'Cada vuelta del ciclo se llama iteración.', null, null, null, 3),

  -- Módulo 2 · for
  (2, 'Imprimir de 1 a 3', E'¿Qué imprime este código?\n\nfor (int i = 1; i <= 3; i++) {\n    System.out.println(i);\n}', 'salida', 'facil', 30,
   null, E'1\n2\n3', '["La variable i empieza en 1 y sube de uno en uno."]',
   'i vale 1, 2 y 3; cuando vale 4 la condición i <= 3 es falsa.', null, null, null, 1),
  (2, 'Cuántas vueltas', '¿Cuántas veces se ejecuta el cuerpo de for (int i = 0; i < 5; i++)?', 'seleccion', 'facil', 30,
   '["4","5","6","Infinitas"]',
   '5', '["Cuenta los valores de i: 0, 1, 2..."]',
   'i toma los valores 0, 1, 2, 3 y 4: son 5 iteraciones.', null, null, null, 2),
  (2, 'Completa la condición', 'Para imprimir del 1 al 10 con for (int i = 1; ___; i++), ¿qué va en el espacio? Escribe la condición.', 'respuesta_corta', 'media', 60,
   null, 'i <= 10|i<=10|i < 11|i<11', '["Debe incluir el 10."]',
   'Con i <= 10 el ciclo incluye el 10; i < 11 es equivalente.', null, null, null, 3),
  (2, 'Contar del 1 al 5', 'Escribe un programa que use un ciclo for para imprimir los números del 1 al 5, uno por línea.', 'codigo', 'facil', 30,
   null,
   $j$public class Ejercicio {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println(i);
        }
    }
}$j$,
   '["Empieza en 1","La condición debe incluir el 5","Usa println para un número por línea"]',
   'El for va de 1 a 5 (i <= 5) e imprime i en cada vuelta.',
   $j$public class Ejercicio {
    public static void main(String[] args) {
        // TODO: imprime los números del 1 al 5 con un ciclo for

    }
}$j$,
   '[{"entrada":"","salida":"1\n2\n3\n4\n5","visible":true}]', '["for"]', 4),
  (2, 'Suma de números', 'Escribe un programa que use un ciclo for para sumar todos los números del 1 al 10 y muestre el resultado así: Suma = 55', 'codigo', 'facil', 40,
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
   '["Usa una variable acumuladora","Inicializa suma = 0","Ciclo del 1 al 10","Suma en cada vuelta"]',
   'El acumulador suma empieza en 0 y en cada vuelta se le agrega i.',
   $j$public class Ejercicio {
    public static void main(String[] args) {
        // TODO: Escribe un ciclo for que sume
        // todos los números del 1 al 10.

    }
}$j$,
   '[{"entrada":"","salida":"Suma = 55","visible":true}]', '["for"]', 5),
  (2, 'Tabla de multiplicar', E'Lee un número n y muestra su tabla de multiplicar del 1 al 10 con el formato:\nn x i = resultado\n\nEjemplo con n = 3: la primera línea es 3 x 1 = 3', 'codigo', 'media', 60,
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
   '["Lee n con Scanner","El ciclo va de 1 a 10","Cuidado con los espacios del formato"]',
   'El ciclo recorre i de 1 a 10 e imprime n * i en cada vuelta.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: imprime la tabla de n del 1 al 10

    }
}$j$,
   '[{"entrada":"3","salida":"3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30","visible":true},{"entrada":"7","salida":"7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70","visible":false}]',
   '["for"]', 6),
  (2, 'Números pares', 'Lee un número n y muestra todos los números pares desde 2 hasta n (incluido si es par), uno por línea.', 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 2; i <= n; i += 2) {
            System.out.println(i);
        }
    }
}$j$,
   '["Puedes empezar en 2 y sumar de a 2","O recorrer todos y usar i % 2 == 0","Si n es menor que 2 no se imprime nada"]',
   'Empezando en 2 y avanzando de a 2 solo se visitan los pares.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime los pares desde 2 hasta n

    }
}$j$,
   '[{"entrada":"10","salida":"2\n4\n6\n8\n10","visible":true},{"entrada":"7","salida":"2\n4\n6","visible":false},{"entrada":"1","salida":"","visible":false}]',
   '["for"]', 7),
  (2, 'Triángulo de asteriscos', E'Lee un número n e imprime un triángulo de n filas: la fila 1 tiene un asterisco, la fila 2 tiene dos, y así sucesivamente.\n\nEjemplo con n = 3:\n*\n**\n***', 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int fila = 1; fila <= n; fila++) {
            for (int col = 1; col <= fila; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}$j$,
   '["Necesitas un ciclo para las filas","Dentro, otro ciclo que imprima tantos * como el número de fila","print no salta de línea; println sí"]',
   'El ciclo externo recorre las filas y el interno imprime fila asteriscos.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime el triángulo de n filas

    }
}$j$,
   '[{"entrada":"3","salida":"*\n**\n***","visible":true},{"entrada":"5","salida":"*\n**\n***\n****\n*****","visible":false}]',
   '["for"]', 8),

  -- Módulo 3 · while
  (3, 'Cuenta regresiva', E'¿Qué imprime este código?\n\nint n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n--;\n}', 'salida', 'facil', 30,
   null, E'3\n2\n1', '["n baja en cada vuelta."]',
   'n vale 3, 2 y 1; cuando llega a 0 la condición es falsa.', null, null, null, 1),
  (3, 'Olvidar actualizar', 'Si en un while se olvida modificar la variable de la condición, ¿qué ocurre?', 'seleccion', 'media', 60,
   '["Se produce un ciclo infinito","El ciclo no se ejecuta","Java corrige el error solo","El programa termina de inmediato"]',
   'Se produce un ciclo infinito', '["La condición nunca cambia."]',
   'Si la condición siempre es verdadera, el ciclo nunca termina.', null, null, null, 2),
  (3, 'Suma acumulada', E'¿Qué imprime este código?\n\nint s = 0, i = 1;\nwhile (i <= 4) {\n    s += i;\n    i++;\n}\nSystem.out.println(s);', 'salida', 'media', 60,
   null, '10', '["Suma 1 + 2 + 3 + 4."]',
   's acumula 1, 3, 6 y 10.', null, null, null, 3),
  (3, 'Despegue', E'Lee un número n y usa un ciclo while para imprimir la cuenta regresiva desde n hasta 1. Al final imprime ¡Despegue!\n\nEjemplo con n = 3:\n3\n2\n1\n¡Despegue!', 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        while (n > 0) {
            System.out.println(n);
            n--;
        }
        System.out.println("¡Despegue!");
    }
}$j$,
   '["La condición es n > 0","Resta 1 a n dentro del ciclo","El mensaje final va después del ciclo"]',
   'Mientras n sea mayor que 0 se imprime y se resta 1; al salir se imprime el mensaje.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: cuenta regresiva con while y luego "¡Despegue!"

    }
}$j$,
   '[{"entrada":"3","salida":"3\n2\n1\n¡Despegue!","visible":true},{"entrada":"5","salida":"5\n4\n3\n2\n1\n¡Despegue!","visible":false}]',
   '["while"]', 4),
  (3, 'Suma de dígitos', 'Lee un número entero positivo y usa un ciclo while para calcular la suma de sus dígitos. Por ejemplo, para 1234 imprime 10.', 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int suma = 0;
        while (n > 0) {
            suma += n % 10;
            n = n / 10;
        }
        System.out.println(suma);
    }
}$j$,
   '["n % 10 da el último dígito","n / 10 quita el último dígito","Repite mientras n > 0"]',
   'En cada vuelta se suma el último dígito (n % 10) y se elimina (n / 10).',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: suma los dígitos de n con un ciclo while

    }
}$j$,
   '[{"entrada":"1234","salida":"10","visible":true},{"entrada":"9","salida":"9","visible":false},{"entrada":"1005","salida":"6","visible":false}]',
   '["while"]', 5),

  -- Módulo 4 · do-while
  (4, 'Diferencia clave', '¿Cuál es la diferencia principal entre while y do-while?', 'seleccion', 'facil', 30,
   '["do-while se ejecuta al menos una vez","do-while es más rápido","while no usa condición","No hay diferencia"]',
   'do-while se ejecuta al menos una vez', '["Mira dónde se evalúa la condición."]',
   'En do-while la condición se evalúa al final, así que el cuerpo corre al menos una vez.', null, null, null, 1),
  (4, 'Una sola vuelta', E'¿Qué imprime este código?\n\nint x = 10;\ndo {\n    System.out.println(x);\n    x++;\n} while (x < 10);', 'salida', 'media', 60,
   null, '10', '["La condición se revisa después de imprimir."]',
   'Imprime 10 una vez; luego x vale 11 y la condición es falsa.', null, null, null, 2),
  (4, 'Cierre del do-while', '¿Qué símbolo debe ir al final de un do-while, después de la condición?', 'respuesta_corta', 'facil', 30,
   null, ';|punto y coma', '["Es un signo de puntuación."]',
   'La instrucción do-while termina con punto y coma.', null, null, null, 3),
  (4, 'Suma hasta cero', E'Lee números enteros (uno por línea) hasta que llegue un 0. Usa un ciclo do-while y al final imprime la suma así: Total = suma\n\nEjemplo: con 5, 3 y 0 imprime Total = 8', 'codigo', 'media', 60,
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
   '["Declara numero antes del do","Lee y suma dentro del cuerpo","La condición es numero != 0"]',
   'El cuerpo lee y suma; la condición se revisa después, así que el 0 también se lee (y suma 0).',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: lee números con do-while hasta que llegue un 0

    }
}$j$,
   '[{"entrada":"5\n3\n0","salida":"Total = 8","visible":true},{"entrada":"0","salida":"Total = 0","visible":false},{"entrada":"10\n-4\n2\n0","salida":"Total = 8","visible":false}]',
   '["do-while"]', 4),

  -- Módulo 5 · Ciclos combinados
  (5, 'Para qué sirve break', '¿Qué hace break dentro de un ciclo?', 'seleccion', 'facil', 30,
   '["Termina el ciclo inmediatamente","Salta a la siguiente vuelta","Reinicia el ciclo","Termina el programa"]',
   'Termina el ciclo inmediatamente', '["Piensa en \"romper\"."]',
   'break sale del ciclo en el que está, sin terminar el programa.', null, null, null, 1),
  (5, 'Para qué sirve continue', '¿Qué hace continue dentro de un ciclo?', 'seleccion', 'facil', 30,
   '["Termina el ciclo inmediatamente","Salta a la siguiente vuelta del ciclo","Repite la vuelta actual","Termina el programa"]',
   'Salta a la siguiente vuelta del ciclo', '["El ciclo continúa, pero esta vuelta no."]',
   'continue omite el resto del cuerpo y pasa a la siguiente iteración.', null, null, null, 2),
  (5, 'Primer múltiplo de 7', 'Lee un número n y encuentra el primer número mayor o igual que n que sea múltiplo de 7. Usa un ciclo y break para detenerte al encontrarlo, e imprime ese número.', 'codigo', 'media', 60,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = n; ; i++) {
            if (i % 7 == 0) {
                System.out.println(i);
                break;
            }
        }
    }
}$j$,
   '["Empieza a buscar desde n","i % 7 == 0 indica múltiplo de 7","Al encontrarlo, imprime y usa break"]',
   'Se revisan los números desde n y break detiene el ciclo en el primer múltiplo.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: busca el primer múltiplo de 7 desde n y usa break

    }
}$j$,
   '[{"entrada":"10","salida":"14","visible":true},{"entrada":"21","salida":"21","visible":false},{"entrada":"1","salida":"7","visible":false}]',
   '["break"]', 3),
  (5, 'Cuadrícula de multiplicar', E'Lee un número n e imprime una cuadrícula de n filas y n columnas: en la fila i y columna j va i * j, separados por un espacio.\n\nEjemplo con n = 3:\n1 2 3\n2 4 6\n3 6 9', 'codigo', 'dificil', 100,
   null,
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                System.out.print(i * j + " ");
            }
            System.out.println();
        }
    }
}$j$,
   '["Un ciclo para las filas y otro para las columnas","Usa print para quedarte en la misma línea","Los espacios al final de la línea no importan"]',
   'El ciclo externo recorre filas y el interno columnas, imprimiendo i * j.',
   $j$import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime la cuadrícula n x n

    }
}$j$,
   '[{"entrada":"3","salida":"1 2 3\n2 4 6\n3 6 9","visible":true},{"entrada":"4","salida":"1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16","visible":false}]',
   '["for"]', 4)
) as e(modulo_orden, titulo, enunciado, tipo, dificultad, puntos, opciones, solucion, pistas, explicacion,
       codigo_inicial, casos, requiere, orden)
join public.modulo m on m.orden = e.modulo_orden
on conflict (id_modulo, orden) do update
  set titulo = excluded.titulo, enunciado = excluded.enunciado, tipo = excluded.tipo,
      dificultad = excluded.dificultad, puntos = excluded.puntos, opciones = excluded.opciones,
      solucion_esperada = excluded.solucion_esperada, pistas = excluded.pistas,
      explicacion = excluded.explicacion, codigo_inicial = excluded.codigo_inicial,
      casos_prueba = excluded.casos_prueba, requiere = excluded.requiere;

-- ---------------------------------------------------------------------------
-- Desafíos
-- periodo: diario (rota cada día, hora de Bogotá) | semanal (rota cada lunes) | mini (siempre disponible).
-- Para programar uno a mano, darle disponible_desde/disponible_hasta: reemplaza a la rotación en esa ventana.
-- ---------------------------------------------------------------------------
insert into public.desafio
  (titulo, enunciado, tipo, dificultad, solucion_esperada, pistas, puntos_recompensa, periodo,
   minutos_estimados, codigo_inicial, casos_prueba, requiere)
values
  -- Mini-retos
  ('Suma del 1 al 100', E'¿Qué imprime este código?\n\nint s = 0;\nfor (int i = 1; i <= 100; i++) {\n    s += i;\n}\nSystem.out.println(s);',
   'salida', 'media', '5050', '["Es la suma de los primeros 100 números."]', 50, 'mini', 5, null, null, '[]'),
  ('Contar pares', E'¿Qué imprime este código?\n\nint c = 0;\nfor (int i = 0; i < 4; i++) {\n    if (i % 2 == 0) c++;\n}\nSystem.out.println(c);',
   'salida', 'media', '2', '["Los pares entre 0 y 3 son 0 y 2."]', 50, 'mini', 5, null, null, '[]'),
  ('Factorial de 5', E'¿Qué imprime este código?\n\nint f = 1;\nint n = 5;\nwhile (n > 1) {\n    f *= n;\n    n--;\n}\nSystem.out.println(f);',
   'salida', 'dificil', '120', '["Multiplica 5 · 4 · 3 · 2."]', 80, 'mini', 5, null, null, '[]'),
  ('Menú de opciones', E'Construye un menú con un ciclo do-while. Lee números (uno por línea) hasta que llegue un 3:\n- con 1 imprime Hola\n- con 2 imprime Adiós\n- con cualquier otro número (distinto de 3) imprime Opción inválida\nAl salir del ciclo imprime Fin.',
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
   '["Lee la opción dentro del do","Usa if / else if para cada opción","La condición del while es opcion != 3"]',
   80, 'mini', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: menú con do-while hasta que llegue un 3

    }
}$j$,
   '[{"entrada":"1\n2\n3","salida":"Hola\nAdiós\nFin","visible":true},{"entrada":"5\n3","salida":"Opción inválida\nFin","visible":false},{"entrada":"3","salida":"Fin","visible":false}]',
   '["do-while"]'),

  -- Retos diarios
  ('Números primos', E'Lee un número n e imprime, uno por línea, todos los números primos desde 2 hasta n.\nUn número es primo si solo es divisible entre 1 y sí mismo.',
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 2; i <= n; i++) {
            boolean primo = true;
            for (int d = 2; d * d <= i; d++) {
                if (i % d == 0) {
                    primo = false;
                    break;
                }
            }
            if (primo) System.out.println(i);
        }
    }
}$j$,
   '["Recorre los números de 2 a n con un for","Para cada uno, busca divisores con otro for","Si encuentras un divisor, no es primo (puedes usar break)"]',
   150, 'diario', 20,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime los primos desde 2 hasta n

    }
}$j$,
   '[{"entrada":"10","salida":"2\n3\n5\n7","visible":true},{"entrada":"20","salida":"2\n3\n5\n7\n11\n13\n17\n19","visible":false},{"entrada":"2","salida":"2","visible":false},{"entrada":"1","salida":"","visible":false}]',
   '["for"]'),
  ('FizzBuzz', E'Lee un número n e imprime los números del 1 al n, uno por línea, pero:\n- si es múltiplo de 3 imprime Fizz\n- si es múltiplo de 5 imprime Buzz\n- si es múltiplo de 3 y de 5 imprime FizzBuzz',
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else System.out.println(i);
        }
    }
}$j$,
   '["Revisa primero el caso de 3 y 5 a la vez","i % 3 == 0 indica múltiplo de 3","Usa if / else if / else"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: FizzBuzz del 1 al n

    }
}$j$,
   '[{"entrada":"15","salida":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz","visible":true},{"entrada":"5","salida":"1\n2\nFizz\n4\nBuzz","visible":false},{"entrada":"30","salida":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz","visible":false}]',
   '["for"]'),
  ('Potencias de 2', E'Lee un número n e imprime las potencias de 2 desde 2^0 hasta 2^n con el formato:\n2^i = valor\n\nNo uses Math.pow: calcula cada potencia multiplicando dentro del ciclo.',
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int potencia = 1;
        for (int i = 0; i <= n; i++) {
            System.out.println("2^" + i + " = " + potencia);
            potencia *= 2;
        }
    }
}$j$,
   '["Empieza con potencia = 1 (que es 2^0)","En cada vuelta imprime y luego multiplica por 2","El ciclo va de 0 a n incluido"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime 2^0 hasta 2^n

    }
}$j$,
   '[{"entrada":"4","salida":"2^0 = 1\n2^1 = 2\n2^2 = 4\n2^3 = 8\n2^4 = 16","visible":true},{"entrada":"0","salida":"2^0 = 1","visible":false},{"entrada":"10","salida":"2^0 = 1\n2^1 = 2\n2^2 = 4\n2^3 = 8\n2^4 = 16\n2^5 = 32\n2^6 = 64\n2^7 = 128\n2^8 = 256\n2^9 = 512\n2^10 = 1024","visible":false}]',
   '["for"]'),
  ('Invertir un número', E'Lee un número entero positivo e imprímelo con sus dígitos al revés usando un ciclo while.\nPor ejemplo, 1234 se convierte en 4321 y 1200 en 21.',
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int invertido = 0;
        while (n > 0) {
            invertido = invertido * 10 + n % 10;
            n = n / 10;
        }
        System.out.println(invertido);
    }
}$j$,
   '["n % 10 te da el último dígito","invertido = invertido * 10 + digito lo agrega al final","n / 10 quita el último dígito"]',
   150, 'diario', 20,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: invierte los dígitos de n con while

    }
}$j$,
   '[{"entrada":"1234","salida":"4321","visible":true},{"entrada":"1200","salida":"21","visible":false},{"entrada":"7","salida":"7","visible":false}]',
   '["while"]'),
  ('Contar vocales', E'Lee una línea de texto y cuenta cuántas vocales tiene (a, e, i, o, u, en mayúscula o minúscula). Imprime solo el número.',
   'codigo', 'media',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        String texto = new Scanner(System.in).nextLine().toLowerCase();
        int vocales = 0;
        for (int i = 0; i < texto.length(); i++) {
            char c = texto.charAt(i);
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') vocales++;
        }
        System.out.println(vocales);
    }
}$j$,
   '["Usa nextLine() para leer la línea completa","Recorre el texto con for y charAt(i)","toLowerCase() te ahorra revisar mayúsculas"]',
   150, 'diario', 15,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        String texto = new Scanner(System.in).nextLine();
        // TODO: cuenta las vocales del texto

    }
}$j$,
   '[{"entrada":"Hola Mundo","salida":"4","visible":true},{"entrada":"Programacion en Java","salida":"8","visible":false},{"entrada":"xyz","salida":"0","visible":false},{"entrada":"AEIOU aeiou","salida":"10","visible":false}]',
   '["for"]'),

  -- Retos semanales
  ('Adivina el número', E'Simula un juego de adivinanza. Primero lee el número secreto; luego lee intentos (uno por línea) hasta acertar.\nPor cada intento imprime:\n- Mayor si el secreto es mayor que el intento\n- Menor si el secreto es menor\n- ¡Correcto! cuando acierta\nAl final imprime Intentos: seguido de cuántos intentos hizo.',
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int secreto = sc.nextInt();
        int intentos = 0;
        int intento = secreto - 1;
        while (intento != secreto) {
            intento = sc.nextInt();
            intentos++;
            if (secreto > intento) System.out.println("Mayor");
            else if (secreto < intento) System.out.println("Menor");
            else System.out.println("¡Correcto!");
        }
        System.out.println("Intentos: " + intentos);
    }
}$j$,
   '["Lee el secreto antes del ciclo","Repite mientras el intento sea distinto del secreto","Cuenta cada intento con un contador"]',
   400, 'semanal', 45,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int secreto = sc.nextInt();
        // TODO: lee intentos con while hasta acertar

    }
}$j$,
   '[{"entrada":"50\n25\n75\n50","salida":"Mayor\nMenor\n¡Correcto!\nIntentos: 3","visible":true},{"entrada":"7\n7","salida":"¡Correcto!\nIntentos: 1","visible":false},{"entrada":"10\n1\n2\n3\n10","salida":"Mayor\nMayor\nMayor\n¡Correcto!\nIntentos: 4","visible":false}]',
   '["while"]'),
  ('Pirámide centrada', E'Lee un número n e imprime una pirámide centrada de n filas hecha con asteriscos.\nLa fila i tiene (n - i) espacios a la izquierda y (2·i - 1) asteriscos.\n\nEjemplo con n = 3:\n  *\n ***\n*****',
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int fila = 1; fila <= n; fila++) {
            for (int e = 0; e < n - fila; e++) System.out.print(" ");
            for (int a = 0; a < 2 * fila - 1; a++) System.out.print("*");
            System.out.println();
        }
    }
}$j$,
   '["Un ciclo para las filas","Dentro: un ciclo para los espacios y otro para los asteriscos","Los espacios de la izquierda sí cuentan"]',
   400, 'semanal', 40,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: pirámide centrada de n filas

    }
}$j$,
   '[{"entrada":"3","salida":"  *\n ***\n*****","visible":true},{"entrada":"1","salida":"*","visible":false},{"entrada":"4","salida":"   *\n  ***\n *****\n*******","visible":false}]',
   '["for"]'),
  ('Números perfectos', E'Un número es perfecto si es igual a la suma de sus divisores menores que él (6 = 1 + 2 + 3).\nLee un número n e imprime, uno por línea, todos los números perfectos desde 1 hasta n.',
   'codigo', 'dificil',
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 2; i <= n; i++) {
            int suma = 0;
            for (int d = 1; d < i; d++) {
                if (i % d == 0) suma += d;
            }
            if (suma == i) System.out.println(i);
        }
    }
}$j$,
   '["Recorre los números de 2 a n","Para cada uno, suma sus divisores con otro ciclo","Si la suma es igual al número, es perfecto"]',
   400, 'semanal', 40,
   $j$import java.util.Scanner;

public class Reto {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // TODO: imprime los números perfectos hasta n

    }
}$j$,
   '[{"entrada":"30","salida":"6\n28","visible":true},{"entrada":"500","salida":"6\n28\n496","visible":false},{"entrada":"5","salida":"","visible":false}]',
   '["for"]')
on conflict (titulo) do update
  set enunciado = excluded.enunciado, tipo = excluded.tipo, dificultad = excluded.dificultad,
      solucion_esperada = excluded.solucion_esperada, pistas = excluded.pistas,
      puntos_recompensa = excluded.puntos_recompensa, periodo = excluded.periodo,
      minutos_estimados = excluded.minutos_estimados, codigo_inicial = excluded.codigo_inicial,
      casos_prueba = excluded.casos_prueba, requiere = excluded.requiere;

-- ---------------------------------------------------------------------------
-- Logros (el otorgamiento automático llega en la Fase 6)
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
