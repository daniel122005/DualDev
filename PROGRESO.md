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

## Lo que te toca a ti: desplegar

Sigue `DESPLIEGUE.md` paso a paso. Todo es gratis y sin tarjeta.

1. **Render** (backend con Docker, `render.yaml`).
2. **Vercel** (frontend).
3. **Render → `CORS_ORIGIN`**, si la URL de Vercel no es `https://dualdev.vercel.app`.
4. **Supabase → Authentication → URL Configuration**: pon tu URL de Vercel en *Site URL* y en *Redirect URLs*.
5. **cron-job.org**: un ping cada 10 min a `https://<tu-backend>.onrender.com/api/health`.

> La migración 0007 y el seed **ya están aplicados** en Supabase. No hay SQL pendiente.

Cuando termines, pásame:
- la URL de Vercel (frontend);
- la URL de Render (backend).

## Lo que sigue después (lo hago yo cuando vuelvas)

1. **Verificar producción:**
   - que la imagen Docker se construya;
   - las pantallas;
   - los envíos de código y la CSP;
   - los tiempos reales en Render (se esperan 4–5 s por envío de código por la CPU del plan gratis);
   - `npm run test:e2e` contra la URL de producción.
2. **Vigilar en producción una petición que se colgó** en 2 de 8 pruebas locales (62 s y 8 s). No se pudo reproducir; si aparece allá, se pone un tiempo máximo a las llamadas a Supabase.
3. **Endurecer el ejecutor:** correr los programas de los estudiantes con otro usuario de Linux, para que no puedan leer las variables del backend aunque se rompa la Guardia.
4. **Pendientes de Supabase para producción:**
   - activar la confirmación de correo;
   - restringir el registro (dominio institucional o invitación);
   - contraseña mínima de 8 caracteres;
   - revisar el Security Advisor y el Performance Advisor.

## Para retomar con Claude

Escribe algo como: *"Ya desplegué, estas son las URLs: … sigamos con la verificación en producción"*,
o *"sigamos con el endurecimiento del ejecutor"*. Claude lee `CLAUDE.md` al empezar y sabe dónde quedamos.
