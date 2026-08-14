import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => {
  const db = {
    categoria: [{ id: 'cat-1', nombre: 'Identidad', icono: 'x', orden: 1 }],
    tramite: [
      {
        id: 'tramite-1',
        nombre: 'Cédula de identidad',
        organismo: 'DNIC',
        modalidad: 'presencial',
        categoria_id: 'cat-1',
        categoria: { id: 'cat-1', nombre: 'Identidad' },
        activo: true,
      },
    ],
    checklist_item: [],
    usuario_tramite: [],
    reporte_cambio: [],
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
          const nuevo = { id: `row-${rows.length + 1}`, ...payload };
          rows.push(nuevo);
          resolve({ data: nuevo, error: null });
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
      __db: db,
    },
  };
});

test('reportar un cambio valida el comentario vacío y guarda el reporte', async () => {
  const { supabase } = require('./lib/supabase');
  const view = await render(<App />);

  await fireEvent.press(await view.findByText('Cédula de identidad'));
  await fireEvent.press(await view.findByText('¿Viste algo desactualizado? Reportalo →'));

  expect(await view.findByText('Reportar un cambio')).toBeTruthy();

  await fireEvent.press(view.getByText('Enviar reporte'));
  expect(await view.findByText('Contanos qué encontraste para poder revisarlo.')).toBeTruthy();

  await fireEvent.changeText(
    view.getByPlaceholderText('Ej: el costo cambió, ahora sale $600…'),
    'El link oficial está roto'
  );
  await fireEvent.press(view.getByText('Enviar reporte'));

  expect(await view.findByText('¡Gracias por avisarnos!')).toBeTruthy();
  expect(supabase.__db.reporte_cambio).toHaveLength(1);
  expect(supabase.__db.reporte_cambio[0]).toMatchObject({
    usuario_id: 'user-1',
    tramite_id: 'tramite-1',
    comentario: 'El link oficial está roto',
    estado: 'pendiente',
  });
});
