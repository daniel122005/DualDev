import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // Ejecutor de código Java. "local" solo para desarrollo (ver src/runner/javaLocal.js).
  RUNNER: z.enum(['local']).default('local'),
  JAVA_HOME: z.string().optional(),
  RUNNER_CONCURRENCIA: z.coerce.number().int().min(1).max(16).default(2),
})

export const env = schema.parse(process.env)
