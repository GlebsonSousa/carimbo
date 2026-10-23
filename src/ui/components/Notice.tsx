import { StyleSheet, Text, View } from 'react-native';
import { fonts, radius, space, type, usePalette } from '../theme/tokens';

interface Props {
  tone: 'error' | 'ok';
  message: string;
  onDark?: boolean;
}

/** Aviso curto. Erros dizem o que houve e como resolver. */
export function Notice({ tone, message, onDark }: Props) {
  const c = usePalette();
  const dot = tone === 'error' ? c.error : c.ok;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: onDark ? c.frost : c.sheetInset }]}
    >
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={[styles.message, { color: onDark ? c.onFrost : c.ink }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: space.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  message: { flex: 1, fontFamily: fonts.body, fontSize: type.small + 1, lineHeight: 20 },
});
