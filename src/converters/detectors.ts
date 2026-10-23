import Papa from 'papaparse';
import { XMLValidator } from 'fast-xml-parser';
import { load } from 'js-yaml';
import type { Validators } from '../core/detect';

const trimmed = (t: string) => t.replace(/^\uFEFF/, '').trim();

/** Validadores de conteúdo usados pela detecção automática de formato. */
export const validators: Validators = {
  json(text) {
    const t = trimmed(text);
    if (!/^[[{]/.test(t)) return false;
    try {
      JSON.parse(t);
      return true;
    } catch {
      return false;
    }
  },
  xml(text) {
    const t = trimmed(text);
    return t.startsWith('<') && !/^<!doctype html|^<html/i.test(t) && XMLValidator.validate(t) === true;
  },
  html(text) {
    return /^(<!doctype html|<html)/i.test(trimmed(text));
  },
  csv(text) {
    const t = trimmed(text);
    if (t.split('\n').length < 2) return false;
    const r = Papa.parse(t, { header: true, skipEmptyLines: 'greedy', preview: 50 });
    return (r.meta.fields?.length ?? 0) >= 2 && r.errors.filter((e) => e.type !== 'Delimiter').length === 0;
  },
  yaml(text) {
    const t = trimmed(text);
    if (!/^[\w"'-][^\n]*:\s|^-\s/m.test(t) || /^#\s/m.test(t)) return false;
    try {
      const v = load(t);
      return typeof v === 'object' && v !== null;
    } catch {
      return false;
    }
  },
  markdown(text) {
    return /^(#{1,6}\s|[-*]\s|\d+\.\s|>\s|```)/m.test(trimmed(text));
  },
};
