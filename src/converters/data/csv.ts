import Papa from 'papaparse';
import { ConversionError } from '../../core/errors';
import type { DataCodec, DataValue } from '../../core/types';
import { stripBom } from './json';
import { columnsOf, toRows } from './table';

export const csvCodec: DataCodec = {
  format: 'csv',
  parse(text) {
    const result = Papa.parse<Record<string, string>>(stripBom(text).trim(), {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
    });
    const fieldCount = result.meta.fields?.length ?? 0;
    const bad = result.errors.find((e) => e.type !== 'Delimiter');
    if (bad || fieldCount === 0) {
      // +2: uma linha de cabeçalho e índice começando em zero.
      throw new ConversionError('invalid_csv', bad?.row !== undefined ? { line: bad.row + 2 } : {});
    }
    return result.data.map((row) => {
      const out: Record<string, DataValue> = {};
      for (const [k, v] of Object.entries(row)) out[k] = typeof v === 'string' ? v : (v ?? null);
      return out;
    });
  },
  serialize(data) {
    const rows = toRows(data);
    return Papa.unparse(rows, { columns: columnsOf(rows), newline: '\n' }) + '\n';
  },
};
