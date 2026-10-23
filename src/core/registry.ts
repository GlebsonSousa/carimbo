import type { FormatId } from './formats';
import type { Converter, DataCodec } from './types';

/**
 * Guarda os conversores disponíveis e responde "para quais formatos este arquivo pode ir?".
 * As telas só conversam com o registro, então adicionar conversores não exige mudar a interface.
 */
export class ConverterRegistry {
  private converters = new Map<string, Converter>();

  register(...converters: Converter[]): this {
    for (const c of converters) this.converters.set(key(c.from, c.to), c);
    return this;
  }

  /**
   * Registra formatos de dados via formato pivô:
   * cada codec lê para DataValue e escreve a partir dele,
   * gerando automaticamente todas as combinações entre eles.
   */
  registerCodecs(...codecs: DataCodec[]): this {
    for (const from of codecs) {
      for (const to of codecs) {
        if (from.format === to.format) continue;
        this.register({
          id: `${from.format}->${to.format}`,
          from: from.format,
          to: to.format,
          convert: (text) => to.serialize(from.parse(text)),
        });
      }
    }
    return this;
  }

  find(from: FormatId, to: FormatId): Converter | undefined {
    return this.converters.get(key(from, to));
  }

  targetsFor(from: FormatId): FormatId[] {
    return [...this.converters.values()].filter((c) => c.from === from).map((c) => c.to);
  }

  sources(): FormatId[] {
    return [...new Set([...this.converters.values()].map((c) => c.from))];
  }
}

const key = (from: FormatId, to: FormatId) => `${from}->${to}`;
