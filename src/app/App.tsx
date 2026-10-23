import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { registry } from '../converters';
import { validators } from '../converters/detectors';
import { convertFile } from '../core/convert';
import { detectFormat } from '../core/detect';
import { toConversionError } from '../core/errors';
import type { FormatId } from '../core/formats';
import type { ConversionResult, LoadedFile } from '../core/types';
import { errorMessage, t } from '../i18n';
import { copyToClipboard, fileFromText, pickFile, readClipboard, readFile, saveToFolder, shareResult } from '../platform/files';
import { addToHistory, type HistoryEntry, loadHistory } from '../platform/history';
import { type IncomingItem, useIncomingItem } from '../platform/incoming';
import { fontFiles } from '../ui/theme/fonts';
import { usePalette } from '../ui/theme/tokens';
import { HomeScreen } from '../ui/screens/HomeScreen';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { WheelScreen } from '../ui/screens/WheelScreen';

/**
 * Três estados. "floating" = o arquivo veio de outro app (Compartilhar / Abrir com):
 * a janela é transparente, então a roda aparece por cima daquele app.
 * Dentro do app, a roda aparece por cima da tela inicial.
 */
type Screen =
  | { name: 'home' }
  | { name: 'wheel'; file: LoadedFile; format: FormatId | null; floating: boolean }
  | { name: 'result'; result: ConversionResult; sourceName: string; floating: boolean };

type Notice = { tone: 'ok' | 'error'; message: string } | null;

export default function App() {
  const [fontsLoaded] = useFonts(fontFiles);
  const c = usePalette();

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [external, setExternal] = useState(false);
  const { incoming, consume, checking } = useIncomingItem();

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  const openFile = useCallback((file: LoadedFile, floating: boolean) => {
    setError(null);
    setScreen({ name: 'wheel', file, format: detectFormat(file, validators), floating });
  }, []);

  /** Executa uma ação mostrando carregamento e convertendo erros em mensagem. */
  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(toConversionError(e)));
    } finally {
      setBusy(false);
    }
  }, []);

  // Compartilhar / Abrir com: o arquivo chega de fora e a roda abre flutuando.
  useEffect(() => {
    if (!incoming) return;
    const item: IncomingItem = incoming;
    consume();
    setExternal(true);
    run(async () => {
      if (item.kind === 'text') openFile(fileFromText(item.text, t('convert.sharedName')), true);
      else openFile(await readFile(item.uri, { name: item.name, mimeType: item.mimeType }), true);
    });
  }, [incoming, consume, run, openFile]);

  /** Fecha a roda: se veio de outro app, volta para ele; senão, volta ao início. */
  const close = useCallback(() => {
    setError(null);
    setNotice(null);
    const floating = screen.name !== 'home' && screen.floating;
    setScreen({ name: 'home' });
    if (floating) {
      setExternal(false);
      BackHandler.exitApp();
    }
  }, [screen]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      close();
      return true;
    });
    return () => sub.remove();
  }, [screen.name, close]);

  const sources = useMemo(() => registry.sources(), []);

  // Enquanto descobre se veio de outro app, não pinta nada: evita piscar a tela inicial por cima do app de trás.
  if (!fontsLoaded || (checking && screen.name === 'home') || (external && screen.name === 'home' && busy)) return null;

  const floating = screen.name !== 'home' && screen.floating;

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: floating ? 'transparent' : c.ground }]}>
        <StatusBar style={floating || screen.name !== 'home' ? 'light' : 'auto'} />

        {!floating && (
          <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <HomeScreen
              sources={sources}
              history={history}
              busy={busy && screen.name === 'home'}
              error={screen.name === 'home' ? error : null}
              onPickFile={() =>
                run(async () => {
                  const file = await pickFile();
                  if (file) openFile(file, false);
                })
              }
              onPasteText={() =>
                run(async () => {
                  const text = await readClipboard();
                  if (!text.trim()) return setError(t('home.clipboardEmpty'));
                  openFile(fileFromText(text, t('convert.pastedName')), false);
                })
              }
            />
          </SafeAreaView>
        )}

        {screen.name === 'wheel' && (
          <WheelScreen
            file={screen.file}
            format={screen.format}
            targets={screen.format ? registry.targetsFor(screen.format) : []}
            working={busy}
            error={error}
            onCancel={close}
            onConvert={(to) =>
              run(async () => {
                const { file, format, floating: fl } = screen;
                if (!format) return;
                const result = await convertFile(file, format, to, registry);
                setHistory(await addToHistory({ name: file.name, from: format, to, at: Date.now() }));
                setNotice(null);
                setScreen({ name: 'result', result, sourceName: file.name, floating: fl });
              })
            }
          />
        )}

        {screen.name === 'result' && (
          <ResultScreen
            result={screen.result}
            sourceName={screen.sourceName}
            busy={busy}
            notice={notice}
            onClose={close}
            onSave={() =>
              act(run, setNotice, async () => {
                const name = await saveToFolder(screen.result);
                return name ? { tone: 'ok', message: t('result.saved', { name }) } : null;
              })
            }
            onShare={() =>
              act(run, setNotice, async () => {
                await shareResult(screen.result);
                return null;
              })
            }
            onCopy={() =>
              act(run, setNotice, async () => {
                await copyToClipboard(screen.result.content);
                return { tone: 'ok', message: t('result.copied') };
              })
            }
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

/** Ações da tela de resultado: o erro aparece no próprio painel, não na tela inicial. */
function act(run: (a: () => Promise<void>) => Promise<void>, setNotice: (n: Notice) => void, action: () => Promise<Notice>) {
  return run(async () => {
    try {
      const n = await action();
      if (n) setNotice(n);
    } catch (e) {
      setNotice({ tone: 'error', message: errorMessage(toConversionError(e)) });
    }
  });
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
