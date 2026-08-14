import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RequireAuth from '../components/RequireAuth';
import { useSession } from '../hooks/useSession';
import { useSignOut } from '../hooks/useSignOut';
import { formatFechaLarga } from '../lib/format';
import { COLORS, FONTS } from '../lib/theme';

export default function ProfileScreen() {
  return (
    <RequireAuth>
      <PerfilContenido />
    </RequireAuth>
  );
}

function PerfilContenido() {
  const { usuario } = useSession();
  const signOut = useSignOut();

  const inicial = (usuario.email?.[0] ?? '?').toUpperCase();
  const fechaAlta = formatFechaLarga(usuario.created_at);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topbar}>
          <Text style={styles.greet}>Tu cuenta</Text>
          <Text style={styles.heading}>Perfil</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.email} numberOfLines={1}>
              {usuario.email}
            </Text>
            {fechaAlta ? <Text style={styles.subtitle}>Cuenta creada el {fechaAlta}</Text> : null}
          </View>
        </View>

        <Pressable
          style={[styles.signOutBtn, signOut.isPending && styles.signOutBtnDisabled]}
          onPress={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          <Text style={styles.signOutText}>
            {signOut.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Text>
        </Pressable>

        <Text style={styles.footer}>Ahora Resuelvo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  scrollContent: {
    paddingBottom: 32,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 18,
    marginTop: 18,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.stampSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.stamp,
  },
  info: {
    flex: 1,
  },
  email: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    marginTop: 2,
  },
  signOutBtn: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutBtnDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  footer: {
    textAlign: 'center',
    marginTop: 28,
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.inkSoft,
    opacity: 0.6,
  },
});
