import { describe, expect, it } from 'vitest';
import { isIndependent } from '../lib/linalg';
import { checkAnswer, parseNumber, type Rand } from './exercise';
import { exercises } from './index';
import { module1 } from './module1';

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
});
