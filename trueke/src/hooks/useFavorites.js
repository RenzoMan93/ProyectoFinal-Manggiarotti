import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { addFavorite, removeFavorite, subscribeToFavorites } from '../services/favoritesService';

/** Live favorites list for the current user, plus a toggle helper. Callers
 * that need to gate the action behind login (guests can browse but not
 * save) should check `user` themselves before calling toggleFavorite. */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    return subscribeToFavorites(user.uid, setFavorites);
  }, [user]);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  function isFavorite(productId) {
    return favoriteIds.has(productId);
  }

  async function toggleFavorite(product) {
    if (!user) return;
    if (favoriteIds.has(product.id)) {
      await removeFavorite(user.uid, product.id);
    } else {
      await addFavorite(user.uid, product);
    }
  }

  return { favorites, isFavorite, toggleFavorite };
}
