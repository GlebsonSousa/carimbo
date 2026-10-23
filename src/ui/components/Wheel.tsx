import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { FORMATS, type FormatId } from '../../core/formats';
import { t, type TranslationKey } from '../../i18n';
import { fonts, type, usePalette } from '../theme/tokens';
import { hitTest, labelPosition, pushOffset, segmentPath, wheelSize, type Hit } from './wheelGeometry';

interface Props {
  size: number;
  source: FormatId;
  targets: FormatId[];
  disabled?: boolean;
  /** Formato escolhido (tocado), controlado pela tela. */
  selected: FormatId | null;
  onSelect: (target: FormatId | null) => void;
  onConvert: (target: FormatId) => void;
}

const TAP_SLOP = 10;

/**
 * A roda de formatos. Dois jeitos de usar:
 * - tocar numa fatia para escolher e tocar no centro para converter;
 * - segurar, deslizar o dedo até a fatia e soltar: converte na hora.
 */
export function Wheel({ size, source, targets, disabled, selected, onSelect, onConvert }: Props) {
  const c = usePalette();
  const w = useMemo(() => wheelSize(size), [size]);
  const [hover, setHover] = useState<number | null>(null);
  const appear = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return appear.setValue(1);
    Animated.timing(appear, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
  }, [appear, reduceMotion]);

  // Estado mais recente para o PanResponder, que é criado uma vez só.
  const live = useRef({ targets, selected, disabled, onSelect, onConvert });
  live.current = { targets, selected, disabled, onSelect, onConvert };
  const lastHit = useRef<Hit>({ kind: 'none' });

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !live.current.disabled,
        onMoveShouldSetPanResponder: () => !live.current.disabled,
        onPanResponderGrant: (e) => {
          const hit = hitTest(e.nativeEvent.locationX, e.nativeEvent.locationY, live.current.targets.length, w);
          lastHit.current = hit;
          setHover(hit.kind === 'segment' ? hit.index : null);
        },
        onPanResponderMove: (e, g) => {
          if (Math.hypot(g.dx, g.dy) < TAP_SLOP) return;
          const hit = hitTest(e.nativeEvent.locationX, e.nativeEvent.locationY, live.current.targets.length, w);
          const index = hit.kind === 'segment' ? hit.index : null;
          setHover((prev) => {
            if (prev !== index && index !== null) Haptics.selectionAsync().catch(() => {});
            return index;
          });
          lastHit.current = hit;
        },
        onPanResponderRelease: (_e, g) => {
          const { targets: ts, selected: sel, onSelect: select, onConvert: convert } = live.current;
          const hit = lastHit.current;
          const moved = Math.hypot(g.dx, g.dy) >= TAP_SLOP;
          setHover(null);
          if (hit.kind === 'segment') {
            const target = ts[hit.index];
            if (moved) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              convert(target);
            } else {
              Haptics.selectionAsync().catch(() => {});
              select(sel === target ? null : target);
            }
          } else if (hit.kind === 'center' && sel) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            convert(sel);
          }
        },
        onPanResponderTerminate: () => setHover(null),
      }),
    [w],
  );

  const count = targets.length;
  const scale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });

  return (
    <Animated.View style={{ width: size, height: size, opacity: appear, transform: [{ scale }] }} {...pan.panHandlers}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        {targets.map((target, i) => {
          const active = target === selected || hover === i;
          const push = active ? pushOffset(i, count) : { x: 0, y: 0 };
          return (
            <Path
              key={target}
              d={segmentPath(i, count, w)}
              fill={active ? c.accent : c.frost}
              fillRule="evenodd"
              transform={`translate(${push.x} ${push.y})`}
            />
          );
        })}
        <Circle cx={size / 2} cy={size / 2} r={w.inner - 10} fill={selected ? c.center : c.frostSoft} />
      </Svg>

      {targets.map((target, i) => {
        const p = labelPosition(i, count, w);
        const active = target === selected || hover === i;
        return (
          <View
            key={target}
            pointerEvents="none"
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('convert.convertTo', { format: FORMATS[target].label })}
            accessibilityState={{ selected: target === selected }}
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={() => onConvert(target)}
            style={[styles.label, { left: p.x - 55, top: p.y - 30 }]}
          >
            <Text style={[styles.format, { color: active ? c.onAccent : c.onFrost }]}>{FORMATS[target].label}</Text>
            <Text style={[styles.desc, { color: active ? c.onAccent : c.onFrostMuted }]}>{t(`format.desc.${target}` as TranslationKey)}</Text>
          </View>
        );
      })}

      <View pointerEvents="none" style={[styles.center, { left: size / 2 - 50, top: size / 2 - 50 }]}>
        {selected ? (
          <>
            <Text style={[styles.centerSmall, { color: c.onCenter }]}>{t('wheel.convert')}</Text>
            <Text style={[styles.centerFormat, { color: c.onCenter }]}>→ {FORMATS[selected].label}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.format, { color: c.onFrost }]}>{FORMATS[source].label}</Text>
            <Text style={[styles.desc, { color: c.onFrostMuted }]}>{t('wheel.source')}</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

const styles = StyleSheet.create({
  label: { position: 'absolute', width: 110, height: 60, alignItems: 'center', justifyContent: 'center', gap: 3 },
  format: { fontFamily: fonts.format, fontSize: type.format, letterSpacing: 0.6 },
  desc: { fontFamily: fonts.mono, fontSize: 11 },
  center: { position: 'absolute', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', gap: 2 },
  centerSmall: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  centerFormat: { fontFamily: fonts.format, fontSize: 13, letterSpacing: 0.6 },
});
