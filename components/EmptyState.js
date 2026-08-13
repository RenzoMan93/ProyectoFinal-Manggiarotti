import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';
import Sello from './Sello';

export default function EmptyState({ title, description, glyph = '?' }) {
  return (
    <View style={styles.container}>
      <Sello label={glyph} muted />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.ink,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkSoft,
    textAlign: 'center',
  },
});
