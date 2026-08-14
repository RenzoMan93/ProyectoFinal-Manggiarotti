import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import Sello from '../components/Sello';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useEmpezarChecklist } from '../hooks/useEmpezarChecklist';
import { useGuardarParaDespues } from '../hooks/useGuardarParaDespues';
import { useSession } from '../hooks/useSession';
import { useTramite } from '../hooks/useTramite';
import { useUsuarioTramite } from '../hooks/useUsuarioTramite';
import { formatMesAnio, getHostname } from '../lib/format';
import { COLORS, FONTS, MODALIDAD_LABEL, MODALIDAD_SUBLABEL } from '../lib/theme';

export default function ProcedureDetailScreen({ navigation, route }) {
  const { procedureId } = route.params ?? {};
  const { usuario } = useSession();

  const { data: tramite, isLoading, isError } = useTramite(procedureId);
  const { data: requisitos = [] } = useChecklistItems(procedureId);
  const { data: usuarioTramite } = useUsuarioTramite(usuario?.id, procedureId);
  const empezarChecklist = useEmpezarChecklist();
  const guardarParaDespues = useGuardarParaDespues();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={COLORS.stamp} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (isError || !tramite) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backrow}>
          <Text style={styles.backrowText}>‹ Atrás</Text>
        </Pressable>
        <EmptyState title="No encontramos este trámite" description="Puede que ya no esté disponible." />
      </SafeAreaView>
    );
  }

  const ctaLabel =
    usuarioTramite?.estado === 'completado'
      ? 'Ver checklist'
      : usuarioTramite?.estado === 'en_curso'
        ? 'Continuar checklist'
        : 'Empezar checklist';

  const handleEmpezar = () => {
    if (!usuario?.id) {
      navigation.navigate('Auth');
      return;
    }
    empezarChecklist.mutate(
      { usuarioId: usuario.id, tramiteId: procedureId },
      { onSuccess: () => navigation.navigate('Checklist', { procedureId }) }
    );
  };

  const handleGuardar = () => {
    if (!usuario?.id) {
      navigation.navigate('Auth');
      return;
    }
    guardarParaDespues.mutate({ usuarioId: usuario.id, tramiteId: procedureId });
  };

  const handleSelloPress = () => {
    Alert.alert('Contenido verificado', 'Este trámite fue verificado contra la fuente oficial correspondiente.');
  };

  const modalidadDescripcion = MODALIDAD_SUBLABEL[tramite.modalidad] ?? '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backrow}>
            <Text style={styles.backrowText}>‹ Atrás</Text>
          </Pressable>

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.badge}>
                {[tramite.categoria?.nombre, tramite.organismo].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.title}>{tramite.nombre}</Text>
            </View>
            <Pressable
              onPress={handleSelloPress}
              accessibilityRole="button"
              accessibilityLabel="Contenido verificado contra fuente oficial"
            >
              <Sello label="OK" />
            </Pressable>
          </View>

          <View style={styles.metaRow}>
            <MetaItem value={tramite.costo_aprox || '—'} label="costo aprox." />
            <MetaItem value={MODALIDAD_LABEL[tramite.modalidad] ?? '—'} label={modalidadDescripcion} />
            <MetaItem value={tramite.duracion_estimada || '—'} label="tiempo estimado" />
          </View>

          <Text style={styles.expediente}>
            {tramite.numero_guia ? `GUÍA N° ${tramite.numero_guia}` : 'Sin número de guía'}
            {tramite.fecha_verificacion ? ` · verificada ${formatMesAnio(tramite.fecha_verificacion)}` : ''}
          </Text>
        </View>

        <View style={styles.body}>
          {tramite.descripcion ? (
            <>
              <Text style={styles.sectionTitle}>Qué es</Text>
              <Text style={styles.paragraph}>{tramite.descripcion}</Text>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Documentos necesarios</Text>
          {requisitos.length > 0 ? (
            requisitos.map((item, index) => (
              <ReqItem key={item.id} texto={item.texto} esUltimo={index === requisitos.length - 1} />
            ))
          ) : (
            <Text style={styles.paragraph}>Todavía no cargamos los requisitos de este trámite.</Text>
          )}

          {tramite.organismo ? (
            <>
              <Text style={styles.sectionTitle}>Dónde se hace</Text>
              <Text style={styles.paragraph}>
                Se gestiona en {tramite.organismo}
                {modalidadDescripcion ? `, de forma ${MODALIDAD_LABEL[tramite.modalidad]?.toLowerCase()} (${modalidadDescripcion}).` : '.'}
              </Text>
            </>
          ) : null}

          {tramite.link_oficial ? (
            <Pressable style={styles.linkRow} onPress={() => Linking.openURL(tramite.link_oficial)}>
              <Text style={styles.linkLabel}>Sitio oficial</Text>
              <Text style={styles.linkValue}>{getHostname(tramite.link_oficial)} →</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.reportRow}
            onPress={() => navigation.navigate('ReportarCambio', { procedureId })}
          >
            <Text style={styles.reportText}>¿Viste algo desactualizado? Reportalo →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View style={styles.ctaRow}>
          {!usuarioTramite ? (
            <Pressable
              style={[styles.guardarBtn, guardarParaDespues.isPending && styles.ctaBtnDisabled]}
              onPress={handleGuardar}
              disabled={guardarParaDespues.isPending}
            >
              <Text style={styles.guardarBtnText}>
                {guardarParaDespues.isPending ? 'Guardando…' : 'Guardar'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.ctaBtn, empezarChecklist.isPending && styles.ctaBtnDisabled]}
            onPress={handleEmpezar}
            disabled={empezarChecklist.isPending}
          >
            <Text style={styles.ctaBtnText}>
              {empezarChecklist.isPending ? 'Cargando…' : ctaLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function MetaItem({ value, label }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

function ReqItem({ texto, esUltimo }) {
  return (
    <View style={[styles.reqItem, esUltimo && styles.reqItemUltimo]}>
      <Text style={styles.reqDash}>—</Text>
      <Text style={styles.reqTexto}>{texto}</Text>
    </View>
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
    paddingBottom: 110,
  },
  hero: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backrow: {
    marginBottom: 14,
  },
  backrowText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
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
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 21,
    color: COLORS.ink,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 14,
  },
  metaItem: {
    minWidth: 80,
  },
  metaValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.ink,
  },
  metaLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  expediente: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    color: COLORS.inkSoft,
    marginTop: 10,
  },
  body: {
    padding: 18,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    color: COLORS.ink,
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.inkSoft,
  },
  reqItem: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    borderStyle: 'dashed',
  },
  reqItemUltimo: {
    borderBottomWidth: 0,
  },
  reqDash: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.stamp,
  },
  reqTexto: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.inkSoft,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  linkLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  linkValue: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.stamp,
  },
  reportRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  reportText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    backgroundColor: COLORS.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: COLORS.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.paper,
  },
  guardarBtn: {
    flex: 1,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guardarBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
});
