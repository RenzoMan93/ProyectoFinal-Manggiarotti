import { useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerOCrearUsuarioTramite } from '../lib/usuarioTramite';

export function useGuardarParaDespues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, tramiteId }) =>
      obtenerOCrearUsuarioTramite({
        usuarioId,
        tramiteId,
        valoresIniciales: {
          estado: 'guardado',
          items_completados: [],
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['usuario-tramite', data.usuario_id, data.tramite_id], data);
      queryClient.invalidateQueries({ queryKey: ['usuario-tramite', 'mios', data.usuario_id] });
    },
  });
}
