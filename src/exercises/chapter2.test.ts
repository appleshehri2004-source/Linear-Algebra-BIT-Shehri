import { describe, expect, it } from 'vitest';
import { addRows, inverseRows, mulRows, rank, transpose } from '../lib/linalg';
import { chapter2 } from './chapter2';
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

/** Every \begin{bmatrix}…\end{bmatrix} in a question, as rows of numbers. A letter (like k) reads as NaN. */
function matrices(text: string): number[][][] {
  return [...text.matchAll(/\\begin\{bmatrix\}(.*?)\\end\{bmatrix\}/g)].map((m) =>
    m[1].split('\\\\').map((row) => row.split('&').map((x) => Number(x.trim()))),
  );
}

/** Which buttons were the right answer, over many questions: every button position should come up. */
function answersSeen(id: string, seed: number, count = 200): Set<string> {
  const rand = seeded(seed);
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const q = chapter2[id](rand);
    seen.add(q.choices![q.answer as number]);
  }
  return seen;
}

describe('2.1-size', () => {
  it('sometimes the answer is a size and sometimes "Not defined"', () => {
    const seen = answersSeen('2.1-size', 1);
    expect(seen.has('Not defined')).toBe(true);
    expect([...seen].some((s) => s.includes('times'))).toBe(true);
  });
});

describe('2.1-commute', () => {
  it('its k makes AB = BA, and k + 1 does not', () => {
    const rand = seeded(2);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.1-commute'](rand);
      const [a, b] = matrices(q.text);
      const k = q.answer as number;
      for (const [value, equal] of [
        [k, true],
        [k + 1, false],
      ] as const) {
        b[1][1] = value;
        expect(JSON.stringify(mulRows(a, b)) === JSON.stringify(mulRows(b, a))).toBe(equal);
      }
    }
  });
});

/** Every \left[\begin{array}…\end{array}\right] (a block matrix) in a question, as rows of numbers, lines removed. */
function blockMatrices(text: string): number[][][] {
  return [...text.matchAll(/\\begin\{array\}\{[c|]+\}(.*?)\\end\{array\}/g)].map((m) =>
    m[1]
      .replace(/\\hline/g, '')
      .split('\\\\')
      .map((row) => row.split('&').map((x) => Number(x.trim()))),
  );
}

/** The answer of a gridRows question, as rows. */
function grid(answer: number[], rows: number): number[][] {
  const cols = answer.length / rows;
  return Array.from({ length: rows }, (_, r) => answer.slice(r * cols, (r + 1) * cols));
}

const isIdentity = (m: number[][]) => m.every((row, r) => row.every((x, c) => Math.abs(x - (r === c ? 1 : 0)) < 1e-9));

describe('2.2-inverse3 and 2.4-block-inverse', () => {
  it('the answer times A is I', () => {
    const rand = seeded(3);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.2-inverse3'](rand);
      const [a] = matrices(q.text);
      expect(isIdentity(mulRows(a, grid(q.answer as number[], 3))!)).toBe(true);
    }
  });

  it('[A B; 0 C] times [A⁻¹ Y; 0 C⁻¹] is I', () => {
    const rand = seeded(4);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.4-block-inverse'](rand);
      const [m] = blockMatrices(q.text);
      const y = grid(q.answer as number[], 2);
      const aInv = inverseRows(m.slice(0, 2).map((row) => row.slice(0, 2)))!;
      const cInv = inverseRows(m.slice(2).map((row) => row.slice(2)))!;
      const inverse = [...aInv.map((row, r) => [...row, ...y[r]]), ...cInv.map((row) => [0, 0, ...row])];
      expect(isIdentity(mulRows(m, inverse)!)).toBe(true);
    }
  });
});

describe('2.4-unknown-block', () => {
  it('XA + B = 0', () => {
    const rand = seeded(5);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.4-unknown-block'](rand);
      const [ab] = blockMatrices(q.text);
      const x = grid(q.answer as number[], 2);
      const sum = addRows(mulRows(x, ab.slice(0, 2))!, ab.slice(2))!;
      expect(sum.flat().every((v) => Math.abs(v) < 1e-9)).toBe(true);
    }
  });
});

describe('yes/no questions', () => {
  for (const id of ['2.3-invertible', '2.8-in-nul', '2.8-in-col', '2.8-basis-r3']) {
    it(`${id}: both Yes and No come up`, () => {
      expect(answersSeen(id, 6)).toEqual(new Set(['Yes', 'No']));
    });
  }

  it('2.3-invertible agrees with inverseRows', () => {
    const rand = seeded(7);
    for (let i = 0; i < 200; i++) {
      const q = chapter2['2.3-invertible'](rand);
      const [a] = matrices(q.text);
      expect(q.answer).toBe(inverseRows(a) ? 0 : 1);
    }
  });
});

describe('2.8-nul-basis', () => {
  it('A times the answer is 0, and x₃ = 1', () => {
    const rand = seeded(8);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.8-nul-basis'](rand);
      const [a] = matrices(q.text);
      const n = q.answer as number[];
      expect(n[2]).toBe(1);
      expect(mulRows(a, n.map((x) => [x]))!.flat()).toEqual([0, 0]);
    }
  });
});

describe('2.8-col-basis', () => {
  it('exactly one option is a basis for Col A', () => {
    const rand = seeded(9);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.8-col-basis'](rand);
      const [a] = matrices(q.text);
      const columns = transpose(a);
      const r = rank(columns);
      const isBasis = q.choices!.map((choice) => {
        const picked = [...choice.matchAll(/\d/g)].map((m) => columns[Number(m[0]) - 1]);
        return picked.length === r && rank(picked) === r;
      });
      expect(isBasis.filter(Boolean)).toHaveLength(1);
      expect(isBasis[q.answer as number]).toBe(true);
    }
  });
});

describe('2.9-coords', () => {
  it('the coordinates rebuild x', () => {
    const rand = seeded(10);
    for (let i = 0; i < 100; i++) {
      const q = chapter2['2.9-coords'](rand);
      const [b1, b2, x] = matrices(q.text).map((m) => m.flat());
      const [c1, c2] = q.answer as number[];
      expect(b1.map((v, r) => c1 * v + c2 * b2[r] + 0)).toEqual(x);
    }
  });
});
