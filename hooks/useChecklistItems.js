import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchChecklistItems(tramiteId) {
  const { data, error } = await supabase
    .from('checklist_item')
    .select('id, texto, subtexto, orden')
    .eq('tramite_id', tramiteId)
    .order('orden', { ascending: true });
  if (error) throw error;
  return data;
}

export function useChecklistItems(tramiteId) {
  return useQuery({
    queryKey: ['checklist-item', tramiteId],
    queryFn: () => fetchChecklistItems(tramiteId),
    enabled: Boolean(tramiteId),
  });
}
