-- ReUsalo — exigir verificación de identidad a las cuentas nuevas.
-- Las cuentas que ya existen no quedan afectadas (no se verifican retroactivamente).
alter table public.profiles add column must_verify boolean not null default true;
update public.profiles set must_verify = false;
