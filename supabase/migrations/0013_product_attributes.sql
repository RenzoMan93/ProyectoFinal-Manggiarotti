-- ReUsalo — atributos nuevos de producto para el rediseño del feed
alter table public.products add column brand text;
alter table public.products add column material text;
alter table public.products add column offers_shipping boolean not null default false;
alter table public.products add column old_price numeric(12,2);
