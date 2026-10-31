# DUALDEV

Plataforma educativa de Java (ciclos `for`, `while`, `do-while`) para estudiantes del Instituto Técnico Industrial, con gamificación (XP, niveles, logros, retos, ranking). Contenido y UI en español.

## Stack tecnológico

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin `tailwind.config` ni PostCSS). NO Next.js.
- **Backend:** Node.js + Express (API REST).
- **Datos / Auth:** Supabase (Supabase Auth + PostgreSQL). NO Firebase ni MongoDB.
- No cambiar el stack sin consultar al dueño del proyecto.

## Comandos

Scripts reales de cada `package.json`:

- Frontend (`cd frontend`): `npm run dev` (http://localhost:5173), `npm run build`, `npm run lint` (oxlint), `npm run preview`
- Backend (`cd backend`): `npm run dev` (node --watch, http://localhost:4000), `npm start`, `npm test` (node --test; 104 pruebas, 2 específicas de Linux quedan en `skip` en Windows: utilidades, ejecutor Java real, análisis "tono profe", configuración del ejecutor, limitador, caché), `npm run test:e2e` (con el backend corriendo: recorre RF-01..RF-12, seguridad, puntos duplicados con concurrencia y tiempos contra Supabase real; crea y borra estudiantes `dualdev.e2e.*`)

Backend en ESM, Express 5. Lee `backend/.env` con `--env-file-if-exists` (no usa dotenv). Alias `@` → `frontend/src`.

## Estructura de carpetas (objetivo)

```
DualDev/
  CLAUDE.md
  frontend/            React + Vite + TS
    src/
      assets/ components/ pages/ layouts/ hooks/ contexts/ services/ utils/ routes/
      index.css        @theme con la paleta, fuentes y clases base
  backend/
    src/
      config/ routes/ controllers/ services/ repositories/ middleware/ utils/
      app.js  server.js
  supabase/
    migrations/        SQL versionado (esquema, RLS, triggers)
    seed.sql           datos iniciales
```

## Variables de entorno

Nunca subir credenciales. Cada app tendrá su `.env.example`.

- Frontend (`frontend/.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- Backend (`backend/.env`): `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo backend), `CORS_ORIGIN`

## Identidad visual (referencia obligatoria; origen: Figma Make)

Archivo: https://www.figma.com/make/9msYKlAZGs7CbOjujImloj/Mockups-para-plataforma-DualDev (el MCP de Figma no conectó; la referencia es la descripción de Figma Make).

- **Paleta (bloque `@theme` en `src/index.css`):** fondo `#03110c`, superficie `#061a13`, tarjetas de cristal translúcido, borde `rgba(122,240,180,0.12)`. Primario esmeralda `#1ed48a`, oscuro `#0e9f6e`, claro `#7af0b4`, acento lima `#b6ff3c` (solo progreso/XP). Estados: ámbar `#fbbf24` (oro/XP), coral `#fb7185` (error), naranja suave `#fdba74`. Texto `#effcf6`, secundario `#84b9a2`.
- **100% verde:** no introducir azules, morados ni otros tonos de marca.
- **Tipografía:** títulos Sora (700-800), texto Plus Jakarta Sans, código JetBrains Mono.
- **Logo:** componente vectorial `components/Logo.tsx` (`Logo`, `LogoMark`): ficha oscura con "D" (tronco blanco + curva degradado menta→lima) y cursor `>`. Wordmark "DUAL" blanco / "DEV" con degradado. Tagline "APRENDE · PRACTICA · AVANZA". Nunca imágenes raster.
- **Clases base:** `.card-border` (cristal, radio 20px, hover elevado), `.btn-primary`, `.btn-lime`, `.nav-item`, `.progress-bar`/`.progress-fill`, `.code-block`, `.page-enter`, `.float-slow`. Respetar `prefers-reduced-motion`.
- **Pantallas del diseño:** Login/Registro, Dashboard, Módulos, Lección, Práctica, Feedback, Retos, Perfil, Ranking, dentro de un `AppShell` (sidebar + contenido).
- No cambiar paleta, logo ni tipografías salvo petición explícita.

### Referencia de diseño real (zip de Figma Make, revisado 2026-10-17)

Copia en `design/figma-make/src/` (solo lectura, NO es parte de la app; es mock con datos falsos y estilos inline). Es la fuente de verdad visual; tiene prioridad sobre la descripción de arriba.
- Tokens: `--color-primary` es `#0e9f6e` (oscuro) y `--color-primary-light` es `#1ed48a`; en la descripción estaban invertidos. Hay además `--color-card`, `--color-card2`, `--color-green-neon/bright/pale`, `--color-yellow/red/orange`, `--color-muted`. Adoptar los nombres del zip en la Fase 4.
- Layout: `AppShell` = sidebar fijo 228px (`hidden md:flex`) con Logo, 6 ítems (Dashboard, Módulos, Práctica, Retos, Ranking, Mi Perfil), tarjeta "Progreso semanal" y "Cerrar sesión"; en móvil, barra superior con los íconos. Contenido `max-w-3xl/4xl/5xl mx-auto p-6`.
- Login/Registro: una sola pantalla con pestañas; registro con nombre, correo institucional y contraseña (sin confirmación).
- Íconos: emojis/símbolos unicode, no librería de íconos. Solo tema oscuro.
- No existen pantallas separadas de Logros ni Progreso (van en Dashboard y Perfil) ni detalle de módulo (la tarjeta del módulo lleva a la lección).

## Reglas del proyecto

- **Codificación (Windows PowerShell 5.1):** nunca editar archivos con `Get-Content -Raw` + `WriteAllText`/`Set-Content`: `Get-Content` lee UTF-8 sin BOM como ANSI y al reescribir se corrompen tildes y emojis ("Ã³", "ðŸ”¥"). Usar la herramienta Edit, o Node (`fs.readFileSync(..., 'utf8')`). Esto ya pasó una vez (Dashboard.tsx y la migración 0004, reparados el 2026-10-17); para detectarlo: buscar `Ã[\x80-\xBF]|â€|ðŸ` fuera de node_modules.

- Fidelidad al Figma > usabilidad > responsive > código mantenible. No rediseñar.
- Backend por capas: routes → controllers → services (lógica) → repositories (acceso a datos); middleware para auth, validación y errores.
- La gamificación (puntos, niveles, logros) se decide SOLO en el backend. El frontend nunca envía puntos.
- Puntos idempotentes: un ejercicio solo otorga puntos la primera vez que se resuelve bien.
- `service_role` jamás en el frontend. Autenticación vía Supabase Auth (sin auth falsa en localStorage). Contraseñas nunca en tablas propias.
- RLS en todas las tablas de usuario.
- Nombres: tablas/columnas en `snake_case` español como el modelo (`usuario`, `modulo`...) salvo decisión contraria en Fase 2; componentes React en `PascalCase`; hooks `useX`; archivos de servicio `xService`.
- No ejecutar código Java arbitrario sin aislamiento. V1: respuestas estructuradas / selección / comparación de salida.
- No agregar librerías innecesarias; no duplicar componentes; no refactors grandes sin avisar.
- Tras cada fase: ejecutar lint/build/tests reales y reportar trazabilidad RF/RNF.

## Repositorio

- GitHub: https://github.com/daniel122005/DualDev (**PÚBLICO**, decisión del usuario 2026-10-18). Rama principal `main` (rastrea `origin/main`).
- Nunca versionar `.env` ni llaves (verificar antes de cada push: el repo es público). Commits solo cuando el usuario lo pida.

## Estado actual

Ver `PROGRESO.md` — ahí vive todo: fase por fase, qué falta por mejorar y las decisiones/hallazgos que no se derivan del código (seed, niveles, hosting, seguridad). Actualizarlo al cerrar cada bloque de trabajo, no este archivo.
