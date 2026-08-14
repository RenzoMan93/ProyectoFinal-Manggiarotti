import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Limpia todo lo cacheado (usuario_tramite, etc.) para que no quede
      // data del usuario anterior visible si otro inicia sesión después.
      queryClient.clear();
    },
  });
}
