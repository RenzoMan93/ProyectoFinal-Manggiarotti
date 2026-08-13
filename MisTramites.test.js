import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => {
  const db = {
    categoria: [{ id: 'cat-1', nombre: 'Identidad', icono: 'x', orden: 1 }],
    tramite: [
      {
        id: 'tramite-en-curso',
        nombre: 'Trámite en curso',
        organismo: 'Org A',
        modalidad: 'presencial',
        categoria_id: 'cat-1',
        categoria: { id: 'cat-1', nombre: 'Identidad' },
        activo: true,
      },
      {
        id: 'tramite-completado',
        nombre: 'Trámite completado',
        organismo: 'Org B',
        modalidad: 'online',
        categoria_id: 'cat-1',
        categoria: { id: 'cat-1', nombre: 'Identidad' },
        activo: true,
      },
      {
        id: 'tramite-guardado',
        nombre: 'Trámite guardado',
        organismo: 'Org C',
        modalidad: 'mixta',
        categoria_id: 'cat-1',
        categoria: { id: 'cat-1', nombre: 'Identidad' },
        activo: true,
      },
      {
        id: 'tramite-nuevo',
        nombre: 'Trámite sin empezar',
        organismo: 'Org D',
        modalidad: 'presencial',
        categoria_id: 'cat-1',
        categoria: { id: 'cat-1', nombre: 'Identidad' },
        descripcion: 'Un trámite que todavía no toqué.',
        activo: true,
      },
    ],
    checklist_item: [
      { id: 'item-1', tramite_id: 'tramite-en-curso', texto: 'Paso 1', subtexto: null, orden: 1 },
      { id: 'item-2', tramite_id: 'tramite-en-curso', texto: 'Paso 2', subtexto: null, orden: 2 },
    ],
    usuario_tramite: [
      {
        id: 'ut-1',
        usuario_id: 'user-1',
        tramite_id: 'tramite-en-curso',
        estado: 'en_curso',
        items_completados: ['item-1'],
        fecha_completado: null,
        recordatorio_activo: false,
        tramite: {
          id: 'tramite-en-curso',
          nombre: 'Trámite en curso',
          organismo: 'Org A',
          checklist_item: [{ count: 2 }],
        },
      },
      {
        id: 'ut-2',
        usuario_id: 'user-1',
        tramite_id: 'tramite-completado',
        estado: 'completado',
        items_completados: [],
        fecha_completado: '2026-08-03',
        recordatorio_activo: false,
        tramite: {
          id: 'tramite-completado',
          nombre: 'Trámite completado',
          organismo: 'Org B',
          checklist_item: [],
        },
      },
      {
        id: 'ut-3',
        usuario_id: 'user-1',
        tramite_id: 'tramite-guardado',
        estado: 'guardado',
        items_completados: [],
        fecha_completado: null,
        recordatorio_activo: false,
        tramite: {
          id: 'tramite-guardado',
          nombre: 'Trámite guardado',
          organismo: 'Org C',
          checklist_item: [],
        },
      },
    ],
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
    },
  };
});

test('Mis trámites muestra las 3 tabs con sus conteos y contenido correcto', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Mis trámites, tab/));

  expect(await view.findByText('En curso (1)')).toBeTruthy();
  expect(view.getByText('Completados (1)')).toBeTruthy();
  expect(view.getByText('Guardados (1)')).toBeTruthy();

  // Tab "En curso" es la que arranca activa.
  expect(view.getByText('Trámite en curso')).toBeTruthy();
  expect(view.getByText('1 de 2 pasos')).toBeTruthy();

  await fireEvent.press(view.getByText('Completados (1)'));
  expect(await view.findByText('Trámite completado')).toBeTruthy();
  expect(view.getByText('Completado el 3 de agosto')).toBeTruthy();

  await fireEvent.press(view.getByText('Guardados (1)'));
  expect(await view.findByText('Trámite guardado')).toBeTruthy();
  expect(view.getByText('Org C')).toBeTruthy();
});

test('Guardar para después crea el registro y el botón desaparece', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Buscar, tab/));
  await fireEvent.changeText(
    view.getByPlaceholderText('Buscar: cédula, RUT, patente…'),
    'sin empezar'
  );
  await fireEvent.press(await view.findByText('Trámite sin empezar'));

  expect(await view.findByText('Un trámite que todavía no toqué.')).toBeTruthy();
  expect(view.getByText('Guardar')).toBeTruthy();

  await fireEvent.press(view.getByText('Guardar'));

  // El botón "Guardar" desaparece una vez que ya existe un usuario_tramite.
  await view.findByText('Empezar checklist');
  expect(view.queryByText('Guardar')).toBeNull();
});
