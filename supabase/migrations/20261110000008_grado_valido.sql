-- DUALDEV · El grado del perfil solo puede ser de 6° a 11° (observación de quienes probaron la plataforma:
-- se podía escribir cualquier número). Es la misma regla que valida el backend en PATCH /api/profile.
-- Lo que ya estaba guardado: "10" pasa a "10°" y lo que no sea un grado real queda sin especificar.
-- Idempotente.

update public.usuario
set grado = case
  when btrim(grado) ~ '^(6|7|8|9|10|11)°?$' then rtrim(btrim(grado), '°') || '°'
  else null
end
where grado is not null and grado not in ('6°', '7°', '8°', '9°', '10°', '11°');

alter table public.usuario drop constraint if exists usuario_grado_check;
alter table public.usuario add constraint usuario_grado_check
  check (grado is null or grado in ('6°', '7°', '8°', '9°', '10°', '11°'));
