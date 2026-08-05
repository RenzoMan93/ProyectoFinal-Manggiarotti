-- ReUsalo — ajuste de orders al brief revisado (v1 sin pasarela de pago)
-- El pago se coordina directo entre comprador y vendedor (efectivo/transferencia);
-- se descartan el método 'tarjeta', el estado 'retenido' y mp_payment_id.
-- Seguro de aplicar: orders/reviews están vacías (Fase 4/5 todavía no se construyen).

drop table if exists public.reviews;
drop table if exists public.orders;
drop type if exists public.order_status;
drop type if exists public.order_method;

create type public.order_method as enum ('efectivo','transferencia');
create type public.order_status as enum ('coordinando','enviado','confirmado','en_disputa');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null,
  method public.order_method not null,
  status public.order_status not null default 'coordinando',
  note text,
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
