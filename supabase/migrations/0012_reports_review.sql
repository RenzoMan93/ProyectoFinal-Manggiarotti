-- ReUsalo — panel de reportes para el admin
alter table public.reports add column resolved boolean not null default false;
alter table public.reports add column resolved_at timestamptz;

create policy "Un admin ve los reportes"
  on public.reports for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "Un admin marca reportes como resueltos"
  on public.reports for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
