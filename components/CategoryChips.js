import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

export default function CategoryChips({ categorias, selectedId, onSelect }) {
  const opciones = [{ id: null, nombre: 'Todos' }, ...categorias];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {opciones.map((categoria) => {
        const activo = categoria.id === selectedId;
        return (
          <Pressable
            key={categoria.id ?? 'todos'}
            onPress={() => onSelect(categoria.id)}
            style={[styles.chip, activo && styles.chipActivo]}
          >
            <Text style={[styles.label, activo && styles.labelActivo]}>{categoria.nombre}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingHorizontal: 18, paddingVertical: 4 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paperRaised,
  },
  chipActivo: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSoft,
  },
  labelActivo: {
    color: COLORS.paper,
  },
});
