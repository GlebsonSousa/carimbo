import { ConverterRegistry } from '../core/registry';
import { dataCodecs } from './data';
import { textConverters } from './text';

/**
 * Ponto único onde os módulos de conversão são ligados ao app.
 * Um módulo novo (ex.: imagens) entra aqui com uma linha.
 */
export function createDefaultRegistry(): ConverterRegistry {
  return new ConverterRegistry().registerCodecs(...dataCodecs).register(...textConverters);
}

export const registry = createDefaultRegistry();
