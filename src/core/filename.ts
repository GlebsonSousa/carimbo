import { FORMATS, type FormatId } from './formats';

export function baseName(name: string): string {
  const clean = name.split('/').pop() ?? name;
  const dot = clean.lastIndexOf('.');
  return dot > 0 ? clean.slice(0, dot) : clean;
}

export function extensionOf(name: string): string {
  const clean = name.split('/').pop() ?? name;
  const dot = clean.lastIndexOf('.');
  return dot > 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

export function outputName(originalName: string, to: FormatId): string {
  const base = baseName(originalName).trim() || 'arquivo';
  return `${base}.${FORMATS[to].extension}`;
}
