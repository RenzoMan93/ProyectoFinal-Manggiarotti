import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useToggleRecordatorio({ usuarioId, tramiteId }) {
  const queryClient = useQueryClient();
  const queryKey = ['usuario-tramite', usuarioId, tramiteId];

  return useMutation({
    mutationFn: async ({ usuarioTramiteId, nextValue, fechaRecordatorio = null }) => {
      const { data, error } = await supabase
        .from('usuario_tramite')
        .update({
          recordatorio_activo: nextValue,
          fecha_recordatorio: nextValue ? fechaRecordatorio : null,
        })
        .eq('id', usuarioTramiteId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ nextValue, fechaRecordatorio = null }) => {
      await queryClient.cancelQueries({ queryKey });
      const previo = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (prev) =>
        prev
          ? {
              ...prev,
              recordatorio_activo: nextValue,
              fecha_recordatorio: nextValue ? fechaRecordatorio : null,
            }
          : prev
      );
      return { previo };
    },
    onError: (_err, _vars, context) => {
      if (context?.previo) queryClient.setQueryData(queryKey, context.previo);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
