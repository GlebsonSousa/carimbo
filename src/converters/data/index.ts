import { csvCodec } from './csv';
import { jsonCodec } from './json';
import { xmlCodec } from './xml';
import { yamlCodec } from './yaml';

export const dataCodecs = [jsonCodec, csvCodec, xmlCodec, yamlCodec];
