import { fireEvent, render } from '@testing-library/react-native';
import App from './App';

jest.mock('./lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: async () => ({ data: [], error: null }),
    }),
  },
}));

test('navega de Inicio a Mis trámites y al detalle de un trámite', async () => {
  const view = await render(<App />);

  expect(await view.findByText('Próximamente: trámites destacados y accesos rápidos.')).toBeTruthy();

  fireEvent.press(view.getByLabelText(/Mis trámites, tab/));
  expect(
    await view.findByText('Próximamente: checklist de trámites guardados y su progreso.')
  ).toBeTruthy();

  fireEvent.press(view.getByLabelText(/Inicio, tab/));
  fireEvent.press(await view.findByText('Ver trámite de ejemplo'));

  expect(await view.findByText('Detalle del trámite')).toBeTruthy();
  expect(view.getByText('ID: demo-123')).toBeTruthy();
});
