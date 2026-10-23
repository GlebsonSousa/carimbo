import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { ConversionError } from '../../core/errors';
import type { DataCodec, DataValue } from '../../core/types';
import { stripBom } from './json';
import { isObject } from './table';

const ATTR = '@_';

export const xmlCodec: DataCodec = {
  format: 'xml',
  parse(text) {
    const clean = stripBom(text).trim();
    const valid = XMLValidator.validate(clean);
    if (valid !== true) throw new ConversionError('invalid_xml', { line: valid.err.line });
    const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: ATTR, ignoreDeclaration: true, parseTagValue: false }).parse(clean) as Record<string, DataValue>;
    // Remove a raiz única (<root>...</root>) para que os dados fiquem iguais aos de JSON/YAML.
    const keys = Object.keys(parsed);
    return keys.length === 1 ? unwrapItems(parsed[keys[0]]) : parsed;
  },
  serialize(data) {
    const body = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: ATTR, format: true, indentBy: '  ', suppressEmptyNode: true }).build({
      root: wrap(sanitize(data)),
    }) as string;
    return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
  },
};

/** Listas viram <item> repetidos, porque XML precisa de nomes de tag. */
function wrap(data: DataValue): DataValue {
  return Array.isArray(data) ? { item: data } : data;
}

/** Desfaz o wrap: <root><item/>...</root> volta a ser uma lista. */
function unwrapItems(data: DataValue): DataValue {
  if (isObject(data)) {
    const keys = Object.keys(data);
    if (keys.length === 1 && keys[0] === 'item') {
      const v = data.item;
      return Array.isArray(v) ? v : [v];
    }
  }
  return data;
}

/** Nomes de tag XML não podem ter espaço nem começar com número. */
function sanitize(data: DataValue): DataValue {
  if (Array.isArray(data)) return data.map(sanitize);
  if (!isObject(data)) return data;
  const out: Record<string, DataValue> = {};
  for (const [k, v] of Object.entries(data)) out[k.startsWith(ATTR) ? k : tagName(k)] = sanitize(v);
  return out;
}

function tagName(key: string): string {
  const cleaned = key.trim().replace(/[^\p{L}\p{N}_.-]+/gu, '_');
  return /^[\p{L}_]/u.test(cleaned) ? cleaned : `_${cleaned}`;
}
