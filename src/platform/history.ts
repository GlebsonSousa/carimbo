import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FormatId } from '../core/formats';

export interface HistoryEntry {
  name: string;
  from: FormatId;
  to: FormatId;
  at: number;
}

const HISTORY_KEY = 'carimbo:history';
const PREFS_KEY = 'carimbo:last-target';
const MAX_ENTRIES = 15;

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(HISTORY_KEY)) ?? '[]') as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function addToHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const next = [entry, ...(await loadHistory())].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  await rememberTarget(entry.from, entry.to);
  return next;
}

/** Guarda o último destino usado para cada formato de origem, para destacá-lo na roda. */
async function rememberTarget(from: FormatId, to: FormatId): Promise<void> {
  const prefs = await loadLastTargets();
  prefs[from] = to;
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadLastTargets(): Promise<Partial<Record<FormatId, FormatId>>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(PREFS_KEY)) ?? '{}');
  } catch {
    return {};
  }
}
