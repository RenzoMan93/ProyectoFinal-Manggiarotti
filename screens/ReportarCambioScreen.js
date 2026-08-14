import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import RequireAuth from '../components/RequireAuth';
import { useReportarCambio } from '../hooks/useReportarCambio';
import { useSession } from '../hooks/useSession';
import { useTramite } from '../hooks/useTramite';
import { COLORS, FONTS } from '../lib/theme';

export default function ReportarCambioScreen({ navigation, route }) {
  return (
    <RequireAuth>
      <ReportarCambioContenido navigation={navigation} route={route} />
    </RequireAuth>
  );
}

function ReportarCambioContenido({ navigation, route }) {
  const { procedureId } = route.params ?? {};
  const { usuario } = useSession();
  const { data: tramite } = useTramite(procedureId);
  const reportar = useReportarCambio();

  const [comentario, setComentario] = useState('');
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = () => {
    const texto = comentario.trim();
    if (!texto) {
      setError('Contanos qué encontraste para poder revisarlo.');
      return;
    }
    setError(null);
    reportar.mutate(
      { usuarioId: usuario.id, tramiteId: procedureId, comentario: texto },
      {
        onSuccess: () => setEnviado(true),
        onError: () => setError('No pudimos enviar el reporte. Probá de nuevo.'),
      }
    );
  };

  if (enviado) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.confirmacion}>
          <Text style={styles.confirmacionTitulo}>¡Gracias por avisarnos!</Text>
          <Text style={styles.confirmacionTexto}>
            Vamos a revisar{tramite?.nombre ? ` "${tramite.nombre}"` : ' este trámite'} y actualizarlo si
            corresponde.
          </Text>
          <View style={styles.confirmacionBtn}>
            <PrimaryButton title="Volver" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.backrow}>
            <Text style={styles.backrowText}>‹ Atrás</Text>
          </Pressable>

          <Text style={styles.eyebrow}>Reportar un cambio</Text>
          <Text style={styles.title}>{tramite?.nombre ?? 'Este trámite'}</Text>
          <Text style={styles.subtitle}>
            ¿Encontraste un dato desactualizado, un link roto o un requisito que cambió? Contanos y lo
            revisamos.
          </Text>

          <TextInput
            style={styles.textarea}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Ej: el costo cambió, ahora sale $600…"
            placeholderTextColor={COLORS.inkSoft}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.submit}>
            <PrimaryButton title="Enviar reporte" onPress={handleEnviar} loading={reportar.isPending} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  backrow: {
    marginBottom: 24,
  },
  backrowText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  eyebrow: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.stamp,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSoft,
    marginBottom: 20,
  },
  textarea: {
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.ink,
  },
  error: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.stamp,
    marginTop: 10,
  },
  submit: {
    marginTop: 18,
  },
  confirmacion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  confirmacionTitulo: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.ink,
    textAlign: 'center',
  },
  confirmacionTexto: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmacionBtn: {
    minWidth: 160,
  },
});
