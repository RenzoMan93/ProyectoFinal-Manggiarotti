import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { escucharNotificaciones, marcarLeida } from '../services/notifications';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) {
      setNotificaciones([]);
      return;
    }
    return escucharNotificaciones(user.uid, setNotificaciones);
  }, [user]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  if (!user) return null;

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="relative rounded-full p-2 text-xl hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        🔔
        {noLeidas > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            Notificaciones
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No tenés notificaciones</p>
            )}
            {notificaciones.map((n) => (
              <Link
                key={n.id}
                to={n.publicacionId ? `/producto/${n.publicacionId}` : '/notificaciones'}
                onClick={() => {
                  if (!n.leida) marcarLeida(n.id);
                  setAbierto(false);
                }}
                className={`block border-b border-gray-50 px-4 py-3 text-sm hover:bg-gray-50 ${
                  n.leida ? 'text-gray-500' : 'font-medium text-gray-900'
                }`}
              >
                {!n.leida && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-500" />}
                {n.mensaje}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
