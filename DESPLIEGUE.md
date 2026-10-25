# Despliegue gratis de DUALDEV

Todo en planes gratis y sin tarjeta:

| Parte | Servicio | Dirección |
|---|---|---|
| Frontend | Vercel (Hobby) | `https://<proyecto>.vercel.app` |
| Backend + Java | Render (Free, Docker) | `https://dualdev-api.onrender.com` |
| BD + Auth | Supabase (Free) | la de siempre |
| Mantener despierto | cron-job.org | — |

Orden: **Render → Vercel → volver a Render (CORS) → Supabase → cron-job.org**.
Ten a mano los valores de `backend/.env` y `frontend/.env` (cópialos de ahí, **nunca** los subas a GitHub).

## 1. Backend en Render

1. Entra a <https://render.com> → **Get Started** → regístrate **con GitHub**.
2. **New +** → **Blueprint** → elige el repositorio `daniel122005/DualDev` → **Connect**.
   Render lee `render.yaml` y propone el servicio `dualdev-api`.
3. Te pedirá 4 valores secretos:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → los mismos de `backend/.env`.
   - `CORS_ORIGIN` → por ahora escribe `https://dualdev.vercel.app` (se corrige en el paso 3 si Vercel te da otro nombre).
4. **Apply**. El primer build tarda unos minutos (descarga Node y el JDK).
5. Cuando diga **Live**, abre `https://dualdev-api.onrender.com/api/health` (o la URL que te muestre Render).
   Debe responder `{"status":"ok","bd":"ok"}`. **Copia esa URL.**

## 2. Frontend en Vercel

1. Entra a <https://vercel.com/signup> → plan **Hobby** → continúa **con GitHub**.
2. **Add New… → Project** → importa `DualDev`.
3. Configura:
   - **Root Directory:** `frontend` (botón *Edit*).
   - **Framework Preset:** Vite (lo detecta solo).
   - **Environment Variables:**
     - `VITE_SUPABASE_URL` → el de `frontend/.env`
     - `VITE_SUPABASE_ANON_KEY` → el de `frontend/.env`
     - `VITE_API_URL` → `https://dualdev-api.onrender.com/api` (la URL del paso 1 + `/api`)
4. **Deploy**. Al terminar, copia la URL del proyecto (p. ej. `https://dualdev.vercel.app`).

## 3. Volver a Render (CORS)

Si la URL de Vercel **no** es exactamente `https://dualdev.vercel.app`:
Render → `dualdev-api` → **Environment** → edita `CORS_ORIGIN` con tu URL de Vercel (sin `/` al final) → **Save** (se vuelve a desplegar solo).

## 4. Supabase

Dashboard → **Authentication → URL Configuration**:
- **Site URL:** tu URL de Vercel.
- **Redirect URLs:** añade tu URL de Vercel.

## 5. Mantenerlo despierto (cron-job.org)

Sin esto, Render apaga el backend tras 15 min sin visitas y Supabase pausa el proyecto tras ~7 días sin actividad.

1. Regístrate gratis en <https://cron-job.org>.
2. **Create cronjob**:
   - **URL:** `https://dualdev-api.onrender.com/api/health`
   - **Execution schedule:** cada **10 minutos**.
3. **Create**. En el historial deben verse respuestas **200**.

`/api/health` hace una consulta mínima a la BD, así que el mismo ping mantiene despiertos Render **y** Supabase.
Un ping cada 10 min usa ~720 de las 750 horas gratis al mes de Render: alcanza para un solo servicio.

## 6. Cuando termines

Pásame la URL de Vercel y la de Render y lo pruebo de punta a punta (pantallas, envíos de código, tiempos).

## Cómo funciona el ejecutor en producción

- La imagen `backend/Dockerfile` trae Node 24 + JDK 17 y corre **sin root** con `RUNNER=contenedor`.
- Cada programa de un estudiante es un proceso aparte con la Guardia (sin archivos, red, procesos ni
  variables de entorno; máximo 64 hilos), entorno vacío, carpeta temporal propia y, además, corre con
  un usuario de Linux `sandbox` DISTINTO del que corre el backend (`node`): aunque el código rompa la
  Guardia, no puede leer `/proc/<pid>/environ` del backend (la llave secreta) ni sus archivos, porque
  ni siquiera es el mismo usuario del sistema. El backend verifica esto al arrancar (autoprueba) y se
  niega a aceptar tráfico si no funciona.
- Límites para 0,1 CPU (en `render.yaml`): 1 envío y 1 caso a la vez, 30 s para compilar, 8 s por caso.
- **Limitación conocida (plan gratis):** todos los programas siguen compartiendo el contenedor del
  backend en vez de tener uno propio por ejecución (el usuario `sandbox` reduce el daño si la Guardia
  falla, pero no sustituye a un contenedor por ejecución). Para producción real: VPS con Docker y un
  contenedor por ejecución.
