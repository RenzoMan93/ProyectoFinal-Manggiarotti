-- ReUsalo — editar/eliminar mensajes y ocultar conversaciones por usuario
alter table public.messages add column edited_at timestamptz;
alter table public.messages add column deleted_at timestamptz;

alter table public.conversations add column deleted_by_buyer boolean not null default false;
alter table public.conversations add column deleted_by_seller boolean not null default false;

create policy "El remitente edita o elimina su propio mensaje"
  on public.messages for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

-- Al llegar un mensaje nuevo, la conversación reaparece para quien la había ocultado.
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = now(), deleted_by_buyer = false, deleted_by_seller = false
  where id = new.conversation_id;
  return new;
end;
$$;
