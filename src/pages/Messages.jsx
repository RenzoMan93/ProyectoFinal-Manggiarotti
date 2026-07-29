import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { escucharChatsDeUsuario } from '../services/chat';

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = escucharChatsDeUsuario(user.uid, (items) => {
      setChats(items);
      setCargando(false);
    });
    return unsub;
  }, [user.uid]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Mensajes</h1>
      {cargando && <p className="text-gray-500">Cargando...</p>}
      {!cargando && chats.length === 0 && (
        <p className="text-gray-500">Todavía no tenés conversaciones. Contactá a un vendedor desde una publicación.</p>
      )}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/mensajes/${chat.id}`}
            className="block px-4 py-3 hover:bg-gray-50"
          >
            <p className="text-sm font-semibold text-gray-900">{chat.publicacionTitulo}</p>
            <p className="truncate text-sm text-gray-500">{chat.ultimoMensaje || 'Sin mensajes todavía'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
