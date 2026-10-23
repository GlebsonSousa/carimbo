import { ConversionError, toConversionError } from './errors';
import { outputName } from './filename';
import type { FormatId } from './formats';
import type { ConverterRegistry } from './registry';
import type { ConversionResult, LoadedFile } from './types';

/** Limite do MVP: a conversão roda em memória, no JavaScript. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function convertFile(file: LoadedFile, from: FormatId, to: FormatId, registry: ConverterRegistry): Promise<ConversionResult> {
  if (file.size > MAX_FILE_BYTES) throw new ConversionError('file_too_large', { maxMb: MAX_FILE_BYTES / 1024 / 1024 });
  if (!file.content.trim()) throw new ConversionError('empty_file');

  const converter = registry.find(from, to);
  if (!converter) throw new ConversionError('unsupported_conversion', { from, to });

  try {
    const content = await converter.convert(file.content);
    return { fileName: outputName(file.name, to), content, from, to };
  } catch (e) {
    throw toConversionError(e);
  }
}
