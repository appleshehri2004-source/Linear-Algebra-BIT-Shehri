import { describe, expect, it } from 'vitest';
import {
  add,
  angleBetween,
  clampVec,
  det2,
  dot,
  isClose,
  isIndependent,
  length,
  matVec,
  projectOnto,
  roundTo,
  scale,
  snapVec,
  solveCombination,
  sub,
} from './linalg';

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

describe('dot', () => {
  it('multiplies matching parts and adds', () => {
    // 1*3 + 2*4 = 11
    expect(dot([1, 2], [3, 4])).toBe(11);
  });

  it('is 0 for arrows at right angles', () => {
    expect(dot([1, 0], [0, 1])).toBe(0);
  });

  it('is negative for arrows pointing opposite ways', () => {
    expect(dot([1, 0], [-2, 1])).toBe(-2);
  });
});

describe('length', () => {
  it('uses Pythagoras: 3, 4, 5', () => {
    expect(length([3, 4])).toBe(5);
  });
});

describe('angleBetween', () => {
  it('is 90 degrees for i-hat and j-hat', () => {
    expect(angleBetween([1, 0], [0, 1])).toBeCloseTo(90);
  });

  it('is 0 for the same direction and 180 for opposite', () => {
    expect(angleBetween([2, 2], [1, 1])).toBeCloseTo(0);
    expect(angleBetween([1, 0], [-3, 0])).toBeCloseTo(180);
  });

  it('is null when an arrow has no length', () => {
    expect(angleBetween([0, 0], [1, 0])).toBeNull();
  });
});

describe('projectOnto', () => {
  it("drops (2, 2) onto the x-axis's line", () => {
    expect(projectOnto([2, 2], [1, 0])).toEqual([2, 0]);
  });

  it('does not depend on how long v is, only its line', () => {
    expect(projectOnto([2, 2], [-5, 0])).toEqual([2, 0]);
  });

  it('is null when projecting onto the zero vector', () => {
    expect(projectOnto([2, 2], [0, 0])).toBeNull();
  });
});

describe('isIndependent', () => {
  it('is true for i-hat and j-hat', () => {
    expect(isIndependent([1, 0], [0, 1])).toBe(true);
  });

  it('is false when one is a stretched copy of the other', () => {
    expect(isIndependent([1, 2], [2, 4])).toBe(false);
  });

  it('is false when one is the zero vector', () => {
    expect(isIndependent([0, 0], [1, 3])).toBe(false);
  });
});

describe('solveCombination', () => {
  it('finds 3 i-hat - 2 j-hat for (3, -2)', () => {
    expect(solveCombination([1, 0], [0, 1], [3, -2])).toEqual({ a: 3, b: -2 });
  });

  it('works for slanted vectors too', () => {
    // 1*(1, 1) + 2*(1, -1) = (3, -1)
    const r = solveCombination([1, 1], [1, -1], [3, -1]);
    expect(r?.a).toBeCloseTo(1);
    expect(r?.b).toBeCloseTo(2);
  });

  it('is null when v and w are dependent', () => {
    expect(solveCombination([1, 2], [2, 4], [1, 1])).toBeNull();
  });
});

describe('isClose', () => {
  it('accepts answers within 0.01', () => {
    expect(isClose(1.414, 1.41)).toBe(true);
    expect(isClose(2, 2.01)).toBe(true);
  });

  it('rejects answers further away', () => {
    expect(isClose(2, 2.02)).toBe(false);
  });
});
