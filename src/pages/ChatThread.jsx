import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { enviarMensaje, escucharMensajes } from '../services/chat';

export default function ChatThread() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const finRef = useRef(null);

  useEffect(() => {
    getDoc(doc(db, 'chats', chatId)).then((snap) => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() });
    });
  }, [chatId]);

  useEffect(() => {
    const unsub = escucharMensajes(chatId, setMensajes);
    return unsub;
  }, [chatId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const textoAEnviar = texto.trim();
    setTexto('');
    await enviarMensaje(chatId, { emisorId: user.uid, texto: textoAEnviar });
  };

  return (
    <div className="mx-auto flex h-[70vh] max-w-lg flex-col">
      <div className="mb-3 border-b border-gray-100 pb-3">
        <Link to="/mensajes" className="text-sm text-gray-500 hover:underline">
          ← Mensajes
        </Link>
        {chat && (
          <p className="mt-1 font-semibold text-gray-900">
            Sobre:{' '}
            <Link to={`/producto/${chat.publicacionId}`} className="text-brand-700 hover:underline">
              {chat.publicacionTitulo}
            </Link>
          </p>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
        {mensajes.length === 0 && (
          <p className="text-center text-sm text-gray-400">Escribí el primer mensaje para coordinar la entrega.</p>
        )}
        {mensajes.map((m) => (
          <div key={m.id} className={`flex ${m.emisorId === user.uid ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.emisorId === user.uid ? 'bg-brand-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {m.texto}
            </span>
          </div>
        ))}
        <div ref={finRef} />
      </div>

      <form onSubmit={handleEnviar} className="mt-3 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button type="submit" className="rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
          Enviar
        </button>
      </form>
    </div>
  );
}
