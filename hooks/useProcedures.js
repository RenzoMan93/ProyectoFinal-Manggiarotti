import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchProcedures() {
  const { data, error } = await supabase.from('procedures').select('*');
  if (error) throw error;
  return data;
}

export function useProcedures() {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: fetchProcedures,
  });
}
