-- ReUsalo — marcar como leída usando la hora del servidor (evita depender
-- del reloj del navegador del usuario para comparar contra created_at)
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  update public.conversations
  set
    buyer_last_read_at = case when buyer_id = auth.uid() then now() else buyer_last_read_at end,
    seller_last_read_at = case when seller_id = auth.uid() then now() else seller_last_read_at end
  where id = p_conversation_id
    and (buyer_id = auth.uid() or seller_id = auth.uid());
end;
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;
