# Progreso de DUALDEV

Resumen para retomar el trabajo. El detalle técnico completo está en `CLAUDE.md`.
Última actualización: **2026-10-24**.

## Dónde vamos

- Fases 0 a 8: **completas** (auth, dashboard, módulos, lecciones, práctica con Java real, logros, ranking, perfil, retos, pruebas y seguridad).
- Las tres prioridades que pediste el 2026-10-18 están **completas, probadas y subidas a GitHub** (`main`):

| # | Prioridad | Commit | Resultado |
|---|-----------|--------|-----------|
| 1 | Calidad de ejercicios + errores con tono de profe | `719cbf6` | Cada error dice qué pasó y por qué ("Recuerda que…"). Contenido nivel semillero: 15 lecciones, 33 ejercicios, 12 retos. |
| 2 | Resaltado de sintaxis Java | `9b9af15` | Colores de la paleta verde en el editor y en los bloques de código, sin librerías. |
| 3 | Más rapidez | `c692e3d` | Cambiar de sección pasa de ~0,8 s a ~10 ms; `/dashboard` y `/profile` de ~1 s a ~0,45 s. |

### 1. Errores con tono de profe
- **Selección:** cada opción incorrecta explica por qué está mal.
- **Predecir la salida:** reconoce la vuelta de más o de menos, el orden inverso, `print` en vez de `println`, etc.
- **Código:** detecta y explica:
  - el `;` después del `for`/`while`;
  - el acumulador declarado dentro del ciclo;
  - el ciclo infinito, diciendo qué variable no cambia y en qué línea;
  - el `for` que cuenta en la dirección contraria;
  - el valor fijo copiado del ejemplo;
  - comas en el `for`, `=` en vez de `==`, la variable usada fuera del ciclo y Scanner sin `import`.
- **Contenido nuevo:** las lecciones "Leer datos con Scanner" y "El operador %", y 9 ejercicios más. La progresión es más gradual: los ciclos anidados quedaron en el módulo 5.
- **Pantalla:** el bloque "📌 Por qué pasó" con la línea señalada en el código.
- **Base de datos:** migración `20261024000007_errores_comunes.sql` y `seed.sql` nuevo, **ya aplicados** en Supabase.

### 2. Resaltado de sintaxis
- Palabras clave, tipos, textos, números, comentarios y clases con colores distintos.
- Se desactivaron las ligaduras de la fuente, para que `<=` no se vea como `≤`.

### 3. Rapidez
- **Backend:** el dashboard y el perfil piden todo a Supabase en una sola tanda, en lugar de 5 seguidas.
- **Frontend:**
  - el código de todas las pantallas se precarga al entrar;
  - el menú ya no desaparece mientras carga una pantalla;
  - una caché en memoria hace que volver a una pantalla sea instantáneo. Se vacía con cada envío y al cambiar de usuario.

### Verificación
- Pruebas del backend: 98/98.
- Prueba de punta a punta contra la BD real: 37/37.
- Build y lint del frontend: OK.
- Recorrido en el navegador, también en móvil (390 px).

## Despliegue: completado y verificado (2026-10-25)

| Parte | URL |
|---|---|
| Frontend (Vercel) | https://dual-dev-pi.vercel.app |
| Backend (Render, Docker) | https://dualdev-api.onrender.com |

Pasos hechos: Render → Vercel → ajuste de `CORS_ORIGIN` en Render y de *Site URL*/*Redirect URLs* en Supabase a la URL real de Vercel → cronjob en cron-job.org.

Se encontró y corrigió un error en `render.yaml`: con `rootDir: backend`, las rutas del Dockerfile deben ser relativas a esa carpeta, no al repo completo (el build fallaba con "backend/backend: no such file or directory"). Corregido y subido (commit `2dc4d5e`).

Verificado en producción real con el navegador (Playwright): registro, login, logout, dashboard con datos reales, sin errores de consola (CSP correcta), y el ejecutor de Java en el contenedor de Render — compiló y corrió un ejercicio con `Scanner`, 3/3 casos (incluidos ocultos), +30 XP. El estudiante de prueba usado se borró de la base real.

El MCP de Supabase pasó a **modo escritura** (antes solo lectura) por decisión del usuario, para poder aplicar cambios directamente cuando haga falta.

Advisors revisados: 2 notas `INFO` esperadas (RLS sin política en `ejercicio`/`desafio`, intencional) y 1 `WARN` nuevo: falta activar la protección de contraseñas filtradas (HaveIBeenPwned) en Supabase.

## Endurecimiento del ejecutor: código listo, falta desplegar (2026-10-25)

El código del estudiante ahora corre con un usuario de Linux (`sandbox`) distinto del que corre el backend (`node`). Así, aunque el código rompa la Guardia (el límite de Java), no puede leer la llave secreta del backend ni sus archivos, porque ni siquiera es el mismo usuario del sistema. El backend comprueba esto al arrancar y **se niega a aceptar tráfico si no funciona** (más estricto que un error que solo se reintenta).

Una revisión de seguridad automática, corrida sola justo después del primer commit de este cambio, encontró 2 problemas reales que ya se corrigieron antes de desplegar nada:
- **(Alto)** el corte por tiempo agotado dejaría de funcionar para el código del estudiante (Node, con el usuario del backend, no puede mandarle una señal de "mátate" a un proceso de otro usuario del sistema).
- **(Medio)** la herramienta que cambiaba de usuario era demasiado general: con control total del backend, se podría haber pedido "cámbiame a root" en vez de a "sandbox".

Se resolvieron los dos con la misma pieza: un programa propio y muy pequeño (`sandboxexec`) al que SOLO se le puede pedir "vuélvete sandbox", nunca otro usuario, y que también se usa para mandar la señal de matar.

Se decidió no restringir el registro a un dominio institucional por ahora (proyecto semillero, no todos tienen correo institucional todavía).

Falta: que Render reconstruya la imagen con este cambio (el próximo `git push` lo dispara solo) y confirmar en los logs que la autoprueba pasa.

## Ajustes de Supabase pendientes

1. Dashboard → Authentication → Providers → Email: activar **Confirm email** y poner **Minimum password length = 8**.
2. La protección de contraseñas filtradas (HaveIBeenPwned) **no se puede activar**: es función del plan Pro, el proyecto está en el plan Free. Queda como limitación aceptada.

## Lo que sigue

1. **Vigilar en producción** la petición que se colgó en 2 de 8 pruebas locales (62 s y 8 s); si aparece allá, poner un tiempo máximo a las llamadas a Supabase.
2. Medir tiempos reales de envío de código bajo más carga (se esperaban 4–5 s por la CPU del plan gratis de Render) y correr `test:e2e` contra la URL de producción.

## Para retomar con Claude

Escribe algo como: *"sigamos con el endurecimiento del ejecutor"* o *"sigamos con los ajustes de Supabase"*.
Claude lee `CLAUDE.md` al empezar y sabe dónde quedamos.
