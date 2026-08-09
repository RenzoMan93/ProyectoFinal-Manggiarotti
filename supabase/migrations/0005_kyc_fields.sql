-- ReUsalo — campos adicionales para la verificación de identidad
alter table public.profiles add column document_number text;
alter table public.profiles add column birth_date date;
alter table public.profiles add column city text;
alter table public.profiles add column postal_code text;
