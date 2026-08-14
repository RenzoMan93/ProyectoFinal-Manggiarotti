import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import App from './App';
import { formatFechaLarga } from './lib/format';

jest.mock('./lib/supabase', () => {
  const db = {
    categoria: [{ id: 'cat-vehiculos', nombre: 'Vehículos', icono: 'car-outline', orden: 1 }],
    tramite: [
      {
        id: 'tramite-transferencia',
        nombre: 'Transferencia de automotor',
        organismo: 'IMM / DNTMV',
        modalidad: 'presencial',
        categoria_id: 'cat-vehiculos',
        categoria: { id: 'cat-vehiculos', nombre: 'Vehículos' },
        descripcion: 'Cambio de titularidad de un vehículo.',
        costo_aprox: '$ 2.150',
        duracion_estimada: '~45 min',
        numero_guia: 'AR-00098',
        fecha_verificacion: '2026-06-01',
        link_oficial: null,
        activo: true,
      },
    ],
    checklist_item: [
      { id: 'item-1', tramite_id: 'tramite-transferencia', texto: 'Verificar padrón libre de deuda', subtexto: 'DARI · online', orden: 1 },
      { id: 'item-2', tramite_id: 'tramite-transferencia', texto: 'Completar formulario de transferencia', subtexto: null, orden: 2 },
    ],
    usuario_tramite: [],
  };

  function matches(row, filters) {
    return filters.every(([col, val]) => row[col] === val);
  }

  function createBuilder(table) {
    const filters = [];
    let mode = 'select';
    let payload = null;
    let single = false;
    let maybeSingle = false;

    const builder = {
      select: () => builder,
      eq: (col, val) => {
        filters.push([col, val]);
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      or: () => builder,
      insert: (obj) => {
        mode = 'insert';
        payload = obj;
        return builder;
      },
      update: (obj) => {
        mode = 'update';
        payload = obj;
        return builder;
      },
      single: () => {
        single = true;
        return builder;
      },
      maybeSingle: () => {
        maybeSingle = true;
        return builder;
      },
      then: (resolve) => {
        const rows = db[table];

        if (mode === 'insert') {
          if (table === 'usuario_tramite') {
            const dup = rows.find(
              (r) => r.usuario_id === payload.usuario_id && r.tramite_id === payload.tramite_id
            );
            if (dup) {
              resolve({ data: null, error: { code: '23505', message: 'duplicate' } });
              return;
            }
          }
          const nuevo = { id: `row-${rows.length + 1}`, ...payload };
          rows.push(nuevo);
          resolve({ data: nuevo, error: null });
          return;
        }

        if (mode === 'update') {
          const found = rows.filter((r) => matches(r, filters));
          found.forEach((r) => Object.assign(r, payload));
          resolve({ data: found[0] ?? null, error: null });
          return;
        }

        const found = rows.filter((r) => matches(r, filters));
        if (single) {
          resolve({ data: found[0] ?? null, error: found[0] ? null : { message: 'not found' } });
        } else if (maybeSingle) {
          resolve({ data: found[0] ?? null, error: null });
        } else {
          resolve({ data: found, error: null });
        }
      },
    };
    return builder;
  }

  return {
    supabase: {
      from: (table) => createBuilder(table),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'user-1', email: 'renzo@test.com' } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      // El mock vive a nivel de módulo (jest.mock solo corre una vez por
      // archivo), así que sin esto usuario_tramite quedaría contaminado
      // de un test al siguiente.
      __resetUsuarioTramite: () => {
        db.usuario_tramite.length = 0;
      },
    },
  };
});

beforeEach(() => {
  require('./lib/supabase').supabase.__resetUsuarioTramite();
  jest.clearAllMocks();
});

test('Ficha -> Empezar checklist -> tildar todos los items completa el trámite', async () => {
  const view = await render(<App />);

  await fireEvent.press(await view.findByText('Transferencia de automotor'));
  expect(await view.findByText('Vehículos · IMM / DNTMV')).toBeTruthy();

  await fireEvent.press(await view.findByText('Empezar checklist'));

  expect(await view.findByText('0 / 2')).toBeTruthy();
  expect(view.getByText('Verificar padrón libre de deuda')).toBeTruthy();
  expect(view.getByText('DARI · online')).toBeTruthy();

  await fireEvent.press(view.getByText('Verificar padrón libre de deuda'));
  expect(await view.findByText('1 / 2')).toBeTruthy();

  await fireEvent.press(view.getByText('Completar formulario de transferencia'));
  expect(await view.findByText('2 / 2')).toBeTruthy();
  expect(await view.findByText(/Trámite completado/)).toBeTruthy();

  // Destildar un ítem saca el trámite de "completado" otra vez.
  await fireEvent.press(view.getByText('Completar formulario de transferencia'));
  expect(await view.findByText('1 / 2')).toBeTruthy();
});

test('activar el recordatorio programa una notificación real y se puede desactivar', async () => {
  const view = await render(<App />);

  await fireEvent.press(await view.findByText('Transferencia de automotor'));
  await fireEvent.press(await view.findByText('Empezar checklist'));

  await fireEvent.press(await view.findByText('Recordatorio activo'));
  await fireEvent.press(await view.findByText('En 3 días'));

  const fechaEsperada = new Date();
  fechaEsperada.setDate(fechaEsperada.getDate() + 3);

  expect(
    await view.findByText(`Te avisamos el ${formatFechaLarga(fechaEsperada.toISOString())}`)
  ).toBeTruthy();
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.objectContaining({ body: expect.stringContaining('Transferencia de automotor') }),
      trigger: expect.objectContaining({ type: 'date' }),
    })
  );

  await fireEvent.press(view.getByText('Recordatorio activo'));
  expect(await view.findByText('Te avisamos si vence un paso')).toBeTruthy();
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('mock-notification-id');
});

test('si no hay permiso de notificaciones, avisa y no activa el recordatorio', async () => {
  Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: false });
  Notifications.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });
  const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});

  const view = await render(<App />);

  await fireEvent.press(await view.findByText('Transferencia de automotor'));
  await fireEvent.press(await view.findByText('Empezar checklist'));

  await fireEvent.press(await view.findByText('Recordatorio activo'));
  await fireEvent.press(await view.findByText('Mañana'));

  await waitFor(() =>
    expect(alertSpy).toHaveBeenCalledWith('Sin permiso para notificar', expect.any(String))
  );
  expect(view.getByText('Te avisamos si vence un paso')).toBeTruthy();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

  alertSpy.mockRestore();
});
