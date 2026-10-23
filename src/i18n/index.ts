import type { ConversionError } from '../core/errors';
import { en } from './en';
import { ptBR, type TranslationKey } from './pt-BR';

const dictionaries: Record<string, Record<TranslationKey, string>> = { pt: ptBR, en };

function deviceLanguage(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2).toLowerCase();
  } catch {
    return 'pt';
  }
}

const active = dictionaries[deviceLanguage()] ?? ptBR;

export function t(key: TranslationKey, params: Record<string, string | number> = {}): string {
  return active[key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

/** Converte um erro do núcleo na mensagem certa, usando a versão com linha quando houver. */
export function errorMessage(error: ConversionError): string {
  const withLine = `error.${error.code}.line` as TranslationKey;
  if (error.details.line && withLine in active) return t(withLine, error.details);
  return t(`error.${error.code}` as TranslationKey, error.details);
}

export type { TranslationKey };
