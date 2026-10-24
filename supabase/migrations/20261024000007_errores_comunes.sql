-- DUALDEV · Retroalimentación "tono profe": errores comunes por ejercicio y por desafío.
-- Cada elemento explica un error típico y POR QUÉ ocurre ("Recuerda que…"). El backend lo compara con:
--   { "respuesta": "...", "mensaje": "..." }  opción elegida (seleccion) o texto (respuesta_corta, admite "|")
--   { "salida":    "...", "mensaje": "..." }  salida escrita (tipo salida) o impresa por el programa (codigo)
--   { "patron":    "...", "mensaje": "..." }  expresión regular sobre el código, sin comentarios ni textos (codigo)
-- Solo el backend la lee (ejercicio y desafio no tienen política RLS para estudiantes). No borra datos. Idempotente.

alter table public.ejercicio add column if not exists errores_comunes jsonb not null default '[]'::jsonb;
alter table public.desafio   add column if not exists errores_comunes jsonb not null default '[]'::jsonb;

alter table public.ejercicio drop constraint if exists ejercicio_errores_comunes_check;
alter table public.ejercicio add constraint ejercicio_errores_comunes_check check (jsonb_typeof(errores_comunes) = 'array');
alter table public.desafio drop constraint if exists desafio_errores_comunes_check;
alter table public.desafio add constraint desafio_errores_comunes_check check (jsonb_typeof(errores_comunes) = 'array');

comment on column public.ejercicio.errores_comunes is
  'Solo backend. [{ respuesta | salida | patron, mensaje }]: explicación de un error típico, en tono de profe.';
comment on column public.desafio.errores_comunes is
  'Solo backend. [{ respuesta | salida | patron, mensaje }]: explicación de un error típico, en tono de profe.';

-- Permisos explícitos (regla desde la migración 0006). Los estudiantes siguen sin acceso a estas tablas.
grant select, insert, update, delete on table public.ejercicio, public.desafio to service_role;
