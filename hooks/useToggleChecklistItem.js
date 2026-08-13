import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function calcularSiguiente(currentItems, itemId, totalCount) {
  const yaHecho = currentItems.includes(itemId);
  const items = yaHecho ? currentItems.filter((id) => id !== itemId) : [...currentItems, itemId];
  const completo = totalCount > 0 && items.length === totalCount;
  return { items, completo };
}

export function useToggleChecklistItem({ usuarioId, tramiteId, totalCount }) {
  const queryClient = useQueryClient();
  const queryKey = ['usuario-tramite', usuarioId, tramiteId];

  return useMutation({
    mutationFn: async ({ usuarioTramiteId, itemId, currentItems }) => {
      const { items, completo } = calcularSiguiente(currentItems, itemId, totalCount);
      const { data, error } = await supabase
        .from('usuario_tramite')
        .update({
          items_completados: items,
          estado: completo ? 'completado' : 'en_curso',
          fecha_completado: completo ? new Date().toISOString() : null,
        })
        .eq('id', usuarioTramiteId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, currentItems }) => {
      await queryClient.cancelQueries({ queryKey });
      const previo = queryClient.getQueryData(queryKey);
      const { items, completo } = calcularSiguiente(currentItems, itemId, totalCount);
      queryClient.setQueryData(queryKey, (prev) =>
        prev
          ? {
              ...prev,
              items_completados: items,
              estado: completo ? 'completado' : 'en_curso',
            }
          : prev
      );
      return { previo };
    },
    onError: (_err, _vars, context) => {
      if (context?.previo) queryClient.setQueryData(queryKey, context.previo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['usuario-tramite', 'en-curso', usuarioId] });
    },
  });
}
