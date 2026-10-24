import { describe, expect, it } from 'vitest';
import { consistency } from '../lib/linalg';
import { chapter1, rowOpTex } from './chapter1';
import type { Rand } from './exercise';

/** A repeatable "random" number maker (mulberry32), the same one exercises.test.ts uses. */
function seeded(seed: number): Rand {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The numbers inside the first \begin{array}...\end{array} of a question, row by row. */
function arrayNumbers(text: string): number[] {
  const inside = text.slice(text.indexOf('{array}{') + 8, text.indexOf('\\end{array}'));
  return [...inside.slice(inside.indexOf('}') + 1).matchAll(/-?\d+/g)].map((m) => Number(m[0]));
}

describe('rowOpTex', () => {
  it('writes the three kinds of row operation, counting rows from 1', () => {
    expect(rowOpTex({ kind: 'swap', i: 0, j: 2 })).toBe('R_1 \\leftrightarrow R_3');
    expect(rowOpTex({ kind: 'scale', i: 1, k: -2 })).toBe('R_2 \\to -2R_2');
    expect(rowOpTex({ kind: 'scale', i: 1, k: 1 / 3 })).toBe('R_2 \\to \\tfrac{1}{3}R_2');
    expect(rowOpTex({ kind: 'add', i: 2, j: 0, k: -2 })).toBe('R_3 \\to R_3 - 2R_1');
    expect(rowOpTex({ kind: 'add', i: 1, j: 0, k: 1 })).toBe('R_2 \\to R_2 + R_1');
  });
});

describe('1.1-which-op', () => {
  it('offers 4 different operations, and every kind is sometimes the answer', () => {
    const rand = seeded(1);
    const answers = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const q = chapter1['1.1-which-op'](rand);
      expect(q.choices).toHaveLength(4);
      const right = q.choices![q.answer as number];
      answers.add(right.includes('leftrightarrow') ? 'swap' : /R_(\d) \\to R_\1 [+-]/.test(right) ? 'add' : 'scale');
    }
    expect(answers).toEqual(new Set(['swap', 'scale', 'add']));
  });
});

describe('1.1-consistent', () => {
  it('asks about consistent and inconsistent systems', () => {
    const rand = seeded(2);
    const answers = new Set<number>();
    for (let i = 0; i < 100; i++) answers.add(chapter1['1.1-consistent'](rand).answer as number);
    expect(answers).toEqual(new Set([0, 1]));
  });
});

describe('1.1-h-consistent', () => {
  it('its h makes the system consistent, and any other h does not', () => {
    const rand = seeded(3);
    for (let i = 0; i < 100; i++) {
      const q = chapter1['1.1-h-consistent'](rand);
      const [a, b, c, ka, kb] = arrayNumbers(q.text);
      const h = q.answer as number;
      expect(consistency([[a, b, c], [ka, kb, h]]).consistent).toBe(true);
      expect(consistency([[a, b, c], [ka, kb, h + 1]]).consistent).toBe(false);
    }
  });
});

describe('1.4-span-rm', () => {
  it('asks about columns that span R^3 and columns that do not', () => {
    const rand = seeded(4);
    const answers = new Set<number>();
    for (let i = 0; i < 100; i++) answers.add(chapter1['1.4-span-rm'](rand).answer as number);
    expect(answers).toEqual(new Set([0, 1]));
  });
});

describe('1.4-condition', () => {
  it('its p and q really describe the b that can be reached', () => {
    const rand = seeded(5);
    for (let i = 0; i < 100; i++) {
      const q = chapter1['1.4-condition'](rand);
      // Read A's two columns back from the bmatrix (rows: a1[0] a2[0] \\ a1[1] a2[1] \\ a1[2] a2[2]).
      const nums = [...q.text.slice(0, q.text.indexOf('\\end{bmatrix}')).matchAll(/-?\d+/g)].map((m) => Number(m[0]));
      const a1 = [nums[0], nums[2], nums[4]];
      const a2 = [nums[1], nums[3], nums[5]];
      const [p, r] = q.answer as number[];
      // b = 2a1 - a2 is reachable, so it must satisfy b3 = p b1 + r b2.
      const b = a1.map((x, k) => 2 * x - a2[k]);
      expect(b[2]).toBeCloseTo(p * b[0] + r * b[1], 9);
      expect(consistency([[a1[0], a2[0], b[0]], [a1[1], a2[1], b[1]], [a1[2], a2[2], b[2] + 1]]).consistent).toBe(false);
    }
  });
});

describe('1.9-one-to-one-onto', () => {
  it('gives each of the four answers sometimes, and never calls a 3x2 matrix onto R^3', () => {
    const rand = seeded(6);
    const answers = new Set<number>();
    for (let i = 0; i < 300; i++) {
      const q = chapter1['1.9-one-to-one-onto'](rand);
      answers.add(q.answer as number);
      // Two inputs, three outputs: at most 2 pivots, so never onto R^3.
      if (!q.text.includes('x_3') && q.text.includes('mathbb{R}^3')) expect([1, 3]).toContain(q.answer);
    }
    expect(answers).toEqual(new Set([0, 1, 2, 3]));
  });
});

describe('1.9-standard-matrix', () => {
  it('always asks for a whole matrix', () => {
    const rand = seeded(7);
    for (let i = 0; i < 100; i++) expect([2, 3]).toContain(chapter1['1.9-standard-matrix'](rand).gridRows);
  });
});
