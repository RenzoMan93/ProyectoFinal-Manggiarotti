import { supabase } from './supabase';

const UNIQUE_VIOLATION = '23505';

// Recupera el usuario_tramite si ya existe (sin tocarlo, para no pisar un
// estado más avanzado como en_curso/completado) o lo crea con los valores
// iniciales dados. Usado tanto por "Empezar checklist" como por "Guardar
// para después".
export async function obtenerOCrearUsuarioTramite({ usuarioId, tramiteId, valoresIniciales }) {
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
    .insert({ usuario_id: usuarioId, tramite_id: tramiteId, ...valoresIniciales })
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
