-- ReUsalo — soporte para varias fotos por producto (rediseño)
-- Reemplaza photo_url (text) por photo_urls (text[]), migrando los datos existentes.

alter table public.products add column photo_urls text[] not null default '{}';

update public.products
set photo_urls = array[photo_url]
where photo_url is not null and photo_url <> '';

alter table public.products alter column photo_urls drop default;
alter table public.products drop column photo_url;
