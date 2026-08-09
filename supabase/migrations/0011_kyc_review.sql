-- ReUsalo — revisión manual de cédulas (sin IA)
alter table public.profiles add column is_admin boolean not null default false;
alter table public.profiles add column verification_status text not null default 'none'
  check (verification_status in ('none', 'pending', 'approved', 'rejected'));
alter table public.profiles add column rejection_reason text;

-- Las cuentas ya verificadas quedan como "approved" para no perder el estado.
update public.profiles set verification_status = 'approved' where id_verified = true;

-- Un admin puede ver los documentos de verificación de cualquier usuario.
create policy "Un admin ve los documentos de verificación"
  on public.kyc_documents for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Un admin puede ver las fotos del bucket privado kyc-documents.
create policy "Un admin ve las fotos de kyc-documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Un admin puede aprobar o rechazar la verificación de cualquier perfil.
create policy "Un admin aprueba o rechaza verificaciones"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
