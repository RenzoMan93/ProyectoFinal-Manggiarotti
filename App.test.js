import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => {
  const mockCategorias = [
    { id: 'cat-identidad', nombre: 'Identidad', icono: 'finger-print-outline', orden: 1 },
    { id: 'cat-bps', nombre: 'BPS', icono: 'people-outline', orden: 2 },
  ];
  const mockTramites = [
    {
      id: 'tramite-cedula',
      nombre: 'Cédula de identidad',
      organismo: 'DNIC',
      modalidad: 'presencial',
      categoria_id: 'cat-identidad',
      categoria: { id: 'cat-identidad', nombre: 'Identidad' },
      descripcion: 'Documento nacional de identidad.',
      costo_aprox: '$ 490',
      duracion_estimada: '~30 min',
      numero_guia: 'AR-00214',
      fecha_verificacion: '2026-07-01',
      link_oficial: null,
      activo: true,
    },
  ];
  const mockChecklistItems = [
    { id: 'item-1', tramite_id: 'tramite-cedula', texto: 'Sacar turno en gub.uy', subtexto: null, orden: 1 },
  ];

  function createQueryBuilder(result) {
    let single = false;
    let maybeSingle = false;
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      or: () => builder,
      single: () => {
        single = true;
        return builder;
      },
      maybeSingle: () => {
        maybeSingle = true;
        return builder;
      },
      then: (resolve) => {
        if (single) {
          const row = result.data?.[0] ?? null;
          resolve({ data: row, error: row ? null : { message: 'not found' } });
        } else if (maybeSingle) {
          resolve({ data: result.data?.[0] ?? null, error: null });
        } else {
          resolve(result);
        }
      },
    };
    return builder;
  }

  return {
    supabase: {
      from: (table) => {
        if (table === 'categoria') return createQueryBuilder({ data: mockCategorias, error: null });
        if (table === 'tramite') return createQueryBuilder({ data: mockTramites, error: null });
        if (table === 'checklist_item') return createQueryBuilder({ data: mockChecklistItems, error: null });
        return createQueryBuilder({ data: [], error: null });
      },
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    },
  };
});

test('Inicio trae categorías y trámites reales, y navega a la ficha real al tocar una card', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const view = await render(<App />);

  expect(await view.findByText('¿Qué trámite necesitás resolver?')).toBeTruthy();
  expect(await view.findByText('BPS')).toBeTruthy();

  const card = await view.findByText('Cédula de identidad');
  await fireEvent.press(card);

  expect(await view.findByText('Identidad · DNIC')).toBeTruthy();
  expect(view.getByText('Documento nacional de identidad.')).toBeTruthy();
  expect(view.getByText('Sacar turno en gub.uy')).toBeTruthy();
  expect(view.getByText('GUÍA N° AR-00214 · verificada 07/2026')).toBeTruthy();

  expect(view.getByText('Guardar')).toBeTruthy();
  await fireEvent.press(view.getByText('Empezar checklist'));
  expect(await view.findByText('Iniciá sesión')).toBeTruthy();

  Alert.alert.mockRestore();
});

test('Búsqueda: estado vacío de recientes, resultados al escribir y guarda la búsqueda', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Buscar, tab/));
  expect(await view.findByText('Todavía no buscaste nada')).toBeTruthy();

  const input = view.getByPlaceholderText('Buscar: cédula, RUT, patente…');
  await fireEvent.changeText(input, 'cedula');

  expect(await view.findByText('1 resultado para "cedula"')).toBeTruthy();
  expect(view.getByText('Cédula de identidad')).toBeTruthy();

  await fireEvent.changeText(input, '');
  expect(await view.findByText('cedula')).toBeTruthy();
});
