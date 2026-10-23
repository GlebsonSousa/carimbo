import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { fonts, type, usePalette } from '../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'quiet' | 'scrim';
  loading?: boolean;
  disabled?: boolean;
}

/** Botão em pílula. "scrim" é o contorno claro usado sobre o fundo escurecido. */
export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const c = usePalette();
  const look = {
    primary: { bg: c.primary, fg: c.onPrimary, border: c.primary },
    outline: { bg: 'transparent', fg: c.ink, border: c.ink },
    quiet: { bg: 'transparent', fg: c.muted, border: 'transparent' },
    scrim: { bg: 'transparent', fg: c.onScrim, border: c.scrimLine },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: look.bg, borderColor: look.border, opacity: pressed ? 0.7 : disabled ? 0.45 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={look.fg} /> : <Text style={[styles.label, { color: look.fg }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { fontFamily: fonts.bodyMedium, fontSize: type.body - 1 },
});
