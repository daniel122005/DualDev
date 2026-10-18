-- DUALDEV · Revisión con el skill de Supabase · Permisos explícitos para la Data API.
-- Contexto (changelog de Supabase, 2026-04-28, "Tables not exposed to Data and GraphQL API automatically"):
-- en proyectos nuevos, y en todos los existentes desde el 2026-10-30, las tablas nuevas de `public`
-- ya NO reciben permisos automáticos para anon / authenticated / service_role.
-- Las migraciones anteriores daban permisos explícitos a `authenticated` pero dependían del permiso
-- automático para `service_role` (el rol del backend). Sin esto, una instalación desde cero deja al
-- backend sin acceso (error 42501). No quita permisos a nadie ni borra datos. Idempotente.

-- 1) Backend (service_role): acceso a todas las tablas de la app. service_role ya salta RLS.
grant select, insert, update, delete on table
  public.nivel, public.modulo, public.contenido, public.ejercicio, public.desafio, public.logro,
  public.usuario, public.progreso, public.intento_ejercicio, public.resultado_desafio,
  public.logro_usuario, public.contenido_completado
to service_role;

-- Columnas identity: por si el backend inserta directamente en alguna tabla con secuencia.
grant usage, select on all sequences in schema public to service_role;

-- 2) Funciones: Postgres da EXECUTE a PUBLIC (y por tanto a anon/authenticated) en toda función nueva.
--    Las de puntos ya están cerradas (migración 0004); esto evita que una función futura quede
--    expuesta por olvido, y cierra la del trigger de registro.
--    OJO: va SIN "in schema public". Los privilegios por defecto por esquema solo pueden AÑADIR
--    permisos; no quitan el EXECUTE global a PUBLIC (comprobado: con "in schema" no tiene efecto).
--    Consecuencia: toda función que se cree de ahora en adelante (también las usadas dentro de
--    políticas RLS) necesita un "grant execute ... to <rol>" explícito para quien deba usarla.
alter default privileges for role postgres revoke execute on functions from public;
revoke all on function public.handle_new_user() from public, anon, authenticated;
