import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useReportarCambio() {
  return useMutation({
    mutationFn: async ({ usuarioId, tramiteId, comentario }) => {
      const { data, error } = await supabase
        .from('reporte_cambio')
        .insert({
          usuario_id: usuarioId,
          tramite_id: tramiteId,
          comentario,
          estado: 'pendiente',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}
