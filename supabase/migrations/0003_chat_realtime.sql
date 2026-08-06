-- ReUsalo — Fase 5: habilitar Realtime en mensajes (chat en vivo)
-- y un trigger que actualiza conversations.updated_at con cada mensaje nuevo.

alter publication supabase_realtime add table public.messages;

create function public.touch_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();
