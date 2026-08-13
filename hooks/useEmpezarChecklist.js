import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const UNIQUE_VIOLATION = '23505';

// "Empezar checklist": recupera el usuario_tramite si ya existe (sin tocar
// su estado, para no degradar un trámite completado de nuevo a en_curso), o
// lo crea con estado en_curso si es la primera vez.
async function empezarChecklist({ usuarioId, tramiteId }) {
  const existente = await supabase
    .from('usuario_tramite')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('tramite_id', tramiteId)
    .maybeSingle();
  if (existente.error) throw existente.error;
  if (existente.data) return existente.data;

  const insertado = await supabase
    .from('usuario_tramite')
    .insert({
      usuario_id: usuarioId,
      tramite_id: tramiteId,
      estado: 'en_curso',
      fecha_inicio: new Date().toISOString(),
      items_completados: [],
    })
    .select()
    .single();

  if (insertado.error) {
    if (insertado.error.code === UNIQUE_VIOLATION) {
      const reintento = await supabase
        .from('usuario_tramite')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('tramite_id', tramiteId)
        .single();
      if (reintento.error) throw reintento.error;
      return reintento.data;
    }
    throw insertado.error;
  }
  return insertado.data;
}

export function useEmpezarChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: empezarChecklist,
    onSuccess: (data) => {
      queryClient.setQueryData(['usuario-tramite', data.usuario_id, data.tramite_id], data);
      queryClient.invalidateQueries({ queryKey: ['usuario-tramite', 'en-curso', data.usuario_id] });
    },
  });
}
