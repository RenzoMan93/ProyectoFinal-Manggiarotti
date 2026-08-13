import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchCategorias() {
  const { data, error } = await supabase
    .from('categoria')
    .select('id, nombre, icono, orden')
    .order('orden', { ascending: true });
  if (error) throw error;
  return data;
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  });
}
