import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DEPARTAMENTOS } from '../utils/uruguay';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    departamento: 'Montevideo',
    barrio: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const update = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Ese email ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('No pudimos crear tu cuenta. Intentá de nuevo.');
      }
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Creá tu cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            required
            value={form.nombre}
            onChange={update('nombre')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Departamento</label>
          <select
            value={form.departamento}
            onChange={update('departamento')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          >
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Barrio (opcional)</label>
          <input
            value={form.barrio}
            onChange={update('barrio')}
            placeholder="Pocitos, Cordón, ..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{' '}
        <Link to="/ingresar" className="font-medium text-brand-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
