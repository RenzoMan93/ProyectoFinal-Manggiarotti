import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const solicitarUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(err.message);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  return { coords, status, error, solicitarUbicacion };
}
