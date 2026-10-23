import { describe, expect, it } from 'vitest';
import { detectFormat } from '../core/detect';
import { validators } from '../converters/detectors';

const d = (name: string, content: string, mimeType?: string) => detectFormat({ name, content, mimeType }, validators);

describe('detecção de formato', () => {
  it('usa a extensão quando o conteúdo confirma', () => {
    expect(d('a.json', '{"a":1}')).toBe('json');
    expect(d('a.yml', 'a: 1')).toBe('yaml');
    expect(d('a.md', 'texto qualquer')).toBe('markdown');
  });

  it('corrige extensão errada pelo conteúdo', () => {
    expect(d('dados.txt', '{"a":1}')).toBe('json');
    expect(d('dados.csv', '<a><b>1</b></a>')).toBe('xml');
  });

  it('reconhece texto colado sem nome', () => {
    expect(d('texto', '[1,2,3]')).toBe('json');
    expect(d('texto', 'nome;idade\nAna;31\nBruno;28')).toBe('csv');
    expect(d('texto', 'servidor:\n  porta: 8080\n  host: local')).toBe('yaml');
    expect(d('texto', '# Notas\n\n- item')).toBe('markdown');
    expect(d('texto', '<!doctype html><html></html>')).toBe('html');
  });

  it('usa o MIME quando não há extensão', () => {
    expect(d('compartilhado', '{"a":1}', 'application/json')).toBe('json');
  });

  it('texto comum fica como TXT ou desconhecido', () => {
    expect(d('nota.txt', 'só uma frase')).toBe('txt');
    expect(d('sem-nome', 'só uma frase')).toBeNull();
  });
});
