import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchMisTramites(usuarioId) {
  const { data, error } = await supabase
    .from('usuario_tramite')
    .select(
      `id, estado, items_completados, fecha_inicio, fecha_completado,
       tramite:tramite_id ( id, nombre, organismo, checklist_item(count) )`
    )
    .eq('usuario_id', usuarioId)
    .order('nombre', { foreignTable: 'tramite', ascending: true });
  if (error) throw error;
  return data;
}

export function useMisTramites(usuarioId) {
  return useQuery({
    queryKey: ['usuario-tramite', 'mios', usuarioId],
    queryFn: () => fetchMisTramites(usuarioId),
    enabled: Boolean(usuarioId),
  });
}
