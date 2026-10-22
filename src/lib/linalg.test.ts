import { describe, expect, it } from 'vitest';
import { add, det2, matVec, scale } from './linalg';

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
