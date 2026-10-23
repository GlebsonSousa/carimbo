import { dump, load } from 'js-yaml';
import { ConversionError } from '../../core/errors';
import type { DataCodec, DataValue } from '../../core/types';
import { stripBom } from './json';

export const yamlCodec: DataCodec = {
  format: 'yaml',
  parse(text) {
    try {
      const value = load(stripBom(text)) as DataValue | undefined;
      return value ?? null;
    } catch (e) {
      const line = (e as { mark?: { line?: number } }).mark?.line;
      throw new ConversionError('invalid_yaml', line !== undefined ? { line: line + 1 } : {});
    }
  },
  serialize(data) {
    return dump(data, { lineWidth: 120 });
  },
};
