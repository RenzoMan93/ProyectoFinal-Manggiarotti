import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchEnCurso(usuarioId) {
  const { data, error } = await supabase
    .from('usuario_tramite')
    .select(
      `id, items_completados,
       tramite:tramite_id ( id, nombre, organismo, checklist_item(count) )`
    )
    .eq('usuario_id', usuarioId)
    .eq('estado', 'en_curso');
  if (error) throw error;
  return data;
}

export function useTramitesEnCurso(usuarioId) {
  return useQuery({
    queryKey: ['usuario-tramite', 'en-curso', usuarioId],
    queryFn: () => fetchEnCurso(usuarioId),
    enabled: Boolean(usuarioId),
  });
}
