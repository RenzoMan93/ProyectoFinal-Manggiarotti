import { useState } from 'react';
import StarRating from './StarRating';
import { calificarUsuario } from '../services/ratings';

export default function RatingForm({ deId, paraId, onCalificado }) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estrellas) return;
    setEnviando(true);
    try {
      await calificarUsuario({ deId, paraId, estrellas, comentario: comentario.trim() });
      setEstrellas(0);
      setComentario('');
      onCalificado?.();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 p-4">
      <p className="mb-2 text-sm font-medium text-gray-700">Calificar a este usuario</p>
      <StarRating value={estrellas} size="text-2xl" onChange={setEstrellas} />
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Contá cómo fue la experiencia (opcional)"
        rows={2}
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!estrellas || enviando}
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {enviando ? 'Enviando...' : 'Enviar calificación'}
      </button>
    </form>
  );
}
