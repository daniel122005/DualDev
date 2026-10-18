-- DUALDEV · Fase 8 · Endurecer el perfil del estudiante (hallazgo de la auditoría de seguridad).
-- Problema: el nombre no tenía límite en la base de datos. Registrándose directo contra Supabase se
-- guardó un nombre de 20.000 caracteres, y con la API de Supabase un estudiante podía poner su nombre
-- vacío o gigante (se muestra a los demás en el ranking), saltándose la validación del backend.
-- No borra datos. Idempotente.

-- 1) El alta normaliza el nombre: sin caracteres de control, recortado y de 2 a 80 caracteres.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text;
begin
  v_nombre := left(btrim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'nombre', ''), '[[:cntrl:]]', '', 'g')), 80);
  if char_length(v_nombre) < 2 then
    v_nombre := left(split_part(new.email, '@', 1), 80);
  end if;
  if char_length(btrim(v_nombre)) < 2 then
    v_nombre := 'Estudiante';
  end if;

  insert into public.usuario (id_usuario, nombre, correo) values (new.id, v_nombre, new.email);
  insert into public.progreso (id_usuario) values (new.id);
  return new;
end;
$$;

-- 2) Regla en la base de datos (última línea de defensa, la misma que valida el backend en PATCH /api/profile).
alter table public.usuario drop constraint if exists usuario_nombre_check;
alter table public.usuario add constraint usuario_nombre_check
  check (char_length(btrim(nombre)) between 2 and 80 and char_length(nombre) <= 80);

-- 3) Los estudiantes ya no editan su fila directamente con la API de Supabase: el perfil se edita
--    solo por el backend (PATCH /api/profile), que valida y usa service_role. Lectura sin cambios.
revoke update on public.usuario from authenticated;
drop policy if exists usuario_update on public.usuario;
