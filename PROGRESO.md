# Progreso de DUALDEV

**Archivo único de progreso y pendientes.** El detalle de arquitectura, stack, reglas y estructura de carpetas vive en `CLAUDE.md`; aquí va todo lo demás: qué se hizo, qué se decidió y qué falta.
Última actualización: **2026-10-25**.

## Dónde vamos

**Producción: desplegada y funcionando.**

| Parte | URL |
|---|---|
| Frontend (Vercel) | https://dual-dev-pi.vercel.app |
| Backend (Render, Docker) | https://dualdev-api.onrender.com |
| BD / Auth | Supabase (proyecto `pmuehlvhsfiuuxfdltrm`) |

Fases 0 a 8 completas (auth, dashboard, módulos, lecciones, práctica con Java real, logros, ranking, perfil, retos, pruebas y seguridad) — ver detalle en la sección de abajo. Las tres prioridades pedidas el 2026-10-18 (calidad de ejercicios + tono de profe, resaltado de sintaxis, rapidez) están completas y verificadas. El despliegue a Vercel + Render + Supabase está hecho y probado de punta a punta en producción real.

## Lo que falta por mejorar (pendiente)

1. **Confirmar en Render que el endurecimiento del ejecutor quedó bien.** Código subido (commits `43ec216`, `0010809`); falta ver en los logs de Render que la autoprueba de aislamiento pasa al arrancar, y probar en producción que un ciclo infinito real se sigue cortando (el fix del punto "ALTO" de abajo depende de esto).
2. **Ajustes de Supabase para producción** (dashboard → Authentication → Providers → Email):
   - activar **Confirm email**;
   - poner **Minimum password length = 8**;
   - restringir el registro a un dominio institucional: **decidido NO hacerlo por ahora** (2026-10-25; proyecto semillero, no todos tienen correo institucional todavía) — si se revierte esta decisión, Supabase tiene un "Before User Created" Auth Hook con función SQL lista para esto (ver la sección de decisiones);
   - protección de contraseñas filtradas (HaveIBeenPwned): **no se puede activar**, es función del plan Pro y el proyecto está en el plan Free. Limitación aceptada.
3. **Vigilar en producción** una petición que se colgó en 2 de 8 corridas locales de `test:e2e` (62 s y 8,4 s); no se reprodujo con traza de llamadas a Supabase. Si aparece en producción, poner un tiempo máximo (timeout) a las llamadas a Supabase.
4. Medir tiempos reales de envío de código bajo más carga en Render (se esperaban 4–5 s por envío, por la CPU de 0,1 del plan gratis) y correr `npm run test:e2e` contra la URL de producción (`API_URL`).
5. Revisar el Performance Advisor de Supabase (el Security Advisor ya se revisó, ver más abajo).
6. El limitador de uso y la caché del backend son por instancia; si el proyecto llegara a escalar a varias instancias de Render, hay que moverlos a un almacén compartido (Redis o similar).
7. Google Fonts se carga desde Google en `index.html`; si se quiere evitar esa petición a terceros con datos de menores, servir las fuentes localmente.

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
- **Trazabilidad:** RF-01 a RF-12 ✅, RNF-01 ✅ (≤3 clics), RNF-02 ✅ en desarrollo (medir de nuevo bajo carga real en Render), RNF-03 ✅ (concurrencia real, sin puntos duplicados).

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
| — Endurecimiento del ejecutor | Usuario Linux `sandbox` vía `sandboxexec`. Código subido el 2026-10-25, pendiente de confirmar en Render (ver pendientes arriba). |

El detalle técnico exhaustivo de cada fase (archivos exactos, migraciones, decisiones de esquema, resultados de pruebas puntuales) queda en el historial de commits y en los propios archivos de código; este documento se enfoca en lo que no se puede derivar solo de leer el repo.

## Para retomar con Claude

Escribe algo como: *"sigamos con los pendientes"*, *"revisemos el endurecimiento del ejecutor en Render"* o *"hagamos los ajustes de Supabase"*. Claude lee este archivo al empezar y sabe dónde quedamos.
