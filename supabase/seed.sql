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

-- Trámites iniciales -------------------------------------------------------
-- Contenido ilustrativo para tener algo real para navegar/buscar/guardar.
-- costo_aprox / link_oficial / duracion_estimada son aproximados: hay que
-- revisarlos contra la fuente oficial antes de usar esto en producción (para
-- eso existe la función de "reportar cambio" desde la ficha del trámite).
-- verificado_por marca que la revisión la hizo el equipo de la app, no un
-- organismo oficial.

-- Identidad · Cédula de identidad ------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Cédula de identidad',
  (select id from public.categoria where nombre = 'Identidad'),
  'DNIC',
  'Documento nacional de identidad. Se tramita por primera vez o se renueva cuando vence o se pierde.',
  '$ 490',
  'presencial',
  'Entrega en el momento',
  'https://www.gub.uy/ministerio-interior/tramites-y-servicios/servicios/cedula-identidad',
  'AR-00101',
  '2026-07-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Sacar turno previo en gub.uy', null::text, 1),
  ('Llevar la cédula vieja o vencida (si es renovación)', null::text, 2),
  ('Llevar partida de nacimiento (si es primera vez)', null::text, 3),
  ('Presentarte en la oficina de DNIC en la fecha del turno', null::text, 4)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00101'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- Identidad · Pasaporte ------------------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Pasaporte',
  (select id from public.categoria where nombre = 'Identidad'),
  'DNIC',
  'Documento de viaje internacional. Se tramita en las oficinas de DNIC con turno previo.',
  'USD 65 aprox.',
  'presencial',
  '5 a 10 días hábiles',
  'https://www.gub.uy/ministerio-interior/tramites-y-servicios/servicios/pasaporte',
  'AR-00102',
  '2026-07-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Sacar turno previo en gub.uy', null::text, 1),
  ('Llevar cédula de identidad vigente', null::text, 2),
  ('Pagar la tasa correspondiente', null::text, 3),
  ('Retirar el pasaporte en la fecha indicada', null::text, 4)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00102'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- BPS · Alta como monotributista ---------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Alta como monotributista',
  (select id from public.categoria where nombre = 'BPS'),
  'BPS',
  'Inscripción como monotributista para empezar a facturar de forma simplificada.',
  'Gratuito',
  'mixta',
  'Trámite en el día',
  'https://www.bps.gub.uy/',
  'AR-00201',
  '2026-06-15',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Tener RUT vigente en DGI', null::text, 1),
  ('Completar el formulario de inscripción en bps.gub.uy', null::text, 2),
  ('Presentar documentación en oficina BPS si se solicita', null::text, 3)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00201'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- BPS · Certificado único --------------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Certificado único BPS',
  (select id from public.categoria where nombre = 'BPS'),
  'BPS',
  'Constancia de estar al día con los aportes a la seguridad social, exigida en contrataciones y otros trámites.',
  'Gratuito',
  'online',
  'Inmediato',
  'https://www.bps.gub.uy/',
  'AR-00202',
  '2026-06-15',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Ingresar a bps.gub.uy con tu usuario', null::text, 1),
  ('Verificar que no tengas deuda pendiente', null::text, 2),
  ('Descargar el certificado en PDF', null::text, 3)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00202'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- DGI · Inscripción en DGI (alta de RUT) ------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Inscripción en DGI',
  (select id from public.categoria where nombre = 'DGI'),
  'DGI',
  'Alta de Registro Único Tributario (RUT) para empezar a operar como contribuyente.',
  'Gratuito',
  'mixta',
  'Trámite en el día',
  'https://www.dgi.gub.uy/',
  'AR-00301',
  '2026-06-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Completar el formulario de inscripción en dgi.gub.uy', null::text, 1),
  ('Llevar cédula de identidad', null::text, 2),
  ('Tener constancia de domicilio fiscal', null::text, 3)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00301'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- DGI · Constancia de inscripción (RUT) --------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Constancia de inscripción',
  (select id from public.categoria where nombre = 'DGI'),
  'DGI',
  'Tarjeta o constancia que certifica el número de RUT, pedida habitualmente por bancos y empleadores.',
  'Gratuito',
  'online',
  'Inmediato',
  'https://www.dgi.gub.uy/',
  'AR-00302',
  '2026-06-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Ingresar a dgi.gub.uy con tu usuario', null::text, 1),
  ('Descargar la constancia de inscripción', null::text, 2)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00302'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- Vehículos · Transferencia de automotor --------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Transferencia de automotor',
  (select id from public.categoria where nombre = 'Vehículos'),
  'IMM / DNTMV',
  'Cambio de titularidad de un vehículo entre comprador y vendedor.',
  '$ 2.150 aprox.',
  'presencial',
  'Turno + trámite en oficina',
  'https://www.gub.uy/tramites/transferencia-vehiculo',
  'AR-00401',
  '2026-06-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Verificar padrón libre de deuda', 'DARI · online', 1),
  ('Reunir cédulas de comprador y vendedor', null::text, 2),
  ('Completar formulario de transferencia', 'Descargable en gub.uy', 3),
  ('Pagar la tasa de transferencia', null::text, 4),
  ('Presentar en oficina departamental', 'Con turno agendado', 5)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00401'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- Vehículos · Renovación de libreta de conducir -----------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Renovación de libreta de conducir',
  (select id from public.categoria where nombre = 'Vehículos'),
  'Intendencia',
  'Renovación de la libreta de conducir vencida o próxima a vencer.',
  '$ 1.800 aprox.',
  'presencial',
  'Entrega en el momento',
  'https://www.gub.uy/tramites/licencia-conducir',
  'AR-00402',
  '2026-06-01',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Sacar turno previo', null::text, 1),
  ('Tener certificado de aptitud psicofísica vigente', null::text, 2),
  ('Llevar cédula de identidad vigente', null::text, 3),
  ('Pagar la tasa correspondiente', null::text, 4)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00402'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- Municipal · Cambio de domicilio --------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Cambio de domicilio',
  (select id from public.categoria where nombre = 'Municipal'),
  'Intendencia',
  'Actualización del domicilio registrado ante la Intendencia.',
  'Gratuito',
  'mixta',
  'Trámite en el día',
  'https://www.gub.uy/tramites/cambio-domicilio',
  'AR-00501',
  '2026-05-15',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Completar el formulario de cambio de domicilio', null::text, 1),
  ('Presentar comprobante del domicilio nuevo', null::text, 2),
  ('Actualizar el domicilio en la cédula si corresponde', null::text, 3)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00501'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;

-- Municipal · Patente de rodados ---------------------------------------------

insert into public.tramite (
  nombre, categoria_id, organismo, descripcion, costo_aprox, modalidad,
  duracion_estimada, link_oficial, numero_guia, fecha_verificacion, verificado_por, activo
)
select
  'Patente de rodados',
  (select id from public.categoria where nombre = 'Municipal'),
  'Intendencia',
  'Pago anual de la patente de rodados ante la Intendencia.',
  'Varía según el vehículo',
  'online',
  'Inmediato',
  'https://www.gub.uy/tramites/patente-rodados',
  'AR-00502',
  '2026-05-15',
  'Equipo Ahora Resuelvo',
  true
on conflict (numero_guia) do update set
  nombre = excluded.nombre, categoria_id = excluded.categoria_id, organismo = excluded.organismo,
  descripcion = excluded.descripcion, costo_aprox = excluded.costo_aprox, modalidad = excluded.modalidad,
  duracion_estimada = excluded.duracion_estimada, link_oficial = excluded.link_oficial,
  fecha_verificacion = excluded.fecha_verificacion, verificado_por = excluded.verificado_por,
  activo = excluded.activo;

insert into public.checklist_item (tramite_id, texto, subtexto, orden)
select t.id, x.texto, x.subtexto, x.orden
from public.tramite t
cross join (values
  ('Consultar el monto en el sitio de tu Intendencia', null::text, 1),
  ('Verificar que no tengas multas pendientes', null::text, 2),
  ('Pagar online o en red de cobranza', null::text, 3)
) as x(texto, subtexto, orden)
where t.numero_guia = 'AR-00502'
on conflict (tramite_id, orden) do update set texto = excluded.texto, subtexto = excluded.subtexto;
