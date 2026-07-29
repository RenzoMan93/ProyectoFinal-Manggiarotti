import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const handleBuscar = (e) => {
    e.preventDefault();
    navigate(`/buscar?q=${encodeURIComponent(busqueda)}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5 text-lg font-bold text-brand-700">
          <span>♻️</span> ReUsalo
        </Link>

        <form onSubmit={handleBuscar} className="order-3 flex w-full flex-1 sm:order-none sm:w-auto">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="search"
            placeholder="Buscar bicicletas, muebles, ropa..."
            className="w-full rounded-l-full border border-gray-300 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-r-full bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Buscar
          </button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link
                to="/publicar"
                className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                + Publicar
              </Link>
              <Link to="/mensajes" className="rounded-full p-2 text-xl hover:bg-gray-100" aria-label="Mensajes">
                💬
              </Link>
              <Link to={`/perfil/${user.uid}`} className="rounded-full p-2 text-xl hover:bg-gray-100" aria-label="Perfil">
                👤
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/ingresar" className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Ingresar
              </Link>
              <Link
                to="/registrarse"
                className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
