import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const LIMITE = 8;

async function fetchDestacados(categoriaId) {
  // TODO: reemplazar el orden alfabético por un ranking real de trámites
  // más buscados cuando exista esa métrica.
  let query = supabase
    .from('tramite')
    .select('id, nombre, organismo, modalidad, categoria_id')
    .eq('activo', true)
    .order('nombre', { ascending: true })
    .limit(LIMITE);

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function useTramitesDestacados(categoriaId) {
  return useQuery({
    queryKey: ['tramites', 'destacados', categoriaId ?? 'todas'],
    queryFn: () => fetchDestacados(categoriaId),
  });
}
