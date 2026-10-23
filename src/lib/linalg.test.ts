import { describe, expect, it } from 'vitest';
import {
  add,
  charPoly2,
  charPolyAt,
  diagonalize,
  eig2,
  matPow,
  meanProduct,
  nearEigenLine,
  fitRange,
  powerTrail,
  repeatMultiply,
  shiftByLambda,
  stretchAlongLine,
  unitAt,
  angleOf,
  snapToEigenLine,
  spokes,
  snapNear,
  charPolyWindow,
  eigenTrail,
  powerParts,
  niceGridStep,
  clampToBox,
  gramSchmidt,
  gramSchmidtAt,
  isOrthogonalMatrix,
  leastSquaresLine,
  lineErrors,
  projectionMatrix,
  projectionPicture,
  projectionPicture3,
  projectOntoPlane,
  sumSquaredErrors,
  stripeLines,
  centroid,
  adBcPieces,
  BLOB,
  orientation,
  polygonArea,
  transformShape,
  UNIT_SQUARE,
  angleBetween,
  applyColumns,
  cross3,
  dot3,
  det3,
  distance,
  identity3,
  length3,
  matMul3,
  matrixAt3,
  matVec3,
  rotationAbout,
  rotationAxisAngle,
  rotY90,
  liftColumns,
  rowToLine,
  sequenceAt,
  type Mat3,
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
  type Vec3,
  equationLine,
  augmentedRows,
  equationText,
  formatNumber,
  lerpRows,
  randomSystem,
  inverse2,
  rrefSteps,
  rank,
  transpose,
  columnSpaceBasis,
  nullSpaceBasis,
  rowSpaceBasis,
  leftNullSpaceBasis,
  completeSolution,
  cramer2,
  cramer3,
  normalize3,
  orthonormalPair,
  planeCorners,
  parallelogram,
  cramerPicture,
  normalize,
  snapToLine,
  pointOnSolution,
  solve2,
  projectToLine,
  dualityNumbers,
  cross2,
  add3,
  scale3,
  parallelogram3,
  parallelepipedEdges,
  boxVolume,
  numberLineTicks,
  toOurCoords,
  toHerCoords,
  changeOfBasisMatrix,
  basisGridLines,
  snapToBasis,
  currentStep,
  eigSym2,
  lineAngle,
  quadForm,
  definiteness,
  levelCurves,
  clipToDisc,
  quadSurface,
  surfaceContours,
  surfaceScale,
  surfaceAlong,
  svd2,
  svdSteps,
  svdStepsAt,
  perp,
  unitCircle,
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

/** Check every number of two matrices (or vectors) is within a tiny rounding error. */
function expectClose(actual: number[][] | number[], expected: number[][] | number[]) {
  expect(actual.flat()).toHaveLength(expected.flat().length);
  actual.flat().forEach((n, i) => expect(n).toBeCloseTo(expected.flat()[i] as number, 9));
}

describe('composition (matMul)', () => {
  it('rotate first, then shear', () => {
    expect(matMul(shear, rot90)).toEqual([[1, 1], [-1, 0]]);
  });

  it('shear first, then rotate', () => {
    expect(matMul(rot90, shear)).toEqual([[0, 1], [-1, 1]]);
  });
});

describe('distance', () => {
  it('is the length of the gap between the tips', () => {
    expect(distance([1, 1], [4, 5])).toBe(5);
    expect(distance([2, 3], [2, 3])).toBe(0);
  });
});

describe('sequenceAt', () => {
  it('starts with nothing changed', () => {
    expect(sequenceAt([rot90, shear], 0)).toEqual(identity());
  });

  it('has finished the first matrix half way through', () => {
    expectClose(sequenceAt([rot90, shear], 0.5), rot90);
  });

  it('ends at the product, last one on the left', () => {
    expectClose(sequenceAt([rot90, shear], 1), matMul(shear, rot90));
    expectClose(sequenceAt([shear, rot90], 1), matMul(rot90, shear));
  });
});

describe('3D', () => {
  const m: Mat3 = [[1, 2, 0], [0, 1, 3], [4, 0, 1]];

  it('matVec3: rotY90 sends i-hat to (0, 0, -1)', () => {
    expect(matVec3(rotY90(), [1, 0, 0])).toEqual([0, 0, -1]);
    expect(matVec3(rotY90(), [0, 0, 1])).toEqual([1, 0, 0]);
    expect(matVec3(rotY90(), [0, 1, 0])).toEqual([0, 1, 0]);
  });

  it('matVec3: adds up copies of the columns', () => {
    // 1·(1,2,0) + 2·(0,1,3) + 3·(4,0,1)
    expect(matVec3(m, [1, 2, 3])).toEqual([13, 4, 9]);
  });

  it('matMul3: B first, then A', () => {
    const v: Vec3 = [1, -2, 5];
    expect(matVec3(matMul3(rotY90(), m), v)).toEqual(matVec3(rotY90(), matVec3(m, v)));
    expect(matMul3(identity3(), m)).toEqual(m);
  });

  it('matMul3: four quarter turns get back to the start', () => {
    const r = rotY90();
    expect(matMul3(r, matMul3(r, matMul3(r, r)))).toEqual(identity3());
  });

  it('det3: volume scale', () => {
    expect(det3(identity3())).toBe(1);
    expect(det3(rotY90())).toBe(1);
    expect(det3([[2, 0, 0], [0, 3, 0], [0, 0, 4]])).toBe(24);
    expect(det3(m)).toBe(25); // 1·(1·1 - 0·3) - 0·(...) + 4·(2·3 - 1·0)
    expect(det3([[1, 0, 0], [0, 1, 0], [0, 0, -1]])).toBe(-1); // a mirror flips space
    expect(det3([[1, 2, 3], [2, 4, 6], [0, 0, 1]])).toBe(0); // two columns in a line: flat
  });

  it('cross3 follows the right-hand rule', () => {
    expect(cross3([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  it('rotationAbout the y-axis by 90° is rotY90', () => {
    expectClose(rotationAbout([0, 1, 0], 90), rotY90());
  });

  it('rotationAxisAngle finds the axis and angle', () => {
    const turn = rotationAxisAngle(rotY90())!;
    expect(turn.degrees).toBeCloseTo(90);
    expectClose(turn.axis.map((n) => n / length3(turn.axis)), [0, 1, 0]);

    const half = rotationAxisAngle(rotationAbout([1, 1, 0], 180))!;
    expect(half.degrees).toBeCloseTo(180);
    expectClose(rotationAbout(half.axis, 180), rotationAbout([1, 1, 0], 180));

    expect(rotationAxisAngle([[2, 0, 0], [0, 1, 0], [0, 0, 1]])).toBeNull();
    expect(rotationAxisAngle([[-1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBeNull(); // a mirror, not a turn
  });

  it('matrixAt3 turns a rotation without shrinking it', () => {
    const half = matrixAt3(rotY90(), 0.5);
    expect(length3(half[0])).toBeCloseTo(1);
    expectClose(half, rotationAbout([0, 1, 0], 45));
    expectClose(matrixAt3(rotY90(), 1), rotY90());
  });

  it('matrixAt3 slides any other matrix from I', () => {
    const s: Mat3 = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
    expect(matrixAt3(s, 0)).toEqual(identity3());
    expect(matrixAt3(s, 0.5)).toEqual([[1.5, 0, 0], [0, 1.5, 0], [0, 0, 1.5]]);
  });
});

describe('applyColumns (non-square matrices)', () => {
  it('a 1x2 matrix takes a 2D vector to a number', () => {
    expect(applyColumns([[1], [-2]], [4, 3])).toEqual([-2]);
  });

  it('a 3x2 matrix takes a 2D vector to a 3D one', () => {
    expect(applyColumns([[2, -1, -2], [0, 1, 1]], [1, 1])).toEqual([2, 0, -1]);
  });

  it('agrees with matVec for a square matrix', () => {
    expect(applyColumns(shear, [2, 3])).toEqual(matVec(shear, [2, 3]));
  });

  it('refuses a vector of the wrong size', () => {
    expect(() => applyColumns([[1], [-2]], [1, 2, 3])).toThrow();
  });
});

describe('rowToLine', () => {
  it('lands (4, 3) on -2 on the x-axis for [1, -2]', () => {
    expect(matVec(rowToLine([1, -2]), [4, 3])).toEqual([-2, 0]);
  });
});

describe('liftColumns', () => {
  it('does to (x, y, 0) what the 3x2 matrix does to (x, y)', () => {
    const columns: [Vec3, Vec3] = [[2, -1, -2], [0, 1, 1]];
    expect(matVec3(liftColumns(columns), [1, 1, 0])).toEqual(applyColumns(columns, [1, 1]));
  });
});

/** A repeatable "random" number maker (mulberry32), so a failing test fails the same way every time. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random 2x2 matrix with whole numbers from -5 to 5. */
function randomMatrix(rand: () => number): Mat2 {
  const n = () => Math.floor(rand() * 11) - 5;
  return [[n(), n()], [n(), n()]];
}

describe('det2 of a product', () => {
  it('det(AB) = det(A) det(B) for 3 random pairs', () => {
    const rand = seeded(3);
    for (let i = 0; i < 3; i++) {
      const a = randomMatrix(rand);
      const b = randomMatrix(rand);
      expect(det2(matMul(a, b))).toBe(det2(a) * det2(b));
    }
  });
});

describe('polygonArea', () => {
  it('is 1 for the unit square', () => {
    expect(polygonArea(UNIT_SQUARE)).toBe(1);
  });

  it('is negative when the corners go clockwise', () => {
    expect(polygonArea([...UNIT_SQUARE].reverse())).toBe(-1);
  });

  it('the unit square lands on a shape whose area is det2', () => {
    for (const m of [[[3, 0], [0, 2]], [[1, 0], [1, 1]], [[1, 1], [2, -1]], [[2, 4], [1, 2]]] as Mat2[]) {
      expect(polygonArea(transformShape(m, UNIT_SQUARE))).toBeCloseTo(det2(m), 9);
    }
  });

  it('the blob scales by the same factor as the square', () => {
    const before = polygonArea(BLOB);
    expect(before).toBeGreaterThan(0); // listed anticlockwise
    const m: Mat2 = [[3, 0], [0, 2]];
    expect(polygonArea(transformShape(m, BLOB))).toBeCloseTo(6 * before, 9);
  });
});

describe('orientation', () => {
  it('says kept, flat or flipped', () => {
    expect(orientation(det2([[3, 0], [0, 2]]))).toBe('kept');
    expect(orientation(det2([[2, 1], [4, 2]]))).toBe('flat');
    expect(orientation(det2([[1, 1], [2, -1]]))).toBe('flipped');
  });
});

describe('adBcPieces', () => {
  it('the box minus the pieces leaves ad - bc', () => {
    for (const m of [[[3, 1], [1, 2]], [[2, 1], [1, 3]], [[4, 2], [1, 3]]] as Mat2[]) {
      const { box, triangles, rectangles } = adBcPieces(m);
      const cut = [...triangles, ...rectangles].reduce((sum, p) => sum + p.area, 0);
      expect(box.area - cut).toBeCloseTo(det2(m), 9);
    }
  });

  it('cuts two bc rectangles for columns (3, 1) and (1, 2)', () => {
    const { rectangles } = adBcPieces([[3, 1], [1, 2]]);
    expect(rectangles.map((r) => r.area)).toEqual([1, 1]);
  });
});

describe('centroid', () => {
  it('is the middle of the unit square', () => {
    expect(centroid(UNIT_SQUARE)).toEqual([0.5, 0.5]);
  });
});

describe('stripeLines', () => {
  it('covers the unit square with 45° lines', () => {
    const lines = stripeLines(UNIT_SQUARE, 0.5);
    // y = x + k for k = -1, -0.5, 0, 0.5, 1
    expect(lines).toHaveLength(5);
    for (const [[xa, ya], [xb, yb]] of lines) expect(yb - ya).toBeCloseTo(xb - xa, 9);
  });

  it('works for a flat shape (no area)', () => {
    expect(stripeLines([[0, 0], [2, 2], [0, 0]], 0.5).length).toBeGreaterThan(0);
  });
});

// ---------- Systems of equations ----------

describe('formatNumber', () => {
  it('shows clean fractions instead of long decimals', () => {
    expect(formatNumber(1 / 3)).toBe('1/3');
    expect(formatNumber(-4.5)).toBe('-9/2');
    expect(formatNumber(0.1 + 0.2)).toBe('3/10');
  });

  it('shows whole numbers as whole numbers, and never "-0"', () => {
    expect(formatNumber(4)).toBe('4');
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(4.4999999999)).toBe('9/2');
  });

  it('falls back to 2 decimals when there is no simple fraction', () => {
    expect(formatNumber(Math.PI)).toBe('3.14');
  });

  it('keeps short decimals as decimals when the fraction would be ugly (1.41, not 141/100)', () => {
    expect(formatNumber(1.41)).toBe('1.41');
    expect(formatNumber(0.25)).toBe('1/4');
    expect(formatNumber(-2 / 21)).toBe('-2/21');
  });
});

/** true when x solves every row a1·x1 + a2·x2 (+ a3·x3) = b of an augmented matrix. */
function solvesRows(rows: number[][], x: number[]): boolean {
  return rows.every((row) => isClose(x.reduce((sum, xi, j) => sum + row[j] * xi, 0), row[x.length], 1e-9));
}

describe('rrefSteps', () => {
  it('solves x + 2y = 5, 3x + 4y = 6: x = -4, y = 4.5', () => {
    const { steps, solution } = rrefSteps([[1, 2, 5], [3, 4, 6]]);
    expect(solution![0]).toBeCloseTo(-4, 9);
    expect(solution![1]).toBeCloseTo(4.5, 9);
    expect(steps[0]).toEqual({ description: 'Start', matrix: [[1, 2, 5], [3, 4, 6]], changedRow: null });
    expect(steps[1].description).toBe('R2 → R2 − 3·R1');
    expect(steps[1].changedRow).toBe(1);
    expect(steps[1].matrix).toEqual([[1, 2, 5], [0, -2, -9]]);
  });

  it('solves x + y + z = 6, 2y + 5z = -4, 2x + 5y - z = 27: (5, 3, -2)', () => {
    const { solution } = rrefSteps([[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]);
    [5, 3, -2].forEach((n, i) => expect(solution![i]).toBeCloseTo(n, 9));
  });

  it('never moves the solution: every step is still solved by it (the lines keep crossing at one point)', () => {
    for (const system of [[[1, 2, 5], [3, 4, 6]], [[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]]) {
      const { steps, solution } = rrefSteps(system);
      for (const step of steps) expect(solvesRows(step.matrix, solution!)).toBe(true);
    }
  });

  it('changes one row per step and ends with the identity on the left', () => {
    const { steps } = rrefSteps([[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]);
    for (let i = 1; i < steps.length; i++) {
      const changed = steps[i].matrix.filter((row, r) => row.some((n, c) => n !== steps[i - 1].matrix[r][c]));
      expect(changed).toHaveLength(1);
    }
    const last = steps[steps.length - 1].matrix;
    expect(last.map((row) => row.slice(0, 3))).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });

  it('writes fractions in the step, e.g. R3 → R3 − 3/2·R2', () => {
    const { steps } = rrefSteps([[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]);
    expect(steps.map((s) => s.description)).toContain('R3 → R3 − 3/2·R2');
  });

  it('swaps rows when a pivot is 0', () => {
    const { steps, solution } = rrefSteps([[0, 1, 2], [1, 0, 3]]);
    expect(steps[1].description).toBe('R1 ↔ R2');
    expect(solution).toEqual([3, 2]);
  });

  it('reports "no unique solution" for a dependent system', () => {
    // x + 2y = 3 and 2x + 4y = 6 are the same line.
    const { steps, solution } = rrefSteps([[1, 2, 3], [2, 4, 6]]);
    expect(solution).toBeNull();
    expect(steps[steps.length - 1].description).toMatch(/no unique solution/i);
  });

  it('does not change the matrix it was given', () => {
    const system = [[1, 2, 5], [3, 4, 6]];
    rrefSteps(system);
    expect(system).toEqual([[1, 2, 5], [3, 4, 6]]);
  });
});

/** Check two matrices match, number by number. */
function expectMatrixClose(a: Mat2, b: Mat2) {
  a.forEach((col, i) => col.forEach((n, j) => expect(n).toBeCloseTo(b[i][j], 9)));
}

describe('inverse2', () => {
  it('turns columns (2,1), (-1,1) into (1/3,-1/3), (1/3,2/3)', () => {
    expectMatrixClose(inverse2([[2, 1], [-1, 1]])!, [[1 / 3, -1 / 3], [1 / 3, 2 / 3]]);
  });

  it('undoes a 90° turn with a -90° turn', () => {
    expectMatrixClose(inverse2(rotation(90))!, rotation(-90));
  });

  it('undoes the shear (1,0), (1,1) with (1,0), (-1,1)', () => {
    expectMatrixClose(inverse2([[1, 0], [1, 1]])!, [[1, 0], [-1, 1]]);
  });

  it('gives back the identity when multiplied by the matrix', () => {
    const a: Mat2 = [[2, 1], [-1, 1]];
    expectMatrixClose(matMul(inverse2(a)!, a), identity());
  });

  it('returns null when det = 0 (a squashed plane cannot be unsquashed)', () => {
    expect(inverse2([[1, 0], [0, 0]])).toBeNull();
    expect(inverse2([[1, 2], [2, 4]])).toBeNull();
  });
});

describe('solve2', () => {
  it('finds which x lands on v', () => {
    // 2·(2, 1) + 3·(-1, 1) = (1, 5)
    const x = solve2([[2, 1], [-1, 1]], [1, 5])!;
    expect(x[0]).toBeCloseTo(2, 9);
    expect(x[1]).toBeCloseTo(3, 9);
  });

  it('returns null when det = 0', () => {
    expect(solve2([[1, 2], [2, 4]], [1, 2])).toBeNull();
  });
});

describe('equationLine', () => {
  it('gives two different points on a·x + b·y = c', () => {
    for (const [a, b, c] of [[1, 2, 5], [3, 4, 6], [1, 0, -4], [0, 1, 4.5]]) {
      const [p, q] = equationLine([a, b, c])!;
      expect(distance(p, q)).toBeGreaterThan(0.5);
      for (const [x, y] of [p, q]) expect(a * x + b * y).toBeCloseTo(c, 9);
    }
  });

  it('returns null for 0x + 0y = c (no line at all)', () => {
    expect(equationLine([0, 0, 3])).toBeNull();
  });
});

describe('equationText', () => {
  it('writes a row as an equation', () => {
    expect(equationText([1, 2, 5])).toBe('x + 2y = 5');
    expect(equationText([0, -2, -9])).toBe('−2y = −9');
    expect(equationText([2, 5, -1, 27])).toBe('2x + 5y − z = 27');
    expect(equationText([1, -0.5, 1 / 3])).toBe('x − (1/2)y = 1/3');
  });

  it('writes 0 = 0 for an empty row', () => {
    expect(equationText([0, 0, 0])).toBe('0 = 0');
  });
});

describe('lerpRows', () => {
  it('slides from one matrix to the other', () => {
    expect(lerpRows([[1, 2, 5]], [[0, -2, -9]], 0.5)).toEqual([[0.5, 0, -2]]);
  });

  it('keeps the solution: halfway between two rows is still a line through the crossing point', () => {
    const { steps, solution } = rrefSteps([[1, 2, 5], [3, 4, 6]]);
    const half = lerpRows(steps[0].matrix, steps[1].matrix, 0.3);
    expect(solvesRows(half, solution!)).toBe(true);
  });
});

describe('randomSystem', () => {
  /** A repeatable "random" number maker, so a failing test fails the same way every time. */
  function seeded(seed: number) {
    return () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  }

  it('makes 2x2 and 3x3 systems with one whole-number solution', () => {
    const rand = seeded(7);
    for (let i = 0; i < 50; i++) {
      for (const size of [2, 3] as const) {
        const rows = randomSystem(size, rand);
        expect(rows).toHaveLength(size);
        rows.forEach((row) => expect(row).toHaveLength(size + 1));
        const { solution } = rrefSteps(rows);
        expect(solution).not.toBeNull();
        solution!.forEach((n) => expect(Math.abs(n - Math.round(n))).toBeLessThan(1e-9));
      }
    }
  });
});

describe('augmentedRows', () => {
  it('turns A (stored as columns) and v into the rows of [A | v]', () => {
    // Columns (2, 1) and (-1, 1): the equations 2x − y = 1 and x + y = 5.
    expect(augmentedRows([[2, 1], [-1, 1]], [1, 5])).toEqual([[2, -1, 1], [1, 1, 5]]);
  });
});

describe('rrefSteps on systems without a unique solution', () => {
  it('skips a column with no pivot and keeps going', () => {
    // Columns (1, 2, 3), (2, 4, 6), (0, 1, 1), written as rows: column 2 has no pivot, column 3 does.
    const { pivotColumns, rref } = rrefSteps([[1, 2, 0, 0], [2, 4, 1, 0], [3, 6, 1, 0]]);
    expect(pivotColumns).toEqual([0, 2]);
    expect(rref).toEqual([[1, 2, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]]);
  });

  it('says when a row has become 0 = something', () => {
    const { steps, solution } = rrefSteps([[1, 2, 3], [2, 4, 7]]);
    expect(solution).toBeNull();
    expect(steps[steps.length - 1].description).toMatch(/0 = 1/);
  });

  it('works for more unknowns than equations', () => {
    expect(rrefSteps([[1, 2, 3, 0], [2, 4, 6, 0]]).pivotColumns).toEqual([0]);
  });
});

/** Turn a matrix given as rows into the columns that the subspace functions want. */
const fromRows = (rows: number[][]) => transpose(rows);

/** true when u and w point along the same line (one is a multiple of the other). */
function sameLine(u: number[], w: number[]): boolean {
  return isClose(u[0] * w[1] - u[1] * w[0], 0, 1e-9);
}

describe('transpose', () => {
  it('turns rows into columns', () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
  });
});

describe('rank', () => {
  it('is 2 for the identity, 1 for columns (1, 0), (0, 0), 0 for the zero matrix', () => {
    expect(rank([[1, 0], [0, 1]])).toBe(2);
    expect(rank([[1, 0], [0, 0]])).toBe(1);
    expect(rank([[0, 0], [0, 0]])).toBe(0);
  });

  it('is 2 for the 3x3 matrix with columns (1, 2, 3), (2, 4, 6), (0, 1, 1)', () => {
    expect(rank([[1, 2, 3], [2, 4, 6], [0, 1, 1]])).toBe(2);
  });

  it('is 3 for Day 8’s 3x3 system', () => {
    expect(rank(fromRows([[1, 1, 1], [0, 2, 5], [2, 5, -1]]))).toBe(3);
  });
});

describe('the four subspaces', () => {
  it('rows (1, 2), (2, 4): the null space is the line through (−2, 1)', () => {
    const A = fromRows([[1, 2], [2, 4]]);
    expect(nullSpaceBasis(A)).toEqual([[-2, 1]]);
    expect(columnSpaceBasis(A)).toEqual([[1, 2]]);
    expect(rowSpaceBasis(A)).toEqual([[1, 2]]);
    expect(leftNullSpaceBasis(A)).toEqual([[-2, 1]]);
  });

  it('rows (1, 2, 3), (2, 4, 6): rank 1, null space dimension 2, left null space dimension 1', () => {
    const A = fromRows([[1, 2, 3], [2, 4, 6]]);
    expect(rank(A)).toBe(1);
    expect(nullSpaceBasis(A)).toHaveLength(2);
    expect(leftNullSpaceBasis(A)).toHaveLength(1);
    // Every null space vector really is sent to 0.
    for (const v of nullSpaceBasis(A)) expect(applyColumns(A, v)).toEqual([0, 0]);
  });

  it('the identity squashes nothing: its null space is just 0 (no basis vectors)', () => {
    expect(nullSpaceBasis([[1, 0], [0, 1]])).toEqual([]);
    expect(columnSpaceBasis([[1, 0], [0, 1]])).toEqual([[1, 0], [0, 1]]);
  });

  it('the zero matrix squashes everything: the null space is the whole plane', () => {
    expect(nullSpaceBasis([[0, 0], [0, 0]])).toEqual([[1, 0], [0, 1]]);
    expect(columnSpaceBasis([[0, 0], [0, 0]])).toEqual([]);
  });

  it('rank + null space dimension = number of columns, for many random matrices', () => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 200; i++) {
      const cols = 2 + Math.floor(rand() * 2);
      const rows = 2 + Math.floor(rand() * 2);
      const A = Array.from({ length: cols }, () => Array.from({ length: rows }, () => Math.floor(rand() * 5) - 2));
      expect(rank(A) + nullSpaceBasis(A).length).toBe(cols);
      expect(rank(transpose(A))).toBe(rank(A));
    }
  });

  it('for any rank-1 2x2 matrix: row space ⟂ null space, column space ⟂ left null space', () => {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 6 - 3;
    for (let i = 0; i < 200; i++) {
      const c1: [number, number] = [rand(), rand()];
      const k = rand();
      const A = [c1, [k * c1[0], k * c1[1]]];
      if (Math.hypot(...c1) < 0.1) continue;
      expect(rank(A)).toBe(1);
      const [row] = rowSpaceBasis(A);
      const [nul] = nullSpaceBasis(A);
      const [col] = columnSpaceBasis(A);
      const [left] = leftNullSpaceBasis(A);
      expect(dot(row as Vec2, nul as Vec2)).toBeCloseTo(0, 9);
      expect(dot(col as Vec2, left as Vec2)).toBeCloseTo(0, 9);
      expect(sameLine(col, c1)).toBe(true);
    }
  });
});

describe('completeSolution', () => {
  const A = fromRows([[1, 2], [2, 4]]);

  it('b = (3, 6): x = (3, 0) + t·(−2, 1)', () => {
    expect(completeSolution(A, [3, 6])).toEqual({ particular: [3, 0], directions: [[-2, 1]] });
  });

  it('b = (3, 7): no solution', () => {
    expect(completeSolution(A, [3, 7])).toBeNull();
  });

  it('every point on the solution line really solves A·x = b', () => {
    const { particular, directions } = completeSolution(A, [3, 6])!;
    for (const t of [-2, 0.5, 3]) {
      const x = particular.map((p, i) => p + t * directions[0][i]);
      expect(applyColumns(A, x)).toEqual([3, 6]);
    }
  });

  it('with an invertible matrix there is one solution and no directions', () => {
    expect(completeSolution([[2, 1], [-1, 1]], [1, 5])).toEqual({ particular: [2, 3], directions: [] });
  });
});

describe('cramer2', () => {
  it('columns (−2, 0), (1, −1), output (−4, −2): numerators 6 and 4, det 2, answer (3, 2)', () => {
    expect(cramer2([[-2, 0], [1, -1]], [-4, -2])).toEqual({ solution: [3, 2], det: 2, numerators: [6, 4] });
  });

  it('gives null when det = 0', () => {
    expect(cramer2([[1, 2], [2, 4]], [3, 6])).toBeNull();
  });
});

describe('cramer3', () => {
  it('agrees with rrefSteps on Day 8’s system: (5, 3, −2)', () => {
    const rows = [[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]];
    const A = fromRows(rows.map((row) => row.slice(0, 3))) as Mat3;
    const v = rows.map((row) => row[3]) as Vec3;
    const { solution } = cramer3(A, v)!;
    const fromElimination = rrefSteps(rows).solution!;
    solution.forEach((n, i) => expect(n).toBeCloseTo(fromElimination[i], 9));
    [5, 3, -2].forEach((n, i) => expect(solution[i]).toBeCloseTo(n, 9));
  });
});

describe('drawing planes in 3D', () => {
  it('normalize3 keeps the direction and makes the length 1', () => {
    expect(normalize3([0, 3, 4])).toEqual([0, 0.6, 0.8]);
  });

  it('orthonormalPair gives two unit arrows at right angles in the same plane', () => {
    const u: Vec3 = [1, 2, 3];
    const w: Vec3 = [0, 1, 1];
    const [e1, e2] = orthonormalPair(u, w);
    expect(dot3(e1, e2)).toBeCloseTo(0, 9);
    expect(dot3(e1, e1)).toBeCloseTo(1, 9);
    expect(dot3(e2, e2)).toBeCloseTo(1, 9);
    // Both are at right angles to u × w, so they lie in the plane of u and w.
    const normal = cross3(u, w);
    expect(dot3(e1, normal)).toBeCloseTo(0, 9);
    expect(dot3(e2, normal)).toBeCloseTo(0, 9);
  });

  it('planeCorners on the floor gives the square from (-2, -2) to (2, 2)', () => {
    expect(planeCorners([1, 0, 0], [0, 1, 0], 2)).toEqual([[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]]);
  });
});

describe('Cramer’s rule as areas', () => {
  const A: Mat2 = [[-2, 0], [1, -1]];

  it('parallelogram lists the corners 0, u, u + w, w', () => {
    expect(parallelogram([1, 0], [3, 2])).toEqual([[0, 0], [1, 0], [4, 2], [3, 2]]);
  });

  it('for y: area made by î and x is y = 2; made by column 1 and v it is det(A)·y = 4', () => {
    const p = cramerPicture(A, [3, 2], 1);
    expect(p.inputArea).toBe(2);
    expect(p.outputArea).toBe(4);
    expect(p.outputSides).toEqual([[-2, 0], [-4, -2]]);
  });

  it('for x: area made by x and ĵ is x = 3; made by v and column 2 it is det(A)·x = 6', () => {
    const p = cramerPicture(A, [3, 2], 0);
    expect(p.inputArea).toBe(3);
    expect(p.outputArea).toBe(6);
  });

  it('the output parallelogram is the input one moved by the matrix, and the areas match cramer2', () => {
    for (const x of [[3, 2], [-1, 4], [0.5, -2]] as Vec2[]) {
      const v = matVec(A, x);
      const { numerators, det } = cramer2(A, v)!;
      for (const unknown of [0, 1] as const) {
        const p = cramerPicture(A, x, unknown);
        expect(p.output).toEqual(transformShape(A, p.input));
        expect(p.outputArea).toBeCloseTo(numerators[unknown], 9);
        expect(p.outputArea / det).toBeCloseTo(x[unknown], 9);
      }
    }
  });
});

describe('helpers for dragging b (Lesson 4.6)', () => {
  it('normalize makes a vector 1 long', () => {
    expect(normalize([3, 4])).toEqual([0.6, 0.8]);
  });

  it('snapToLine moves a nearby point onto the line, and leaves a far one alone', () => {
    const near = snapToLine([3, 6.1], [1, 2], 0.25);
    expect(near[0]).toBeCloseTo(3.04, 9);
    expect(near[1]).toBeCloseTo(6.08, 9);
    // After snapping, b really is in the column space: there is a solution.
    expect(completeSolution([[1, 2], [2, 4]], near)).not.toBeNull();
    expect(snapToLine([3, 7], [1, 2], 0.25)).toEqual([3, 7]);
  });

  it('snapToLine with a step lands on tidy points along the line', () => {
    expect(snapToLine([2.1, 4.1], [1, 2], 0.25, 0.5)).toEqual([2, 4]);
    expect(snapToLine([1.6, 3.1], [1, 2], 0.25, 0.5)).toEqual([1.5, 3]);
    expect(snapToLine([3, 7], [1, 2], 0.25, 0.5)).toEqual([3, 7]);
  });

  it('pointOnSolution walks along the solution line, and every point solves A·x = b', () => {
    const A = [[1, 2], [2, 4]];
    const all = completeSolution(A, [3, 6])!;
    expect(pointOnSolution(all, 1)).toEqual([1, 1]);
    for (const t of [-1.5, 0, 2]) expect(applyColumns(A, pointOnSolution(all, t))).toEqual([3, 6]);
  });
});

describe('duality (Lesson 5.1)', () => {
  it('projectToLine reads where v lands on the number line', () => {
    expect(projectToLine([4, 3], [0.6, 0.8])).toBeCloseTo(4.8, 9);
    expect(projectToLine([4, 3], [0.6, 0.8])).toBeCloseTo(dot([0.6, 0.8], [4, 3]), 9);
    expect(projectToLine([-2, 0], [1, 0])).toBeCloseTo(-2, 9); // behind the origin: a negative number
  });

  it('i-hat and j-hat land exactly at u-hat\'s x and y', () => {
    const u = normalize([-1, 2]);
    expect(projectToLine([1, 0], u)).toBeCloseTo(u[0], 9);
    expect(projectToLine([0, 1], u)).toBeCloseTo(u[1], 9);
  });

  it('the landing number always equals the dot product, for 200 random lines and vectors', () => {
    const rand = seeded(51);
    for (let i = 0; i < 200; i++) {
      const angle = rand() * 2 * Math.PI;
      const u: Vec2 = [Math.cos(angle), Math.sin(angle)];
      const v: Vec2 = [rand() * 10 - 5, rand() * 10 - 5];
      const k = rand() * 6 - 3;
      const n = dualityNumbers(v, u, k);
      expect(n.position).toBeCloseTo(dot(u, v), 9);
      expect(n.value).toBeCloseTo(n.dot, 9);
      // The dashed line from v to where it lands is at right angles to the number line.
      expect(dot(sub(v, n.landing), u)).toBeCloseTo(0, 9);
    }
  });

  it('scaling u by 3 triples the number', () => {
    const n = dualityNumbers([4, 3], [0.6, 0.8], 3);
    expect(n.value).toBeCloseTo(14.4, 9);
    expect(n.dot).toBeCloseTo(14.4, 9);
    expect(n.landing[0]).toBeCloseTo(2.88, 9);
    expect(n.landing[1]).toBeCloseTo(3.84, 9);
  });
});

describe('numberLineTicks', () => {
  it('puts a tick at each whole number along the line, with a short mark across it', () => {
    const ticks = numberLineTicks([0.6, 0.8], 2, 0.1);
    expect(ticks.map((t) => t.value)).toEqual([-2, -1, 0, 1, 2]);
    expect(ticks[4].point[0]).toBeCloseTo(1.2, 9);
    expect(ticks[4].point[1]).toBeCloseTo(1.6, 9);
    const [a, b] = ticks[4].ends;
    expect(distance(a, b)).toBeCloseTo(0.2, 9);
    expect(dot(sub(b, a), [0.6, 0.8])).toBeCloseTo(0, 9); // across the line
  });
});

describe('cross products (Lessons 5.2-5.3)', () => {
  it('cross2 is the signed area of the parallelogram', () => {
    expect(cross2([-3, 1], [2, 1])).toBe(-5); // v is left of w: negative
    expect(cross2([2, 1], [-3, 1])).toBe(5);
    expect(cross2([1, 0], [0, 1])).toBe(1);
    expect(cross2([1, 2], [2, 4])).toBe(0); // on one line: no area
  });

  it('cross3 examples', () => {
    expect(cross3([0, 0, 2], [0, 2, 0])).toEqual([-4, 0, 0]);
    expect(cross3([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]); // i-hat × j-hat = k-hat
    expect(cross3([0, 1, 0], [0, 0, 1])).toEqual([1, 0, 0]);
  });

  it('w × v = -(v × w), and v × w is at right angles to both with length = area, for 200 random pairs', () => {
    const rand = seeded(52);
    const r = () => Math.round(rand() * 8 - 4);
    for (let i = 0; i < 200; i++) {
      const v: Vec3 = [r(), r(), r()];
      const w: Vec3 = [r(), r(), r()];
      const c = cross3(v, w);
      expect(cross3(w, v)).toEqual(scale3(-1, c));
      expect(dot3(c, v)).toBe(0);
      expect(dot3(c, w)).toBe(0);
      // Area = |v| |w| sin(angle); sin² = 1 - cos².
      const lv = length3(v);
      const lw = length3(w);
      const area2 = lv * lv * lw * lw - dot3(v, w) ** 2;
      expect(length3(c) ** 2).toBeCloseTo(area2, 6);
    }
  });

  it('add3, scale3 and parallelogram3', () => {
    expect(add3([1, 2, 3], [1, -2, 0])).toEqual([2, 0, 3]);
    expect(scale3(-2, [1, 0, 3])).toEqual([-2, 0, -6]);
    expect(parallelogram3([1, 0, 0], [0, 2, 0])).toEqual([[0, 0, 0], [1, 0, 0], [1, 2, 0], [0, 2, 0]]);
  });

  it('parallelepipedEdges gives the 12 edges of the unit cube', () => {
    const edges = parallelepipedEdges([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    expect(edges).toHaveLength(12);
    for (const [a, b] of edges) expect(length3(sub3(b, a))).toBe(1);
  });

  it('boxVolume: base × height = dot(p, v × w) = det of the three columns', () => {
    expect(boxVolume([0, 0, 3], [2, 0, 0], [0, 1, 0])).toEqual({ base: 2, height: 3, volume: 6 });
    const rand = seeded(53);
    const r = () => Math.round(rand() * 8 - 4);
    for (let i = 0; i < 200; i++) {
      const p: Vec3 = [r(), r(), r()];
      const v: Vec3 = [r(), r(), r()];
      const w: Vec3 = [r(), r(), r()];
      const box = boxVolume(p, v, w);
      expect(box.volume).toBe(det3([p, v, w]));
      expect(box.base * box.height).toBeCloseTo(box.volume, 9);
    }
  });
});

function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

describe('change of basis (Module 7)', () => {
  // Jennifer's basis: b1 = (2, 1), b2 = (-1, 1).
  const P: Mat2 = [[2, 1], [-1, 1]];
  const rot90: Mat2 = [[0, 1], [-1, 0]];

  it('toOurCoords: her (-1, 2) is our (-4, 1)', () => {
    expect(toOurCoords(P, [-1, 2])).toEqual([-4, 1]);
    expect(toOurCoords(P, [1, 0])).toEqual([2, 1]); // her "i-hat" is b1
  });

  it('toHerCoords: our (3, 2) is her (5/3, 1/3)', () => {
    const her = toHerCoords(P, [3, 2])!;
    expect(her[0]).toBeCloseTo(5 / 3, 9);
    expect(her[1]).toBeCloseTo(1 / 3, 9);
    expect(toHerCoords([[1, 2], [2, 4]], [3, 2])).toBeNull(); // b1 and b2 on one line: not a basis
  });

  it('changeOfBasisMatrix: a 90° turn in her numbers', () => {
    const [c1, c2] = changeOfBasisMatrix(P, rot90)!;
    expectClose(c1, [1 / 3, 5 / 3]);
    expectClose(c2, [-2 / 3, -1 / 3]);
    expect(changeOfBasisMatrix([[1, 2], [2, 4]], rot90)).toBeNull();
  });

  it('ours → hers → ours gets back the start, for 200 random bases', () => {
    const rand = seeded(71);
    for (let i = 0; i < 200; i++) {
      const Q = randomMatrix(rand);
      const v: Vec2 = [rand() * 10 - 5, rand() * 10 - 5];
      const her = toHerCoords(Q, v);
      if (det2(Q) === 0) {
        expect(her).toBeNull();
        continue;
      }
      expectClose(toOurCoords(Q, her!), v);
    }
  });

  it('the three steps P, then M, then P⁻¹ end exactly where her matrix does, for 200 random cases', () => {
    const rand = seeded(72);
    for (let i = 0; i < 200; i++) {
      const Q = randomMatrix(rand);
      const M = randomMatrix(rand);
      const her = changeOfBasisMatrix(Q, M);
      if (!her) continue;
      const threeSteps = sequenceAt([Q, M, inverse2(Q)!], 1);
      expectClose(threeSteps[0], her[0]);
      expectClose(threeSteps[1], her[1]);
      // And in words: turn her numbers into ours, do M, turn back — the same as her matrix on her numbers.
      const x: Vec2 = [rand() * 6 - 3, rand() * 6 - 3];
      expectClose(toHerCoords(Q, matVec(M, toOurCoords(Q, x)))!, matVec(her, x));
    }
  });

  it('a stretch of everything by 2 looks the same in every basis', () => {
    expectClose(changeOfBasisMatrix(P, [[2, 0], [0, 2]])!.flat(), [2, 0, 0, 2]);
  });

  it('basisGridLines: her grid lines go through her grid corners', () => {
    const lines = basisGridLines(P, 2);
    expect(lines).toHaveLength(10);
    // The vertical line x = 1 of our grid becomes her line through b1, running along b2.
    const [start, end] = lines[6];
    expect(start).toEqual(toOurCoords(P, [1, -2]));
    expect(end).toEqual(toOurCoords(P, [1, 2]));
  });

  it('snapToBasis moves a point to the nearest corner of her grid', () => {
    expect(snapToBasis(P, [1.1, 2.2])).toEqual([1, 2]); // her (1, 1) is our (1, 2)
    expect(snapToBasis([[1, 2], [2, 4]], [1.1, 2.2])).toEqual([1.1, 2.2]); // not a basis: left alone
  });

  it('currentStep says which step is playing', () => {
    expect(currentStep(3, 0)).toBe(0);
    expect(currentStep(3, 0.5)).toBe(1);
    expect(currentStep(3, 0.9)).toBe(2);
    expect(currentStep(3, 1)).toBe(2);
  });
});

describe('orthogonality (Module 6)', () => {
  const shear: Mat2 = [[1, 0], [1, 1]];
  const rand = seeded(61);
  const randVec3 = (): Vec3 => [rand() * 6 - 3, rand() * 6 - 3, rand() * 6 - 3];
  const randVec2 = (): Vec2 => [rand() * 8 - 4, rand() * 8 - 4];

  it('projectOntoPlane: (1, 2, 3) onto the floor is (1, 2, 0)', () => {
    expectClose(projectOntoPlane([1, 2, 3], [1, 0, 0], [0, 1, 0])!, [1, 2, 0]);
    expect(projectOntoPlane([1, 2, 3], [1, 0, 0], [2, 0, 0])).toBeNull();
  });

  it('projectOntoPlane: the error is at right angles to the plane, for 200 random cases', () => {
    for (let i = 0; i < 200; i++) {
      const [v, u, w] = [randVec3(), randVec3(), randVec3()];
      const p = projectOntoPlane(v, u, w)!;
      const error: Vec3 = [v[0] - p[0], v[1] - p[1], v[2] - p[2]];
      expect(dot3(error, u)).toBeCloseTo(0, 9);
      expect(dot3(error, w)).toBeCloseTo(0, 9);
    }
  });

  it('projectionMatrix: for a = (1, 1) every number is 1/2, and P·P = P', () => {
    const P = projectionMatrix([1, 1])!;
    expectClose(P, [[0.5, 0.5], [0.5, 0.5]]);
    expectClose(matMul(P, P), P);
    expect(projectionMatrix([0, 0])).toBeNull();
  });

  it('projectionMatrix: P·P = P and P·v matches projectOnto, for 200 random lines', () => {
    for (let i = 0; i < 200; i++) {
      const [a, v] = [randVec2(), randVec2()];
      const P = projectionMatrix(a)!;
      expectClose(matMul(P, P), P);
      expectClose(matVec(P, v), projectOnto(v, a)!);
    }
  });

  it('projectionPicture: the error always meets the line at a right angle, and the mark is a square', () => {
    for (let i = 0; i < 300; i++) {
      const [v, a] = [randVec2(), randVec2()];
      const pic = projectionPicture(v, a)!;
      expect(dot(pic.error, a)).toBeCloseTo(0, 9);
      expectClose(add(pic.projection, pic.error), v);
      // No mark only when v is (almost) on the line already.
      if (!pic.mark) {
        expect(length(pic.error)).toBeLessThan(0.01);
        continue;
      }
      const [c, s1, , s2] = pic.mark;
      expect(dot(sub(s1, c), sub(s2, c))).toBeCloseTo(0, 9);
      expect(length(sub(s1, c))).toBeCloseTo(length(sub(s2, c)), 9);
    }
  });

  it('projectionPicture: no mark when v is already on the line, and the mark fits on a short error', () => {
    expect(projectionPicture([2, 2], [1, 1])!.mark).toBeNull();
    expect(projectionPicture([2, 0], [0, 0])).toBeNull();
    const mark = projectionPicture([1, 0.2], [1, 0])!.mark!;
    expect(length(sub(mark[3], mark[0]))).toBeCloseTo(0.1, 9); // half of the 0.2 error
  });

  it('projectionPicture3: the mark is at right angles in 3D, for 200 random cases', () => {
    for (let i = 0; i < 200; i++) {
      const pic = projectionPicture3(randVec3(), randVec3(), randVec3())!;
      if (!pic.mark) {
        expect(length3(pic.error)).toBeLessThan(0.01);
        continue;
      }
      const [c, s1, , s2] = pic.mark;
      const side1: Vec3 = [s1[0] - c[0], s1[1] - c[1], s1[2] - c[2]];
      const side2: Vec3 = [s2[0] - c[0], s2[1] - c[1], s2[2] - c[2]];
      expect(dot3(side1, side2)).toBeCloseTo(0, 9);
    }
  });

  it('leastSquaresLine: (1, 1), (2, 2), (3, 2) give C = 2/3 and D = 1/2', () => {
    const fit = leastSquaresLine([[1, 1], [2, 2], [3, 2]])!;
    expect(fit.C).toBeCloseTo(2 / 3, 9);
    expect(fit.D).toBeCloseTo(1 / 2, 9);
    expectClose(fit.AtA, [[3, 6], [6, 14]]);
    expectClose(fit.Atb, [5, 11]);
    expect(sumSquaredErrors([[1, 1], [2, 2], [3, 2]], fit.C, fit.D)).toBeCloseTo(1 / 6, 9);
  });

  it('leastSquaresLine: null when every point has the same t', () => {
    expect(leastSquaresLine([[2, 1], [2, 3]])).toBeNull();
    expect(leastSquaresLine([[2, 1]])).toBeNull();
  });

  it('no line beats the best line, for 500 random point sets and random lines', () => {
    for (let i = 0; i < 500; i++) {
      const points: Vec2[] = Array.from({ length: 3 + (i % 4) }, randVec2);
      const fit = leastSquaresLine(points);
      if (!fit) continue;
      const best = sumSquaredErrors(points, fit.C, fit.D);
      const C = rand() * 10 - 5;
      const D = rand() * 6 - 3;
      expect(sumSquaredErrors(points, C, D)).toBeGreaterThanOrEqual(best - 1e-9);
      // Nudging the best line a tiny bit also never helps.
      expect(sumSquaredErrors(points, fit.C + 0.01, fit.D - 0.01)).toBeGreaterThanOrEqual(best);
    }
  });

  it('lineErrors: each segment goes straight up or down from the point to the line', () => {
    expect(lineErrors([[1, 1], [3, 2]], 0.5, 0.5)).toEqual([[[1, 1], [1, 1]], [[3, 2], [3, 2]]]);
    expect(lineErrors([[2, 0]], 1, 1)).toEqual([[[2, 0], [2, 3]]]);
  });

  it('clampToBox keeps a dragged point inside the picture', () => {
    expect(clampToBox([7, -2], [0, 5], [0, 4])).toEqual([5, 0]);
    expect(clampToBox([2, 3], [0, 5], [0, 4])).toEqual([2, 3]);
  });

  it('gramSchmidt: (1, 1), (1, 0) give (1/√2, 1/√2) and (1/√2, −1/√2)', () => {
    const [q1, q2] = gramSchmidt([[1, 1], [1, 0]])!;
    expectClose(q1, [Math.SQRT1_2, Math.SQRT1_2]);
    expectClose(q2, [Math.SQRT1_2, -Math.SQRT1_2]);
    expect(gramSchmidt([[1, 2], [2, 4]])).toBeNull();
  });

  it('gramSchmidt: QᵀQ = I for 200 sets of three random independent 3D vectors', () => {
    for (let i = 0; i < 200; i++) {
      const vs = [randVec3(), randVec3(), randVec3()];
      if (Math.abs(det3(vs as Mat3)) < 0.01) continue;
      const Q = gramSchmidt(vs)!;
      const QtQ = Q.map((a) => Q.map((b) => dot3(a as Vec3, b as Vec3)));
      QtQ.flat().forEach((n, k) => expect(Math.abs(n - (k % 4 === 0 ? 1 : 0))).toBeLessThan(1e-9));
    }
  });

  it('gramSchmidtAt: starts at v1, v2; after step 2 they are at right angles; ends 1 long', () => {
    const v1: Vec2 = [2, 1];
    const v2: Vec2 = [1, 2];
    expect(gramSchmidtAt(v1, v2, 0)).toEqual({ a1: v1, a2: v2, step: 0 });
    const middle = gramSchmidtAt(v1, v2, 2 / 3)!;
    expect(dot(middle.a1, middle.a2)).toBeCloseTo(0, 9);
    const end = gramSchmidtAt(v1, v2, 1)!;
    expect(length(end.a1)).toBeCloseTo(1, 9);
    expect(length(end.a2)).toBeCloseTo(1, 9);
    expect(dot(end.a1, end.a2)).toBeCloseTo(0, 9);
    expect(gramSchmidtAt([1, 1], [2, 2], 0.5)).toBeNull();
  });

  it('isOrthogonalMatrix: a rotation by 30° is, a shear is not', () => {
    expect(isOrthogonalMatrix(rotation(30))).toBe(true);
    expect(isOrthogonalMatrix([[1, 0], [0, -1]])).toBe(true); // a flip
    expect(isOrthogonalMatrix(shear)).toBe(false);
    expect(isOrthogonalMatrix([[2, 0], [0, 2]])).toBe(false);
  });

  it('an orthogonal matrix keeps lengths and dot products; a shear does not', () => {
    for (let i = 0; i < 200; i++) {
      const Q = rotation(rand() * 360);
      const [v, w] = [randVec2(), randVec2()];
      expect(length(matVec(Q, v))).toBeCloseTo(length(v), 9);
      expect(dot(matVec(Q, v), matVec(Q, w))).toBeCloseTo(dot(v, w), 9);
    }
    expect(length(matVec(shear, [0, 1]))).not.toBeCloseTo(1, 3);
    expect(dot(matVec(shear, [1, 0]), matVec(shear, [0, 1]))).toBe(1); // the right angle at the origin is lost
  });
});

describe('eigenvectors and eigenvalues (Module 8)', () => {
  const rot90: Mat2 = [[0, 1], [-1, 0]];
  const shear: Mat2 = [[1, 0], [1, 1]];
  const twoI: Mat2 = [[2, 0], [0, 2]];
  const rand = seeded(81);
  const randMat = (): Mat2 => [[rand() * 8 - 4, rand() * 8 - 4], [rand() * 8 - 4, rand() * 8 - 4]];

  /** The pairs from eig2, or fail the test if the kind is not 'lines'. */
  function pairsOf(a: Mat2) {
    const e = eig2(a);
    if (e.kind !== 'lines') throw new Error(`expected lines, got ${e.kind}`);
    return e.pairs;
  }

  it('charPoly2: columns (2, 1), (2, 3) give λ² − 5λ + 4, which is det(A − λI) at every λ', () => {
    expect(charPoly2([[2, 1], [2, 3]])).toEqual({ trace: 5, det: 4 });
    for (const lambda of [-2, 0, 0.5, 1, 3, 4, 7]) {
      expect(charPolyAt([[2, 1], [2, 3]], lambda)).toBeCloseTo(det2(shiftByLambda([[2, 1], [2, 3]], lambda)), 9);
    }
    expect(charPolyAt([[2, 1], [2, 3]], 1)).toBe(0);
    expect(charPolyAt([[2, 1], [2, 3]], 4)).toBe(0);
  });

  it('eig2: columns (3, 0), (1, 2) give λ = 3 along (1, 0) and λ = 2 along (−1, 1)', () => {
    const [p1, p2] = pairsOf([[3, 0], [1, 2]]);
    expect(p1).toEqual({ lambda: 3, direction: [1, 0] });
    expect(p2).toEqual({ lambda: 2, direction: [-1, 1] });
  });

  it('eig2: columns (2, 1), (2, 3) give λ = 4 and 1', () => {
    expect(pairsOf([[2, 1], [2, 3]]).map((p) => p.lambda)).toEqual([4, 1]);
  });

  it('eig2: a 90° turn has no real eigenvalues; its roots are ±i', () => {
    expect(eig2(rot90)).toEqual({ kind: 'none', re: 0, im: 1 });
    expect(eig2(rotation(30)).kind).toBe('none');
  });

  it('eig2: a shear has only λ = 1, with eigenvectors only on the x-axis', () => {
    const pairs = pairsOf(shear);
    expect(pairs).toEqual([{ lambda: 1, direction: [1, 0] }]);
    expect(diagonalize(shear)).toBeNull();
  });

  it('eig2: for 2I every vector is an eigenvector, with λ = 2', () => {
    expect(eig2(twoI)).toEqual({ kind: 'every', lambda: 2 });
  });

  it('eig2: columns (3, 4), (1, 1) give λ = 2 + √5 and 2 − √5', () => {
    const [p1, p2] = pairsOf([[3, 4], [1, 1]]);
    expect(p1.lambda).toBeCloseTo(2 + Math.sqrt(5), 12);
    expect(p2.lambda).toBeCloseTo(2 - Math.sqrt(5), 12);
  });

  it('eig2: A · direction = λ · direction, for 300 random matrices with real eigenvalues', () => {
    let checked = 0;
    for (let i = 0; i < 300; i++) {
      const a = randMat();
      const e = eig2(a);
      if (e.kind !== 'lines') continue;
      for (const { lambda, direction } of e.pairs) {
        expectClose(matVec(a, direction), scale(lambda, direction));
        expect(charPolyAt(a, lambda)).toBeCloseTo(0, 6);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('meanProduct: (8, 2), (4, 6) gives m = 7, p = 40, λ = 10 and 4', () => {
    expect(meanProduct([[8, 2], [4, 6]])).toEqual({ m: 7, p: 40, gap: 9, root: 3, lambdas: [10, 4] });
  });

  it('meanProduct: (2, 1), (7, 8) gives λ = 9 and 1; a rotation gives none', () => {
    expect(meanProduct([[2, 1], [7, 8]]).lambdas).toEqual([9, 1]);
    expect(meanProduct(rot90).lambdas).toBeNull();
  });

  it('stretchAlongLine: on an eigen-line it gives λ, off one it gives null', () => {
    const a: Mat2 = [[3, 0], [1, 2]];
    expect(stretchAlongLine(a, [1, 0])).toBe(3);
    expect(stretchAlongLine(a, [-2, 2])).toBe(2);
    expect(stretchAlongLine(a, [0, 1])).toBeNull();
    expect(stretchAlongLine([[1, 1], [1, 1]], [1, -1])).toBe(0); // squashed to 0 counts, λ = 0
    expect(stretchAlongLine(rot90, [1, 2])).toBeNull();
  });

  it('nearEigenLine lights only the right lines, all the way round the circle, for all five matrices', () => {
    const lit = (a: Mat2) => {
      const e = eig2(a);
      const found = new Set<number>();
      let litAngles = 0;
      for (let deg = 0; deg < 360; deg += 0.5) {
        const i = nearEigenLine(e, unitAt(deg));
        if (i === null) continue;
        litAngles++;
        found.add(i);
        // Whenever a line lights up, A really does keep the probe (nearly) on its line.
        expect(stretchAlongLine(a, unitAt(deg), 5)).not.toBeNull();
      }
      return { found: found.size, litAngles };
    };
    expect(lit([[3, 0], [1, 2]]).found).toBe(2);
    expect(lit([[2, 1], [2, 3]]).found).toBe(2);
    expect(lit(rot90)).toEqual({ found: 0, litAngles: 0 });
    expect(lit(shear).found).toBe(1);
    expect(lit(twoI).litAngles).toBe(720); // every direction
  });

  it('diagonalize: A = P D P⁻¹ for columns (3, 0), (1, 2)', () => {
    const a: Mat2 = [[3, 0], [1, 2]];
    const { P, D } = diagonalize(a)!;
    expect(D).toEqual([[3, 0], [0, 2]]);
    expectClose(matMul(P, matMul(D, inverse2(P)!)), a);
  });

  it('matPow: P D¹⁰ P⁻¹ equals multiplying by A ten times', () => {
    const a: Mat2 = [[3, 0], [1, 2]];
    expectClose(matPow(a, 10), repeatMultiply(a, 10));
    expect(repeatMultiply(a, 0)).toEqual(identity());
    expectClose(matPow(shear, 5), [[1, 0], [5, 1]]); // no eigenbasis: falls back to multiplying
  });

  it('Fibonacci: the 10th power of columns (1, 1), (1, 0) holds F(10) = 55', () => {
    const fib = matPow([[1, 1], [1, 0]], 10);
    expect(fib[1][0]).toBeCloseTo(55, 9);
    expectClose(matVec(fib, [1, 0]), [89, 55]); // (F(11), F(10))
  });

  it('Markov: columns (0.9, 0.1), (0.2, 0.8) settle to (2/3, 1/3)', () => {
    const a: Mat2 = [[0.9, 0.1], [0.2, 0.8]];
    const end = matVec(matPow(a, 100), [1, 0]);
    expect(end[0]).toBeCloseTo(2 / 3, 9);
    expect(end[1]).toBeCloseTo(1 / 3, 9);
    expect(pairsOf(a).map((p) => p.lambda).map((n) => roundTo(n, 9))).toEqual([1, 0.7]);
  });

  it('powerTrail and fitRange', () => {
    expect(powerTrail([[2, 0], [0, 3]], [1, 1], 2)).toEqual([[1, 1], [2, 3], [4, 9]]);
    expect(fitRange([[1, 1], [4, 9]])).toBe(12);
    expect(fitRange([[0.5, 0.2]])).toBe(3);
  });
});

describe('EigenProbe helpers (Module 8)', () => {
  it('angleOf goes round from 0 to 360', () => {
    expect(angleOf([1, 0])).toBe(0);
    expect(angleOf([0, 1])).toBeCloseTo(90, 9);
    expect(angleOf([-1, -1])).toBeCloseTo(225, 9);
    expect(angleOf(unitAt(300))).toBeCloseTo(300, 9);
  });

  it('snapToEigenLine pulls a nearby probe exactly onto the line, on its own side', () => {
    const e = eig2([[3, 0], [1, 2]]);
    expectClose(snapToEigenLine(e, unitAt(2))!, [1, 0]);
    expectClose(snapToEigenLine(e, unitAt(181))!, [-1, 0]);
    expectClose(snapToEigenLine(e, unitAt(136))!, [-Math.SQRT1_2, Math.SQRT1_2]);
    expect(snapToEigenLine(e, unitAt(60))).toBeNull();
    expect(snapToEigenLine(eig2([[0, 1], [-1, 0]]), [1, 0])).toBeNull();
  });

  it('spokes: evenly spaced arrows plus two along each extra direction', () => {
    const s = spokes(4, 2, [[1, 1]]);
    expect(s).toHaveLength(6);
    expectClose(s[1][1], [0, 2]);
    expectClose(s[4][1], [Math.SQRT2, Math.SQRT2]);
  });
});

describe('LambdaKnob helpers (Module 8)', () => {
  it('snapNear clicks onto a root only when close', () => {
    expect(snapNear(1.04, [1, 4], 0.08)).toBe(1);
    expect(snapNear(3.95, [1, 4], 0.08)).toBe(4);
    expect(snapNear(2.5, [1, 4], 0.08)).toBe(2.5);
  });

  it('charPolyWindow: λ² − 5λ + 4 from −1 to 6 goes from −2.25 (at λ = 2.5) up to 10', () => {
    const [lo, hi] = charPolyWindow([[2, 1], [2, 3]], [-1, 6]);
    expect(lo).toBeCloseTo(-2.25, 9);
    expect(hi).toBeCloseTo(10, 9);
  });
});

describe('PowerView helpers (Module 8)', () => {
  it('eigenTrail: in the eigenbasis each step only scales each number by its λ', () => {
    const a: Mat2 = [[3, 0], [1, 2]];
    // (0, 1) = 1·(1, 0) + 1·(−1, 1), so its eigen-numbers are (1, 1), then (3, 2), (9, 4).
    expect(eigenTrail(a, [0, 1], 2)).toEqual([[1, 1], [3, 2], [9, 4]]);
    // Going back to our numbers gives the same trail as applying A again and again.
    const P = diagonalize(a)!.P;
    eigenTrail(a, [2, -1], 5)!.forEach((c, k) => expectClose(matVec(P, c), powerTrail(a, [2, -1], 5)[k]));
    expect(eigenTrail([[1, 0], [1, 1]], [1, 1], 3)).toBeNull();
  });

  it('powerParts: P Dⁿ P⁻¹ with Dⁿ holding λⁿ', () => {
    const { Dn } = powerParts([[3, 0], [1, 2]], 3)!;
    expect(Dn).toEqual([[27, 0], [0, 8]]);
  });

  it('niceGridStep keeps about 5 lines a side', () => {
    expect(niceGridStep(4)).toBe(1);
    expect(niceGridStep(10)).toBe(2);
    expect(niceGridStep(98)).toBe(20);
    expect(niceGridStep(300)).toBe(50);
  });
});

describe('symmetric matrices and quadratic forms (Module 8)', () => {
  const A: Mat2 = [[2, 1], [1, 2]];

  it('eigSym2: λ = 3 along (1, 1) and λ = 1 along (1, −1), at right angles', () => {
    const { values, vectors } = eigSym2(A);
    expectClose(values, [3, 1]);
    // On the same line: the parallelogram they make has no area.
    expect(cross2(vectors[0], [1, 1])).toBeCloseTo(0, 12);
    expect(cross2(vectors[1], [1, -1])).toBeCloseTo(0, 12);
    expect(dot(vectors[0], vectors[1])).toBeCloseTo(0, 12);
    vectors.forEach((q, i) => expectClose(matVec(A, q), scale(values[i], q)));
  });

  it('eigSym2 works for many symmetric matrices: A·q = λq, 1 long, perpendicular, biggest first', () => {
    for (const [p, b, d] of [[1, 0, 3], [0, 2, 0], [5, -2, 1], [-1, 0.5, -4], [3, 0, 3]]) {
      const S: Mat2 = [[p, b], [b, d]];
      const { values, vectors } = eigSym2(S);
      expect(values[0]).toBeGreaterThanOrEqual(values[1]);
      vectors.forEach((q, i) => {
        expect(length(q)).toBeCloseTo(1, 12);
        expectClose(matVec(S, q), scale(values[i], q));
      });
      expect(dot(vectors[0], vectors[1])).toBeCloseTo(0, 12);
    }
  });

  it('quadForm: xᵀAx', () => {
    expect(quadForm(A, [1, 0])).toBe(2);
    expect(quadForm(A, [1, 1])).toBe(6);
    expect(quadForm(A, [1, -1])).toBe(2);
  });

  it('definiteness from the signs of the eigenvalues', () => {
    expect(definiteness(A)).toBe('positive definite');
    expect(definiteness([[1, 2], [2, 1]])).toBe('indefinite'); // eigenvalues 3 and −1
    expect(definiteness([[-2, 0], [0, -1]])).toBe('negative definite');
    expect(definiteness([[1, 1], [1, 1]])).toBe('positive semidefinite'); // eigenvalues 2 and 0
    expect(definiteness([[-1, 0], [0, 0]])).toBe('negative semidefinite');
    expect(definiteness([[0, 0], [0, 0]])).toBe('zero');
  });

  it('levelCurves: every point really has xᵀAx = c', () => {
    const cases: [Mat2, number, number][] = [
      [A, 1, 1], // an ellipse
      [A, 4, 1],
      [[[1, 2], [2, 1]], 2, 2], // a hyperbola, both ways
      [[[1, 2], [2, 1]], -2, 2],
      [[[1, 2], [2, 1]], 0, 2], // the asymptotes
      [[[1, 1], [1, 1]], 2, 2], // two parallel lines
    ];
    for (const [S, c, count] of cases) {
      const curves = levelCurves(S, c, 4);
      expect(curves).toHaveLength(count);
      curves.flat().forEach((x) => expect(quadForm(S, x)).toBeCloseTo(c, 9));
    }
  });

  it('levelCurves: the ellipse’s half-axes lie along the eigenvectors, 1/√λ long for c = 1', () => {
    const [ellipse] = levelCurves(A, 1, 4);
    const far = Math.max(...ellipse.map(length));
    const near = Math.min(...ellipse.map(length));
    expect(far).toBeCloseTo(1, 3); // 1/√1, along (1, −1)
    expect(near).toBeCloseTo(1 / Math.sqrt(3), 3); // 1/√3, along (1, 1)
    const farthest = ellipse.reduce((m, p) => (length(p) > length(m) ? p : m));
    expect(lineAngle(farthest, [1, -1])).toBeLessThan(2);
  });

  it('levelCurves: empty when nothing has that value; the hyperbola reaches far enough', () => {
    expect(levelCurves(A, -1, 4)).toEqual([]);
    const branches = levelCurves([[1, 2], [2, 1]], 1, 4);
    branches.forEach((b) => expect(Math.max(...b.map(length))).toBeGreaterThanOrEqual(4));
  });

  it('clipToDisc keeps only the parts inside, split into pieces', () => {
    const pieces = clipToDisc([[-3, 0], [-1, 0], [0, 0], [1, 0], [3, 0], [0.5, 0.5], [0.2, 0.2]], 2);
    expect(pieces).toEqual([[[-1, 0], [0, 0], [1, 0]], [[0.5, 0.5], [0.2, 0.2]]]);
  });

  it('quadSurface: a bowl stays above 0, a saddle goes both ways, and nothing is taller than height', () => {
    const bowl = quadSurface(A, 2, 1.5).flat();
    expect(Math.min(...bowl.map((p) => p[2]))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...bowl.map((p) => Math.abs(p[2])))).toBeLessThanOrEqual(1.5 + 1e-9);
    const saddle = quadSurface([[1, 2], [2, 1]], 2, 1.5).flat();
    expect(Math.min(...saddle.map((p) => p[2]))).toBeLessThan(0);
    expect(Math.max(...saddle.map((p) => p[2]))).toBeGreaterThan(0);
    const k = surfaceScale(A, 2, 1.5);
    bowl.forEach(([x, y, z]) => expect(z).toBeCloseTo(k * quadForm(A, [x, y]), 9));
  });

  it('surfaceAlong an eigenvector is the parabola z = λt² (squashed by surfaceScale)', () => {
    const k = surfaceScale([[1, 2], [2, 1]], 2, 1.5);
    const down = eigSym2([[1, 2], [2, 1]]).vectors[1]; // λ = −1
    surfaceAlong([[1, 2], [2, 1]], down, 2, 1.5).forEach(([x, y, z]) => expect(z).toBeCloseTo(k * -1 * (x * x + y * y), 9));
  });

  it('surfaceContours sit on the surface, inside its disc', () => {
    const k = surfaceScale(A, 2, 1.5);
    surfaceContours(A, [1, 2, 4], 2, 1.5).flat().forEach(([x, y, z]) => {
      expect(length([x, y])).toBeLessThanOrEqual(2);
      expect(z).toBeCloseTo(k * quadForm(A, [x, y]), 9);
    });
  });
});

describe('SVD (Module 8)', () => {
  /** U·Σ·Vᵀ multiplied back together. */
  function rebuild({ U, sigma, V }: ReturnType<typeof svd2>): Mat2 {
    return matMul(U, matMul([[sigma[0], 0], [0, sigma[1]]], transpose(V) as Mat2));
  }

  function expectWithin(actual: Mat2, expected: Mat2, tolerance = 1e-9) {
    actual.flat().forEach((n, i) => expect(Math.abs(n - expected.flat()[i])).toBeLessThan(tolerance));
  }

  /** U and V have columns 1 long and at right angles. */
  function expectOrthonormal(m: Mat2) {
    expect(length(m[0])).toBeCloseTo(1, 12);
    expect(length(m[1])).toBeCloseTo(1, 12);
    expect(dot(m[0], m[1])).toBeCloseTo(0, 12);
  }

  const examples: Mat2[] = [
    [[3, 4], [0, 5]],
    rotation(30),
    rotation(-135),
    [[1, 2], [2, 4]], // rank 1
    [[2, 0], [0, -1]], // a flip
    [[1, 0], [1, 1]], // a shear
    [[0, 1], [1, 0]], // swap x and y (det −1)
    [[-2, 1], [3, 0.5]],
    [[0, 0], [0, 0]],
    [[2, 0], [0, 2]],
  ];

  it('columns (3, 4), (0, 5): σ = 3√5 and √5, and σ₁σ₂ = |det| = 15', () => {
    const { sigma } = svd2([[3, 4], [0, 5]]);
    expect(Math.abs(sigma[0] - 3 * Math.sqrt(5))).toBeLessThan(1e-9);
    expect(Math.abs(sigma[1] - Math.sqrt(5))).toBeLessThan(1e-9);
    expect(sigma[0] * sigma[1]).toBeCloseTo(15, 9);
  });

  it('any rotation has σ = 1 and 1', () => {
    for (const deg of [0, 17, 90, 150, -60, 180]) {
      const { sigma } = svd2(rotation(deg));
      expect(Math.abs(sigma[0] - 1)).toBeLessThan(1e-9);
      expect(Math.abs(sigma[1] - 1)).toBeLessThan(1e-9);
    }
  });

  it('a rank-1 matrix has σ₂ = 0', () => {
    const { sigma } = svd2([[1, 2], [2, 4]]);
    expect(sigma[1]).toBe(0);
    expect(sigma[0]).toBeCloseTo(5, 9); // the column (1, 2) times (1, 2)ᵀ…: √(5·5)
  });

  it('A = U·Σ·Vᵀ within 1e-9, σ₁ ≥ σ₂ ≥ 0, U and V orthonormal, V a rotation', () => {
    for (const a of examples) {
      const s = svd2(a);
      expectWithin(rebuild(s), a);
      expect(s.sigma[0]).toBeGreaterThanOrEqual(s.sigma[1]);
      expect(s.sigma[1]).toBeGreaterThanOrEqual(0);
      expectOrthonormal(s.U);
      expectOrthonormal(s.V);
      expect(det2(s.V)).toBeCloseTo(1, 12);
    }
  });

  it('A sends vᵢ to σᵢ·uᵢ: the circle’s perpendicular arrows land on the ellipse’s half-axes', () => {
    for (const a of examples) {
      const { U, sigma, V } = svd2(a);
      [0, 1].forEach((i) => expect(distance(matVec(a, V[i]), scale(sigma[i], U[i]))).toBeLessThan(1e-9));
    }
  });

  it('svdSteps: two real rotations around a stretch, multiplying back to A', () => {
    for (const a of examples) {
      const { Vt, S, R } = svdSteps(a);
      expectWithin(matMul(R, matMul(S, Vt)), a);
      expect(det2(Vt)).toBeCloseTo(1, 12);
      expect(det2(R)).toBeCloseTo(1, 12);
      expect(S[0][1]).toBe(0);
      expect(S[1][0]).toBe(0);
    }
  });

  it('"Three steps" ends exactly where "Direct" ends, and passes through Vᵀ and S·Vᵀ on the way', () => {
    for (const a of examples) {
      expect(svdStepsAt(a, 1)).toEqual(matrixAt(a, 1));
      const { Vt, S } = svdSteps(a);
      expectWithin(svdStepsAt(a, 1 / 3), Vt);
      expectWithin(svdStepsAt(a, 2 / 3), matMul(S, Vt));
      // Just before the end it is already within a hair of A, so the last frame doesn't jump.
      expectWithin(svdStepsAt(a, 1 - 1e-12), a, 1e-6);
    }
  });

  it('the rotation steps turn the circle without squashing it', () => {
    const a: Mat2 = [[3, 4], [0, 5]];
    for (const t of [0.1, 0.2, 0.3]) unitCircle(24).forEach((p) => expect(length(matVec(svdStepsAt(a, t), p))).toBeCloseTo(1, 9));
  });

  it('perp turns a quarter turn anticlockwise', () => {
    expect(perp([1, 0])).toEqual([0, 1]);
    expect(perp([2, 3])).toEqual([-3, 2]);
  });
});
