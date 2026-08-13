import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import RequireAuth from '../components/RequireAuth';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useEmpezarChecklist } from '../hooks/useEmpezarChecklist';
import { useSession } from '../hooks/useSession';
import { useTramite } from '../hooks/useTramite';
import { useToggleChecklistItem } from '../hooks/useToggleChecklistItem';
import { useToggleRecordatorio } from '../hooks/useToggleRecordatorio';
import { useUsuarioTramite } from '../hooks/useUsuarioTramite';
import { formatMesAnio } from '../lib/format';
import { COLORS, FONTS } from '../lib/theme';

export default function ChecklistScreen({ navigation, route }) {
  return (
    <RequireAuth>
      <ChecklistContenido navigation={navigation} route={route} />
    </RequireAuth>
  );
}

function ChecklistContenido({ navigation, route }) {
  const { procedureId } = route.params ?? {};
  const { usuario } = useSession();

  const { data: tramite } = useTramite(procedureId);
  const { data: items = [] } = useChecklistItems(procedureId);
  const {
    data: usuarioTramite,
    isLoading: cargandoProgreso,
  } = useUsuarioTramite(usuario?.id, procedureId);

  const empezarChecklist = useEmpezarChecklist();
  const toggleItem = useToggleChecklistItem({
    usuarioId: usuario?.id,
    tramiteId: procedureId,
    totalCount: items.length,
  });
  const toggleRecordatorio = useToggleRecordatorio({ usuarioId: usuario?.id, tramiteId: procedureId });

  // Si se entra directo al checklist (deep link, refresh) sin haber pasado
  // por "Empezar checklist" en la ficha, lo creamos acá para que la pantalla
  // funcione igual.
  useEffect(() => {
    if (usuario?.id && !cargandoProgreso && !usuarioTramite) {
      empezarChecklist.mutate({ usuarioId: usuario.id, tramiteId: procedureId });
    }
  }, [usuario?.id, cargandoProgreso, usuarioTramite]);

  if (cargandoProgreso || !usuarioTramite) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={COLORS.stamp} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const completados = Array.isArray(usuarioTramite.items_completados)
    ? usuarioTramite.items_completados
    : [];
  const total = items.length;
  const hechos = completados.length;
  const porcentaje = total > 0 ? Math.round((hechos / total) * 100) : 0;
  const estaCompleto = usuarioTramite.estado === 'completado';

  const handleToggleItem = (itemId) => {
    toggleItem.mutate({ usuarioTramiteId: usuarioTramite.id, itemId, currentItems: completados });
  };

  const handleToggleRecordatorio = () => {
    toggleRecordatorio.mutate({
      usuarioTramiteId: usuarioTramite.id,
      nextValue: !usuarioTramite.recordatorio_activo,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <BackRow onPress={() => navigation.goBack()} />
          {tramite ? (
            <Text style={styles.badge}>
              {[tramite.categoria?.nombre, tramite.organismo].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          <Text style={styles.title}>{tramite?.nombre ?? 'Trámite'}</Text>
          {tramite?.numero_guia ? (
            <Text style={styles.expediente}>
              GUÍA N° {tramite.numero_guia}
              {tramite.fecha_verificacion ? ` · verificada ${formatMesAnio(tramite.fecha_verificacion)}` : ''}
            </Text>
          ) : null}
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Tu progreso</Text>
            <Text style={styles.progressCount}>
              {hechos} / {total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${porcentaje}%` }]} />
          </View>
        </View>

        {estaCompleto && <CompletionBanner />}

        <Pressable style={styles.reminderRow} onPress={handleToggleRecordatorio}>
          <View>
            <Text style={styles.reminderTitle}>Recordatorio activo</Text>
            <Text style={styles.reminderSubtitle}>Te avisamos si vence un paso</Text>
          </View>
          <Toggle activo={Boolean(usuarioTramite.recordatorio_activo)} />
        </Pressable>

        <View style={styles.checklist}>
          {total > 0 ? (
            items.map((item) => (
              <CheckItem
                key={item.id}
                texto={item.texto}
                subtexto={item.subtexto}
                hecho={completados.includes(item.id)}
                onPress={() => handleToggleItem(item.id)}
              />
            ))
          ) : (
            <EmptyState title="Este trámite todavía no tiene checklist" description="Vamos a sumarlo pronto." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BackRow({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.backrow}>
      <Text style={styles.backrowText}>‹ Atrás</Text>
    </Pressable>
  );
}

function CompletionBanner() {
  return (
    <View style={styles.stampBanner}>
      <View style={styles.stampGlyph}>
        <Text style={styles.stampGlyphText}>✓</Text>
      </View>
      <Text style={styles.stampText}>
        ¡Trámite completado! Guardá el comprobante correspondiente por las dudas.
      </Text>
    </View>
  );
}

function Toggle({ activo }) {
  return (
    <View style={[styles.toggleTrack, activo && styles.toggleTrackOn]}>
      <View style={[styles.toggleThumb, activo && styles.toggleThumbOn]} />
    </View>
  );
}

function CheckItem({ texto, subtexto, hecho, onPress }) {
  return (
    <Pressable style={styles.checkItem} onPress={onPress}>
      <View style={[styles.checkbox, hecho && styles.checkboxDone]}>
        {hecho ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <View style={styles.checkItemInfo}>
        <Text style={[styles.checkItemTexto, hecho && styles.checkItemTextoDone]}>{texto}</Text>
        {subtexto ? <Text style={styles.checkItemSubtexto}>{subtexto}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  loader: {
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    padding: 18,
    paddingBottom: 8,
  },
  backrow: {
    marginBottom: 14,
  },
  backrowText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    backgroundColor: COLORS.stampSoft,
    color: COLORS.stamp,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 21,
    color: COLORS.ink,
    marginBottom: 2,
  },
  expediente: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    color: COLORS.inkSoft,
  },
  progressWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.ink,
  },
  progressCount: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.stamp,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.line,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.stamp,
    borderRadius: 999,
  },
  stampBanner: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: COLORS.okSoft,
    borderWidth: 1,
    borderColor: COLORS.ok,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stampGlyph: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.ok,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampGlyphText: {
    fontFamily: FONTS.headingBold,
    fontSize: 18,
    color: COLORS.ok,
  },
  stampText: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.ok,
    lineHeight: 17,
  },
  reminderRow: {
    marginHorizontal: 18,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  reminderTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.ink,
  },
  reminderSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 999,
    backgroundColor: COLORS.line,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: COLORS.ok,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.paperRaised,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  checklist: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: COLORS.ok,
    borderColor: COLORS.ok,
  },
  checkboxMark: {
    color: COLORS.paperRaised,
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
  },
  checkItemInfo: {
    flex: 1,
  },
  checkItemTexto: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.ink,
    lineHeight: 18,
  },
  checkItemTextoDone: {
    color: COLORS.inkSoft,
    textDecorationLine: 'line-through',
  },
  checkItemSubtexto: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkSoft,
    marginTop: 2,
  },
});
