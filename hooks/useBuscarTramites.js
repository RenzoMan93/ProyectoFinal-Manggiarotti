import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Los filtros .or() de PostgREST usan "," "(" ")" como sintaxis propia, así
// que se sacan del texto ingresado por el usuario para no romper el filtro.
function sanitizar(texto) {
  return texto.replace(/[,()%]/g, ' ').trim();
}

async function buscarTramites({ texto, categoriaId }) {
  let query = supabase
    .from('tramite')
    .select('id, nombre, organismo, modalidad, categoria_id')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const limpio = sanitizar(texto);
  if (limpio) {
    query = query.or(`nombre.ilike.%${limpio}%,organismo.ilike.%${limpio}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function useBuscarTramites({ query, categoriaId }) {
  const texto = query.trim();
  const hayFiltro = texto.length > 0 || Boolean(categoriaId);

  return useQuery({
    queryKey: ['tramites', 'buscar', texto, categoriaId ?? 'todas'],
    queryFn: () => buscarTramites({ texto, categoriaId }),
    enabled: hayFiltro,
  });
}
