-- Ahora Resuelvo — esquema inicial
-- Tablas: categoria, tramite, checklist_item, usuario_tramite, reporte_cambio

create extension if not exists pgcrypto;

create type public.modalidad_tramite as enum ('presencial', 'online', 'mixta');
create type public.estado_usuario_tramite as enum ('guardado', 'en_curso', 'completado');
create type public.estado_reporte_cambio as enum ('pendiente', 'revisado', 'aplicado');

-- categoria ------------------------------------------------------------

create table public.categoria (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  icono text,
  orden integer not null default 0
);

-- tramite ----------------------------------------------------------------

create table public.tramite (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria_id uuid not null references public.categoria (id) on delete restrict,
  organismo text not null,
  descripcion text,
  requisitos jsonb not null default '[]'::jsonb,
  costo_aprox text,
  modalidad public.modalidad_tramite not null,
  duracion_estimada text,
  link_oficial text,
  numero_guia text,
  fecha_verificacion date,
  verificado_por text,
  activo boolean not null default true,
  constraint requisitos_es_array check (jsonb_typeof(requisitos) = 'array')
);

create index tramite_categoria_id_idx on public.tramite (categoria_id);
create index tramite_activo_idx on public.tramite (activo);

-- checklist_item -----------------------------------------------------------

create table public.checklist_item (
  id uuid primary key default gen_random_uuid(),
  tramite_id uuid not null references public.tramite (id) on delete cascade,
  texto text not null,
  subtexto text,
  orden integer not null default 0
);

create index checklist_item_tramite_id_idx on public.checklist_item (tramite_id);

-- usuario_tramite ------------------------------------------------------

create table public.usuario_tramite (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tramite_id uuid not null references public.tramite (id) on delete cascade,
  estado public.estado_usuario_tramite not null default 'guardado',
  items_completados jsonb not null default '[]'::jsonb,
  fecha_inicio timestamptz,
  fecha_completado timestamptz,
  recordatorio_activo boolean not null default false,
  fecha_recordatorio timestamptz,
  constraint items_completados_es_array check (jsonb_typeof(items_completados) = 'array'),
  constraint usuario_tramite_unico unique (usuario_id, tramite_id)
);

create index usuario_tramite_usuario_id_idx on public.usuario_tramite (usuario_id);
create index usuario_tramite_tramite_id_idx on public.usuario_tramite (tramite_id);

-- reporte_cambio -----------------------------------------------------------

create table public.reporte_cambio (
  id uuid primary key default gen_random_uuid(),
  tramite_id uuid not null references public.tramite (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  comentario text not null,
  estado public.estado_reporte_cambio not null default 'pendiente',
  created_at timestamptz not null default now()
);

create index reporte_cambio_tramite_id_idx on public.reporte_cambio (tramite_id);
create index reporte_cambio_usuario_id_idx on public.reporte_cambio (usuario_id);
