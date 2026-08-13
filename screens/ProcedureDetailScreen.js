import { StyleSheet, Text, View } from 'react-native';

export default function ProcedureDetailScreen({ route }) {
  const { procedureId } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del trámite</Text>
      <Text>ID: {procedureId ?? 'sin definir'}</Text>
      <Text>Próximamente: guía paso a paso y checklist interactivo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
