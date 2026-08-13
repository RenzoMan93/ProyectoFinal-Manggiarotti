import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import RequireAuth from '../components/RequireAuth';
import TramiteCard from '../components/TramiteCard';
import { useMisTramites } from '../hooks/useMisTramites';
import { useSession } from '../hooks/useSession';
import { formatFechaLarga } from '../lib/format';
import { COLORS, FONTS } from '../lib/theme';

const TABS = [
  { key: 'en_curso', label: 'En curso', destino: 'Checklist' },
  { key: 'completado', label: 'Completados', destino: 'Checklist' },
  { key: 'guardado', label: 'Guardados', destino: 'ProcedureDetail' },
];

const MENSAJES_VACIO = {
  en_curso: 'Todavía no empezaste ningún trámite.',
  completado: 'Todavía no completaste ningún trámite.',
  guardado: 'No guardaste ningún trámite para después.',
};

function progresoDe(item) {
  const total = item.tramite?.checklist_item?.[0]?.count ?? 0;
  const hechos = Array.isArray(item.items_completados) ? item.items_completados.length : 0;
  return { total, hechos };
}

function subtituloPara(tabKey, item) {
  if (tabKey === 'en_curso') {
    const { total, hechos } = progresoDe(item);
    return total > 0 ? `${hechos} de ${total} pasos` : 'En curso';
  }
  if (tabKey === 'completado') {
    const fecha = formatFechaLarga(item.fecha_completado);
    return fecha ? `Completado el ${fecha}` : 'Completado';
  }
  return item.tramite?.organismo ?? 'Guardado';
}

export default function MyProceduresScreen() {
  return (
    <RequireAuth>
      <MisTramitesContenido />
    </RequireAuth>
  );
}

function MisTramitesContenido() {
  const navigation = useNavigation();
  const { usuario } = useSession();
  const { data: registros = [], isLoading } = useMisTramites(usuario.id);
  const [tab, setTab] = useState('en_curso');

  const grupos = useMemo(
    () => ({
      en_curso: registros.filter((r) => r.estado === 'en_curso'),
      completado: registros.filter((r) => r.estado === 'completado'),
      guardado: registros.filter((r) => r.estado === 'guardado'),
    }),
    [registros]
  );

  const tabActiva = TABS.find((t) => t.key === tab);
  const items = grupos[tab];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.greet}>Tu actividad</Text>
        <Text style={styles.heading}>Mis trámites</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {TABS.map((t) => {
          const activa = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.pill, activa && styles.pillActiva]}
            >
              <Text style={[styles.pillLabel, activa && styles.pillLabelActiva]}>
                {t.label} ({grupos[t.key].length})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.stamp} style={styles.loader} />
        ) : items.length > 0 ? (
          items.map((item) => (
            <TramiteCard
              key={item.id}
              nombre={item.tramite?.nombre ?? 'Trámite'}
              subtitulo={subtituloPara(tab, item)}
              completado={tab === 'completado'}
              progreso={tab === 'en_curso' ? progresoDe(item).hechos / (progresoDe(item).total || 1) : undefined}
              onPress={() =>
                navigation.navigate(tabActiva.destino, { procedureId: item.tramite?.id })
              }
            />
          ))
        ) : (
          <EmptyState title={MENSAJES_VACIO[tab]} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  topbar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greet: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    marginBottom: 2,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.ink,
  },
  pillRow: {
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paperRaised,
  },
  pillActiva: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  pillLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  pillLabelActiva: {
    color: COLORS.paper,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 10,
  },
  loader: {
    marginTop: 16,
  },
});
