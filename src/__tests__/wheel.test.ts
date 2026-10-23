import { describe, expect, it } from 'vitest';
import { hitTest, labelPosition, segmentPath, wheelSize } from '../ui/components/wheelGeometry';

const w = wheelSize(400);

describe('roda', () => {
  it('primeira fatia fica no topo', () => {
    const p = labelPosition(0, 3, w);
    expect(Math.round(p.x)).toBe(200);
    expect(p.y).toBeLessThan(200);
  });

  it('identifica a fatia sob o dedo', () => {
    expect(hitTest(200, 60, 3, w)).toEqual({ kind: 'segment', index: 0 });
    expect(hitTest(330, 260, 3, w)).toEqual({ kind: 'segment', index: 1 });
    expect(hitTest(70, 260, 3, w)).toEqual({ kind: 'segment', index: 2 });
  });

  it('centro e fora da roda', () => {
    expect(hitTest(200, 200, 3, w)).toEqual({ kind: 'center' });
    expect(hitTest(5, 5, 3, w)).toEqual({ kind: 'none' });
  });

  it('funciona com 2 a 6 fatias e com uma só', () => {
    for (let n = 1; n <= 6; n++) for (let i = 0; i < n; i++) expect(segmentPath(i, n, w)).toMatch(/^M[\d.]+ [\d.]+A/);
    expect(hitTest(200, 80, 1, w)).toEqual({ kind: 'segment', index: 0 });
  });
});
