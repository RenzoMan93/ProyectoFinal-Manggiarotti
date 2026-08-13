import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// La sesión vive en un único Context (una sola suscripción a Supabase) en
// vez de que cada componente que llama useSession() haga su propio
// getSession()/onAuthStateChange: si no, un componente recién montado (por
// ejemplo justo después de un login, cuando RequireAuth deja pasar a su
// contenido) arranca con usuario=null hasta que su propio efecto resuelve,
// aunque el resto de la app ya sepa que hay sesión.
const SessionContext = createContext({ session: null, usuario: null, cargando: true });

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setSession(data.session);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCargando(false);
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = { session, usuario: session?.user ?? null, cargando };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
