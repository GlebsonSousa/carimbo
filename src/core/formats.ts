/**
 * Catálogo dos formatos suportados.
 * Para adicionar um formato novo: inclua o id em FormatId e os metadados em FORMATS.
 */
export type FormatId = 'json' | 'csv' | 'xml' | 'yaml' | 'markdown' | 'html' | 'txt';

export interface FormatInfo {
  id: FormatId;
  /** Rótulo curto exibido no carimbo (ex.: "JSON"). Não é texto traduzível. */
  label: string;
  /** Extensão usada ao gerar arquivos, sem ponto. */
  extension: string;
  /** Extensões reconhecidas na leitura, sem ponto. */
  aliases: string[];
  mimeTypes: string[];
}

export const FORMATS: Record<FormatId, FormatInfo> = {
  json: { id: 'json', label: 'JSON', extension: 'json', aliases: ['json'], mimeTypes: ['application/json', 'text/json'] },
  csv: { id: 'csv', label: 'CSV', extension: 'csv', aliases: ['csv'], mimeTypes: ['text/csv', 'text/comma-separated-values', 'application/csv'] },
  xml: { id: 'xml', label: 'XML', extension: 'xml', aliases: ['xml'], mimeTypes: ['application/xml', 'text/xml'] },
  yaml: { id: 'yaml', label: 'YAML', extension: 'yaml', aliases: ['yaml', 'yml'], mimeTypes: ['application/yaml', 'application/x-yaml', 'text/yaml', 'text/x-yaml'] },
  markdown: { id: 'markdown', label: 'MD', extension: 'md', aliases: ['md', 'markdown'], mimeTypes: ['text/markdown', 'text/x-markdown'] },
  html: { id: 'html', label: 'HTML', extension: 'html', aliases: ['html', 'htm'], mimeTypes: ['text/html'] },
  txt: { id: 'txt', label: 'TXT', extension: 'txt', aliases: ['txt'], mimeTypes: ['text/plain'] },
};

export const ALL_FORMATS = Object.values(FORMATS);

export function formatFromExtension(ext: string): FormatId | null {
  const clean = ext.replace(/^\./, '').toLowerCase();
  return ALL_FORMATS.find((f) => f.aliases.includes(clean))?.id ?? null;
}

export function formatFromMime(mime: string | null | undefined): FormatId | null {
  if (!mime) return null;
  const clean = mime.split(';')[0].trim().toLowerCase();
  return ALL_FORMATS.find((f) => f.mimeTypes.includes(clean))?.id ?? null;
}

export function mimeFor(id: FormatId): string {
  return FORMATS[id].mimeTypes[0];
}
