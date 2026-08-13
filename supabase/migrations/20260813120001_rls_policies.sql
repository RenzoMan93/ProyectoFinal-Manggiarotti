-- Row Level Security para el esquema de Ahora Resuelvo

-- Tabla de administradores + helper is_admin() ---------------------------
-- Un admin es cualquier usuario cuyo id esté en admin_users. Se gestiona
-- a mano (o con service_role) — no hay señal en el cliente para asignarse
-- a sí mismo como admin.

create table public.admin_users (
  usuario_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admin_users enable row level security;

-- Nadie puede leer/escribir admin_users desde el cliente; solo service_role
-- (que evita RLS) puede administrar esta tabla.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where usuario_id = auth.uid()
  );
$$;

-- categoria: lectura pública, escritura solo admin ------------------------

alter table public.categoria enable row level security;

create policy "categoria: lectura publica"
  on public.categoria for select
  to anon, authenticated
  using (true);

create policy "categoria: escritura admin"
  on public.categoria for insert
  to authenticated
  with check (public.is_admin());

create policy "categoria: actualizacion admin"
  on public.categoria for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categoria: borrado admin"
  on public.categoria for delete
  to authenticated
  using (public.is_admin());

-- tramite: lectura pública, escritura solo admin ---------------------------

alter table public.tramite enable row level security;

create policy "tramite: lectura publica"
  on public.tramite for select
  to anon, authenticated
  using (true);

create policy "tramite: escritura admin"
  on public.tramite for insert
  to authenticated
  with check (public.is_admin());

create policy "tramite: actualizacion admin"
  on public.tramite for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tramite: borrado admin"
  on public.tramite for delete
  to authenticated
  using (public.is_admin());

-- checklist_item: lectura pública, escritura solo admin --------------------

alter table public.checklist_item enable row level security;

create policy "checklist_item: lectura publica"
  on public.checklist_item for select
  to anon, authenticated
  using (true);

create policy "checklist_item: escritura admin"
  on public.checklist_item for insert
  to authenticated
  with check (public.is_admin());

create policy "checklist_item: actualizacion admin"
  on public.checklist_item for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "checklist_item: borrado admin"
  on public.checklist_item for delete
  to authenticated
  using (public.is_admin());

-- usuario_tramite: cada usuario solo ve/edita sus propias filas -----------

alter table public.usuario_tramite enable row level security;

create policy "usuario_tramite: propias filas"
  on public.usuario_tramite for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- reporte_cambio: el usuario lee/escribe lo propio, el admin ve y gestiona todo
-- (el estado pendiente/revisado/aplicado lo mueve un admin al procesar el
-- reporte, así que necesita acceso más allá de sus propias filas)

alter table public.reporte_cambio enable row level security;

create policy "reporte_cambio: propias filas"
  on public.reporte_cambio for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "reporte_cambio: admin ve y gestiona todo"
  on public.reporte_cambio for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Grants ------------------------------------------------------------------
-- Las policies de RLS son el filtro por fila, pero primero hace falta el
-- permiso de tabla: sin el GRANT correspondiente, anon/authenticated no
-- pueden ni siquiera intentar la operación. admin_users no se otorga a
-- ningún rol de cliente: solo se administra con la service_role key.

grant usage on schema public to anon, authenticated;

grant select on public.categoria, public.tramite, public.checklist_item
  to anon, authenticated;

grant insert, update, delete on public.categoria, public.tramite, public.checklist_item
  to authenticated;

grant select, insert, update, delete on public.usuario_tramite, public.reporte_cambio
  to authenticated;
