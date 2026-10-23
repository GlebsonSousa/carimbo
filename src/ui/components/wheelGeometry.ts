/**
 * Geometria da roda (rosca dividida em fatias). Funções puras, testadas em __tests__/wheel.test.ts.
 * Ângulos em graus, 0° = direita, crescendo no sentido horário (como na tela).
 */
export interface WheelSize {
  size: number;
  outer: number;
  inner: number;
}

export function wheelSize(size: number): WheelSize {
  return { size, outer: size * 0.385, inner: size * 0.165 };
}

/** Início e fim de cada fatia; a primeira fica centralizada no topo. */
export function segmentRange(index: number, count: number): [number, number] {
  const sweep = 360 / count;
  const start = -90 - sweep / 2 + index * sweep;
  return [start, start + sweep];
}

export function segmentMid(index: number, count: number): number {
  const [a, b] = segmentRange(index, count);
  return (a + b) / 2;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

function point(cx: number, cy: number, r: number, deg: number): string {
  return `${(cx + r * Math.cos(rad(deg))).toFixed(1)} ${(cy + r * Math.sin(rad(deg))).toFixed(1)}`;
}

/** Caminho SVG de uma fatia, com um vão de largura constante entre as fatias. */
export function segmentPath(index: number, count: number, w: WheelSize, gapPx = 8): string {
  const c = w.size / 2;
  const [a0, a1] = segmentRange(index, count);
  if (count === 1) {
    // Um destino só: anel inteiro, desenhado como duas metades.
    return `M${point(c, c, w.outer, -90)}A${w.outer} ${w.outer} 0 1 1 ${point(c, c, w.outer, 90)}A${w.outer} ${w.outer} 0 1 1 ${point(c, c, w.outer, -90)}Z` +
      `M${point(c, c, w.inner, -90)}A${w.inner} ${w.inner} 0 1 0 ${point(c, c, w.inner, 90)}A${w.inner} ${w.inner} 0 1 0 ${point(c, c, w.inner, -90)}Z`;
  }
  const outerGap = (gapPx / 2 / w.outer) * (180 / Math.PI);
  const innerGap = (gapPx / 2 / w.inner) * (180 / Math.PI);
  const large = a1 - a0 - 2 * outerGap > 180 ? 1 : 0;
  return (
    `M${point(c, c, w.outer, a0 + outerGap)}` +
    `A${w.outer} ${w.outer} 0 ${large} 1 ${point(c, c, w.outer, a1 - outerGap)}` +
    `L${point(c, c, w.inner, a1 - innerGap)}` +
    `A${w.inner} ${w.inner} 0 ${large} 0 ${point(c, c, w.inner, a0 + innerGap)}Z`
  );
}

/** Posição do rótulo de uma fatia (centro do texto). */
export function labelPosition(index: number, count: number, w: WheelSize): { x: number; y: number } {
  const c = w.size / 2;
  const r = (w.outer + w.inner) / 2;
  const mid = count === 1 ? -90 : segmentMid(index, count);
  return { x: c + r * Math.cos(rad(mid)), y: c + r * Math.sin(rad(mid)) };
}

/** Deslocamento da fatia escolhida, para fora, na direção do seu centro. */
export function pushOffset(index: number, count: number, px = 8): { x: number; y: number } {
  if (count === 1) return { x: 0, y: 0 };
  const mid = segmentMid(index, count);
  return { x: px * Math.cos(rad(mid)), y: px * Math.sin(rad(mid)) };
}

export type Hit = { kind: 'segment'; index: number } | { kind: 'center' } | { kind: 'none' };

/** O que está sob o dedo, em coordenadas relativas ao canto da roda. */
export function hitTest(x: number, y: number, count: number, w: WheelSize): Hit {
  const c = w.size / 2;
  const dx = x - c;
  const dy = y - c;
  const dist = Math.hypot(dx, dy);
  if (dist < w.inner) return { kind: 'center' };
  // Uma folga além da borda: o dedo pode passar um pouco da fatia.
  if (dist > w.outer * 1.25) return { kind: 'none' };
  if (count === 1) return { kind: 'segment', index: 0 };
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const sweep = 360 / count;
  const fromStart = (((deg - (-90 - sweep / 2)) % 360) + 360) % 360;
  return { kind: 'segment', index: Math.floor(fromStart / sweep) % count };
}
