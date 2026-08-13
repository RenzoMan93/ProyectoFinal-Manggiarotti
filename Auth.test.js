import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => {
  let session = null;
  let listener = null;

  function crearSesion(email) {
    return { user: { id: 'user-mock', email } };
  }

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
        signInWithPassword: async ({ email, password }) => {
          if (email === 'valida@test.com' && password === 'correcta123') {
            session = crearSesion(email);
            listener?.('SIGNED_IN', session);
            return { data: { session, user: session.user }, error: null };
          }
          return { data: { session: null, user: null }, error: { message: 'Invalid login credentials' } };
        },
        signUp: async ({ email }) => {
          if (email === 'existe@test.com') {
            return { data: { session: null, user: null }, error: { message: 'User already registered' } };
          }
          if (email === 'pendiente@test.com') {
            return { data: { session: null, user: { id: 'user-pendiente' } }, error: null };
          }
          session = crearSesion(email);
          listener?.('SIGNED_IN', session);
          return { data: { session, user: session.user }, error: null };
        },
        onAuthStateChange: (callback) => {
          listener = callback;
          return { data: { subscription: { unsubscribe: () => { listener = null; } } } };
        },
      },
      // jest.mock solo corre una vez por archivo: sin esto, la sesión de un
      // test quedaría pisando el estado inicial ("deslogueado") del siguiente.
      __resetSession: () => {
        session = null;
        listener = null;
      },
    },
  };
});

beforeEach(() => {
  require('./lib/supabase').supabase.__resetSession();
});

test('login con credenciales incorrectas muestra error y no navega', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Mis trámites, tab/));
  expect(await view.findByText('Iniciar sesión')).toBeTruthy();

  await fireEvent.changeText(view.getByPlaceholderText('tu@email.com'), 'mala@test.com');
  await fireEvent.changeText(view.getByPlaceholderText('••••••••'), 'incorrecta');
  await fireEvent.press(view.getByText('Iniciar sesión'));

  expect(await view.findByText('Email o contraseña incorrectos.')).toBeTruthy();
});

test('login exitoso vuelve atrás y desbloquea Mis trámites', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Mis trámites, tab/));
  await view.findByText('Iniciar sesión');

  await fireEvent.changeText(view.getByPlaceholderText('tu@email.com'), 'valida@test.com');
  await fireEvent.changeText(view.getByPlaceholderText('••••••••'), 'correcta123');
  await fireEvent.press(view.getByText('Iniciar sesión'));

  expect(await view.findByText('Tu actividad')).toBeTruthy();
});

test('signup sin confirmación de email pendiente vuelve atrás logueado', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Mis trámites, tab/));
  await view.findByText('Iniciar sesión');

  await fireEvent.press(view.getByText('¿No tenés cuenta? Registrate'));
  expect(await view.findByText('Creá tu cuenta')).toBeTruthy();

  await fireEvent.changeText(view.getByPlaceholderText('tu@email.com'), 'nueva@test.com');
  await fireEvent.changeText(view.getByPlaceholderText('••••••••'), 'unaClave123');
  await fireEvent.press(view.getByText('Crear cuenta'));

  expect(await view.findByText('Tu actividad')).toBeTruthy();
});

test('signup que requiere confirmación de email avisa y vuelve a modo login', async () => {
  const view = await render(<App />);

  await fireEvent.press(view.getByLabelText(/Mis trámites, tab/));
  await view.findByText('Iniciar sesión');
  await fireEvent.press(view.getByText('¿No tenés cuenta? Registrate'));

  await fireEvent.changeText(view.getByPlaceholderText('tu@email.com'), 'pendiente@test.com');
  await fireEvent.changeText(view.getByPlaceholderText('••••••••'), 'unaClave123');
  await fireEvent.press(view.getByText('Crear cuenta'));

  expect(
    await view.findByText('Te enviamos un email para confirmar tu cuenta. Confirmalo y después iniciá sesión.')
  ).toBeTruthy();
  expect(view.getByText('Iniciá sesión')).toBeTruthy();
});
