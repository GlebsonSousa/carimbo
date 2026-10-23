import * as Linking from 'expo-linking';
import { useIncomingShare } from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';

/** O que chegou de fora do app: um arquivo (Compartilhar / Abrir com) ou um texto. */
export type IncomingItem =
  | { kind: 'file'; uri: string; name?: string | null; mimeType?: string | null }
  | { kind: 'text'; text: string }
  | { kind: 'bubble'; id: string };

const isFileUri = (url: string | null): url is string => !!url && /^(content|file):\/\//i.test(url);
const isBubbleUri = (url: string | null): url is string => !!url && url.startsWith('carimbo://bubble');
const accepts = (url: string | null): url is string => isFileUri(url) || isBubbleUri(url);

/**
 * Junta as portas de entrada do Android num único lugar:
 * - Compartilhar (ACTION_SEND), via expo-sharing
 * - Abrir com (ACTION_VIEW), via Linking
 * - Toque na bolha flutuante (carimbo://bubble), via Linking
 * Para adicionar outra entrada no futuro, basta alimentar o mesmo estado aqui.
 */
export function useIncomingItem() {
  const share = useIncomingShare();
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [handled, setHandled] = useState<string | null>(null);
  const [initialChecked, setInitialChecked] = useState(false);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => accepts(url) && setViewUrl(url))
      .finally(() => setInitialChecked(true));
    const sub = Linking.addEventListener('url', ({ url }) => accepts(url) && setViewUrl(url));
    return () => sub.remove();
  }, []);

  let item: IncomingItem | null = null;
  const raw = share.sharedPayloads[0];

  if (raw && !share.isResolving) {
    if (raw.shareType === 'text' || raw.shareType === 'url') {
      item = { kind: 'text', text: raw.value };
    } else {
      const resolved = share.resolvedSharedPayloads[0];
      item = {
        kind: 'file',
        uri: raw.value,
        name: resolved?.originalName ?? null,
        mimeType: resolved?.contentMimeType ?? raw.mimeType ?? null,
      };
    }
  } else if (viewUrl) {
    item = isBubbleUri(viewUrl) ? { kind: 'bubble', id: viewUrl } : { kind: 'file', uri: viewUrl };
  }

  const id = item ? (item.kind === 'file' ? item.uri : item.kind === 'text' ? item.text : item.id) : null;
  const pending = item && id !== handled ? item : null;

  const consume = useCallback(() => {
    setHandled(id);
    share.clearSharedPayloads();
    setViewUrl(null);
  }, [id, share]);

  /** Ainda descobrindo se o app foi aberto por Compartilhar / Abrir com. */
  const checking = !initialChecked || share.isResolving;

  return { incoming: pending, consume, checking };
}
