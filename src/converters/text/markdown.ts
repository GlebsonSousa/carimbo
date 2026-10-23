import { marked } from 'marked';
import type { Converter } from '../../core/types';

const HTML_STYLE = `body{font-family:system-ui,sans-serif;line-height:1.6;max-width:42rem;margin:2rem auto;padding:0 1rem;color:#1C1F26}
pre,code{font-family:ui-monospace,monospace;background:#EEF1F6;border-radius:4px}pre{padding:1rem;overflow-x:auto}
table{border-collapse:collapse}td,th{border:1px solid #c9cfdb;padding:.3rem .6rem}`;

function renderHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string;
}

export const markdownToHtml: Converter = {
  id: 'markdown->html',
  from: 'markdown',
  to: 'html',
  convert(md) {
    const title = /^#\s+(.+)$/m.exec(md)?.[1]?.trim() ?? 'Documento';
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${HTML_STYLE}</style>
</head>
<body>
${renderHtml(md)}</body>
</html>
`;
  },
};

export const markdownToTxt: Converter = {
  id: 'markdown->txt',
  from: 'markdown',
  to: 'txt',
  convert(md) {
    return htmlToPlainText(renderHtml(md));
  },
};

export function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/>\n+</g, '><')
      .replace(/<li>/gi, '• ')
      .replace(/<\/(p|h[1-6]|li|pre|blockquote|tr)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/t[dh]>/gi, '\t')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
