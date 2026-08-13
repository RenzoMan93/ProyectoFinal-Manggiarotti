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
import { supabase } from '../lib/supabase';
import { COLORS, FONTS } from '../lib/theme';

const ERRORES = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'User already registered': 'Ya existe una cuenta con ese email.',
};

function traducirError(mensaje) {
  return ERRORES[mensaje] ?? mensaje ?? 'Algo salió mal. Probá de nuevo.';
}

export default function AuthScreen({ navigation }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const esLogin = modo === 'login';

  const cambiarModo = () => {
    setError(null);
    setAviso(null);
    setModo(esLogin ? 'signup' : 'login');
  };

  const handleSubmit = async () => {
    setError(null);
    setAviso(null);

    const correo = email.trim();
    if (!correo || !password) {
      setError('Completá tu email y contraseña.');
      return;
    }

    setCargando(true);
    const { data, error: authError } = esLogin
      ? await supabase.auth.signInWithPassword({ email: correo, password })
      : await supabase.auth.signUp({ email: correo, password });
    setCargando(false);

    if (authError) {
      setError(traducirError(authError.message));
      return;
    }

    if (data.session) {
      navigation.goBack();
      return;
    }

    setAviso('Te enviamos un email para confirmar tu cuenta. Confirmalo y después iniciá sesión.');
    setModo('login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.backrow}>
            <Text style={styles.backrowText}>‹ Atrás</Text>
          </Pressable>

          <Text style={styles.eyebrow}>Ahora Resuelvo</Text>
          <Text style={styles.title}>{esLogin ? 'Iniciá sesión' : 'Creá tu cuenta'}</Text>
          <Text style={styles.subtitle}>
            {esLogin
              ? 'Para guardar tus trámites y ver tu progreso.'
              : 'Guardá tu progreso y volvé cuando quieras.'}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.inkSoft}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={COLORS.inkSoft}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

          <View style={styles.submit}>
            <PrimaryButton
              title={esLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              onPress={handleSubmit}
              loading={cargando}
            />
          </View>

          <Pressable onPress={cambiarModo} style={styles.toggleWrap}>
            <Text style={styles.toggle}>
              {esLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
            </Text>
          </Pressable>
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
    fontSize: 24,
    color: COLORS.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.inkSoft,
    marginBottom: 24,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSoft,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.ink,
  },
  error: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.stamp,
    marginBottom: 12,
  },
  aviso: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.ok,
    marginBottom: 12,
  },
  submit: {
    marginTop: 8,
  },
  toggleWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  toggle: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
});
