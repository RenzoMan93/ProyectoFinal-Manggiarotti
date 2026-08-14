import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_RECORDATORIOS = 'recordatorios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepararCanalAndroid() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_RECORDATORIOS, {
    name: 'Recordatorios de trámites',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function pedirPermisoNotificaciones() {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function programarRecordatorio({ tramiteNombre, fecha }) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ahora Resuelvo',
      body: `Recordatorio: seguí con "${tramiteNombre}"`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fecha,
      channelId: CANAL_RECORDATORIOS,
    },
  });
}

export async function cancelarRecordatorio(identificador) {
  if (!identificador) return;
  await Notifications.cancelScheduledNotificationAsync(identificador);
}
