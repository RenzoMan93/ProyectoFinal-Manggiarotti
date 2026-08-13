import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio</Text>
      <Text>Próximamente: trámites destacados y accesos rápidos.</Text>
      <PrimaryButton
        title="Ver trámite de ejemplo"
        onPress={() => navigation.navigate('ProcedureDetail', { procedureId: 'demo-123' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
