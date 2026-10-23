import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { t } from '../../i18n';
import { Notice } from '../components/Notice';
import { fonts, space, type, usePalette } from '../theme/tokens';

interface Props {
  busy: boolean;
  error: string | null;
  onPickFile: () => void;
  onPasteText: () => void;
  onClose: () => void;
}

/** O que a bolha abre: dois atalhos flutuando sobre o app em que a pessoa estava. */
export function QuickScreen({ busy, error, onPickFile, onPasteText, onClose }: Props) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}>
      <Pressable accessibilityLabel={t('quick.close')} style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.stack, { bottom: insets.bottom + 120 }]} pointerEvents="box-none">
        {error && (
          <View style={styles.notice}>
            <Notice tone="error" message={error} onDark />
          </View>
        )}
        <QuickAction label={t('quick.pickFile')} disabled={busy} onPress={onPickFile} icon="file" />
        <QuickAction label={t('quick.pasteText')} disabled={busy} onPress={onPasteText} icon="clipboard" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('quick.close')}
          onPress={onClose}
          style={({ pressed }) => [styles.close, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c.onAccent} strokeWidth={2.4} strokeLinecap="round">
            <Path d="M6 6l12 12M18 6L6 18" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

function QuickAction({ label, icon, disabled, onPress }: { label: string; icon: 'file' | 'clipboard'; disabled: boolean; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor: c.frost, opacity: pressed ? 0.8 : disabled ? 0.5 : 1 }]}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c.onFrost} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {icon === 'file' ? (
          <>
            <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <Path d="M14 3v5h5" />
          </>
        ) : (
          <>
            <Rect x={8} y={3} width={8} height={4} rx={1} />
            <Path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
          </>
        )}
      </Svg>
      <Text style={[styles.actionText, { color: c.onFrost }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { position: 'absolute', right: space.md, left: space.md, alignItems: 'flex-end', gap: 10 },
  notice: { alignSelf: 'stretch' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 20, borderRadius: 26 },
  actionText: { fontFamily: fonts.bodyMedium, fontSize: type.body - 1 },
  close: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
