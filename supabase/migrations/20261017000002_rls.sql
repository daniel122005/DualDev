-- DUALDEV · Fase 2 · RLS y permisos
-- Principio: el cliente (anon key) solo LEE lo suyo y los catálogos públicos.
-- Toda escritura de intentos, puntos, progreso y logros la hace el backend con service_role (salta RLS).

alter table public.nivel              enable row level security;
alter table public.modulo             enable row level security;
alter table public.contenido          enable row level security;
alter table public.ejercicio          enable row level security;
alter table public.desafio            enable row level security;
alter table public.logro              enable row level security;
alter table public.usuario            enable row level security;
alter table public.progreso           enable row level security;
alter table public.intento_ejercicio  enable row level security;
alter table public.resultado_desafio  enable row level security;
alter table public.logro_usuario      enable row level security;

-- Quitar los permisos por defecto de Supabase y conceder solo lo necesario.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.nivel, public.modulo, public.contenido, public.logro to authenticated;
grant select on public.usuario, public.progreso, public.intento_ejercicio,
                public.resultado_desafio, public.logro_usuario to authenticated;
grant update (nombre) on public.usuario to authenticated;

-- Catálogos: lectura para usuarios autenticados.
create policy nivel_select    on public.nivel    for select to authenticated using (true);
create policy logro_select    on public.logro    for select to authenticated using (true);
create policy modulo_select   on public.modulo   for select to authenticated using (disponible);
create policy contenido_select on public.contenido for select to authenticated
  using (exists (select 1 from public.modulo m where m.id_modulo = contenido.id_modulo and m.disponible));

-- ejercicio y desafio: SIN política a propósito. Contienen la solución esperada,
-- así que solo el backend (service_role) los lee y entrega al cliente sin ese campo.

-- Datos propios del estudiante.
create policy usuario_select on public.usuario for select to authenticated
  using (id_usuario = (select auth.uid()));
create policy usuario_update on public.usuario for update to authenticated
  using (id_usuario = (select auth.uid()))
  with check (id_usuario = (select auth.uid()));

create policy progreso_select on public.progreso for select to authenticated
  using (id_usuario = (select auth.uid()));
create policy intento_select on public.intento_ejercicio for select to authenticated
  using (id_usuario = (select auth.uid()));
create policy resultado_select on public.resultado_desafio for select to authenticated
  using (id_usuario = (select auth.uid()));
create policy logro_usuario_select on public.logro_usuario for select to authenticated
  using (id_usuario = (select auth.uid()));
