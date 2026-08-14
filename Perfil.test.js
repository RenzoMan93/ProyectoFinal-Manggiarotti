import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => {
  let session = { user: { id: 'user-1', email: 'renzo@test.com', created_at: '2026-08-01T00:00:00.000Z' } };
  let listener = null;

  function createQueryBuilder(result) {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      or: () => builder,
      single: () => builder,
      maybeSingle: () => builder,
      then: (resolve) => resolve(result),
    };
    return builder;
  }

  return {
    supabase: {
      from: () => createQueryBuilder({ data: [], error: null }),
      auth: {
        getSession: async () => ({ data: { session } }),
        signOut: async () => {
          session = null;
          listener?.('SIGNED_OUT', null);
          return { error: null };
        },
        onAuthStateChange: (callback) => {
          listener = callback;
          return { data: { subscription: { unsubscribe: () => { listener = null; } } } };
        },
      },
      __resetSession: () => {
        session = { user: { id: 'user-1', email: 'renzo@test.com', created_at: '2026-08-01T00:00:00.000Z' } };
        listener = null;
      },
    },
  };
});

beforeEach(() => {
  require('./lib/supabase').supabase.__resetSession();
});

test('Perfil muestra los datos de la cuenta y cerrar sesión redirige a Auth', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Perfil, tab/));

  expect(await view.findByText('renzo@test.com')).toBeTruthy();
  expect(view.getByText('Cuenta creada el 1 de agosto')).toBeTruthy();

  await fireEvent.press(view.getByText('Cerrar sesión'));

  expect(await view.findByText('Iniciá sesión')).toBeTruthy();
});
