-- DUALDEV · Fase 2 · Esquema base
-- Convención: tablas y columnas en snake_case español, igual que el modelo del proyecto.

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------

create table public.nivel (
  numero          smallint primary key,
  nombre          text    not null,
  puntos_minimos  integer not null unique check (puntos_minimos >= 0)
);

create table public.modulo (
  id_modulo    bigint generated always as identity primary key,
  titulo       text    not null,
  descripcion  text    not null,
  orden        integer not null unique check (orden > 0),
  disponible   boolean not null default true
);

create table public.contenido (
  id_contenido   bigint generated always as identity primary key,
  id_modulo      bigint  not null references public.modulo (id_modulo) on delete cascade,
  titulo         text    not null,
  explicacion    text    not null,
  codigo_ejemplo text,
  orden          integer not null check (orden > 0),
  unique (id_modulo, orden)
);

create table public.ejercicio (
  id_ejercicio      bigint generated always as identity primary key,
  id_modulo         bigint  not null references public.modulo (id_modulo) on delete cascade,
  titulo            text    not null,
  enunciado         text    not null,
  tipo              text    not null check (tipo in ('seleccion', 'respuesta_corta', 'salida')),
  dificultad        text    not null check (dificultad in ('facil', 'media', 'dificil')),
  puntos            integer not null check (puntos > 0),
  opciones          jsonb,
  solucion_esperada text    not null,
  pista             text,
  explicacion       text,
  orden             integer not null check (orden > 0),
  unique (id_modulo, orden),
  check (tipo <> 'seleccion' or jsonb_typeof(opciones) = 'array')
);
comment on column public.ejercicio.solucion_esperada is
  'Solo el backend la lee. Admite alternativas separadas por "|". Se compara normalizada (espacios/mayúsculas).';

create table public.desafio (
  id_desafio        bigint generated always as identity primary key,
  titulo            text    not null unique,
  enunciado         text    not null,
  tipo              text    not null check (tipo in ('seleccion', 'respuesta_corta', 'salida')),
  dificultad        text    not null check (dificultad in ('facil', 'media', 'dificil')),
  opciones          jsonb,
  solucion_esperada text    not null,
  pista             text,
  puntos_recompensa integer not null check (puntos_recompensa > 0),
  disponible        boolean not null default true,
  check (tipo <> 'seleccion' or jsonb_typeof(opciones) = 'array')
);

create table public.logro (
  id_logro        bigint generated always as identity primary key,
  codigo          text    not null unique,
  nombre          text    not null,
  descripcion     text    not null,
  tipo_criterio   text    not null check (tipo_criterio in
                    ('puntos', 'ejercicios_completados', 'modulos_completados', 'desafios_completados')),
  valor_requerido integer not null check (valor_requerido > 0),
  unique (tipo_criterio, valor_requerido)
);

-- ---------------------------------------------------------------------------
-- Datos del estudiante
-- ---------------------------------------------------------------------------

-- Perfil público ligado a Supabase Auth. Nunca guarda contraseñas.
create table public.usuario (
  id_usuario  uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null,
  correo      text not null unique,
  created_at  timestamptz not null default now()
);

create table public.progreso (
  id_progreso       bigint generated always as identity primary key,
  id_usuario        uuid     not null unique references public.usuario (id_usuario) on delete cascade,
  puntos_acumulados integer  not null default 0 check (puntos_acumulados >= 0),
  nivel_actual      smallint not null default 1 references public.nivel (numero),
  updated_at        timestamptz not null default now()
);
create index progreso_ranking_idx on public.progreso (puntos_acumulados desc);
create index progreso_nivel_idx on public.progreso (nivel_actual);

create table public.intento_ejercicio (
  id_intento       bigint generated always as identity primary key,
  id_usuario       uuid    not null references public.usuario (id_usuario) on delete cascade,
  id_ejercicio     bigint  not null references public.ejercicio (id_ejercicio) on delete cascade,
  respuesta        text    not null,
  es_correcto      boolean not null,
  puntos_otorgados integer not null default 0 check (puntos_otorgados >= 0),
  feedback         text,
  created_at       timestamptz not null default now()
);
create index intento_usuario_ejercicio_idx on public.intento_ejercicio (id_usuario, id_ejercicio);
create index intento_ejercicio_idx on public.intento_ejercicio (id_ejercicio);
-- Un estudiante solo puede acertar una vez cada ejercicio: evita puntos repetidos aunque se repita la petición.
create unique index intento_acierto_unico_idx
  on public.intento_ejercicio (id_usuario, id_ejercicio) where es_correcto;

create table public.resultado_desafio (
  id_resultado     bigint generated always as identity primary key,
  id_usuario       uuid    not null references public.usuario (id_usuario) on delete cascade,
  id_desafio       bigint  not null references public.desafio (id_desafio) on delete cascade,
  completado       boolean not null default false,
  respuesta        text,
  intentos         integer not null default 1 check (intentos > 0),
  puntos_otorgados integer not null default 0 check (puntos_otorgados >= 0),
  updated_at       timestamptz not null default now(),
  unique (id_usuario, id_desafio)
);
create index resultado_desafio_idx on public.resultado_desafio (id_desafio);

create table public.logro_usuario (
  id_usuario       uuid   not null references public.usuario (id_usuario) on delete cascade,
  id_logro         bigint not null references public.logro (id_logro) on delete cascade,
  fecha_obtencion  timestamptz not null default now(),
  primary key (id_usuario, id_logro)
);
create index logro_usuario_logro_idx on public.logro_usuario (id_logro);

-- ---------------------------------------------------------------------------
-- Alta automática de perfil y progreso al registrarse en Supabase Auth
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuario (id_usuario, nombre, correo)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.progreso (id_usuario) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
