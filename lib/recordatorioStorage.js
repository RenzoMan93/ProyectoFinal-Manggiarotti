import AsyncStorage from '@react-native-async-storage/async-storage';

// Mapeo local (por dispositivo) entre un usuario_tramite y el identificador
// de la notificación local programada para su recordatorio. No tiene sentido
// guardarlo en Supabase: un identificador de notificación local solo vale en
// el dispositivo donde se programó.
const PREFIJO = 'ahora-resuelvo:recordatorio:';

export async function guardarNotificacionId(usuarioTramiteId, notificacionId) {
  await AsyncStorage.setItem(PREFIJO + usuarioTramiteId, notificacionId);
}

export async function obtenerNotificacionId(usuarioTramiteId) {
  return AsyncStorage.getItem(PREFIJO + usuarioTramiteId);
}

export async function borrarNotificacionId(usuarioTramiteId) {
  await AsyncStorage.removeItem(PREFIJO + usuarioTramiteId);
}
