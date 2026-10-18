-- DUALDEV · Fase 5 · Lecciones, ejercicios de código Java y registro atómico de intentos/puntos.
-- También deja listas las columnas que necesitan las fases 6 y 7, para aplicar SQL manual una sola vez.
-- Idempotente: se puede ejecutar más de una vez.

-- ---------------------------------------------------------------------------
-- Módulos y lecciones (contenido)
-- ---------------------------------------------------------------------------
alter table public.modulo
  add column if not exists dificultad text not null default 'basico';
alter table public.modulo drop constraint if exists modulo_dificultad_check;
alter table public.modulo add constraint modulo_dificultad_check
  check (dificultad in ('basico', 'intermedio', 'avanzado'));

alter table public.contenido
  add column if not exists salida_ejemplo    text,
  add column if not exists tip               text,
  add column if not exists minutos_estimados integer not null default 5,
  add column if not exists puntos            integer not null default 50;
alter table public.contenido drop constraint if exists contenido_minutos_check;
alter table public.contenido add constraint contenido_minutos_check check (minutos_estimados > 0);
alter table public.contenido drop constraint if exists contenido_puntos_check;
alter table public.contenido add constraint contenido_puntos_check check (puntos >= 0);

-- Lecciones terminadas: la PK impide dar los puntos de una lección dos veces.
create table if not exists public.contenido_completado (
  id_usuario       uuid    not null references public.usuario (id_usuario) on delete cascade,
  id_contenido     bigint  not null references public.contenido (id_contenido) on delete cascade,
  puntos_otorgados integer not null default 0 check (puntos_otorgados >= 0),
  fecha            timestamptz not null default now(),
  primary key (id_usuario, id_contenido)
);
create index if not exists contenido_completado_contenido_idx on public.contenido_completado (id_contenido);

-- ---------------------------------------------------------------------------
-- Ejercicios: tipo "codigo" con casos de prueba ocultos
-- ---------------------------------------------------------------------------
alter table public.ejercicio
  add column if not exists codigo_inicial text,
  add column if not exists pistas         jsonb not null default '[]'::jsonb,
  add column if not exists casos_prueba   jsonb,
  add column if not exists requiere       jsonb not null default '[]'::jsonb;
comment on column public.ejercicio.casos_prueba is
  'Solo backend. [{ "entrada": "...", "salida": "...", "visible": bool }]. Los visibles se muestran como ejemplo.';
comment on column public.ejercicio.requiere is
  'Estructuras obligatorias en el código, p. ej. ["for"] o ["do-while"]; evita imprimir el resultado a mano.';

-- Una sola pista de texto -> lista de pistas.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'ejercicio' and column_name = 'pista') then
    update public.ejercicio set pistas = jsonb_build_array(pista)
      where pista is not null and pistas = '[]'::jsonb;
    alter table public.ejercicio drop column pista;
  end if;
end $$;

alter table public.ejercicio drop constraint if exists ejercicio_tipo_check;
alter table public.ejercicio add constraint ejercicio_tipo_check
  check (tipo in ('seleccion', 'respuesta_corta', 'salida', 'codigo'));
alter table public.ejercicio drop constraint if exists ejercicio_codigo_check;
alter table public.ejercicio add constraint ejercicio_codigo_check
  check (tipo <> 'codigo' or (codigo_inicial is not null
                              and jsonb_typeof(casos_prueba) = 'array'
                              and jsonb_array_length(casos_prueba) > 0));
alter table public.ejercicio drop constraint if exists ejercicio_listas_check;
alter table public.ejercicio add constraint ejercicio_listas_check
  check (jsonb_typeof(pistas) = 'array' and jsonb_typeof(requiere) = 'array');

-- ---------------------------------------------------------------------------
-- Intentos: se registran todos; los puntos solo en el PRIMER acierto.
-- Antes: único por acierto (impedía guardar un segundo acierto). Ahora: único por intento con puntos.
-- ---------------------------------------------------------------------------
alter table public.intento_ejercicio
  add column if not exists duracion_seg integer,
  add column if not exists detalle      jsonb;
alter table public.intento_ejercicio drop constraint if exists intento_duracion_check;
alter table public.intento_ejercicio add constraint intento_duracion_check
  check (duracion_seg is null or duracion_seg between 0 and 86400);

drop index if exists public.intento_acierto_unico_idx;
create unique index if not exists intento_puntos_unico_idx
  on public.intento_ejercicio (id_usuario, id_ejercicio) where puntos_otorgados > 0;
create index if not exists intento_usuario_fecha_idx on public.intento_ejercicio (id_usuario, created_at desc);

-- ---------------------------------------------------------------------------
-- Fase 6/7: perfil, logros y desafíos
-- ---------------------------------------------------------------------------
alter table public.usuario add column if not exists grado text;
alter table public.usuario drop constraint if exists usuario_grado_check;
alter table public.usuario add constraint usuario_grado_check check (grado is null or char_length(grado) <= 20);
grant update (nombre, grado) on public.usuario to authenticated;

alter table public.logro add column if not exists icono text;
alter table public.logro drop constraint if exists logro_tipo_criterio_check;
alter table public.logro add constraint logro_tipo_criterio_check check (tipo_criterio in (
  'puntos', 'ejercicios_completados', 'modulos_completados', 'desafios_completados',
  'lecciones_completadas', 'racha_dias', 'nivel', 'top_ranking', 'ejercicios_perfectos'));

alter table public.desafio
  add column if not exists periodo           text not null default 'mini',
  add column if not exists disponible_desde  timestamptz,
  add column if not exists disponible_hasta  timestamptz,
  add column if not exists minutos_estimados integer not null default 15,
  add column if not exists codigo_inicial    text,
  add column if not exists pistas            jsonb not null default '[]'::jsonb,
  add column if not exists casos_prueba      jsonb,
  add column if not exists requiere          jsonb not null default '[]'::jsonb;
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'desafio' and column_name = 'pista') then
    update public.desafio set pistas = jsonb_build_array(pista)
      where pista is not null and pistas = '[]'::jsonb;
    alter table public.desafio drop column pista;
  end if;
end $$;
alter table public.desafio drop constraint if exists desafio_periodo_check;
alter table public.desafio add constraint desafio_periodo_check check (periodo in ('diario', 'semanal', 'mini'));
alter table public.desafio drop constraint if exists desafio_tipo_check;
alter table public.desafio add constraint desafio_tipo_check
  check (tipo in ('seleccion', 'respuesta_corta', 'salida', 'codigo'));
alter table public.desafio drop constraint if exists desafio_codigo_check;
alter table public.desafio add constraint desafio_codigo_check
  check (tipo <> 'codigo' or (codigo_inicial is not null
                              and jsonb_typeof(casos_prueba) = 'array'
                              and jsonb_array_length(casos_prueba) > 0));
alter table public.desafio drop constraint if exists desafio_ventana_check;
alter table public.desafio add constraint desafio_ventana_check
  check (disponible_desde is null or disponible_hasta is null or disponible_desde < disponible_hasta);

alter table public.resultado_desafio
  add column if not exists duracion_seg integer,
  add column if not exists detalle      jsonb;

-- ---------------------------------------------------------------------------
-- RLS de la tabla nueva
-- ---------------------------------------------------------------------------
alter table public.contenido_completado enable row level security;
revoke all on public.contenido_completado from anon, authenticated;
grant select on public.contenido_completado to authenticated;
drop policy if exists contenido_completado_select on public.contenido_completado;
create policy contenido_completado_select on public.contenido_completado for select to authenticated
  using (id_usuario = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Funciones transaccionales (solo el backend con service_role puede llamarlas)
-- ---------------------------------------------------------------------------

-- Nivel que corresponde a unos puntos.
create or replace function public.nivel_para_puntos(p_puntos integer)
returns smallint
language sql
stable
set search_path = ''
as $$
  select coalesce(max(n.numero), 1)::smallint from public.nivel n where n.puntos_minimos <= p_puntos;
$$;

-- Suma puntos al progreso y recalcula el nivel. Devuelve el total nuevo.
create or replace function public.sumar_puntos(p_usuario uuid, p_puntos integer)
returns table (puntos_totales integer, nivel smallint)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  return query
  update public.progreso p
     set puntos_acumulados = p.puntos_acumulados + p_puntos,
         nivel_actual      = public.nivel_para_puntos(p.puntos_acumulados + p_puntos),
         updated_at        = now()
   where p.id_usuario = p_usuario
  returning p.puntos_acumulados, p.nivel_actual;
end;
$$;

-- Registra un intento. Si es correcto y es el primer acierto, otorga los puntos del ejercicio
-- en la misma transacción. Dos peticiones simultáneas no pueden cobrar dos veces: el índice
-- único parcial intento_puntos_unico_idx hace que la segunda se registre con 0 puntos.
create or replace function public.registrar_intento_ejercicio(
  p_usuario    uuid,
  p_ejercicio  bigint,
  p_respuesta  text,
  p_correcto   boolean,
  p_feedback   text,
  p_detalle    jsonb,
  p_duracion   integer
)
returns table (id_intento bigint, puntos_otorgados integer, primer_acierto boolean, puntos_totales integer, nivel smallint)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_puntos integer;
  v_id     bigint;
begin
  select e.puntos into v_puntos from public.ejercicio e where e.id_ejercicio = p_ejercicio;
  if not found then
    raise exception 'El ejercicio % no existe', p_ejercicio using errcode = 'P0002';
  end if;

  if p_correcto then
    insert into public.intento_ejercicio
      (id_usuario, id_ejercicio, respuesta, es_correcto, puntos_otorgados, feedback, detalle, duracion_seg)
    values (p_usuario, p_ejercicio, p_respuesta, true, v_puntos, p_feedback, p_detalle, p_duracion)
    on conflict (id_usuario, id_ejercicio) where puntos_otorgados > 0 do nothing
    returning intento_ejercicio.id_intento into v_id;

    if v_id is not null then
      return query
        select v_id, v_puntos, true, s.puntos_totales, s.nivel from public.sumar_puntos(p_usuario, v_puntos) s;
      return;
    end if;
  end if;

  insert into public.intento_ejercicio
    (id_usuario, id_ejercicio, respuesta, es_correcto, puntos_otorgados, feedback, detalle, duracion_seg)
  values (p_usuario, p_ejercicio, p_respuesta, p_correcto, 0, p_feedback, p_detalle, p_duracion)
  returning intento_ejercicio.id_intento into v_id;

  return query
    select v_id, 0, false, p.puntos_acumulados, p.nivel_actual
      from public.progreso p where p.id_usuario = p_usuario;
end;
$$;

-- Marca una lección como terminada y otorga sus puntos solo la primera vez.
create or replace function public.completar_contenido(p_usuario uuid, p_contenido bigint)
returns table (puntos_otorgados integer, nuevo boolean, puntos_totales integer, nivel smallint)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_puntos  integer;
  v_insertado boolean;
begin
  select c.puntos into v_puntos from public.contenido c where c.id_contenido = p_contenido;
  if not found then
    raise exception 'La lección % no existe', p_contenido using errcode = 'P0002';
  end if;

  insert into public.contenido_completado (id_usuario, id_contenido, puntos_otorgados)
  values (p_usuario, p_contenido, v_puntos)
  on conflict (id_usuario, id_contenido) do nothing;
  v_insertado := found;

  if v_insertado and v_puntos > 0 then
    return query
      select v_puntos, true, s.puntos_totales, s.nivel from public.sumar_puntos(p_usuario, v_puntos) s;
    return;
  end if;

  return query
    select 0, v_insertado, p.puntos_acumulados, p.nivel_actual
      from public.progreso p where p.id_usuario = p_usuario;
end;
$$;

-- Registra el resultado de un desafío. Una fila por (usuario, desafío); los puntos solo al completarlo
-- por primera vez. El bloqueo de fila (for update) serializa envíos simultáneos del mismo estudiante.
create or replace function public.registrar_resultado_desafio(
  p_usuario   uuid,
  p_desafio   bigint,
  p_respuesta text,
  p_correcto  boolean,
  p_detalle   jsonb,
  p_duracion  integer
)
returns table (puntos_otorgados integer, primera_vez boolean, intentos integer, puntos_totales integer, nivel smallint)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_recompensa integer;
  v_fila       public.resultado_desafio%rowtype;
  v_nueva      boolean;
begin
  select d.puntos_recompensa into v_recompensa from public.desafio d where d.id_desafio = p_desafio;
  if not found then
    raise exception 'El desafío % no existe', p_desafio using errcode = 'P0002';
  end if;

  insert into public.resultado_desafio (id_usuario, id_desafio, completado, respuesta, intentos, detalle, duracion_seg)
  values (p_usuario, p_desafio, false, p_respuesta, 0, p_detalle, p_duracion)
  on conflict (id_usuario, id_desafio) do nothing;

  select * into v_fila from public.resultado_desafio r
   where r.id_usuario = p_usuario and r.id_desafio = p_desafio
   for update;

  v_nueva := p_correcto and not v_fila.completado;

  update public.resultado_desafio r
     set intentos         = r.intentos + 1,
         respuesta        = p_respuesta,
         detalle          = p_detalle,
         duracion_seg     = p_duracion,
         completado       = r.completado or p_correcto,
         puntos_otorgados = case when v_nueva then v_recompensa else r.puntos_otorgados end,
         updated_at       = case when v_nueva or not r.completado then now() else r.updated_at end
   where r.id_resultado = v_fila.id_resultado
  returning * into v_fila;

  if v_nueva then
    return query
      select v_recompensa, true, v_fila.intentos, s.puntos_totales, s.nivel
        from public.sumar_puntos(p_usuario, v_recompensa) s;
    return;
  end if;

  return query
    select 0, false, v_fila.intentos, p.puntos_acumulados, p.nivel_actual
      from public.progreso p where p.id_usuario = p_usuario;
end;
$$;

-- intentos parte en 0 en la inserción técnica de arriba; el check original exige > 0.
alter table public.resultado_desafio drop constraint if exists resultado_desafio_intentos_check;
alter table public.resultado_desafio add constraint resultado_desafio_intentos_check check (intentos >= 0);

-- Por defecto Postgres deja ejecutar funciones a PUBLIC (y Supabase las expone por RPC). Se cierran.
revoke all on function public.nivel_para_puntos(integer) from public, anon, authenticated;
revoke all on function public.sumar_puntos(uuid, integer) from public, anon, authenticated;
revoke all on function public.registrar_intento_ejercicio(uuid, bigint, text, boolean, text, jsonb, integer) from public, anon, authenticated;
revoke all on function public.completar_contenido(uuid, bigint) from public, anon, authenticated;
revoke all on function public.registrar_resultado_desafio(uuid, bigint, text, boolean, jsonb, integer) from public, anon, authenticated;
grant execute on function public.nivel_para_puntos(integer) to service_role;
grant execute on function public.sumar_puntos(uuid, integer) to service_role;
grant execute on function public.registrar_intento_ejercicio(uuid, bigint, text, boolean, text, jsonb, integer) to service_role;
grant execute on function public.completar_contenido(uuid, bigint) to service_role;
grant execute on function public.registrar_resultado_desafio(uuid, bigint, text, boolean, jsonb, integer) to service_role;
