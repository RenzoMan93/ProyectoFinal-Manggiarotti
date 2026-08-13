-- Seed inicial de categorías para Ahora Resuelvo
-- Los nombres de "icono" son claves de Ionicons (@expo/vector-icons), a
-- ajustar cuando se defina el set de íconos final de la app.

insert into public.categoria (nombre, icono, orden)
values
  ('Identidad', 'finger-print-outline', 1),
  ('BPS', 'people-outline', 2),
  ('DGI', 'receipt-outline', 3),
  ('Vehículos', 'car-outline', 4),
  ('Municipal', 'business-outline', 5)
on conflict (nombre) do update
set icono = excluded.icono,
    orden = excluded.orden;
