import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

export default function PrimaryButton({ title, onPress, disabled = false, loading = false }) {
  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.paper} />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.ink,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: COLORS.paper,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
});
