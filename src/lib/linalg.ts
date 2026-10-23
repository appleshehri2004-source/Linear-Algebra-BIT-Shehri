// All the math for the site lives here. Components call these functions
// and never compute math themselves.

/** A 2D vector [x, y]. */
export type Vec2 = [number, number];

/** A 2x2 matrix stored as its columns: [ihat, jhat]. */
export type Mat2 = [Vec2, Vec2];

/** Add two vectors: walk along u, then along v. */
export function add(u: Vec2, v: Vec2): Vec2 {
  return [u[0] + v[0], u[1] + v[1]];
}

/** Stretch (or flip, if k is negative) a vector by the number k. */
export function scale(k: number, v: Vec2): Vec2 {
  return [k * v[0], k * v[1]];
}

/**
 * Multiply a matrix by a vector.
 * The result is v[0] copies of i-hat plus v[1] copies of j-hat.
 */
export function matVec(m: Mat2, v: Vec2): Vec2 {
  const [ihat, jhat] = m;
  return [
    v[0] * ihat[0] + v[1] * jhat[0],
    v[0] * ihat[1] + v[1] * jhat[1],
  ];
}

/**
 * The determinant of a 2x2 matrix: how much the matrix scales area.
 * Negative means space gets flipped over.
 * With columns (a, c) and (b, d), it is ad - bc.
 */
export function det2(m: Mat2): number {
  const [[a, c], [b, d]] = m;
  return a * d - b * c + 0; // + 0 turns -0 into 0
}

/** Subtract: the vector that goes from the tip of v to the tip of u. */
export function sub(u: Vec2, v: Vec2): Vec2 {
  return [u[0] - v[0], u[1] - v[1]];
}

/**
 * Round a number to a few decimal places, e.g. roundTo(1.26, 1) = 1.3.
 * Also turns -0 into 0, so a readout never shows "-0".
 */
export function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f + 0;
}

/**
 * Move a vector to the nearest grid point, e.g. step 1 snaps to whole numbers.
 * Used while dragging, so arrows land on tidy values.
 */
export function snapVec(v: Vec2, step = 1): Vec2 {
  // Rounding to 10 places cleans up tiny errors like 0.30000000000000004.
  const snap = (n: number) => roundTo(Math.round(n / step) * step, 10);
  return [snap(v[0]), snap(v[1])];
}

/** Keep a vector inside the square from -limit to limit, so it can't be dragged off the plane. */
export function clampVec(v: Vec2, limit: number): Vec2 {
  const clamp = (n: number) => Math.min(limit, Math.max(-limit, n));
  return [clamp(v[0]), clamp(v[1])];
}

/**
 * The dot product: multiply matching parts, then add.
 * Positive when v and w point roughly the same way, 0 when they are at right angles,
 * negative when they point roughly opposite ways.
 */
export function dot(v: Vec2, w: Vec2): number {
  return v[0] * w[0] + v[1] * w[1];
}

/** How long the arrow is (Pythagoras): the square root of x² + y². */
export function length(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

/**
 * The angle between two arrows, in degrees (0 to 180).
 * Uses dot(v, w) = |v| |w| cos(angle). A zero-length arrow has no direction, so that gives null.
 */
export function angleBetween(v: Vec2, w: Vec2): number | null {
  const lengths = length(v) * length(w);
  if (lengths === 0) return null;
  // Clamp to -1..1: rounding errors can give 1.0000000002, which would make acos fail.
  const cos = Math.min(1, Math.max(-1, dot(v, w) / lengths));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * The projection of w onto the line through v: the "shadow" w casts on that line.
 * It is (w·v / v·v) copies of v. Projecting onto the zero vector makes no sense, so that gives null.
 */
export function projectOnto(w: Vec2, v: Vec2): Vec2 | null {
  const vv = dot(v, v);
  if (vv === 0) return null;
  const [x, y] = scale(dot(w, v) / vv, v);
  return [x + 0, y + 0]; // + 0 turns -0 into 0
}

/**
 * true when v and w point in different directions (neither is a stretched copy of the other).
 * They are dependent exactly when the matrix with columns v and w squashes area to 0.
 */
export function isIndependent(v: Vec2, w: Vec2): boolean {
  return Math.abs(det2([v, w])) > 1e-9;
}

/**
 * Find a and b with a·v + b·w = target, or null if v and w are dependent
 * (then most targets can't be reached, and the ones that can be have many answers).
 * Uses Cramer's rule: swap the target into each column and divide by det2.
 */
export function solveCombination(v: Vec2, w: Vec2, target: Vec2): { a: number; b: number } | null {
  if (!isIndependent(v, w)) return null;
  const d = det2([v, w]);
  return {
    a: det2([target, w]) / d + 0,
    b: det2([v, target]) / d + 0,
  };
}

/** true when two numbers are within `tolerance` of each other. Used to check typed answers. */
export function isClose(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance + 1e-12;
}

// ---------- Transformations ----------

/** A transformation that may not be linear: any rule that moves each point somewhere. */
export type PointMap = (p: Vec2) => Vec2;

/** The matrix that changes nothing: i-hat stays (1, 0) and j-hat stays (0, 1). */
export function identity(): Mat2 {
  return [[1, 0], [0, 1]];
}

/**
 * Multiply two matrices. matMul(A, B) means "apply B first, then A".
 * Each column of the answer is where A sends that column of B.
 */
export function matMul(a: Mat2, b: Mat2): Mat2 {
  const [x1, y1] = matVec(a, b[0]);
  const [x2, y2] = matVec(a, b[1]);
  return [[x1 + 0, y1 + 0], [x2 + 0, y2 + 0]]; // + 0 turns -0 into 0
}

/** Slide from u (t = 0) to v (t = 1) in a straight line. t = 0.5 is halfway. */
export function lerpVec(u: Vec2, v: Vec2, t: number): Vec2 {
  return [(1 - t) * u[0] + t * v[0] + 0, (1 - t) * u[1] + t * v[1] + 0];
}

/** Slide each column of A towards the matching column of B: t = 0 gives A, t = 1 gives B. */
export function lerpMatrix(a: Mat2, b: Mat2, t: number): Mat2 {
  return [lerpVec(a[0], b[0], t), lerpVec(a[1], b[1], t)];
}

/** The matrix that turns the plane anticlockwise by this many degrees (negative: clockwise). */
export function rotation(degrees: number): Mat2 {
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [[c, s], [-s, c]];
}

/**
 * If m only turns the plane (no stretching, no flipping), its angle in degrees, from -180 to 180.
 * Otherwise null. A rotation keeps i-hat and j-hat 1 long, at right angles, and not flipped.
 */
export function rotationAngle(m: Mat2): number | null {
  const [ihat, jhat] = m;
  const isRotation =
    isClose(length(ihat), 1, 1e-9) &&
    isClose(length(jhat), 1, 1e-9) &&
    isClose(dot(ihat, jhat), 0, 1e-9) &&
    det2(m) > 0;
  return isRotation ? (Math.atan2(ihat[1], ihat[0]) * 180) / Math.PI : null;
}

/**
 * Smooth start and stop for animations: slow at the ends, fastest in the middle.
 * Turns a time from 0 to 1 into a progress from 0 to 1.
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * The matrix an animation shows at time t, on its way from "nothing changed" (t = 0) to m (t = 1).
 * Usually (1 - t)·I + t·m, which keeps grid lines straight and parallel at every frame.
 * For a rotation it turns the angle instead, so the grid doesn't shrink half way.
 */
export function matrixAt(m: Mat2, t: number): Mat2 {
  const angle = rotationAngle(m);
  return angle === null ? lerpMatrix(identity(), m, t) : rotation(angle * t);
}

/** Where point p is at time t when a (maybe non-linear) map f is animated: slide from p to f(p). */
export function mapAt(f: PointMap, p: Vec2, t: number): Vec2 {
  return lerpVec(p, f(p), t);
}

// Three transformations that are NOT linear, used as counter-examples in lesson 2.1.

/** Keeps the origin, but straight lines come out curved. */
export function bendLines([x, y]: Vec2): Vec2 {
  return [x, y + 0.15 * x * x];
}

/** Keeps lines straight and parallel, but slides the origin to (1, 1). */
export function shiftOrigin([x, y]: Vec2): Vec2 {
  return [x + 1, y + 1];
}

/**
 * Slides points left and right along each horizontal line, in a wave. Whole-number x values stay put,
 * so every grid line lands exactly on itself and the grid looks unchanged. But a diagonal line comes out wavy.
 */
export function bendDiagonal([x, y]: Vec2): Vec2 {
  return [x + 0.3 * Math.sin(2 * Math.PI * x), y];
}

/** The number part of the way from a to b: t = 0 gives a, t = 1 gives b. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * The grid lines x = k and y = k for every whole k from -extent to extent, before any transformation.
 * Each line is a list of points along it, from -extent to extent.
 * pieces = 1 gives just the two ends (enough for a matrix, which keeps lines straight);
 * more pieces let a non-linear map bend the line into a curve.
 */
export function gridLines(extent: number, pieces = 1): Vec2[][] {
  const lines: Vec2[][] = [];
  for (let k = -extent; k <= extent; k++) {
    lines.push(
      segmentPoints([k, -extent], [k, extent], pieces), // vertical: x = k
      segmentPoints([-extent, k], [extent, k], pieces), // horizontal: y = k
    );
  }
  return lines;
}

/** Points along the straight line from a to b, cut into equal pieces (pieces + 1 points, ends included). */
export function segmentPoints(a: Vec2, b: Vec2, pieces: number): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i <= pieces; i++) points.push(lerpVec(a, b, i / pieces));
  return points;
}

/** How far apart the tips of u and v are: the length of the arrow from one to the other. */
export function distance(u: Vec2, v: Vec2): number {
  return length(sub(u, v));
}

/**
 * The matrix at time t when several matrices play one after another, each taking an equal share of t.
 * At t = 1 it is the product of all of them, last one on the left: sequenceAt([A, B], 1) = matMul(B, A).
 * Halfway through [A, B] (t = 0.5) A has just finished and B hasn't started.
 */
export function sequenceAt(steps: Mat2[], t: number): Mat2 {
  let done = identity();
  for (let k = 0; k < steps.length; k++) {
    // How far through its own share this step is: 0 before it starts, 1 once it has finished.
    const local = Math.min(1, Math.max(0, t * steps.length - k));
    done = matMul(matrixAt(steps[k], local), done);
  }
  return done;
}

// ---------- 3D ----------

/** A 3D vector [x, y, z]. */
export type Vec3 = [number, number, number];

/** A 3x3 matrix stored as its columns: [ihat, jhat, khat]. */
export type Mat3 = [Vec3, Vec3, Vec3];

/** The 3x3 matrix that changes nothing. */
export function identity3(): Mat3 {
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

/** Turn space 90° about the y-axis: i-hat goes to (0, 0, -1) and k-hat comes round to (1, 0, 0). */
export function rotY90(): Mat3 {
  return [[0, 0, -1], [0, 1, 0], [1, 0, 0]];
}

/** Multiply a 3x3 matrix by a vector: v[0] copies of i-hat, plus v[1] of j-hat, plus v[2] of k-hat. */
export function matVec3(m: Mat3, v: Vec3): Vec3 {
  const [ihat, jhat, khat] = m;
  const part = (r: number) => v[0] * ihat[r] + v[1] * jhat[r] + v[2] * khat[r] + 0; // + 0 turns -0 into 0
  return [part(0), part(1), part(2)];
}

/** matMul3(A, B) means "apply B first, then A". Each column of the answer is where A sends that column of B. */
export function matMul3(a: Mat3, b: Mat3): Mat3 {
  return [matVec3(a, b[0]), matVec3(a, b[1]), matVec3(a, b[2])];
}

export function dot3(v: Vec3, w: Vec3): number {
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
}

/** The cross product: an arrow at right angles to both v and w (right-hand rule). */
export function cross3(v: Vec3, w: Vec3): Vec3 {
  return [v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0]];
}

export function length3(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * The determinant of a 3x3 matrix: how much the matrix scales volume (negative: space is flipped).
 * It is the volume of the box made by the three columns: i-hat · (j-hat × k-hat).
 */
export function det3(m: Mat3): number {
  return dot3(m[0], cross3(m[1], m[2])) + 0;
}

export function lerpVec3(u: Vec3, v: Vec3, t: number): Vec3 {
  return [lerp(u[0], v[0], t) + 0, lerp(u[1], v[1], t) + 0, lerp(u[2], v[2], t) + 0];
}

export function lerpMatrix3(a: Mat3, b: Mat3, t: number): Mat3 {
  return [lerpVec3(a[0], b[0], t), lerpVec3(a[1], b[1], t), lerpVec3(a[2], b[2], t)];
}

/** The matrix that turns space by `degrees` about `axis` (anticlockwise when the axis points at you). */
export function rotationAbout(axis: Vec3, degrees: number): Mat3 {
  const len = length3(axis);
  const k: Vec3 = [axis[0] / len, axis[1] / len, axis[2] / len];
  const r = (degrees * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  // Rodrigues' formula: the part along the axis stays, the rest turns around it.
  const turn = (v: Vec3): Vec3 => {
    const kv = cross3(k, v);
    const along = dot3(k, v) * (1 - c);
    return [v[0] * c + kv[0] * s + k[0] * along, v[1] * c + kv[1] * s + k[1] * along, v[2] * c + kv[2] * s + k[2] * along];
  };
  return [turn([1, 0, 0]), turn([0, 1, 0]), turn([0, 0, 1])];
}

/**
 * If m only turns space (no stretching, no flipping), the axis and angle (0 to 180 degrees) it turns by.
 * Otherwise null. The identity counts as a turn by 0 about any axis.
 */
export function rotationAxisAngle(m: Mat3): { axis: Vec3; degrees: number } | null {
  const [a, b, c] = m;
  const isRotation =
    [a, b, c].every((col) => isClose(length3(col), 1, 1e-9)) &&
    isClose(dot3(a, b), 0, 1e-9) &&
    isClose(dot3(a, c), 0, 1e-9) &&
    isClose(dot3(b, c), 0, 1e-9) &&
    det3(m) > 0;
  if (!isRotation) return null;

  // The numbers on the diagonal add up to 1 + 2 cos(angle).
  const trace = a[0] + b[1] + c[2];
  const angle = Math.acos(Math.min(1, Math.max(-1, (trace - 1) / 2)));
  const degrees = (angle * 180) / Math.PI;
  if (degrees < 1e-9) return { axis: [0, 0, 1], degrees: 0 };

  // The "twist" part of m (row r, column c is m[c][r]) points along the axis, unless the angle is 180°.
  const twist: Vec3 = [b[2] - c[1], c[0] - a[2], a[1] - b[0]];
  if (length3(twist) > 1e-6) return { axis: twist, degrees };

  // A half turn has no twist, but then m + I = 2·(axis)(axis)ᵀ, so its biggest column points along the axis.
  const cols = [0, 1, 2].map((i): Vec3 => {
    const col = [...m[i]] as Vec3;
    col[i] += 1;
    return col;
  });
  const longest = cols.reduce((best, col) => (length3(col) > length3(best) ? col : best));
  return { axis: longest, degrees };
}

/** Like matrixAt, in 3D: the matrix an animation shows at time t on its way from I to m. Rotations turn. */
export function matrixAt3(m: Mat3, t: number): Mat3 {
  const turn = rotationAxisAngle(m);
  return turn === null ? lerpMatrix3(identity3(), m, t) : rotationAbout(turn.axis, turn.degrees * t);
}

// ---------- Matrices that aren't square ----------

/**
 * Apply any matrix (stored as its columns, as many as v has numbers) to v:
 * v[0] copies of column 1, plus v[1] copies of column 2, and so on.
 * A 3x2 matrix has two columns of 3 numbers each: it takes a 2D vector to a 3D one.
 * A 1x2 matrix has two columns of 1 number each: it takes a 2D vector to a single number.
 */
export function applyColumns(columns: number[][], v: number[]): number[] {
  if (columns.length !== v.length) throw new Error(`${columns.length} columns but ${v.length} numbers`);
  const rows = columns[0].length;
  const out = new Array<number>(rows).fill(0);
  columns.forEach((col, j) => col.forEach((n, r) => (out[r] += v[j] * n)));
  return out.map((n) => n + 0);
}

/**
 * A 1x2 matrix [a, b] sends the plane to a number line. To draw that on the plane, use the x-axis as the
 * number line: the 2x2 matrix that sends i-hat to (a, 0) and j-hat to (b, 0) does the same squashing.
 */
export function rowToLine([a, b]: [number, number]): Mat2 {
  return [[a, 0], [b, 0]];
}

/**
 * A 3x2 matrix (two columns of 3 numbers) as a 3x3 matrix that does the same thing to the floor
 * (the xy-plane, z = 0): i-hat and j-hat go where its columns say, and k-hat is squashed to 0.
 * Used to draw a 2D plane landing in 3D.
 */
export function liftColumns([c1, c2]: [Vec3, Vec3]): Mat3 {
  return [c1, c2, [0, 0, 0]];
}

// ---------- Area (Module 3: the determinant) ----------

/**
 * The signed area inside a closed shape whose corners are listed in order (the "shoelace formula").
 * Positive when the corners go anticlockwise, negative when they go clockwise.
 * A matrix with a negative determinant flips the order, so the area turns negative too.
 */
export function polygonArea(points: Vec2[]): number {
  let twice = 0;
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length];
    twice += x1 * y2 - x2 * y1;
  });
  return twice / 2 + 0;
}

/** The middle of a shape: the average of its corners. Used to place a label inside it. */
export function centroid(points: Vec2[]): Vec2 {
  const sum = points.reduce((acc, p) => add(acc, p), [0, 0] as Vec2);
  return scale(1 / points.length, sum);
}

/** Move every corner of a shape with the matrix. */
export function transformShape(m: Mat2, points: Vec2[]): Vec2[] {
  return points.map((p) => matVec(m, p));
}

/** The unit square's corners, anticlockwise from the origin: 0, i-hat, i-hat + j-hat, j-hat. */
export const UNIT_SQUARE: Vec2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];

/** A small blob shape (corners anticlockwise) for showing that every shape scales by the same factor. */
export const BLOB: Vec2[] = [
  [-1, 0.6], [-0.7, 0.4], [-0.4, 0.6], [-0.3, 1], [-0.45, 1.4], [-0.8, 1.6], [-1.1, 1.35], [-1.15, 0.95],
];

/**
 * Diagonal lines (going up at 45°), `gap` apart, that cover the box around a shape.
 * Cut them to the shape's outline (an SVG clip path) to draw stripes inside it.
 */
export function stripeLines(points: Vec2[], gap: number): Vec2[][] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Each line is y = x + k. These k values reach every corner of the box.
  const lines: Vec2[][] = [];
  for (let k = Math.floor((y0 - x1) / gap) * gap; k <= y1 - x0; k += gap) {
    lines.push([[x0, x0 + k], [x1, x1 + k]]);
  }
  return lines;
}

/**
 * Which way a shape faces after a transformation, from its signed area (or a determinant):
 * 'kept' (same way round), 'flat' (squashed to a line or a point) or 'flipped' (turned over, like a mirror).
 * Areas closer to 0 than `tolerance` count as flat, so a slider passing through 0 shows it.
 */
export function orientation(area: number, tolerance = 0.005): 'kept' | 'flat' | 'flipped' {
  if (Math.abs(area) < tolerance) return 'flat';
  return area > 0 ? 'kept' : 'flipped';
}

/** One piece of the "a·d − b·c" picture: a shape and its area. */
export interface AreaPiece {
  points: Vec2[];
  area: number;
}

/**
 * The picture behind det = ad − bc, for a matrix with columns (a, c) and (b, d), all four numbers positive.
 * The parallelogram sits inside an (a + b) by (c + d) rectangle. Cut away from the rectangle:
 * two triangles of area ac/2, two triangles of area bd/2, and two rectangles of area bc.
 * What's left is the parallelogram: (a + b)(c + d) − ac − bd − 2bc = ad − bc.
 */
export function adBcPieces(m: Mat2): { box: AreaPiece; triangles: AreaPiece[]; rectangles: AreaPiece[] } {
  const [[a, c], [b, d]] = m;
  const piece = (points: Vec2[]): AreaPiece => ({ points, area: Math.abs(polygonArea(points)) });
  return {
    box: piece([[0, 0], [a + b, 0], [a + b, c + d], [0, c + d]]),
    triangles: [
      piece([[0, 0], [a, 0], [a, c]]), // under î
      piece([[b, d], [b, c + d], [a + b, c + d]]), // the same shape at the top
      piece([[a, c], [a + b, c], [a + b, c + d]]), // right of ĵ's copy
      piece([[0, 0], [b, d], [0, d]]), // left of ĵ
    ],
    rectangles: [
      piece([[a, 0], [a + b, 0], [a + b, c], [a, c]]), // bottom right corner
      piece([[0, d], [b, d], [b, c + d], [0, c + d]]), // top left corner
    ],
  };
}

// ---------- Systems of equations ----------

/**
 * A number written the way you'd write it by hand: 1/3 instead of 0.3333, -9/2 instead of -4.5.
 * Tries every bottom number up to 100. Numbers with no simple fraction (like pi) get 2 decimals.
 * A short decimal with a big bottom number stays a decimal: 1.41, not 141/100.
 */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const close = (a: number) => Math.abs(a - n) < 1e-9 * Math.max(1, Math.abs(n));
  for (let bottom = 1; bottom <= 100; bottom++) {
    const top = Math.round(n * bottom);
    if (close(top / bottom)) {
      if (top === 0) return '0'; // never "-0"
      if (bottom === 1) return String(top);
      if (bottom > 12 && close(roundTo(n, 2))) break; // a short decimal reads better
      return `${top}/${bottom}`;
    }
  }
  return String(roundTo(n, 2));
}

/** One step of elimination: what was done, the matrix after it, and which row changed (null for the start). */
export interface EliminationStep {
  description: string;
  matrix: number[][];
  changedRow: number | null;
}

/** Every step of elimination, and the answer (null when there is no unique solution). */
export interface Elimination {
  steps: EliminationStep[];
  solution: number[] | null;
}

/** Numbers this close to 0 count as 0: rounding errors shouldn't count as a pivot. */
const TINY = 1e-9;

/**
 * Gaussian elimination on an augmented matrix [A | b], written down step by step.
 * NOTE: unlike every other matrix in this file, the augmented matrix is stored as ROWS, because
 * elimination works on rows. x + 2y = 5, 3x + 4y = 6 is [[1, 2, 5], [3, 4, 6]]. Works for 2 or 3 equations.
 *
 * The order is the one taught in class:
 * 1. Going down: under each pivot, make every number 0 ("R2 → R2 − 3·R1"). Swap rows if a pivot is 0.
 * 2. Going up: make each pivot 1 ("R2 → (−1/2)·R2"), then make every number above it 0.
 * At the end the left side is the identity, and the right-hand column is the solution.
 * Row operations never change the solution: every step's equations are solved by the same x.
 */
export function rrefSteps(augmented: number[][]): Elimination {
  const m = augmented.map((row) => [...row]);
  const n = m.length;
  const steps: EliminationStep[] = [{ description: 'Start', matrix: copyRows(m), changedRow: null }];
  const record = (description: string, changedRow: number) =>
    steps.push({ description, matrix: copyRows(m), changedRow });

  // 1. Going down.
  for (let c = 0; c < n; c++) {
    if (Math.abs(m[c][c]) < TINY) {
      const below = m.findIndex((row, r) => r > c && Math.abs(row[c]) >= TINY);
      if (below === -1) {
        steps.push({
          description: `No unique solution: column ${c + 1} has no pivot`,
          matrix: copyRows(m),
          changedRow: null,
        });
        return { steps, solution: null };
      }
      [m[c], m[below]] = [m[below], m[c]];
      record(`R${c + 1} ↔ R${below + 1}`, c);
    }
    for (let r = c + 1; r < n; r++) {
      const k = m[r][c] / m[c][c];
      if (Math.abs(k) < TINY) continue;
      m[r] = m[r].map((x, j) => x - k * m[c][j]);
      m[r][c] = 0; // exactly 0, not 1e-17
      record(`R${r + 1} → R${r + 1} ${k > 0 ? '−' : '+'} ${multiplier(Math.abs(k))}R${c + 1}`, r);
    }
  }

  // 2. Going up.
  for (let c = n - 1; c >= 0; c--) {
    const pivot = m[c][c];
    if (Math.abs(pivot - 1) >= TINY) {
      m[c] = m[c].map((x) => x / pivot);
      m[c][c] = 1;
      const factor = formatNumber(1 / pivot).replace('-', '−');
      record(`R${c + 1} → ${factor.includes('/') ? `(${factor})` : factor}·R${c + 1}`, c);
    }
    for (let r = c - 1; r >= 0; r--) {
      const k = m[r][c];
      if (Math.abs(k) < TINY) continue;
      m[r] = m[r].map((x, j) => x - k * m[c][j]);
      m[r][c] = 0;
      record(`R${r + 1} → R${r + 1} ${k > 0 ? '−' : '+'} ${multiplier(Math.abs(k))}R${c + 1}`, r);
    }
  }

  return { steps, solution: m.map((row) => row[n] + 0) };
}

/** "3·" for 3, "3/2·" for 1.5, and nothing at all for 1 (R2 − R1, not R2 − 1·R1). */
function multiplier(k: number): string {
  const text = formatNumber(k);
  return text === '1' ? '' : `${text}·`;
}

/** A copy of a matrix stored as rows, with -0 turned into 0. */
function copyRows(m: number[][]): number[][] {
  return m.map((row) => row.map((x) => x + 0));
}

/**
 * The matrix that undoes m: send everything through m, then through inverse2(m), and every point is back home.
 * With columns (a, c) and (b, d), the inverse has columns (d, −c) and (−b, a), all divided by the determinant.
 * Returns null when det = 0: m squashed the plane flat, and a line can't be unsquashed.
 */
export function inverse2(m: Mat2): Mat2 | null {
  const det = det2(m);
  if (Math.abs(det) < TINY) return null;
  const [[a, c], [b, d]] = m;
  return [[d / det + 0, -c / det + 0], [-b / det + 0, a / det + 0]];
}

/** Which x does m send to v? Answer: rewind v with the inverse. null when det = 0 (no single answer). */
export function solve2(m: Mat2, v: Vec2): Vec2 | null {
  const inv = inverse2(m);
  return inv ? matVec(inv, v) : null;
}

/**
 * Two points on the line a·x + b·y = c, for drawing it. The first is the point of the line nearest
 * the origin; the second is one step along the line from there. Works for upright lines like x = −4 too.
 * null when a and b are both 0 (then it isn't a line).
 */
export function equationLine([a, b, c]: number[]): [Vec2, Vec2] | null {
  const lengthSquared = a * a + b * b;
  if (lengthSquared < TINY) return null;
  const nearest: Vec2 = [(c * a) / lengthSquared + 0, (c * b) / lengthSquared + 0];
  const along = scale(1 / Math.sqrt(lengthSquared), [-b, a]);
  return [nearest, add(nearest, along)];
}

/**
 * The rows of the augmented matrix [A | v], for the equations A·x = v. A is stored as columns, so row r is
 * (column 1's number r, column 2's number r, v's number r). Columns (2, 1), (-1, 1) and v = (1, 5) give
 * 2x − y = 1 and x + y = 5.
 */
export function augmentedRows(m: Mat2, v: Vec2): number[][] {
  return [0, 1].map((r) => [m[0][r], m[1][r], v[r]]);
}

/** Slide every number of one matrix towards the other: t = 0 gives a, t = 1 gives b. Works for any size. */
export function lerpRows(a: number[][], b: number[][], t: number): number[][] {
  return a.map((row, r) => row.map((n, c) => lerp(n, b[r][c], t) + 0));
}

/**
 * A row of an augmented matrix written as an equation: [1, 2, 5] is "x + 2y = 5", [0, -2, -9] is "−2y = −9".
 * Fractions go in brackets so they don't run into the letter: "(1/2)y".
 */
export function equationText(row: number[], names = ['x', 'y', 'z']): string {
  const minus = (text: string) => text.replace('-', '−');
  const terms: string[] = [];
  row.slice(0, -1).forEach((k, i) => {
    if (Math.abs(k) < TINY) return;
    const size = formatNumber(Math.abs(k));
    const coefficient = size === '1' ? '' : size.includes('/') ? `(${size})` : size;
    const sign = k < 0 ? '−' : '+';
    terms.push(terms.length === 0 ? `${k < 0 ? '−' : ''}${coefficient}${names[i]}` : `${sign} ${coefficient}${names[i]}`);
  });
  return `${terms.length ? terms.join(' ') : '0'} = ${minus(formatNumber(row[row.length - 1]))}`;
}

/**
 * A random system of 2 or 3 equations (an augmented matrix, stored as rows) with one whole-number answer.
 * It picks the answer first, then a matrix of small whole numbers with det ≠ 0, then works out the right-hand side.
 */
export function randomSystem(size: 2 | 3, rand: () => number = Math.random): number[][] {
  const small = () => Math.floor(rand() * 7) - 3; // -3 to 3
  const answer = Array.from({ length: size }, small);
  const rows = Array.from({ length: size }, () => Array.from({ length: size }, small));
  const det = size === 2 ? det2(rows as Mat2) : det3(rows as Mat3);
  // A 0 in the top-left corner would need a row swap first: allowed, but not for the first example.
  if (Math.abs(det) < TINY || rows[0][0] === 0) return randomSystem(size, rand);
  return rows.map((row) => [...row, row.reduce((sum, k, i) => sum + k * answer[i], 0)]);
}
