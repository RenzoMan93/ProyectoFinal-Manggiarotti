import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchTramite(id) {
  const { data, error } = await supabase
    .from('tramite')
    .select('*, categoria:categoria_id ( id, nombre )')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export function useTramite(id) {
  return useQuery({
    queryKey: ['tramite', id],
    queryFn: () => fetchTramite(id),
    enabled: Boolean(id),
  });
}
