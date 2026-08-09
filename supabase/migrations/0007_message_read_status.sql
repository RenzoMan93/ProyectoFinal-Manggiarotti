-- ReUsalo — marcar conversaciones como leídas para mostrar notificación de no leídos
alter table public.conversations add column buyer_last_read_at timestamptz;
alter table public.conversations add column seller_last_read_at timestamptz;
