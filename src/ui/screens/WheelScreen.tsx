import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FORMATS, type FormatId } from '../../core/formats';
import type { LoadedFile } from '../../core/types';
import { t } from '../../i18n';
import { Button } from '../components/Button';
import { FileChip } from '../components/FileChip';
import { Notice } from '../components/Notice';
import { Wheel } from '../components/Wheel';
import { fonts, space, type, usePalette } from '../theme/tokens';

interface Props {
  file: LoadedFile;
  format: FormatId | null;
  targets: FormatId[];
  working: boolean;
  error: string | null;
  onConvert: (to: FormatId) => void;
  onCancel: () => void;
}

/** A roda flutuando sobre o fundo escurecido (o app de trás, ou a tela inicial). */
export function WheelScreen({ file, format, targets, working, error, onConvert, onCancel }: Props) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<FormatId | null>(null);
  const size = Math.min(width - 24, height * 0.5, 420);

  const problem = !format
    ? t('error.unknown_format')
    : targets.length === 0
      ? t('convert.noTargets', { format: FORMATS[format].label })
      : error;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: c.scrim, paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.middle}>
        <FileChip name={file.name} size={file.size} />
        {format && targets.length > 0 && (
          <Wheel
            size={size}
            source={format}
            targets={targets}
            disabled={working}
            selected={selected}
            onSelect={setSelected}
            onConvert={onConvert}
          />
        )}
      </View>

      <View style={styles.bottom}>
        {problem ? (
          <Notice tone="error" message={problem} onDark />
        ) : (
          <Text style={[styles.hint, { color: c.onScrim }]}>{working ? t('convert.working') : selected ? t('wheel.hintSelected') : t('wheel.hint')}</Text>
        )}
        <Button label={t('wheel.cancel')} onPress={onCancel} variant="scrim" disabled={working} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingHorizontal: space.lg },
  middle: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', gap: space.lg },
  bottom: { alignSelf: 'stretch', alignItems: 'center', gap: space.md },
  hint: { fontFamily: fonts.body, fontSize: type.body - 1, textAlign: 'center' },
});
