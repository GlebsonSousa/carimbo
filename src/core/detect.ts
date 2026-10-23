import { extensionOf } from './filename';
import { formatFromExtension, formatFromMime, type FormatId } from './formats';
import type { LoadedFile } from './types';

/** Função que diz se um texto é válido em determinado formato. */
export type Validator = (text: string) => boolean;
export type Validators = Partial<Record<FormatId, Validator>>;

/** Ordem de tentativa quando a extensão não ajuda. Do mais rígido ao mais permissivo. */
const SNIFF_ORDER: FormatId[] = ['json', 'xml', 'html', 'csv', 'yaml', 'markdown'];

/**
 * Descobre o formato de um arquivo combinando extensão, tipo MIME e conteúdo.
 * 1. Se a extensão/MIME aponta um formato e o conteúdo confirma, usa ele.
 * 2. Senão, testa o conteúdo em cada formato, do mais rígido ao mais permissivo.
 * 3. Se nada bater, devolve o palpite da extensão (ou null).
 */
export function detectFormat(file: Pick<LoadedFile, 'name' | 'content' | 'mimeType'>, validators: Validators): FormatId | null {
  const hint = formatFromExtension(extensionOf(file.name)) ?? formatFromMime(file.mimeType);
  const text = file.content;

  if (hint && hint !== 'txt') {
    const check = validators[hint];
    if (!check || check(text)) return hint;
  }

  for (const format of SNIFF_ORDER) {
    const check = validators[format];
    if (check && check(text)) return format;
  }

  return hint;
}
