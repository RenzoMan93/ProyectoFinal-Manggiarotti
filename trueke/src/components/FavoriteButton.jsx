import React from 'react';

/** Presentational heart toggle — callers own the favorites subscription
 * (via useFavorites) and pass down `active`/`onClick` so multiple buttons
 * on one screen (e.g. every Feed card) don't each open their own
 * Firestore listener. */
export default function FavoriteButton({ active, onClick, className }) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#c4593b' : 'none'} stroke={active ? '#c4593b' : '#fff'} strokeWidth="2">
        <path d="M12 21s-6.5-4.35-9-8.5C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19.5 4 21 8 21 12.5c-2.5 4.15-9 8.5-9 8.5z" />
      </svg>
    </button>
  );
}
