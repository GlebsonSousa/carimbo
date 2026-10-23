import { ConversionError } from '../../core/errors';
import type { DataCodec, DataValue } from '../../core/types';

export const jsonCodec: DataCodec = {
  format: 'json',
  parse(text) {
    try {
      return JSON.parse(stripBom(text)) as DataValue;
    } catch (e) {
      const match = /position (\d+)/i.exec(String((e as Error).message));
      const line = match ? lineAt(text, Number(match[1])) : 0;
      throw new ConversionError('invalid_json', line ? { line } : {});
    }
  },
  serialize(data) {
    return JSON.stringify(data, null, 2) + '\n';
  },
};

export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function lineAt(text: string, position: number): number {
  return text.slice(0, position).split('\n').length;
}
