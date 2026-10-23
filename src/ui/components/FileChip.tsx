import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts, space, type, usePalette } from '../theme/tokens';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Pílula com o nome e o tamanho do arquivo, no topo da roda. */
export function FileChip({ name, size }: { name: string; size: number }) {
  const c = usePalette();
  return (
    <View style={[styles.chip, { backgroundColor: c.frost }]}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c.onFrost} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <Path d="M14 3v5h5" />
      </Svg>
      <Text style={[styles.name, { color: c.onFrost }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.size, { color: c.onFrostMuted }]}>{formatBytes(size)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: space.md, borderRadius: 20, maxWidth: '88%' },
  name: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: type.small + 1 },
  size: { fontFamily: fonts.mono, fontSize: 12 },
});
