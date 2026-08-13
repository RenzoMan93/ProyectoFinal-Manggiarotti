import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from './EmptyState';
import PrimaryButton from './PrimaryButton';
import { useSession } from '../hooks/useSession';
import { COLORS } from '../lib/theme';

// Envuelve una pantalla que necesita sesión activa. Mientras se resuelve la
// sesión no muestra nada; si no hay usuario, redirige una vez a Auth y deja
// una pantalla de respaldo con un botón manual por si el usuario vuelve
// atrás sin loguearse.
export default function RequireAuth({ children }) {
  const navigation = useNavigation();
  const { usuario, cargando } = useSession();
  const yaRedirigido = useRef(false);

  useEffect(() => {
    if (!cargando && !usuario && !yaRedirigido.current) {
      yaRedirigido.current = true;
      navigation.navigate('Auth');
    }
  }, [cargando, usuario, navigation]);

  if (cargando) {
    return <View style={styles.blank} />;
  }

  if (!usuario) {
    return (
      <SafeAreaView style={styles.gate} edges={['top']}>
        <EmptyState title="Iniciá sesión" description="Necesitás una cuenta para ver esta sección." />
        <View style={styles.gateButton}>
          <PrimaryButton title="Iniciar sesión" onPress={() => navigation.navigate('Auth')} />
        </View>
      </SafeAreaView>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  gate: {
    flex: 1,
    backgroundColor: COLORS.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateButton: {
    marginTop: 8,
    minWidth: 180,
  },
});
