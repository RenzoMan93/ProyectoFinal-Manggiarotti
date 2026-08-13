import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ahora-resuelvo:busquedas-recientes';
const MAX_RECIENTES = 8;

export function useRecentSearches() {
  const [recientes, setRecientes] = useState([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setRecientes(JSON.parse(raw));
      })
      .finally(() => setCargado(true));
  }, []);

  const guardar = useCallback((next) => {
    setRecientes(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addRecent = useCallback(
    (texto) => {
      const valor = texto.trim();
      if (!valor) return;
      setRecientes((prev) => {
        const sinDuplicado = prev.filter((item) => item.toLowerCase() !== valor.toLowerCase());
        const next = [valor, ...sinDuplicado].slice(0, MAX_RECIENTES);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const clearRecent = useCallback(() => guardar([]), [guardar]);

  return { recientes, cargado, addRecent, clearRecent };
}
