# Progreso de DUALDEV

**Archivo único de progreso y pendientes.** El detalle de arquitectura, stack, reglas y estructura de carpetas vive en `CLAUDE.md`; aquí va todo lo demás: qué se hizo, qué se decidió y qué falta.
Última actualización: **2026-10-30**.

## Dónde vamos

**Producción: desplegada y funcionando.**

| Parte | URL |
|---|---|
| Frontend (Vercel) | https://dual-dev-pi.vercel.app |
| Backend (Render, Docker) | https://dualdev-api.onrender.com |
| BD / Auth | Supabase (proyecto `pmuehlvhsfiuuxfdltrm`) |

Fases 0 a 8 completas (auth, dashboard, módulos, lecciones, práctica con Java real, logros, ranking, perfil, retos, pruebas y seguridad) — ver detalle en la sección de abajo. Las tres prioridades pedidas el 2026-10-18 (calidad de ejercicios + tono de profe, resaltado de sintaxis, rapidez) están completas y verificadas. El despliegue a Vercel + Render + Supabase está hecho y probado de punta a punta en producción real.

## Correcciones pedidas por la profesora (2026-10-27)

Hecho en el frontend y en `supabase/seed.sql` (sin cambios de backend, porque Render no puede desplegar mientras falle la autoprueba del usuario `sandbox`):
- **Progreso visible y retroalimentación por sección:** pantalla nueva `/modulos/:id/resumen` (`ModuleSummaryScreen.tsx` + `utils/retroalimentacion.ts`, usa el `GET /modules/:id` que ya existía): anillo de avance, insignia, lecciones/ejercicios/por corregir/XP, retroalimentación "tono profe" por tipo de ejercicio (conceptos, leer código, escribir programas), lista de ejercicios con estado, autoevaluación del estudiante (😕/🙂/😎 + nota; **solo en el navegador**, no llega al profe) y siguiente paso. Se llega desde Módulos, Dashboard, la barra "Avance del módulo" de Práctica y automáticamente al resolver el último ejercicio del módulo.
- **Editor tipo IDE** (`CodeEditor.tsx` + `utils/plantillasJava.ts`): `for`/`while`/`do`/`if`/`ifelse`/`sout`/`scan`/`leer`/`main` + Tab arman la estructura con la sangría de la línea; Tab salta entre campos; Enter conserva la sangría y cierra la llave; Shift+Tab quita sangría; `Esc` y luego Tab sale del editor; barra "Insertar" clicable (sirve en celular); resalta la línea actual. Usa `execCommand('insertText')` para que Ctrl+Z siga funcionando.
- **Consola nueva** (`Consola.tsx`): estado (compilando / sin errores / error de compilación / tiempo agotado), comando `$ java Clase`, entrada visible, salida numerada, copiar y limpiar.
- **Lecciones con formato** (`TextoLeccion.tsx`): `**negrita**`, `` `código` ``, viñetas, pasos numerados y tablas (para pruebas de escritorio), sin librerías ni HTML crudo.
- **Contenido:** las 4 lecciones de "Introducción a ciclos" reescritas con ese formato + lección nueva "Prueba de escritorio"; **23 ejercicios nuevos** de más complejidad (33 → 56): factorial con `long`, divisores, mayor/menor con negativos, invertir número, Collatz, palíndromo, adivina el número, centinela -1, cajero con menú, primos, pirámide, tablero, etc. Todas las soluciones se verificaron con el ejecutor Java real (casos visibles y ocultos, código inicial que compila y no resuelve, patrones de error que no se activan con la solución) y el seed completo se aplicó dos veces en PGlite sin error.
- **Seed aplicado en producción** (verificado el 2026-10-30: 56 ejercicios, 16 lecciones, 5 módulos, 12 retos en Supabase). Al cargarlo, a 1 módulo del único estudiante real le bajó el % por debajo del 50 % y volvió a bloquear el siguiente hasta que resuelva un par de ejercicios más (medido el 2026-10-27).

### Segunda ronda (2026-10-28)
- **Ver la respuesta correcta ya dada:** `GET /exercises/:id` devuelve `mi_respuesta` (la última respuesta correcta del propio estudiante, de `intento_ejercicio.respuesta`; nunca la de otro). En Práctica aparece la tarjeta "✓ Tu respuesta correcta" (código resaltado, salida o la opción elegida, con la explicación); en código el editor arranca con ese código (si no hay borrador) y hay botón "Cargar mi código en el editor"; en selección queda marcada la opción.
- **Auto-verificación quitada solo en el módulo 1** (Introducción a ciclos), como pidió la profesora; los demás módulos la conservan.
- **Pruebas:** recorrido de TODO el curso por la API real con un estudiante temporal (5 lecciones por módulo completadas, y en los 56 ejercicios: respuesta incorrecta con retroalimentación, "Ejecutar código" con la solución, acierto con puntos, re-envío sin puntos, `mi_respuesta` correcta) → **56/56, 0 problemas, los 5 módulos al 100 %**. `test:e2e` **37/37**. Barrido en el navegador de Dashboard, Módulos, resúmenes, Práctica, Lecciones, Retos (con editor y consola), Ranking y Perfil: **0 errores de la app en consola**.
- **Formato en todas las lecciones:** las 11 lecciones de los módulos 2 a 5 también usan pasos, viñetas y tablas (pruebas de escritorio, tabla de `%`, comparativas while/for y while/do-while, break/continue). Código y salida de los ejemplos sin cambios. Aplicado en producción y verificado con huella md5 idéntica al repo en los 5 módulos. Celdas de tabla con letra normal (el código va como chip).
- Nota de desarrollo: `node --watch` a veces reinicia el backend local en medio de una prueba (solo en desarrollo); si una prueba dice "el backend no responde", repetirla.

### Tercera ronda (2026-10-30)
- **Pruebas de punta a punta contra PRODUCCIÓN** (`API_URL=https://dualdev-api.onrender.com/api npm run test:e2e`): **37/37 correctas**, 3 estudiantes temporales creados y borrados. Tiempos reales en Render (plan gratis, 0,1 CPU): cargas 0,16–0,59 s (RNF-02 < 3 s, holgado); envío de código **máx 6,1 s** (compilar + casos ocultos), error de compilación 3,3 s, corte de la bomba de hilos 5,8 s. O sea: la navegación va rápida, pero la retroalimentación de código no baja de ~3–6 s en el plan gratis (es la CPU de 0,1; bajarlo exige plan de pago o un VPS).
- **Tiempo máximo en las llamadas a Supabase** (`backend/src/utils/tiempoLimite.js`, variable `SUPABASE_TIMEOUT_MS`, 8 s por defecto): ninguna petición se queda colgada; al agotarse, el backend responde **503** con un mensaje claro en vez de esperar sin fin, y `authenticate` ya no lo confunde con "sesión inválida" (401). Verificado con 4 pruebas nuevas y contra el propio supabase-js apuntando a una base que no responde (se reconoce tanto en consultas como en auth). Backend: **102 pruebas pasan, 0 fallan, 2 en skip** (las de Linux).
- **Fuentes servidas desde el propio sitio** (paquetes `@fontsource` importados en `src/index.css`; se quitaron los `<link>` a Google de `index.html`): Sora 700/800, Plus Jakarta Sans 400/500/600/700 y JetBrains Mono 400/500, solo subconjunto latino (~110 KB en woff2). Verificado en el navegador sobre el build: las 8 fuentes se registran, las de la pantalla cargan y **0 peticiones a terceros**. Ya no salen datos de menores hacia Google.
- **Performance Advisor de Supabase revisado**: limpio; solo 3 avisos `INFO` de índices nunca usados (`logro_usuario_logro_idx`, `progreso_nivel_idx`, `contenido_completado_contenido_idx`), normal con un solo estudiante real. No se borran: sirven cuando haya un curso completo.

## Lo que falta por mejorar (pendiente)

1. **✅ Despliegue de Render resuelto: "Deploy live" de `dc6e271` el 2026-10-27, `/api/health` ok.** Historia: el deploy del endurecimiento del ejecutor FALLÓ (correo de Render, 2026-10-25 noche). Log revisado el 2026-10-27: el build pasa; falla al arrancar con `setgroups: Operation not permitted` (`sandboxexec.c:37`). Primer diagnóstico (`0cb998f`) DESCARTÓ las dos hipótesis iniciales: el binario sí tiene `cap_setgid,cap_setuid=ep`, la raíz NO está montada `nosuid` y `CapBnd` SÍ incluye setuid/setgid. Hipótesis nueva: Render pone `NoNewPrivs=1` en el contenedor (las capacidades de archivo se ignoran al ejecutar) o usa user namespace/gVisor. Segundo diagnóstico (2026-10-27): `NoNewPrivs`, `Seccomp`, `uid_map`, `/proc/self/setgroups` y versión del kernel en el arranque, y `sandboxexec` imprime las capacidades que recibió de verdad cuando falla (líneas `[sandboxexec]`). Con eso se decide entre un diseño alternativo o revertir el usuario sandbox.
   **Arreglado el despliegue (2026-10-27):** falla cerrada por defecto, pero con `RUNNER_PERMITIR_SIN_SANDBOX=true` (puesto en el `Dockerfile`, decisión explícita y revisada en el repo) y SOLO si el error es el conocido (`setgroups/setres*id: Operation not permitted`), el servidor arranca sin el usuario sandbox y sigue como estaba producción antes (código del estudiante con el usuario del backend + Guardia), y lo dice en el log: `[ejecutor] Aislamiento: ...` y `[ejecutor] El usuario sandbox no funciona aquí...` (este último incluye las líneas `[sandboxexec]` con las capacidades reales, para terminar de diagnosticar sin bloquear despliegues). Nunca usa el usuario sandbox sin haberlo verificado. No se publica en `/api/health` (es ruta pública). Pendiente: leer esas líneas y decidir si vale la pena un proceso "broker" como root para recuperar el aislamiento extra. El backend sigue respondiendo en `https://dualdev-api.onrender.com/api/health` porque Render no cambia el tráfico a un deploy que no pasa — sigue corriendo la versión anterior (sin el usuario `sandbox`), así que la app no está caída, pero el endurecimiento todavía no quedó activo. **Para retomar:** abrir Render → `dualdev-api` → Events/Logs, ver el log del build/deploy fallido del commit `0010809` (o `43ec216` si fue ese) y pegarlo aquí para diagnosticar. Sospechosos más probables a revisar primero: el `Dockerfile` instala `gcc`/`libc6-dev` y compila `backend/docker/sandboxexec.c` con `setcap` — puede haber fallado el build de la imagen (paquete, permiso de `setcap` en el entorno de build de Render, o la ruta `/usr/local/bin`) o la autoprueba al arrancar (`verificarAislamientoEjecutor`, que hace que el contenedor se niegue a arrancar si el aislamiento no funciona — ESO ES A PROPÓSITO, pero si falla hay que ver por qué: falta `sandboxexec`, uid/gid no coinciden, etc.).
2. Una vez con el log: corregir, subir y volver a verificar (salud, un envío de código normal, y un ciclo infinito real para confirmar que el corte por tiempo sigue funcionando con el usuario sandbox).
2. **Ajustes de Supabase para producción** (dashboard → Authentication → Providers → Email):
   - activar **Confirm email**;
   - poner **Minimum password length = 8**;
   - restringir el registro a un dominio institucional: **decidido NO hacerlo por ahora** (2026-10-25; proyecto semillero, no todos tienen correo institucional todavía) — si se revierte esta decisión, Supabase tiene un "Before User Created" Auth Hook con función SQL lista para esto (ver la sección de decisiones);
   - protección de contraseñas filtradas (HaveIBeenPwned): **no se puede activar**, es función del plan Pro y el proyecto está en el plan Free. Limitación aceptada.
3. ✅ **Resuelto (2026-10-30):** la petición que se colgaba ya no puede quedarse esperando: todas las llamadas a Supabase se cortan a los `SUPABASE_TIMEOUT_MS` (8 s) y responden 503. Si en producción aparece algún 503 de estos en el log (`[bd] tiempo agotado`), es la señal de que Supabase se puso lento, no de un error del código.
4. ✅ **Medido en producción (2026-10-30):** `test:e2e` contra la URL de Render dio 37/37; cargas 0,16–0,59 s y envío de código máx 6,1 s (ver "Tercera ronda"). Falta solo, si se quiere, medir con varios estudiantes enviando código a la vez (el curso real todavía no empieza).
5. ✅ **Performance Advisor revisado (2026-10-30):** limpio, 3 avisos `INFO` de índices sin usar.
6. El limitador de uso y la caché del backend son por instancia; si el proyecto llegara a escalar a varias instancias de Render, hay que moverlos a un almacén compartido (Redis o similar).
7. ✅ **Resuelto (2026-10-30):** las fuentes se sirven desde el propio sitio, ya no se piden a Google.

## Pendiente de más largo plazo (sin fecha, requiere decisión o infraestructura)

- **Contenedor por ejecución:** en el plan gratis de Render, todos los programas de los estudiantes comparten el contenedor del backend (el usuario `sandbox` reduce el daño si la Guardia de Java falla, pero no sustituye a un contenedor por ejecución). Para eso se necesitaría un VPS con Docker.
- Revisar manualmente los 33 ejercicios / 15 lecciones / 12 retos del seed si se agrega contenido nuevo (la última revisión de fondo fue la del 2026-10-24, nivel "semillero").

## Qué detecta la retroalimentación "tono de profe"

Cada error debe decir qué pasó y por qué, nunca solo "incorrecto" (motor en `backend/src/runner/analisis.js`):
- **Selección:** cada opción incorrecta explica por qué está mal, no solo cuál es la correcta.
- **Predecir la salida:** reconoce la vuelta de más/menos, el orden inverso, `print` en vez de `println`, empezar antes/saltar el primero, espacios/mayúsculas.
- **Código:** detecta y explica el `;` después de `for`/`while`, el acumulador declarado dentro del ciclo que lo actualiza, el ciclo infinito (qué variable no cambia y en qué línea), el `for` que cuenta en dirección contraria, el valor fijo copiado del ejemplo (caso oculto que imprime lo mismo), comas en el `for`, `=` en vez de `==`, variable usada fuera del ciclo donde se declaró, y Scanner sin `import`.
- Nunca citan datos de un caso oculto (entrada, salida, excepción, stderr).

## Decisiones y hallazgos importantes (no se derivan del código)

- **Niveles:** 7 niveles con puntos mínimos 0, 300, 800, 1100, 1500, 2100, 2700 (tabla `nivel`, migración `20261017000003_niveles_diseno.sql`). El nivel del estudiante se deriva de sus puntos, nunca de `progreso.nivel_actual`.
- **Reglas de progreso:** un módulo se desbloquea con ≥50 % del módulo anterior resuelto; meta semanal = 5 ejercicios (semana empieza el lunes 00:00 hora Bogotá); la racha (días consecutivos) es unificada entre intentos, lecciones y desafíos, y cuenta como viva si hay actividad hoy o ayer.
- **Puntos:** SOLO el backend decide puntos, niveles y logros; el frontend nunca los envía. Un ejercicio/lección/desafío otorga puntos la primera vez que se resuelve bien, nunca más (índices únicos en BD + funciones `security definer`).
- **Ejecución de código Java:** nunca dentro del proceso de la API. Dos acciones: "Ejecutar código" (consola, sin puntos, con límite de uso) y "Enviar respuesta" (casos de prueba ocultos en el servidor, puntos una sola vez). Nunca se revela texto de un caso oculto (entrada, salida, excepción, stderr ni código de salida).
- **Diferencias deliberadas con el diseño de Figma:** registro con correo libre (no solo institucional); login solo por correo; "¿Olvidaste tu contraseña?" visible pero deshabilitado; sin diagrama de flujo en la lección; "Casos x/y" en vez de "Precisión"; sin "+100 XP" por logro en la actividad; perfil a 2 columnas.
- **Privacidad del ranking:** los demás estudiantes aparecen como "Nombre I." sin id ni correo; uno mismo se ve completo. Rankings filtrados por semana/módulo solo listan a quien sumó puntos ahí (y siempre a uno mismo).
- **Rotación de desafíos** (`utils/retos.js`): los "mini" siempre están disponibles; el "diario" rota cada día y el "semanal" cada lunes (hora Bogotá), salvo un desafío con `disponible_desde/hasta` puesto a mano, que reemplaza la rotación de su periodo en esa ventana. Los puntos de un desafío se dan una sola vez por estudiante (si un diario repetido vuelve a salir en la rotación, quien ya lo resolvió no vuelve a ganar puntos — decisión consciente).
- **Entorno de desarrollo:** JDK 17 Temurin instalado en `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot`; el ejecutor usa `JAVA_HOME` explícito porque el `java` del PATH puede ser un JRE 8 viejo. Sin Docker ni WSL en la máquina de desarrollo (por eso todo lo que depende de Linux/contenedores — `RUNNER=contenedor`, el endurecimiento con `sandboxexec` — se verifica en Render, nunca localmente).
- **Hosting 100 % gratis, sin tarjeta** (decisión del usuario, proyecto universitario): Vercel (frontend), Render Free + Docker (backend), Supabase Free (BD/Auth), cron-job.org (mantener despiertos Render y Supabase). Guía paso a paso en `DESPLIEGUE.md`. Descartados: Hugging Face (Docker de pago), Oracle/Cloud Run (piden tarjeta), Vercel para el backend (sin JDK ni procesos largos).
  - Corregido en el despliegue: con `rootDir: backend` en `render.yaml`, las rutas del Dockerfile deben ser relativas a esa carpeta (`./Dockerfile`, `.`), no al repo completo (commit `2dc4d5e`).
- **Endurecimiento del ejecutor (usuario Linux `sandbox`, 2026-10-25):** javac/java del estudiante (y la señal para matarlos) corren con un usuario Linux `sandbox` (uid/gid 10001) DISTINTO del que corre el backend (`node`). Así, aunque el código del estudiante rompa la Guardia (el Security Manager de Java), no puede leer `/proc/<pid>/environ` del backend (la llave secreta) ni sus archivos, porque ni siquiera es el mismo usuario del sistema.
  - El cambio de usuario lo hace `sandboxexec` (`backend/docker/sandboxexec.c`, binario propio y mínimo, compilado en el `Dockerfile`): el uid/gid destino están escritos en su código, nunca se reciben como argumento ni variable de entorno. Se le da la capacidad de cambiar de usuario (`cap_setuid`/`cap_setgid` vía `setcap`) A ÉL, no a una herramienta genérica ni al runtime de Node.
  - Una revisión de seguridad automática encontró y se corrigieron 2 problemas reales en el primer intento (commit `43ec216` → arreglado en `0010809`): (1) **ALTO** — Node (usuario `node`) no puede mandarle una señal de "mátate" a un proceso de OTRO usuario (`sandbox`): el corte de ciclos infinitos/salida excesiva se habría roto justo para el código del estudiante. Arreglado: la señal de matar también sale a través de `sandboxexec`. (2) **MEDIO** — darle la capacidad a una herramienta genérica (`setpriv`) habría permitido, con control total del backend, pedir "cámbiame a root"; `sandboxexec` solo permite volverse `sandbox`, nunca otro usuario.
  - Autoprueba al arrancar (`verificarAislamientoEjecutor` en `server.js`, antes de `app.listen`): compila un programa de prueba como sandbox y compara el uid del archivo resultante; si no coincide, el servidor **se niega a arrancar**.
- **Revisión de seguridad automática al desplegar** (Security Advisor de Supabase, 2026-10-25): 2 notas `INFO` esperadas (RLS sin política en `ejercicio`/`desafio`, intencional — solo el backend lee la solución) y 1 `WARN` (protección de contraseñas filtradas, ver pendientes arriba).
- **MCP de Supabase en modo escritura desde el 2026-10-25** (`.mcp.json`, decisión explícita del usuario tras ver el tradeoff: puede ejecutar SQL y aplicar cambios directamente en la BD de producción real, antes era solo lectura).
- **Service key rotada** (2026-10-17): la llave vieja debe eliminarse en Supabase → API Keys (pendiente de que el usuario lo confirme si no lo ha hecho).
- **Codificación en Windows:** nunca editar archivos con `Get-Content -Raw` + `WriteAllText`/`Set-Content` (corrompe tildes/emojis). Usar la herramienta Edit o `fs.readFileSync(..., 'utf8')`. Ya pasó una vez (reparado).
- **Trazabilidad (revisada 2026-10-28, `test:e2e` 37/37):** RF-01 registro ✅ · RF-02 login ✅ · RF-03 cierre de sesión ✅ · RF-04 módulos con progreso y bloqueo ✅ · RF-05 lecciones ✅ · RF-06 ejercicios sin exponer solución + código Java real ✅ · RF-07 retroalimentación tono profe (incorrecta, compilación, sin ciclo) ✅ · RF-08 intentos y lecciones registrados ✅ · RF-09 perfil/dashboard/ranking con privacidad ✅ · RF-10 puntos una sola vez ✅ · RF-11 logros ✅ · RF-12 retos diario/semanal/mini ✅ · RNF-01 ≤3 clics ✅ · RNF-02 tiempos en local: cargas 0,3–0,65 s, retroalimentación ≤1,8 s ✅ (medir bajo carga en Render) · RNF-03 concurrencia sin puntos duplicados ✅ · SEG: RLS, ejecutor (hilos, entorno), límites, JSON malformado ✅.

## Historial por fase (resumen)

| Fase | Qué se hizo |
|---|---|
| 0 — Análisis | Proyecto desde cero. |
| 1 — Base | Frontend Vite+React+TS+Tailwind v4; backend Express por capas, helmet, CORS, `/api/health`, manejo de errores central. |
| 2 — Base de datos | 11 tablas en Supabase + RLS + seed inicial; `usuario` con FK a `auth.users`; trigger `handle_new_user`. |
| 3 — Auth | Supabase Auth (frontend) + validación de JWT (backend); login, registro, logout, rutas protegidas. |
| 4 — Frontend base y dashboard | Tema del zip de Figma Make adoptado; `AppShell`, `/api/me` y `/api/dashboard`; escala de 7 niveles. |
| 5 — Aprendizaje + ejecutor Java | Ejecutor real con JDK 17 y Security Manager propio ("Guardia"); lecciones, ejercicios de código, práctica, feedback por línea. |
| 6 — Logros, ranking, perfil | Logros sincronizados, ranking con privacidad, perfil editable. |
| 7 — Desafíos | Retos diarios/semanales/mini con rotación, pistas, cuenta regresiva. |
| 8 — Pruebas y auditoría de seguridad | Corrección de la "bomba de hilos" del ejecutor (Guardia con tope de hilos), endurecimiento del perfil, límites de API, rendimiento (casos en paralelo, caché de catálogo). |
| — Revisión del skill de Supabase | Permisos explícitos para proyectos nuevos de Supabase (cambio de política de Supabase del 2026-04-28). |
| — 3 prioridades del usuario (2026-10-18) | (a) Calidad de ejercicios + errores con tono de profe; (b) resaltado de sintaxis Java sin librerías; (c) rapidez (consultas en una tanda, precarga, caché en el cliente). Completas y verificadas el 2026-10-24. |
| — Despliegue | Vercel + Render + Supabase + cron-job.org. Completo y verificado en producción el 2026-10-25. |
| — Endurecimiento del ejecutor | Usuario Linux `sandbox` vía `sandboxexec`. Código subido el 2026-10-25; en Render falla al arrancar con `setgroups: Operation not permitted` (probable: Render quita CAP_SETUID/SETGID). Diagnóstico temporal en `server.js` (commit `0cb998f`), falta leer su log. |
| — Correcciones de la profesora (2026-10-27) | Resumen y retroalimentación por módulo, editor tipo IDE, consola nueva, lecciones con formato, 23 ejercicios nuevos. Ver sección arriba. |

El detalle técnico exhaustivo de cada fase (archivos exactos, migraciones, decisiones de esquema, resultados de pruebas puntuales) queda en el historial de commits y en los propios archivos de código; este documento se enfoca en lo que no se puede derivar solo de leer el repo.

## Para retomar con Claude

Escribe algo como: *"sigamos con los pendientes"*, *"revisemos el endurecimiento del ejecutor en Render"* o *"hagamos los ajustes de Supabase"*. Claude lee este archivo al empezar y sabe dónde quedamos.
