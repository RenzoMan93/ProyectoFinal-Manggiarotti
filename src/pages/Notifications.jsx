import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { escucharNotificaciones, marcarLeida } from '../services/notifications';

export default function Notifications() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const unsub = escucharNotificaciones(user.uid, setNotificaciones);
    return unsub;
  }, [user.uid]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <Link to="/busquedas-guardadas" className="text-sm font-medium text-brand-700 hover:underline">
          Mis búsquedas guardadas
        </Link>
      </div>

      {notificaciones.length === 0 && <p className="text-gray-500">No tenés notificaciones todavía.</p>}

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {notificaciones.map((n) => (
          <Link
            key={n.id}
            to={n.publicacionId ? `/producto/${n.publicacionId}` : '#'}
            onClick={() => !n.leida && marcarLeida(n.id)}
            className={`block px-4 py-3 text-sm hover:bg-gray-50 ${n.leida ? 'text-gray-500' : 'font-medium text-gray-900'}`}
          >
            {n.mensaje}
          </Link>
        ))}
      </div>
    </div>
  );
}
