import { useColorScheme } from 'react-native';

/**
 * Tokens de design do Carimbo.
 * Fatias foscas e claras flutuando sobre o app desfocado; laranja só no que está escolhido.
 */
const light = {
  ground: '#F6F6F8',
  surface: '#FFFFFF',
  ink: '#1B1D2A',
  muted: '#5E6172',
  line: '#E4E4EA',
  scrim: 'rgba(24,22,34,0.46)',
  onScrim: '#FFFBF7',
  scrimLine: 'rgba(255,251,247,0.35)',
  frost: 'rgba(255,251,247,0.94)',
  frostSoft: 'rgba(255,251,247,0.82)',
  onFrost: '#1B1D2A',
  onFrostMuted: '#4A4D5E',
  accent: '#F2643F',
  onAccent: '#1B1D2A',
  center: '#1B1D2A',
  onCenter: '#FFFBF7',
  sheet: '#FFFBF7',
  sheetInset: '#F3EEE9',
  primary: '#1B1D2A',
  onPrimary: '#FFFBF7',
  ok: '#2E7D57',
  error: '#B93A26',
};

const dark: typeof light = {
  ground: '#121318',
  surface: '#1C1D24',
  ink: '#F2EEE9',
  muted: '#A3A6B5',
  line: '#2A2C36',
  scrim: 'rgba(6,6,10,0.55)',
  onScrim: '#F2EEE9',
  scrimLine: 'rgba(242,238,233,0.35)',
  frost: 'rgba(40,42,56,0.95)',
  frostSoft: 'rgba(40,42,56,0.85)',
  onFrost: '#F2EEE9',
  onFrostMuted: '#A3A6B5',
  accent: '#F2643F',
  onAccent: '#1B1D2A',
  center: '#F2EEE9',
  onCenter: '#1B1D2A',
  sheet: '#1C1D24',
  sheetInset: '#262833',
  primary: '#F2EEE9',
  onPrimary: '#1B1D2A',
  ok: '#5CC48E',
  error: '#FF8A75',
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const fonts = {
  format: 'Unbounded_600SemiBold',
  body: 'Onest_400Regular',
  bodyMedium: 'Onest_500Medium',
  bodyBold: 'Onest_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 10, md: 18, lg: 32, pill: 999 };
export const type = { title: 30, heading: 20, body: 16, small: 13, format: 16 };
