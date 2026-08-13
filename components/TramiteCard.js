import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';
import { getMonogram } from '../lib/monogram';

export default function TramiteCard({ nombre, subtitulo, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.glyph}>
        <Text style={styles.glyphText}>{getMonogram(nombre)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {nombre}
        </Text>
        {subtitulo ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitulo}
          </Text>
        ) : null}
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.paperRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  glyph: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.stampSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.stamp,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.line,
    marginLeft: 4,
  },
});
