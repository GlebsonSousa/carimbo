import * as Clipboard from 'expo-clipboard';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ConversionError } from '../core/errors';
import { mimeFor } from '../core/formats';
import type { ConversionResult, LoadedFile } from '../core/types';

/**
 * Tudo que depende do Android (arquivos, pastas, compartilhar, área de transferência) fica aqui.
 * O núcleo e as telas nunca chamam APIs do sistema diretamente.
 */

const isCancel = (e: unknown) => /cancel/i.test(String((e as Error)?.message ?? e));

/** Abre o seletor do sistema. Devolve null se o usuário cancelar. */
export async function pickFile(): Promise<LoadedFile | null> {
  try {
    const picked = await File.pickFileAsync();
    if (picked.canceled) return null;
    return readFile(picked.result.uri);
  } catch (e) {
    if (isCancel(e)) return null;
    throw e instanceof ConversionError ? e : new ConversionError('read_failed');
  }
}

/** Lê um arquivo por URI (file:// ou content://), vindo do seletor, do Compartilhar ou do Abrir com. */
export async function readFile(uri: string, hints: { name?: string | null; mimeType?: string | null } = {}): Promise<LoadedFile> {
  try {
    const file = new File(uri);
    const content = await file.text();
    return {
      name: hints.name || safeName(file),
      content,
      mimeType: hints.mimeType ?? (file.type || null),
      size: file.size ?? content.length,
    };
  } catch {
    throw new ConversionError('read_failed');
  }
}

/** Texto (colado ou compartilhado) vira um "arquivo" em memória para seguir o mesmo fluxo. */
export function fileFromText(text: string, name: string): LoadedFile {
  return { name, content: text, mimeType: 'text/plain', size: text.length };
}

export async function readClipboard(): Promise<string> {
  return (await Clipboard.getStringAsync()) ?? '';
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/** O usuário escolhe uma pasta e o arquivo é criado nela. Devolve null se cancelar. */
export async function saveToFolder(result: ConversionResult): Promise<string | null> {
  let dir: Directory;
  try {
    dir = await Directory.pickDirectoryAsync();
  } catch (e) {
    if (isCancel(e)) return null;
    throw new ConversionError('save_failed');
  }
  try {
    const out = dir.createFile(result.fileName, mimeFor(result.to));
    await out.write(result.content);
    return out.name || result.fileName;
  } catch {
    throw new ConversionError('save_failed');
  }
}

/** Grava uma cópia temporária e abre a folha de compartilhamento do Android. */
export async function shareResult(result: ConversionResult): Promise<void> {
  const tmp = new File(Paths.cache, result.fileName);
  if (tmp.exists) tmp.delete();
  tmp.create();
  await tmp.write(result.content);
  await Sharing.shareAsync(tmp.uri, { mimeType: mimeFor(result.to) });
}

function safeName(file: File): string {
  try {
    return decodeURIComponent(file.name);
  } catch {
    return file.name || 'arquivo';
  }
}
