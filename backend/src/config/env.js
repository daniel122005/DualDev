import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // Ejecutor de código Java (ver src/runner/index.js):
  //  - "local": desarrollo en el equipo del programador.
  //  - "contenedor": el backend entero corre dentro de una imagen Docker desechable (Render) y los
  //    programas se ejecutan ahí como procesos hijos con la Guardia, sin root y sin secretos.
  RUNNER: z.enum(['local', 'contenedor']).default('local'),
  JAVA_HOME: z.string().optional(),
  RUNNER_CONCURRENCIA: z.coerce.number().int().min(1).max(16).default(2),
  // Límites ajustables según la CPU del servidor (en uno de 0,1 CPU todo tarda ~10 veces más y un
  // programa correcto no debe confundirse con un ciclo infinito).
  RUNNER_CASOS_EN_PARALELO: z.coerce.number().int().min(1).max(8).default(3),
  RUNNER_COMPILACION_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
  RUNNER_EJECUCION_MS: z.coerce.number().int().min(500).max(30_000).default(3_000),
})

export const env = schema.parse(process.env)
