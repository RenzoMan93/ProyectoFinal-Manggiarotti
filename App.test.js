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
    },
  ];

  function createQueryBuilder(result) {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      or: () => builder,
      then: (resolve) => resolve(result),
    };
    return builder;
  }

  return {
    supabase: {
      from: (table) => {
        if (table === 'categoria') return createQueryBuilder({ data: mockCategorias, error: null });
        if (table === 'tramite') return createQueryBuilder({ data: mockTramites, error: null });
        return createQueryBuilder({ data: [], error: null });
      },
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    },
  };
});

test('Inicio trae categorías y trámites reales, y navega a la ficha al tocar una card', async () => {
  const view = await render(<App />);

  expect(await view.findByText('¿Qué trámite necesitás resolver?')).toBeTruthy();
  expect(await view.findByText('BPS')).toBeTruthy();

  const card = await view.findByText('Cédula de identidad');
  fireEvent.press(card);

  expect(await view.findByText('Detalle del trámite')).toBeTruthy();
  expect(view.getByText('ID: tramite-cedula')).toBeTruthy();
});

test('Búsqueda: estado vacío de recientes, resultados al escribir y guarda la búsqueda', async () => {
  const view = await render(<App />);

  fireEvent.press(view.getByLabelText(/Buscar, tab/));
  expect(await view.findByText('Todavía no buscaste nada')).toBeTruthy();

  const input = view.getByPlaceholderText('Buscar: cédula, RUT, patente…');
  fireEvent.changeText(input, 'cedula');

  expect(await view.findByText('1 resultado para "cedula"')).toBeTruthy();
  expect(view.getByText('Cédula de identidad')).toBeTruthy();

  fireEvent.changeText(input, '');
  expect(await view.findByText('cedula')).toBeTruthy();
});
