import { StyleSheet, Text } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

export default function SectionLabel({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.stamp,
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: 18,
  },
});
