import { describe, expect, it } from 'vitest';
import { convertFile } from '../core/convert';
import { ConversionError } from '../core/errors';
import type { FormatId } from '../core/formats';
import { createDefaultRegistry } from '../converters';

const registry = createDefaultRegistry();
const file = (name: string, content: string) => ({ name, content, size: content.length });
const run = (from: FormatId, to: FormatId, content: string) => convertFile(file(`dados.${from}`, content), from, to, registry);

const JSON_LIST = JSON.stringify([
  { nome: 'Ana', idade: 31, endereco: { cidade: 'Recife' } },
  { nome: 'Bruno', idade: 28, endereco: { cidade: 'Natal' } },
]);

describe('registro', () => {
  it('oferece só destinos possíveis', () => {
    expect(registry.targetsFor('json').sort()).toEqual(['csv', 'xml', 'yaml']);
    expect(registry.targetsFor('markdown').sort()).toEqual(['html', 'txt']);
    expect(registry.targetsFor('txt')).toEqual([]);
  });
});

describe('dados', () => {
  it('JSON -> CSV achata objetos aninhados', async () => {
    const r = await run('json', 'csv', JSON_LIST);
    expect(r.content).toBe('nome,idade,endereco.cidade\nAna,31,Recife\nBruno,28,Natal\n');
    expect(r.fileName).toBe('dados.csv');
  });

  it('CSV -> JSON -> CSV preserva os dados', async () => {
    const csv = 'nome,cidade\nAna,"Recife, PE"\nBruno,Natal\n';
    const json = await run('csv', 'json', csv);
    expect(JSON.parse(json.content)).toEqual([{ nome: 'Ana', cidade: 'Recife, PE' }, { nome: 'Bruno', cidade: 'Natal' }]);
    const back = await run('json', 'csv', json.content);
    expect(back.content).toBe(csv);
  });

  it('JSON -> XML -> JSON preserva lista', async () => {
    const xml = await run('json', 'xml', '[{"a":"1"},{"a":"2"}]');
    expect(xml.content).toContain('<item>');
    const json = await run('xml', 'json', xml.content);
    expect(JSON.parse(json.content)).toEqual([{ a: '1' }, { a: '2' }]);
  });

  it('XML com chave inválida vira tag válida', async () => {
    const xml = await run('json', 'xml', '{"nome completo":"Ana","1x":"b"}');
    expect(xml.content).toContain('<nome_completo>Ana</nome_completo>');
    expect(xml.content).toContain('<_1x>b</_1x>');
  });

  it('YAML <-> JSON', async () => {
    const y = await run('json', 'yaml', '{"app":{"nome":"Carimbo","versao":1}}');
    expect(y.content).toBe('app:\n  nome: Carimbo\n  versao: 1\n');
    const j = await run('yaml', 'json', y.content);
    expect(JSON.parse(j.content)).toEqual({ app: { nome: 'Carimbo', versao: 1 } });
  });

  it('erros trazem código e linha', async () => {
    await expect(run('json', 'csv', '{"a": 1,\n"b": }')).rejects.toMatchObject({ code: 'invalid_json' });
    await expect(run('xml', 'json', '<a><b></a>')).rejects.toMatchObject({ code: 'invalid_xml' });
    await expect(run('yaml', 'json', 'a: [1, 2')).rejects.toMatchObject({ code: 'invalid_yaml' });
    await expect(run('csv', 'json', '')).rejects.toBeInstanceOf(ConversionError);
  });
});

describe('texto', () => {
  it('Markdown -> HTML gera documento completo', async () => {
    const r = await run('markdown', 'html', '# Título\n\nOlá **mundo**');
    expect(r.content).toContain('<title>Título</title>');
    expect(r.content).toContain('<strong>mundo</strong>');
  });

  it('Markdown -> TXT remove a marcação', async () => {
    const r = await run('markdown', 'txt', '# Lista\n\n- um\n- dois & três');
    expect(r.content).toBe('Lista\n• um\n• dois & três\n');
  });
});

describe('limites', () => {
  it('recusa arquivo grande', async () => {
    await expect(convertFile({ name: 'a.json', content: '{}', size: 11 * 1024 * 1024 }, 'json', 'csv', registry)).rejects.toMatchObject({ code: 'file_too_large' });
  });
});
