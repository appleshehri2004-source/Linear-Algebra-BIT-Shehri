import { describe, expect, it } from 'vitest';
import { det2, isIndependent } from '../lib/linalg';
import { checkAnswer, matTex, parseNumber, type Rand } from './exercise';
import { exercises } from './index';
import { module1 } from './module1';
import { module4 } from './module4';

/** A repeatable "random" number maker (mulberry32), so a failing test fails the same way every time. */
function seeded(seed: number): Rand {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('every exercise', () => {
  for (const [id, generate] of Object.entries(exercises)) {
    it(`${id}: accepts the right answer and rejects a wrong one`, () => {
      const rand = seeded(id.length * 1000 + 7);
      for (let i = 0; i < 200; i++) {
        const q = generate(rand);
        const right = typeof q.answer === 'number' ? [q.answer] : [...q.answer];
        expect(checkAnswer(q, right)).toBe(true);

        // Rounded to 2 decimals, the way a learner would type it.
        expect(checkAnswer(q, right.map((n) => Math.round(n * 100) / 100))).toBe(true);

        const wrong = [...right];
        wrong[0] += 1;
        expect(checkAnswer(q, wrong)).toBe(false);

        // A question must never print "NaN" or "undefined".
        expect(q.text).not.toMatch(/NaN|undefined|Infinity/);
      }
    });
  }
});

describe('1.4-dependent', () => {
  it('its answer really makes the vectors dependent', () => {
    const rand = seeded(3);
    for (let i = 0; i < 50; i++) {
      const q = module1['1.4-dependent'](rand);
      // Read the two vectors back out of the question's TeX.
      const nums = [...q.text.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
      const [vx, vy, wy] = nums;
      expect(isIndependent([vx, vy], [q.answer as number, wy])).toBe(false);
    }
  });
});

describe('parseNumber', () => {
  it('reads ordinary and typographic minus signs', () => {
    expect(parseNumber('-2')).toBe(-2);
    expect(parseNumber('−2')).toBe(-2);
    expect(parseNumber(' 2.5 ')).toBe(2.5);
    expect(parseNumber('2,5')).toBe(2.5);
  });

  it('gives null for empty or non-numbers', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });

  it('reads fractions like 1/3 and -9/2', () => {
    expect(parseNumber('1/3')).toBeCloseTo(1 / 3, 12);
    expect(parseNumber('-9/2')).toBe(-4.5);
    expect(parseNumber('−9/2')).toBe(-4.5);
    expect(parseNumber(' 3 / 4 ')).toBe(0.75);
    expect(parseNumber('2.5/5')).toBe(0.5);
  });

  it('gives null for half-typed or impossible fractions', () => {
    expect(parseNumber('1/')).toBeNull();
    expect(parseNumber('/2')).toBeNull();
    expect(parseNumber('1/0')).toBeNull();
    expect(parseNumber('1/2/3')).toBeNull();
  });
});

describe('matTex', () => {
  it('puts column 1 (i-hat) on the left', () => {
    expect(matTex([[1, -2], [3, 0]])).toBe('\\begin{bmatrix} 1 & 3 \\\\ -2 & 0 \\end{bmatrix}');
  });
});

describe('4.3-no-inverse', () => {
  it('its answer really makes det = 0', () => {
    const rand = seeded(5);
    for (let i = 0; i < 50; i++) {
      const q = module4['4.3-no-inverse'](rand);
      // Read a, c and d back out of the question's TeX: [a k over c d].
      const [a, c, d] = [...q.text.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
      expect(det2([[a, c], [q.answer as number, d]])).toBe(0);
    }
  });
});

describe('4.2-new-row', () => {
  it('never writes a double sign like "- -2" or a minus inside a fraction', () => {
    const rand = seeded(11);
    for (let i = 0; i < 100; i++) {
      const q = module4['4.2-new-row'](rand);
      const step = q.text.slice(q.text.indexOf('R_2 \\to'));
      expect(step).not.toMatch(/[-+] -|\{-/);
    }
  });
});
