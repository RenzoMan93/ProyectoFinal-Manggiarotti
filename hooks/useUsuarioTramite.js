import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchUsuarioTramite({ usuarioId, tramiteId }) {
  const { data, error } = await supabase
    .from('usuario_tramite')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('tramite_id', tramiteId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useUsuarioTramite(usuarioId, tramiteId) {
  return useQuery({
    queryKey: ['usuario-tramite', usuarioId, tramiteId],
    queryFn: () => fetchUsuarioTramite({ usuarioId, tramiteId }),
    enabled: Boolean(usuarioId) && Boolean(tramiteId),
  });
}
