-- ReUsalo — schema inicial (Fase 1)
-- Pegar completo en Supabase Dashboard -> SQL Editor -> Run,
-- o aplicar con `supabase db push` si usás la CLI.

-- ============================================================
-- EXTENSIONES
-- ============================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================
-- PROFILES (extiende auth.users de Supabase, 1:1)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null unique,
  id_verified boolean not null default false,
  id_verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles son visibles para todos"
  on public.profiles for select
  using (true);

create policy "Un usuario puede crear su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Un usuario puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea automáticamente el perfil cuando alguien se registra en Supabase Auth.
-- El name/phone se pasan como metadata en el signUp() del cliente.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- KYC DOCUMENTS (cédula) — nunca en bucket público, tabla bloqueada
-- para lectura desde el cliente (solo backend con service_role).
-- ============================================================
create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  front_photo_path text not null,
  back_photo_path text not null,
  verified_at timestamptz not null default now()
);

alter table public.kyc_documents enable row level security;

create policy "Un usuario puede subir sus propios documentos de KYC"
  on public.kyc_documents for insert
  with check (auth.uid() = user_id);
-- Sin policy de select/update/delete: la tabla queda bloqueada para
-- anon/authenticated; solo el backend con la service_role key puede leerla.

-- ============================================================
-- PRODUCTS
-- ============================================================
create type public.product_category as enum (
  'hogar','electro','tech','ropa','deportes','bebes',
  'libros','herramientas','vehiculos','mascotas','otros'
);
create type public.product_condition as enum (
  'Nuevo','Usado - buen estado','Usado - regular estado'
);
create type public.product_status as enum ('disponible','vendido','pausado');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price > 0),
  category public.product_category not null,
  condition public.product_condition not null,
  location text not null,
  color text,
  photo_url text not null,
  status public.product_status not null default 'disponible',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Los productos son visibles para todos"
  on public.products for select
  using (true);

create policy "Un usuario autenticado puede publicar productos"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "El vendedor puede editar sus propios productos"
  on public.products for update
  using (auth.uid() = seller_id);

create policy "El vendedor puede borrar sus propios productos"
  on public.products for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- FAVORITES
-- ============================================================
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "Un usuario ve sus propios favoritos"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Un usuario agrega sus propios favoritos"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Un usuario borra sus propios favoritos"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ORDERS
-- Nota: las políticas de update se van a afinar en la Fase 4
-- (checkout) para restringir qué transición de estado puede hacer
-- cada rol; por ahora alcanza con que solo comprador/vendedor lean
-- y editen sus propias órdenes.
-- ============================================================
create type public.order_method as enum ('efectivo','transferencia','tarjeta');
create type public.order_status as enum ('retenido','coordinando','enviado','confirmado','en_disputa');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null,
  method public.order_method not null,
  status public.order_status not null default 'coordinando',
  note text,
  mp_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Comprador o vendedor ven la orden"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "El comprador crea la orden"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "Comprador o vendedor actualizan la orden"
  on public.orders for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ============================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (product_id, buyer_id)
);

alter table public.conversations enable row level security;

create policy "Comprador o vendedor ven la conversación"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "El comprador inicia la conversación"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

create policy "Comprador o vendedor actualizan la conversación"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Los participantes de la conversación ven los mensajes"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Un participante envía mensajes como sí mismo"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  buyer_id uuid not null references public.profiles(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Las calificaciones son visibles para todos"
  on public.reviews for select
  using (true);

create policy "El comprador califica tras una compra confirmada"
  on public.reviews for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.buyer_id = auth.uid()
        and o.status = 'confirmado'
    )
  );

-- ============================================================
-- REPORTS — bloqueada para lectura desde el cliente (solo backend/admin)
-- ============================================================
create type public.report_type as enum ('product','user');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  type public.report_type not null,
  reported_product_id uuid references public.products(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  reason text not null,
  comment text,
  created_at timestamptz not null default now(),
  check (
    (type = 'product' and reported_product_id is not null and reported_user_id is null) or
    (type = 'user' and reported_user_id is not null and reported_product_id is null)
  )
);

alter table public.reports enable row level security;

create policy "Un usuario autenticado puede reportar"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
-- Sin policy de select: solo el backend con service_role ve los reportes.

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- product-photos: lectura pública, escritura solo del dueño en su propia
-- carpeta (convención de path: product-photos/{uid}/{archivo})
create policy "Fotos de productos con lectura pública"
  on storage.objects for select
  using (bucket_id = 'product-photos');

create policy "El dueño sube sus propias fotos de productos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "El dueño borra sus propias fotos de productos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- kyc-documents: privado. Un usuario puede subir a su propia carpeta,
-- pero nadie (ni siquiera el dueño) puede leerlo desde el cliente;
-- solo el backend con service_role.
create policy "El dueño sube sus propios documentos de KYC"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
