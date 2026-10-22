import { describe, expect, it } from 'vitest';
import {
  add,
  angleBetween,
  bendDiagonal,
  bendLines,
  clampVec,
  det2,
  dot,
  easeInOut,
  gridLines,
  identity,
  isClose,
  isIndependent,
  length,
  lerp,
  lerpMatrix,
  lerpVec,
  mapAt,
  matMul,
  matrixAt,
  matVec,
  projectOnto,
  rotation,
  rotationAngle,
  roundTo,
  scale,
  segmentPoints,
  shiftOrigin,
  snapVec,
  solveCombination,
  sub,
  type Mat2,
  type Vec2,
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

// ---------- Day 5: transformations ----------

/** Check two matrices match, allowing tiny rounding errors (e.g. cos 90° = 0.00000000000000006). */
function expectMatClose(actual: Mat2, expected: Mat2) {
  actual.flat().forEach((n, i) => expect(n).toBeCloseTo(expected.flat()[i]));
}

/** true when three points lie on one straight line (the triangle they make has no area). */
function onOneLine(a: Vec2, b: Vec2, c: Vec2): boolean {
  return Math.abs(det2([sub(b, a), sub(c, a)])) < 1e-9;
}

const rot90: Mat2 = [[0, 1], [-1, 0]];
const shear: Mat2 = [[1, 0], [1, 1]];

describe('identity', () => {
  it('has columns (1, 0) and (0, 1)', () => {
    expect(identity()).toEqual([[1, 0], [0, 1]]);
  });

  it('leaves every vector where it is', () => {
    expect(matVec(identity(), [3, -2])).toEqual([3, -2]);
  });
});

describe('matMul', () => {
  it('rotates first, then shears', () => {
    expect(matMul(shear, rot90)).toEqual([[1, 1], [-1, 0]]);
  });

  it('applies M1 first, then M2', () => {
    const m1: Mat2 = [[1, 1], [-2, 0]];
    const m2: Mat2 = [[0, 1], [2, 0]];
    expect(matMul(m2, m1)).toEqual([[2, 1], [0, -2]]);
  });

  it('gives the same answer as applying the two matrices one after the other', () => {
    const v: Vec2 = [2, -3];
    expect(matVec(matMul(shear, rot90), v)).toEqual(matVec(shear, matVec(rot90, v)));
  });

  it('depends on the order', () => {
    expect(matMul(rot90, shear)).not.toEqual(matMul(shear, rot90));
  });
});

describe('lerpVec', () => {
  it('goes from u (t = 0) to v (t = 1)', () => {
    expect(lerpVec([0, 0], [4, 2], 0)).toEqual([0, 0]);
    expect(lerpVec([0, 0], [4, 2], 0.5)).toEqual([2, 1]);
    expect(lerpVec([0, 0], [4, 2], 1)).toEqual([4, 2]);
  });
});

describe('lerpMatrix', () => {
  const b: Mat2 = [[3, 1], [-1, 2]];

  it('gives A at t = 0', () => {
    expect(lerpMatrix(identity(), b, 0)).toEqual(identity());
  });

  it('gives B at t = 1', () => {
    expect(lerpMatrix(identity(), b, 1)).toEqual(b);
  });

  it('gives the midpoint at t = 0.5', () => {
    expect(lerpMatrix(identity(), b, 0.5)).toEqual([[2, 0.5], [-0.5, 1.5]]);
  });
});

describe('rotation', () => {
  it('rotation(90) is rot90', () => {
    expectMatClose(rotation(90), rot90);
  });

  it('rotation(0) is the identity', () => {
    expectMatClose(rotation(0), identity());
  });

  it('rotation(-90) turns clockwise', () => {
    expectMatClose(rotation(-90), [[0, -1], [1, 0]]);
  });
});

describe('rotationAngle', () => {
  it('finds the angle of a rotation', () => {
    expect(rotationAngle(rot90)).toBeCloseTo(90);
    expect(rotationAngle(rotation(-30))).toBeCloseTo(-30);
  });

  it('is null for matrices that stretch or flip', () => {
    expect(rotationAngle([[2, 0], [0, 2]])).toBeNull();
    expect(rotationAngle(shear)).toBeNull();
    expect(rotationAngle([[-1, 0], [0, 1]])).toBeNull(); // reflection
  });
});

describe('easeInOut', () => {
  it('starts at 0, ends at 1, and is halfway at the middle', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
  });

  it('moves slowly near the start and the end', () => {
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
  });
});

describe('matrixAt', () => {
  it('slides straight from the identity to A for ordinary matrices', () => {
    expect(matrixAt(shear, 0)).toEqual(identity());
    expect(matrixAt(shear, 0.5)).toEqual([[1, 0], [0.5, 1]]);
    expect(matrixAt(shear, 1)).toEqual(shear);
  });

  it('turns the angle for a rotation, so the grid keeps its size', () => {
    expectMatClose(matrixAt(rot90, 0.5), rotation(45));
    // i-hat is still 1 long halfway through (a straight slide would make it about 0.71).
    expect(length(matrixAt(rot90, 0.5)[0])).toBeCloseTo(1);
  });

  it('turns clockwise for a clockwise rotation', () => {
    expectMatClose(matrixAt(rotation(-60), 0.5), rotation(-30));
  });

  it('slides straight for a reflection (it is not a rotation)', () => {
    expect(matrixAt([[-1, 0], [0, 1]], 0.5)).toEqual([[0, 0], [0, 1]]);
  });
});

describe('mapAt', () => {
  it('slides a point from where it starts to where the map sends it', () => {
    expect(mapAt(shiftOrigin, [2, 3], 0)).toEqual([2, 3]);
    expect(mapAt(shiftOrigin, [2, 3], 0.5)).toEqual([2.5, 3.5]);
    expect(mapAt(shiftOrigin, [2, 3], 1)).toEqual([3, 4]);
  });
});

describe('counter-examples: transformations that are not linear', () => {
  it('bendLines keeps the origin but bends the x-axis into a curve', () => {
    expect(bendLines([0, 0])).toEqual([0, 0]);
    expect(onOneLine(bendLines([-2, 0]), bendLines([0, 0]), bendLines([2, 0]))).toBe(false);
  });

  it('shiftOrigin keeps lines straight but moves the origin', () => {
    expect(shiftOrigin([0, 0])).not.toEqual([0, 0]);
    expect(onOneLine(shiftOrigin([1, 1]), shiftOrigin([2, 2]), shiftOrigin([3, 3]))).toBe(true);
  });

  it('bendDiagonal keeps every grid line on itself', () => {
    // A point on the vertical grid line x = 2 stays on it.
    expect(bendDiagonal([2, 0.7])[0]).toBeCloseTo(2);
    // A point on the horizontal grid line y = 1 stays on it (it only slides sideways).
    expect(bendDiagonal([0.25, 1])[1]).toBe(1);
  });

  it('bendDiagonal keeps the origin but bends the diagonal y = x', () => {
    expect(bendDiagonal([0, 0])).toEqual([0, 0]);
    expect(onOneLine(bendDiagonal([0, 0]), bendDiagonal([0.25, 0.25]), bendDiagonal([0.5, 0.5]))).toBe(false);
  });
});

describe('lerp', () => {
  it('goes from a (t = 0) to b (t = 1)', () => {
    expect(lerp(2, 6, 0)).toBe(2);
    expect(lerp(2, 6, 0.25)).toBe(3);
    expect(lerp(2, 6, 1)).toBe(6);
  });
});

describe('gridLines', () => {
  it('makes a vertical and a horizontal line for each whole number', () => {
    // k = -2, -1, 0, 1, 2: five of each
    expect(gridLines(2)).toHaveLength(10);
  });

  it('gives just the two ends when pieces = 1', () => {
    const lines = gridLines(2);
    expect(lines[0]).toEqual([[-2, -2], [-2, 2]]); // x = -2
    expect(lines[1]).toEqual([[-2, -2], [2, -2]]); // y = -2
  });

  it('cuts each line into equal pieces', () => {
    const xAxis = gridLines(2, 4)[5]; // y = 0
    expect(xAxis).toEqual([[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]]);
  });
});

describe('segmentPoints', () => {
  it('cuts the line from a to b into equal pieces', () => {
    expect(segmentPoints([0, 0], [2, 4], 2)).toEqual([[0, 0], [1, 2], [2, 4]]);
  });
});
