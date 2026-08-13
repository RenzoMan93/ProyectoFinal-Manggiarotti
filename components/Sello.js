import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

// El "sello" es la marca de contenido verificado del sistema visual: un
// círculo rotado con un anillo punteado adentro, como un sello de goma.
export default function Sello({ label = 'OK', size = 'default', muted = false, style }) {
  const chico = size === 'sm';
  const dimension = chico ? 28 : 52;
  const color = muted ? COLORS.inkSoft : COLORS.stamp;

  return (
    <View
      style={[
        styles.outer,
        {
          width: dimension,
          height: dimension,
          borderColor: color,
          opacity: muted ? 0.55 : 1,
        },
        style,
      ]}
    >
      <View style={[styles.inner, { borderColor: color, margin: chico ? 2.5 : 4 }]} />
      <Text style={[styles.label, { color, fontSize: chico ? 11 : 16 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  inner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  label: {
    fontFamily: FONTS.headingBold,
  },
});
