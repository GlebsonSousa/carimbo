import type { DataValue } from '../../core/types';

type Row = Record<string, DataValue>;

/**
 * Transforma qualquer DataValue em linhas planas para formatos tabulares (CSV).
 * Objetos aninhados viram colunas com ponto: { a: { b: 1 } } -> "a.b".
 */
export function toRows(data: DataValue): Row[] {
  if (Array.isArray(data)) return data.map((item) => (isObject(item) ? flatten(item) : { value: item }));
  if (isObject(data)) {
    // Objeto com uma única lista dentro (ex.: { "clientes": [...] }) vira a própria lista.
    const values = Object.values(data);
    if (values.length === 1 && Array.isArray(values[0])) return toRows(values[0]);
    return [flatten(data)];
  }
  return [{ value: data }];
}

export function columnsOf(rows: Row[]): string[] {
  const cols: string[] = [];
  for (const row of rows) for (const k of Object.keys(row)) if (!cols.includes(k)) cols.push(k);
  return cols;
}

function flatten(obj: Record<string, DataValue>, prefix = '', out: Row = {}): Row {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isObject(v)) flatten(v, key, out);
    else if (Array.isArray(v)) out[key] = v.every((x) => !isObject(x) && !Array.isArray(x)) ? v.join('; ') : JSON.stringify(v);
    else out[key] = v;
  }
  return out;
}

export function isObject(v: DataValue): v is Record<string, DataValue> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
