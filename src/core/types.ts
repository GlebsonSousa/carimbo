import type { FormatId } from './formats';

/** Estrutura intermediária (formato pivô) usada pelos formatos de dados. */
export type DataValue = null | boolean | number | string | DataValue[] | { [key: string]: DataValue };

/** Um conversor direto de um formato para outro. */
export interface Converter {
  id: string;
  from: FormatId;
  to: FormatId;
  convert(input: string): Promise<string> | string;
}

/** Um formato de dados sabe ler para o pivô e escrever a partir dele. */
export interface DataCodec {
  format: FormatId;
  parse(text: string): DataValue;
  serialize(data: DataValue): string;
}

/** Arquivo já carregado na memória, independente de onde veio. */
export interface LoadedFile {
  name: string;
  content: string;
  mimeType?: string | null;
  size: number;
}

export interface ConversionResult {
  fileName: string;
  content: string;
  from: FormatId;
  to: FormatId;
}
