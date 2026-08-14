-- Constraints únicos que permiten re-ejecutar el seed de trámites de forma
-- idempotente (upsert por numero_guia / por posición dentro del trámite).

alter table public.tramite
  add constraint tramite_numero_guia_unico unique (numero_guia);

alter table public.checklist_item
  add constraint checklist_item_tramite_orden_unico unique (tramite_id, orden);
