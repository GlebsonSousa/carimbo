import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FORMATS } from '../../core/formats';
import type { ConversionResult } from '../../core/types';
import { t } from '../../i18n';
import { Button } from '../components/Button';
import { formatBytes } from '../components/FileChip';
import { Notice } from '../components/Notice';
import { fonts, radius, space, type, usePalette } from '../theme/tokens';

interface Props {
  result: ConversionResult;
  sourceName: string;
  busy: boolean;
  notice: { tone: 'ok' | 'error'; message: string } | null;
  onSave: () => void;
  onShare: () => void;
  onCopy: () => void;
  onClose: () => void;
}

/** Painel de resultado que sobe por cima do fundo escurecido. */
export function ResultScreen({ result, sourceName, busy, notice, onSave, onShare, onCopy, onClose }: Props) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const lines = result.content.split('\n');
  const lineCount = lines.filter((l) => l.trim()).length;
  const bytes = new TextEncoder().encode(result.content).length;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: c.scrim, paddingBottom: insets.bottom + 12 }]}>
      <View style={[styles.sheet, { backgroundColor: c.sheet }]}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: c.accent }]}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c.onAccent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M5 12.5l4.5 4.5L19 7.5" />
            </Svg>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: c.ink }]} accessibilityRole="header" accessibilityLiveRegion="polite">
              {t('result.done', { format: FORMATS[result.to].label })}
            </Text>
            <Text style={[styles.subtitle, { color: c.muted }]} numberOfLines={1}>
              {sourceName} → {result.fileName}
            </Text>
          </View>
        </View>

        <View style={[styles.preview, { backgroundColor: c.sheetInset }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.fileName, { color: c.ink }]} numberOfLines={1}>
              {result.fileName}
            </Text>
            <Text style={[styles.meta, { color: c.muted }]}>
              {formatBytes(bytes)} · {t('result.lines', { n: lineCount })}
            </Text>
          </View>
          <Text style={[styles.code, { color: c.muted }]} numberOfLines={4}>
            {lines.slice(0, 4).join('\n')}
          </Text>
        </View>

        {notice && <Notice tone={notice.tone} message={notice.message} />}

        <View style={styles.actions}>
          <Button label={t('result.save')} onPress={onSave} loading={busy} />
          <View style={styles.pair}>
            <View style={styles.half}>
              <Button label={t('result.share')} onPress={onShare} variant="outline" disabled={busy} />
            </View>
            <View style={styles.half}>
              <Button label={t('result.copy')} onPress={onCopy} variant="outline" disabled={busy} />
            </View>
          </View>
          <Button label={t('result.close')} onPress={onClose} variant="quiet" disabled={busy} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { justifyContent: 'flex-end', paddingHorizontal: 12 },
  sheet: { borderRadius: radius.lg, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 12, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodyBold, fontSize: type.heading },
  subtitle: { fontFamily: fonts.mono, fontSize: 12 },
  preview: { borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: space.md, gap: 10 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  fileName: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: type.small + 1 },
  meta: { fontFamily: fonts.mono, fontSize: 12 },
  code: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 19 },
  actions: { gap: 10 },
  pair: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
