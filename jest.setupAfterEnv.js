import { queryClient } from './lib/queryClient';

// El queryClient de la app es un singleton de módulo: si no se limpia entre
// tests, cada query deja programado su timer de garbage collection (gcTime,
// 5 min por default) y ese timer mantiene vivo el proceso de Jest mucho más
// allá de que los tests ya terminaron.
afterEach(() => {
  queryClient.clear();
});
