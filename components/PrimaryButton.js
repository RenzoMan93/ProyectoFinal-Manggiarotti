import { Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
});
