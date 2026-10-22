import { describe, expect, it } from 'vitest';
import { add, clampVec, det2, matVec, roundTo, scale, snapVec, sub } from './linalg';

describe('add', () => {
  it('adds matching parts', () => {
    expect(add([1, 2], [3, -1])).toEqual([4, 1]);
  });
});

describe('scale', () => {
  it('multiplies both parts by the number', () => {
    expect(scale(-2, [3, 1])).toEqual([-6, -2]);
  });
});

describe('matVec', () => {
  it('lands -1 i-hat + 2 j-hat where the matrix sends them', () => {
    // i-hat goes to (1, -2), j-hat goes to (3, 0).
    // -1*(1, -2) + 2*(3, 0) = (5, 2)
    expect(matVec([[1, -2], [3, 0]], [-1, 2])).toEqual([5, 2]);
  });
});

describe('det2', () => {
  it('stretching x by 3 and y by 2 scales area by 6', () => {
    expect(det2([[3, 0], [0, 2]])).toBe(6);
  });

  it('is negative when space gets flipped', () => {
    // 1*(-1) - 2*1 = -3
    expect(det2([[1, 1], [2, -1]])).toBe(-3);
  });
});

describe('scaling for the lesson 1.2 slider', () => {
  it('doubles at 2', () => {
    expect(scale(2, [2, 1])).toEqual([4, 2]);
  });

  it('flips and stretches at -1.8', () => {
    const [x, y] = scale(-1.8, [2, 1]);
    expect(x).toBeCloseTo(-3.6);
    expect(y).toBeCloseTo(-1.8);
  });
});

describe('sub', () => {
  it('undoes add', () => {
    expect(sub([4, 1], [1, 2])).toEqual([3, -1]);
  });
});

describe('roundTo', () => {
  it('rounds to the given decimals', () => {
    expect(roundTo(1.26, 1)).toBe(1.3);
    expect(roundTo(-3.6000000000000005, 1)).toBe(-3.6);
  });

  it('never gives -0', () => {
    expect(Object.is(roundTo(-0.01, 1), 0)).toBe(true);
  });
});

describe('snapVec', () => {
  it('snaps to whole numbers by default', () => {
    expect(snapVec([2.6, -1.4])).toEqual([3, -1]);
  });

  it('snaps to tenths without floating-point leftovers', () => {
    expect(snapVec([0.29, 0.71], 0.1)).toEqual([0.3, 0.7]);
  });

  it('never gives -0', () => {
    const [x] = snapVec([-0.2, 0]);
    expect(Object.is(x, 0)).toBe(true);
  });
});

describe('clampVec', () => {
  it('keeps a vector inside the plane', () => {
    expect(clampVec([7, -9], 5)).toEqual([5, -5]);
    expect(clampVec([1, 2], 5)).toEqual([1, 2]);
  });
});
