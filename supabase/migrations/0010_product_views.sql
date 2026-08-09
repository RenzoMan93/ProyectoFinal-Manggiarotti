-- ReUsalo — contador de vistas por producto
alter table public.products add column views integer not null default 0;

-- security definer: cualquier visitante (incluso sin cuenta) puede sumar una
-- vista, sin necesidad de darle permiso de UPDATE general sobre products.
create or replace function public.increment_product_views(p_product_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products set views = views + 1 where id = p_product_id;
end;
$$;

grant execute on function public.increment_product_views(uuid) to anon, authenticated;
