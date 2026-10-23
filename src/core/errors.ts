/**
 * Erros do núcleo carregam só um código e detalhes.
 * O texto exibido ao usuário fica em src/i18n, nunca aqui.
 */
export type ErrorCode =
  | 'unknown_format'
  | 'unsupported_conversion'
  | 'file_too_large'
  | 'empty_file'
  | 'invalid_json'
  | 'invalid_csv'
  | 'invalid_xml'
  | 'invalid_yaml'
  | 'read_failed'
  | 'save_failed'
  | 'unexpected';

export class ConversionError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly details: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = 'ConversionError';
  }
}

export function toConversionError(e: unknown): ConversionError {
  return e instanceof ConversionError ? e : new ConversionError('unexpected', { message: String((e as Error)?.message ?? e) });
}
