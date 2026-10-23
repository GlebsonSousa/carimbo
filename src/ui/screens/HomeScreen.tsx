import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FORMATS, type FormatId } from '../../core/formats';
import { t } from '../../i18n';
import type { HistoryEntry } from '../../platform/history';
import { Button } from '../components/Button';
import { Notice } from '../components/Notice';
import { fonts, radius, space, type, usePalette } from '../theme/tokens';

interface Props {
  sources: FormatId[];
  history: HistoryEntry[];
  busy: boolean;
  error: string | null;
  onPickFile: () => void;
  onPasteText: () => void;
}

export function HomeScreen({ sources, history, busy, error, onPickFile, onPasteText }: Props) {
  const c = usePalette();
  return (
    <ScrollView style={{ backgroundColor: c.ground }} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: c.ink }]} accessibilityRole="header">
          {t('app.name')}
        </Text>
        <Text style={[styles.tagline, { color: c.muted }]}>{t('app.tagline')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Button label={t('home.pickFile')} onPress={onPickFile} loading={busy} />
        <Button label={t('home.pasteText')} onPress={onPasteText} variant="outline" disabled={busy} />
        <View style={styles.formats}>
          <Text style={[styles.label, { color: c.muted }]}>{t('home.supported')}</Text>
          <View style={styles.tags}>
            {sources.map((f) => (
              <View key={f} style={[styles.tag, { backgroundColor: c.ground }]}>
                <Text style={[styles.tagText, { color: c.ink }]}>{FORMATS[f].label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {error && <Notice tone="error" message={error} />}

      <View style={styles.history}>
        <Text style={[styles.heading, { color: c.ink }]} accessibilityRole="header">
          {t('home.history')}
        </Text>
        {history.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>{t('home.historyEmpty')}</Text>
        ) : (
          history.map((h) => (
            <View key={`${h.at}-${h.name}`} style={[styles.row, { borderBottomColor: c.line }]}>
              <View style={styles.rowText}>
                <Text style={[styles.rowName, { color: c.ink }]} numberOfLines={1}>
                  {h.name}
                </Text>
                <Text style={[styles.time, { color: c.muted }]}>{timeAgo(h.at)}</Text>
              </View>
              <Text style={[styles.conversion, { color: c.ink }]}>
                {FORMATS[h.from].label} → {FORMATS[h.to].label}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function timeAgo(at: number): string {
  const min = Math.floor((Date.now() - at) / 60000);
  if (min < 1) return t('time.now');
  if (min < 60) return t('time.minutes', { n: min });
  const h = Math.floor(min / 60);
  return h < 24 ? t('time.hours', { n: h }) : t('time.days', { n: Math.floor(h / 24) });
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  hero: { gap: space.sm, marginTop: space.xl },
  title: { fontFamily: fonts.format, fontSize: type.title, letterSpacing: -0.5 },
  tagline: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 24 },
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.md - 4 },
  formats: { gap: space.sm, marginTop: space.sm },
  label: { fontFamily: fonts.body, fontSize: type.small },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: { borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  tagText: { fontFamily: fonts.format, fontSize: 11, letterSpacing: 0.6 },
  history: { gap: space.xs },
  heading: { fontFamily: fonts.bodyBold, fontSize: type.heading, marginBottom: space.xs },
  empty: { fontFamily: fonts.body, fontSize: type.body },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 12, borderBottomWidth: 1 },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontFamily: fonts.bodyMedium, fontSize: type.body - 1 },
  time: { fontFamily: fonts.body, fontSize: type.small },
  conversion: { fontFamily: fonts.mono, fontSize: 12 },
});
