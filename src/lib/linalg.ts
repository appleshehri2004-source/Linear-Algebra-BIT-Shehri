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
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2] + 0; // + 0 turns -0 into 0
}

/** The cross product: an arrow at right angles to both v and w (right-hand rule). */
export function cross3(v: Vec3, w: Vec3): Vec3 {
  return [v[1] * w[2] - v[2] * w[1] + 0, v[2] * w[0] - v[0] * w[2] + 0, v[0] * w[1] - v[1] * w[0] + 0]; // + 0 turns -0 into 0
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

/**
 * Every step of elimination, and what it found:
 * - solution: the answer, or null when there is no unique solution (none at all, or infinitely many).
 * - pivotColumns: the columns of A that got a pivot (counting from 0). How many there are is the rank.
 * - rref: the matrix at the end, with every pivot 1 and 0s above and below it.
 */
export interface Elimination {
  steps: EliminationStep[];
  solution: number[] | null;
  pivotColumns: number[];
  rref: number[][];
}

/** Numbers this close to 0 count as 0: rounding errors shouldn't count as a pivot. */
const TINY = 1e-9;

/**
 * Gaussian elimination on an augmented matrix [A | b], written down step by step.
 * NOTE: unlike every other matrix in this file, the augmented matrix is stored as ROWS, because
 * elimination works on rows. x + 2y = 5, 3x + 4y = 6 is [[1, 2, 5], [3, 4, 6]]. The last number of each
 * row is b; any number of equations and unknowns works (2x3, 3x3, 2x2...).
 *
 * The order is the one taught in class:
 * 1. Going down: under each pivot, make every number 0 ("R2 → R2 − 3·R1"). Swap rows if a pivot is 0.
 *    A column with no pivot is skipped: its unknown is "free".
 * 2. Going up: make each pivot 1 ("R2 → (−1/2)·R2"), then make every number above it 0.
 * When every column has a pivot, the left side ends as the identity and the right-hand column is the solution.
 * Row operations never change the solution: every step's equations are solved by the same x.
 */
export function rrefSteps(augmented: number[][]): Elimination {
  const m = augmented.map((row) => [...row]);
  const unknowns = m[0].length - 1;
  const steps: EliminationStep[] = [{ description: 'Start', matrix: copyRows(m), changedRow: null }];
  const record = (description: string, changedRow: number) =>
    steps.push({ description, matrix: copyRows(m), changedRow });
  const pivotColumns: number[] = [];

  // 1. Going down. p is the row the next pivot goes in.
  for (let c = 0, p = 0; c < unknowns && p < m.length; c++) {
    if (Math.abs(m[p][c]) < TINY) {
      const below = m.findIndex((row, r) => r > p && Math.abs(row[c]) >= TINY);
      if (below === -1) {
        steps.push({ description: `Column ${c + 1} has no pivot: move on`, matrix: copyRows(m), changedRow: null });
        continue;
      }
      [m[p], m[below]] = [m[below], m[p]];
      record(`R${p + 1} ↔ R${below + 1}`, p);
    }
    for (let r = p + 1; r < m.length; r++) {
      const k = m[r][c] / m[p][c];
      if (Math.abs(k) < TINY) continue;
      m[r] = m[r].map((x, j) => cleanZero(x - k * m[p][j]));
      m[r][c] = 0; // exactly 0, not 1e-17
      record(`R${r + 1} → R${r + 1} ${k > 0 ? '−' : '+'} ${multiplier(Math.abs(k))}R${p + 1}`, r);
    }
    pivotColumns.push(c);
    p++;
  }

  // 2. Going up: pivot number p sits in row p.
  for (let p = pivotColumns.length - 1; p >= 0; p--) {
    const c = pivotColumns[p];
    const pivot = m[p][c];
    if (Math.abs(pivot - 1) >= TINY) {
      m[p] = m[p].map((x) => cleanZero(x / pivot));
      m[p][c] = 1;
      const factor = formatNumber(1 / pivot).replace('-', '−');
      record(`R${p + 1} → ${factor.includes('/') ? `(${factor})` : factor}·R${p + 1}`, p);
    }
    for (let r = p - 1; r >= 0; r--) {
      const k = m[r][c];
      if (Math.abs(k) < TINY) continue;
      m[r] = m[r].map((x, j) => cleanZero(x - k * m[p][j]));
      m[r][c] = 0;
      record(`R${r + 1} → R${r + 1} ${k > 0 ? '−' : '+'} ${multiplier(Math.abs(k))}R${p + 1}`, r);
    }
  }

  const rref = copyRows(m);
  // A row with only 0s on the left but not on the right says "0 = 3": impossible.
  const impossible = rref.findIndex((row) => isZeroRow(row.slice(0, -1)) && Math.abs(row[unknowns]) >= TINY);
  if (impossible !== -1) {
    steps.push({
      description: `No unique solution: R${impossible + 1} says 0 = ${formatNumber(rref[impossible][unknowns])}, so there is no solution`,
      matrix: rref,
      changedRow: null,
    });
    return { steps, solution: null, pivotColumns, rref };
  }
  if (pivotColumns.length < unknowns) {
    const free = [...Array(unknowns).keys()].filter((c) => !pivotColumns.includes(c));
    steps.push({
      description: `No unique solution: column ${free[0] + 1} has no pivot`,
      matrix: rref,
      changedRow: null,
    });
    return { steps, solution: null, pivotColumns, rref };
  }
  const solution = new Array<number>(unknowns).fill(0);
  pivotColumns.forEach((c, p) => (solution[c] = rref[p][unknowns] + 0));
  return { steps, solution, pivotColumns, rref };
}

/** Rounding errors (like 1e-17) become exactly 0. */
function cleanZero(x: number): number {
  return Math.abs(x) < TINY ? 0 : x;
}

/** true when every number in the list is (about) 0. */
function isZeroRow(row: number[]): boolean {
  return row.every((x) => Math.abs(x) < TINY);
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

// ---------- Rank and the four subspaces (Module 4 part 2) ----------
// These take a matrix of any size stored as its COLUMNS, like applyColumns: a 2x3 matrix is 3 columns of
// 2 numbers. The rows (1, 2, 3) and (2, 4, 6) are the columns [[1, 2], [2, 4], [3, 6]].

/** Swap rows and columns. The columns of the transpose are the rows of the matrix (and the other way round). */
export function transpose(m: number[][]): number[][] {
  return m[0].map((_, r) => m.map((col) => col[r]));
}

/** Elimination on A·x = 0, with A given as columns. The rows are A's rows with a 0 on the end. */
function eliminate(columns: number[][]): Elimination {
  return rrefSteps(transpose(columns).map((row) => [...row, 0]));
}

/** How many columns get a pivot = how many dimensions the output has (2 = a plane, 1 = a line, 0 = a point). */
export function rank(columns: number[][]): number {
  return eliminate(columns).pivotColumns.length;
}

/**
 * Where the matrix can land: the column space. Its basis is the original columns that got a pivot
 * (the other columns are made of these, so they add nothing new).
 */
export function columnSpaceBasis(columns: number[][]): number[][] {
  return eliminate(columns).pivotColumns.map((c) => [...columns[c]]);
}

/**
 * Everything the matrix squashes to 0: the null space. One basis vector per free column (a column with no
 * pivot): set that unknown to 1, the other free ones to 0, and read the pivot unknowns off the rref.
 * Rows (1, 2) and (2, 4): x + 2y = 0, so y = 1 gives x = −2, the vector (−2, 1).
 */
export function nullSpaceBasis(columns: number[][]): number[][] {
  const { pivotColumns, rref } = eliminate(columns);
  const unknowns = columns.length;
  const free = [...Array(unknowns).keys()].filter((c) => !pivotColumns.includes(c));
  return free.map((f) => {
    const v = new Array<number>(unknowns).fill(0);
    v[f] = 1;
    pivotColumns.forEach((c, p) => (v[c] = -rref[p][f] + 0));
    return v;
  });
}

/** The rows' span, a space in the input: the column space of the transpose. */
export function rowSpaceBasis(columns: number[][]): number[][] {
  return columnSpaceBasis(transpose(columns));
}

/** The left null space, in the output: vectors y with yᵀA = 0. It is the null space of the transpose. */
export function leftNullSpaceBasis(columns: number[][]): number[][] {
  return nullSpaceBasis(transpose(columns));
}

/** Every solution of A·x = b: one particular solution, plus any mix of the null space directions. */
export interface CompleteSolution {
  particular: number[];
  directions: number[][];
}

/**
 * All solutions of A·x = b (A as columns), or null when there are none (b is not in the column space).
 * The particular solution sets every free unknown to 0. Rows (1, 2), (2, 4) with b = (3, 6):
 * x = (3, 0) + t·(−2, 1). With b = (3, 7) elimination ends with "0 = 1": no solution.
 */
export function completeSolution(columns: number[][], b: number[]): CompleteSolution | null {
  const unknowns = columns.length;
  const { pivotColumns, rref } = rrefSteps(transpose(columns).map((row, r) => [...row, b[r]]));
  const impossible = rref.some((row) => isZeroRow(row.slice(0, -1)) && Math.abs(row[unknowns]) >= TINY);
  if (impossible) return null;
  const particular = new Array<number>(unknowns).fill(0);
  pivotColumns.forEach((c, p) => (particular[c] = rref[p][unknowns] + 0));
  return { particular, directions: nullSpaceBasis(columns) };
}

// ---------- Cramer's rule ----------

/**
 * The answer to A·x = v by Cramer's rule, with the determinants it uses.
 * numerators[i] is det(A with column i swapped for v); the answer's number i is numerators[i] / det.
 */
export interface Cramer<V> {
  solution: V;
  det: number;
  numerators: number[];
}

/**
 * Cramer's rule for 2x2. x = det([v, column 2]) / det(A), y = det([column 1, v]) / det(A). null when det = 0.
 * Columns (−2, 0), (1, −1) and v = (−4, −2): numerators 6 and 4, det 2, so x = 3, y = 2.
 */
export function cramer2(m: Mat2, v: Vec2): Cramer<Vec2> | null {
  const det = det2(m);
  if (Math.abs(det) < TINY) return null;
  const numerators = [det2([v, m[1]]), det2([m[0], v])];
  return { solution: [numerators[0] / det + 0, numerators[1] / det + 0], det, numerators };
}

/** Cramer's rule for 3x3: the same idea, one column swapped for v at a time. null when det = 0. */
export function cramer3(m: Mat3, v: Vec3): Cramer<Vec3> | null {
  const det = det3(m);
  if (Math.abs(det) < TINY) return null;
  const numerators = [det3([v, m[1], m[2]]), det3([m[0], v, m[2]]), det3([m[0], m[1], v])];
  return { solution: numerators.map((n) => n / det + 0) as Vec3, det, numerators };
}

/** v made 1 long, keeping its direction. */
export function normalize3(v: Vec3): Vec3 {
  const len = length3(v);
  return [v[0] / len + 0, v[1] / len + 0, v[2] / len + 0];
}

/**
 * Two arrows, 1 long and at right angles, that span the same plane as u and w (u and w must not be on one line).
 * The first points along u; the second is w with its u-part taken away (Gram–Schmidt). Used to draw a plane as a square.
 */
export function orthonormalPair(u: Vec3, w: Vec3): [Vec3, Vec3] {
  const e1 = normalize3(u);
  const along = dot3(w, e1);
  const e2 = normalize3([w[0] - along * e1[0], w[1] - along * e1[1], w[2] - along * e1[2]]);
  return [e1, e2];
}

/** The 4 corners of a square centred on the origin, lying in the plane spanned by u and w, `size` from the centre to each side. */
export function planeCorners(u: Vec3, w: Vec3, size: number): Vec3[] {
  const [e1, e2] = orthonormalPair(u, w);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(
    ([a, b]) => [0, 1, 2].map((i) => size * (a * e1[i] + b * e2[i]) + 0) as Vec3,
  );
}

/** The parallelogram made by u and w: its corners 0, u, u + w, w. */
export function parallelogram(u: Vec2, w: Vec2): Vec2[] {
  return [[0, 0], u, add(u, w), w];
}

/** The two parallelograms of Cramer's rule for one unknown, and their signed areas. */
export interface CramerPicture {
  /** Its sides, before the matrix: î and x (for y), or x and ĵ (for x). */
  inputSides: [Vec2, Vec2];
  input: Vec2[];
  /** Its area is the unknown itself. */
  inputArea: number;
  /** After the matrix: column 1 and v (for y), or v and column 2 (for x). */
  outputSides: [Vec2, Vec2];
  output: Vec2[];
  /** det(A) times the input area: Cramer's top determinant. */
  outputArea: number;
}

/**
 * Cramer's rule as areas. For y: the parallelogram made by î and x has area y (its height above the x-axis,
 * times a base of 1). The matrix sends î to column 1 and x to v, and multiplies every area by det(A).
 * So the area made by column 1 and v is det(A)·y, and y = that area / det(A). For x, use x and ĵ the same way.
 * `unknown` is 0 for x and 1 for y.
 */
export function cramerPicture(m: Mat2, x: Vec2, unknown: 0 | 1): CramerPicture {
  const v = matVec(m, x);
  const inputSides: [Vec2, Vec2] = unknown === 1 ? [[1, 0], x] : [x, [0, 1]];
  const outputSides: [Vec2, Vec2] = unknown === 1 ? [m[0], v] : [v, m[1]];
  return {
    inputSides,
    input: parallelogram(...inputSides),
    inputArea: det2(inputSides) + 0,
    outputSides,
    output: parallelogram(...outputSides),
    outputArea: det2(outputSides) + 0,
  };
}

/** v made 1 long, keeping its direction. */
export function normalize(v: Vec2): Vec2 {
  const len = length(v);
  return [v[0] / len + 0, v[1] / len + 0];
}

/**
 * If p is within `tolerance` of the line through the origin along `direction`, move it onto the line
 * (straight across, to the nearest point). Otherwise leave it. Dragging rarely lands exactly on a line,
 * so this makes "b is on the column space" reachable by hand.
 * With `step`, the point on the line is also rounded to a whole number of steps along `direction`
 * (step 0.5 along (1, 2) gives (1, 2), (1.5, 3), (2, 4)...), so the answers come out tidy.
 */
export function snapToLine(p: Vec2, direction: Vec2, tolerance: number, step?: number): Vec2 {
  const onLine = projectOnto(p, direction);
  if (!onLine || distance(p, onLine) > tolerance) return p;
  if (!step) return onLine;
  const copies = Math.round(dot(p, direction) / dot(direction, direction) / step) * step;
  return [copies * direction[0] + 0, copies * direction[1] + 0];
}

/** One solution from a complete solution: particular + t copies of the first direction (or just particular if there are none). */
export function pointOnSolution({ particular, directions }: CompleteSolution, t: number): number[] {
  return particular.map((p, i) => p + t * (directions[0]?.[i] ?? 0) + 0);
}

// ---- Module 5: duality and the cross product ----

/**
 * Where v lands on a number line through the origin along the unit vector u: drop v straight onto the line
 * and read the number there. Worked out by turning the whole picture until the line lies along the x-axis,
 * then reading v's x. No dot product is used, so "it always equals dot(u, v)" is something the tests check,
 * not something built in. That equality is duality.
 */
export function projectToLine(v: Vec2, u: Vec2): number {
  const lineAngle = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  return matVec(rotation(-lineAngle), v)[0] + 0;
}

/** Everything DualityView shows: the number line runs along uHat (1 long), and u = k · uHat. */
export interface DualityNumbers {
  /** The number where v lands on the line. */
  position: number;
  /** The point on the line where v lands (the foot of the dashed line). */
  landing: Vec2;
  /** The landing number times k: what the 1x2 matrix [u_x u_y] gives for v. */
  value: number;
  /** dot(k · uHat, v), worked out the usual way. Always equal to value. */
  dot: number;
}

export function dualityNumbers(v: Vec2, uHat: Vec2, k = 1): DualityNumbers {
  const position = projectToLine(v, uHat);
  return {
    position,
    landing: scale(position, uHat),
    value: k * position + 0,
    dot: dot(scale(k, uHat), v) + 0,
  };
}

/** One tick mark on a tilted number line: its number, where it sits, and the two ends of the little mark across the line. */
export interface Tick {
  value: number;
  point: Vec2;
  ends: [Vec2, Vec2];
}

/** Tick marks at the whole numbers -n to n along the number line through the origin in the direction uHat (1 long). */
export function numberLineTicks(uHat: Vec2, n: number, size = 0.15): Tick[] {
  const across: Vec2 = [-uHat[1] * size, uHat[0] * size]; // uHat turned a quarter turn: at right angles to the line
  const ticks: Tick[] = [];
  for (let value = -n; value <= n; value++) {
    const point = scale(value, uHat);
    ticks.push({ value, point, ends: [sub(point, across), add(point, across)] });
  }
  return ticks;
}

/**
 * The 2D cross product: the signed area of the parallelogram made by v and w.
 * It is the determinant with v and w as columns. Negative when v is to the left of w (w is clockwise from v).
 */
export function cross2(v: Vec2, w: Vec2): number {
  return det2([v, w]);
}

export function add3(u: Vec3, v: Vec3): Vec3 {
  return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
}

export function scale3(k: number, v: Vec3): Vec3 {
  return [k * v[0] + 0, k * v[1] + 0, k * v[2] + 0];
}

/** The parallelogram made by v and w in 3D: its corners 0, v, v + w, w. */
export function parallelogram3(v: Vec3, w: Vec3): Vec3[] {
  return [[0, 0, 0], v, add3(v, w), w];
}

/** The 12 edges of the slanted box (parallelepiped) made by a, b and c, as pairs of points. */
export function parallelepipedEdges(a: Vec3, b: Vec3, c: Vec3): [Vec3, Vec3][] {
  const o: Vec3 = [0, 0, 0];
  const edges: [Vec3, Vec3][] = [];
  // For each side (a, b or c), the 4 edges running along it start at the 4 corners made from the other two.
  for (const [side, p, q] of [[a, b, c], [b, c, a], [c, a, b]]) {
    for (const start of [o, p, q, add3(p, q)]) edges.push([start, add3(start, side)]);
  }
  return edges;
}

/** The box made by p, v and w, measured as base × height. Its base is the parallelogram of v and w. */
export interface BoxVolume {
  /** Area of the base: the length of v × w. */
  base: number;
  /** How far p reaches above the base, straight up along v × w (negative: below it). 0 if the base is flat. */
  height: number;
  /** base × height = dot(p, v × w). Signed, like a determinant. */
  volume: number;
}

export function boxVolume(p: Vec3, v: Vec3, w: Vec3): BoxVolume {
  const n = cross3(v, w);
  const base = length3(n);
  const height = base === 0 ? 0 : dot3(p, n) / base + 0;
  return { base, height, volume: dot3(p, n) + 0 };
}

// ---- Module 7: change of basis ----
// Jennifer's basis is stored like any matrix: P = [b1, b2], her two basis vectors written in our numbers.

/** Her numbers → ours: "her" copies of b1 and b2, added up. That is just P times her numbers. */
export function toOurCoords(P: Mat2, her: Vec2): Vec2 {
  const [x, y] = matVec(P, her);
  return [x + 0, y + 0]; // + 0 turns -0 into 0
}

/** Our numbers → hers: undo P, so P⁻¹ times our numbers. null when b1 and b2 lie on one line (not a basis). */
export function toHerCoords(P: Mat2, ours: Vec2): Vec2 | null {
  const her = solve2(P, ours);
  return her && [her[0] + 0, her[1] + 0];
}

/**
 * The matrix M (written in our numbers) rewritten in Jennifer's numbers: P⁻¹ M P.
 * Read it right to left: her numbers → ours (P), do M, back to hers (P⁻¹). null when P is not a basis.
 */
export function changeOfBasisMatrix(P: Mat2, M: Mat2): Mat2 | null {
  const inv = inverse2(P);
  return inv && matMul(inv, matMul(M, P));
}

/** Jennifer's grid: our grid lines from -extent to extent, moved by P (her lines are where ours land). */
export function basisGridLines(P: Mat2, extent: number): Vec2[][] {
  return gridLines(extent).map((line) => transformShape(P, line));
}

/** Move a point (our numbers) to the nearest corner of Jennifer's grid: round her numbers to whole numbers. */
export function snapToBasis(P: Mat2, ours: Vec2): Vec2 {
  const her = toHerCoords(P, ours);
  return her ? toOurCoords(P, [Math.round(her[0]), Math.round(her[1])]) : ours;
}

/** Which of n steps is playing at time t (0 to 1): 0 for the first, n - 1 for the last (and at t = 1). */
export function currentStep(n: number, t: number): number {
  return Math.min(n - 1, Math.floor(t * n));
}

// ---- Module 6: orthogonality ----

/**
 * The shadow of v on the plane through the origin spanned by u and w: the point of the plane closest to v.
 * Made from two arrows 1 long and at right angles in the plane (orthonormalPair): v's part along each, added up.
 * (1, 2, 3) onto the floor spanned by (1, 0, 0) and (0, 1, 0) is (1, 2, 0). null when u and w lie on one line.
 */
export function projectOntoPlane(v: Vec3, u: Vec3, w: Vec3): Vec3 | null {
  if (length3(cross3(u, w)) < TINY) return null;
  const [e1, e2] = orthonormalPair(u, w);
  return add3(scale3(dot3(v, e1), e1), scale3(dot3(v, e2), e2));
}

/**
 * The matrix that projects onto the line through a: P = a aᵀ / (aᵀ a). P times any vector is its shadow on the line.
 * For a = (1, 1) every number is 1/2. Projecting twice changes nothing, so P·P = P. null when a = 0.
 */
export function projectionMatrix(a: Vec2): Mat2 | null {
  const aa = dot(a, a);
  if (aa === 0) return null;
  // Column j of a aᵀ is a times a's number j.
  return [scale(a[0] / aa, a), scale(a[1] / aa, a)];
}

/**
 * The little square drawn where two lines meet at a right angle: its corners in order, starting at `corner`,
 * with sides `size` long along `a` and along `b`. Works in 2D or 3D. null if a or b has no length.
 */
export function rightAngleMark<V extends number[]>(corner: V, a: V, b: V, size: number): V[] | null {
  const la = Math.hypot(...a);
  const lb = Math.hypot(...b);
  if (la < TINY || lb < TINY) return null;
  const at = (s: number, t: number) => corner.map((c, i) => c + (s * a[i]) / la + (t * b[i]) / lb) as V;
  return [corner, at(size, 0), at(size, size), at(0, size)];
}

/** Everything a projection picture draws: the shadow, the error (v minus its shadow), and the right-angle mark. */
export interface ProjectionPicture<V> {
  projection: V;
  /** v − projection: the walk from the shadow up to v. Always at right angles to the line or plane. */
  error: V;
  /** The right-angle mark at the shadow, between the error and the line or plane. null when the error is ~0. */
  mark: V[] | null;
}

/** How big the right-angle mark is: 0.3, but never more than half the error, so it fits. */
function markSize(errorLength: number): number {
  return Math.min(0.3, errorLength / 2);
}

/**
 * The picture for projecting v onto the line through a. The mark sits at the shadow, with one side along the
 * line (pointing back towards the origin, or along a if the shadow is at the origin) and one along the error.
 * null when a = 0 (there is no line).
 */
export function projectionPicture(v: Vec2, a: Vec2): ProjectionPicture<Vec2> | null {
  const projection = projectOnto(v, a);
  if (!projection) return null;
  const error = sub(v, projection);
  const back = length(projection) > TINY ? scale(-1, projection) : a;
  const e = length(error);
  return { projection, error, mark: e < 0.01 ? null : rightAngleMark(projection, back, error, markSize(e)) };
}

/** The same picture in 3D, for projecting v onto the plane spanned by u and w. null when u and w are on one line. */
export function projectionPicture3(v: Vec3, u: Vec3, w: Vec3): ProjectionPicture<Vec3> | null {
  const projection = projectOntoPlane(v, u, w);
  if (!projection) return null;
  const error: Vec3 = [v[0] - projection[0] + 0, v[1] - projection[1] + 0, v[2] - projection[2] + 0];
  // A side along the plane: back towards the origin, or along u if the shadow is at the origin.
  const along = length3(projection) > TINY ? scale3(-1, projection) : u;
  const e = length3(error);
  return { projection, error, mark: e < 0.01 ? null : rightAngleMark(projection, along, error, markSize(e)) };
}

/** The best line b = C + D·t through some points (t, b), and the normal equations Aᵀ A x = Aᵀ b it came from. */
export interface LeastSquares {
  C: number;
  D: number;
  /** Aᵀ A = [[n, Σt], [Σt, Σt²]]. It is symmetric, so rows and columns are the same. */
  AtA: Mat2;
  /** Aᵀ b = (Σb, Σt·b). */
  Atb: Vec2;
}

/**
 * The line b = C + D·t that makes the sum of squared vertical errors smallest (least squares).
 * A has a row (1, t) for each point; solve Aᵀ A (C, D) = Aᵀ b. Points (1, 1), (2, 2), (3, 2) give C = 2/3, D = 1/2.
 * null when there are fewer than two different t values (then many lines fit equally well).
 */
export function leastSquaresLine(points: Vec2[]): LeastSquares | null {
  const n = points.length;
  const st = points.reduce((s, [t]) => s + t, 0);
  const stt = points.reduce((s, [t]) => s + t * t, 0);
  const sb = points.reduce((s, [, b]) => s + b, 0);
  const stb = points.reduce((s, [t, b]) => s + t * b, 0);
  const AtA: Mat2 = [[n, st], [st, stt]];
  const Atb: Vec2 = [sb, stb];
  if (n < 2 || Math.abs(det2(AtA)) < TINY) return null;
  const [C, D] = solve2(AtA, Atb)!;
  return { C: C + 0, D: D + 0, AtA, Atb };
}

/** For each point (t, b), the vertical error segment from the point to the line b = C + D·t. */
export function lineErrors(points: Vec2[], C: number, D: number): [Vec2, Vec2][] {
  return points.map(([t, b]) => [[t, b], [t, C + D * t]]);
}

/** Keep a dragged point inside a box: x between xs[0] and xs[1], y between ys[0] and ys[1]. */
export function clampToBox([x, y]: Vec2, xs: [number, number], ys: [number, number]): Vec2 {
  return [Math.min(xs[1], Math.max(xs[0], x)), Math.min(ys[1], Math.max(ys[0], y))];
}

/** The sum of squared vertical errors of the line b = C + D·t: the number least squares makes smallest. */
export function sumSquaredErrors(points: Vec2[], C: number, D: number): number {
  return points.reduce((s, [t, b]) => s + (b - C - D * t) ** 2, 0);
}

/**
 * Gram–Schmidt: turn independent vectors (any size, all the same length) into arrows 1 long and at right angles
 * that span the same space. Take each vector, remove its parts along the arrows already made, scale to length 1.
 * (1, 1), (1, 0) give (1/√2, 1/√2), (1/√2, −1/√2). null if the vectors are dependent (one becomes 0).
 */
export function gramSchmidt(vectors: number[][]): number[][] | null {
  const qs: number[][] = [];
  for (const v of vectors) {
    let w = [...v];
    for (const q of qs) {
      const along = w.reduce((s, x, i) => s + x * q[i], 0);
      w = w.map((x, i) => x - along * q[i]);
    }
    const len = Math.hypot(...w);
    if (len < 1e-9 * Math.max(1, Math.hypot(...v))) return null;
    qs.push(w.map((x) => x / len + 0));
  }
  return qs;
}

/** The steps of Gram–Schmidt on two 2D vectors, for the animation. */
export interface GramSchmidtSteps {
  /** v2's shadow on v1: the part of v2 that gets taken away. */
  projection: Vec2;
  /** v2 minus that shadow: at right angles to v1. */
  w2: Vec2;
  /** The final arrows, both 1 long. */
  q1: Vec2;
  q2: Vec2;
}

/** Gram–Schmidt on v1 and v2, keeping the in-between arrow. null when they lie on one line. */
export function gramSchmidtSteps(v1: Vec2, v2: Vec2): GramSchmidtSteps | null {
  const qs = gramSchmidt([v1, v2]);
  if (!qs) return null;
  const projection = projectOnto(v2, v1)!;
  return { projection, w2: sub(v2, projection), q1: qs[0] as Vec2, q2: qs[1] as Vec2 };
}

/**
 * Where the two arrows are at time t (0 to 1) of the 3-step animation:
 * step 1 (t to 1/3) keeps v1 and shows v2's shadow on it, step 2 (to 2/3) slides v2 down to w2 = v2 − shadow,
 * step 3 (to 1) shrinks or stretches both to length 1. null when v1 and v2 lie on one line.
 */
export function gramSchmidtAt(v1: Vec2, v2: Vec2, t: number): { a1: Vec2; a2: Vec2; step: number } | null {
  const s = gramSchmidtSteps(v1, v2);
  if (!s) return null;
  const step = currentStep(3, t);
  const local = easeInOut(Math.min(1, Math.max(0, t * 3 - step)));
  if (step === 0) return { a1: v1, a2: v2, step };
  if (step === 1) return { a1: v1, a2: lerpVec(v2, s.w2, local), step };
  return { a1: lerpVec(v1, s.q1, local), a2: lerpVec(s.w2, s.q2, local), step };
}

/**
 * true when m is orthogonal: its columns are 1 long and at right angles (Qᵀ Q = I).
 * Such a matrix is a rotation or a flip: it keeps every length and every angle. A shear is not one.
 */
export function isOrthogonalMatrix(m: Mat2, tolerance = 1e-9): boolean {
  const [c1, c2] = m;
  return (
    Math.abs(dot(c1, c1) - 1) < tolerance && Math.abs(dot(c2, c2) - 1) < tolerance && Math.abs(dot(c1, c2)) < tolerance
  );
}

// ---- Module 8: eigenvectors and eigenvalues ----

/**
 * The characteristic polynomial of A: det(A − λI) = λ² − trace·λ + det.
 * trace is the diagonal added up (top-left + bottom-right). For columns (2, 1), (2, 3): λ² − 5λ + 4.
 */
export function charPoly2(m: Mat2): { trace: number; det: number } {
  return { trace: m[0][0] + m[1][1], det: det2(m) };
}

/** The characteristic polynomial worked out at one λ. It is 0 exactly at the eigenvalues. */
export function charPolyAt(m: Mat2, lambda: number): number {
  const { trace, det } = charPoly2(m);
  return lambda * lambda - trace * lambda + det;
}

/** A − λI: A with λ taken off both diagonal numbers. */
export function shiftByLambda(m: Mat2, lambda: number): Mat2 {
  return [[m[0][0] - lambda, m[0][1]], [m[1][0], m[1][1] - lambda]];
}

/**
 * The mean-product trick: m = trace / 2 (the mean of the two eigenvalues) and p = det (their product),
 * so λ = m ± √(m² − p). `gap` is m² − p and `root` is √gap: below 0 there are no real eigenvalues (lambdas is null).
 * The bigger λ comes first. Columns (8, 2), (4, 6): m = 7, p = 40, λ = 10 and 4.
 */
export function meanProduct(a: Mat2): { m: number; p: number; gap: number; root: number; lambdas: [number, number] | null } {
  const { trace, det } = charPoly2(a);
  const m = trace / 2;
  const gap = m * m - det;
  // A gap that is 0 up to rounding (like 1e-16) is a repeated eigenvalue, not "no real ones".
  const g = Math.abs(gap) < TINY ? 0 : gap;
  if (g < 0) return { m, p: det, gap, root: NaN, lambdas: null };
  const r = Math.sqrt(g);
  return { m, p: det, gap: g, root: r, lambdas: [m + r + 0, m - r + 0] };
}

/** One eigenvalue with its eigenvector direction: A · direction = lambda · direction. */
export interface EigenPair {
  lambda: number;
  direction: Vec2;
}

/**
 * What the eigenvalues of a 2x2 matrix look like. Three kinds:
 * - 'lines': one or two eigenvalues, each with the one line of vectors that stays put (biggest λ first).
 *   A shear has only one.
 * - 'every': A = λI, so every vector is an eigenvector (with that one λ).
 * - 'none': no real eigenvalues; the roots are re ± im·i (a rotation, for example).
 */
export type Eigen =
  | { kind: 'lines'; pairs: EigenPair[] }
  | { kind: 'every'; lambda: number }
  | { kind: 'none'; re: number; im: number };

/**
 * A tidy arrow along the line that (A − λI) squashes to 0. It points up (or right, if flat),
 * and its smallest non-zero number is 1 long, so whole-number answers look like (−1, 1), not (−0.71, 0.71).
 */
function nullDirection(b: Mat2): Vec2 {
  // The rows of A − λI. Any arrow at right angles to a non-zero row is squashed to 0.
  const rows: Vec2[] = [[b[0][0], b[1][0]], [b[0][1], b[1][1]]];
  const [x, y] = length(rows[0]) >= length(rows[1]) ? rows[0] : rows[1];
  let d: Vec2 = [-y, x];
  d = d.map((n) => (Math.abs(n) < TINY * 1e3 ? 0 : n)) as Vec2;
  if (d[1] < 0 || (d[1] === 0 && d[0] < 0)) d = [-d[0], -d[1]];
  const sizes = d.filter((n) => n !== 0).map(Math.abs);
  // Make the smallest number 1, unless that would make the other one huge (then make the biggest 1).
  const k = Math.max(...sizes) / Math.min(...sizes) > 10 ? Math.max(...sizes) : Math.min(...sizes);
  return [d[0] / k + 0, d[1] / k + 0];
}

export function eig2(a: Mat2): Eigen {
  const { m, gap, lambdas } = meanProduct(a);
  if (!lambdas) return { kind: 'none', re: m, im: Math.sqrt(-gap) };
  if (lambdas[0] === lambdas[1]) {
    const b = shiftByLambda(a, m);
    if (b.flat().every((n) => Math.abs(n) < TINY)) return { kind: 'every', lambda: m };
    return { kind: 'lines', pairs: [{ lambda: m, direction: nullDirection(b) }] };
  }
  return { kind: 'lines', pairs: lambdas.map((lambda) => ({ lambda, direction: nullDirection(shiftByLambda(a, lambda)) })) };
}

/**
 * Is A·v still on v's line, to within `degrees`? Then v is (nearly) an eigenvector: give back how much A
 * stretched it along the line (λ; negative means flipped). null when A knocks v off its line, or v = 0.
 * A·v = 0 counts as staying on the line, with λ = 0.
 */
export function stretchAlongLine(a: Mat2, v: Vec2, degrees = 1): number | null {
  const vv = dot(v, v);
  if (vv < TINY) return null;
  const av = matVec(a, v);
  const along = dot(av, v) / vv;
  if (length(av) < TINY) return 0;
  return lineAngle(v, av) <= degrees ? along + 0 : null;
}

/** The angle between the lines through v and w, in degrees: 0 (same line) to 90 (at right angles). */
export function lineAngle(v: Vec2, w: Vec2): number {
  const a = angleBetween(v, w);
  if (a === null) return 0;
  return Math.min(a, 180 - a);
}

/**
 * Which eigen-line (an index into eigen.pairs) the arrow v is within `degrees` of, or null.
 * With kind 'every', every arrow is on an eigen-line, so the answer is always 0.
 */
export function nearEigenLine(eigen: Eigen, v: Vec2, degrees = 1.5): number | null {
  if (length(v) < TINY) return null;
  if (eigen.kind === 'every') return 0;
  if (eigen.kind === 'none') return null;
  const i = eigen.pairs.findIndex((p) => lineAngle(v, p.direction) <= degrees);
  return i === -1 ? null : i;
}

/** A point on the unit circle, `degrees` anticlockwise from the x-axis. The probe in EigenProbe sweeps this. */
export function unitAt(degrees: number): Vec2 {
  const r = (degrees * Math.PI) / 180;
  return [Math.cos(r) + 0, Math.sin(r) + 0];
}

/**
 * A = P D P⁻¹, with A's eigenvectors as the columns of P and the eigenvalues down the diagonal of D.
 * In the eigenbasis, A just stretches each axis. null when there aren't two independent eigenvectors
 * (a shear, or no real eigenvalues). For A = λI, P = I and D = A.
 */
export function diagonalize(a: Mat2): { P: Mat2; D: Mat2 } | null {
  const eigen = eig2(a);
  if (eigen.kind === 'every') return { P: identity(), D: a };
  if (eigen.kind === 'none' || eigen.pairs.length < 2) return null;
  const [e1, e2] = eigen.pairs;
  return { P: [e1.direction, e2.direction], D: [[e1.lambda, 0], [0, e2.lambda]] };
}

/** Aⁿ the slow way: A times A times A …, n times. A⁰ = I. */
export function repeatMultiply(a: Mat2, n: number): Mat2 {
  let result = identity();
  for (let i = 0; i < n; i++) result = matMul(a, result);
  return result;
}

/**
 * Aⁿ the fast way: P Dⁿ P⁻¹. Dⁿ is easy, it is just each λ to the power n.
 * Falls back to repeatMultiply when A can't be diagonalized. n is a whole number, 0 or more.
 */
export function matPow(a: Mat2, n: number): Mat2 {
  const parts = powerParts(a, n);
  return parts ? matMul(parts.P, matMul(parts.Dn, parts.Pinv)) : repeatMultiply(a, n);
}

/** The three pieces of Aⁿ = P Dⁿ P⁻¹, for showing them. null when A can't be diagonalized. */
export function powerParts(a: Mat2, n: number): { P: Mat2; Dn: Mat2; Pinv: Mat2 } | null {
  const parts = diagonalize(a);
  const Pinv = parts && inverse2(parts.P);
  if (!parts || !Pinv) return null;
  return { P: parts.P, Dn: [[parts.D[0][0] ** n + 0, 0], [0, parts.D[1][1] ** n + 0]], Pinv };
}

/** v, Av, A²v, …, Aⁿv: where v goes when A is applied again and again (n + 1 points). */
export function powerTrail(a: Mat2, v: Vec2, n: number): Vec2[] {
  const trail: Vec2[] = [v];
  for (let i = 0; i < n; i++) trail.push(matVec(a, trail[i]));
  return trail;
}

/** The smallest range (a whole number, at least `min`) that fits every point on a square plane. */
export function fitRange(points: Vec2[], min = 3): number {
  const biggest = Math.max(0, ...points.flatMap(([x, y]) => [Math.abs(x), Math.abs(y)]));
  // A quarter extra, so the label at the arrow tip stays inside the picture.
  return Math.max(min, Math.ceil(biggest * 1.25));
}

/** The direction of v, in degrees anticlockwise from the x-axis: 0 up to (not including) 360. */
export function angleOf(v: Vec2): number {
  const deg = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg + 0;
}

/**
 * If v is within `degrees` of an eigen-line, the arrow 1 long along that line, on v's side of the origin
 * (for snapping a dragged probe exactly onto the line). Otherwise null. Never snaps for kind 'every' or 'none'.
 */
export function snapToEigenLine(eigen: Eigen, v: Vec2, degrees = 3): Vec2 | null {
  if (eigen.kind !== 'lines') return null;
  const i = nearEigenLine(eigen, v, degrees);
  if (i === null) return null;
  const d = normalize(eigen.pairs[i].direction);
  return dot(d, v) >= 0 ? d : [-d[0] + 0, -d[1] + 0];
}

/**
 * Arrows from the origin for the "whole plane moves" picture: `count` of them evenly round the circle,
 * plus one along each of `extra` (both ways), all `size` long. Each is a two-point line [origin, tip].
 */
export function spokes(count: number, size: number, extra: Vec2[] = []): Vec2[][] {
  const tips = Array.from({ length: count }, (_, k) => scale(size, unitAt((360 * k) / count)));
  for (const d of extra) {
    const u = normalize(d);
    tips.push(scale(size, u), scale(-size, u));
  }
  return tips.map((tip) => [[0, 0], tip]);
}

/** x, moved exactly onto the nearest of `targets` when it is within `within` of it (for a slider that "clicks" into place). */
export function snapNear(x: number, targets: number[], within: number): number {
  const near = targets.filter((t) => Math.abs(t - x) <= within).sort((p, q) => Math.abs(p - x) - Math.abs(q - x));
  return near.length ? near[0] : x;
}

/** The lowest and highest value of the characteristic polynomial for λ from lo to hi (sampled), for sizing its graph. */
export function charPolyWindow(m: Mat2, [lo, hi]: [number, number]): [number, number] {
  const values = Array.from({ length: 101 }, (_, k) => charPolyAt(m, lo + ((hi - lo) * k) / 100));
  // The vertex (λ = trace / 2) is the lowest point, so include it if it is in range.
  const mid = charPoly2(m).trace / 2;
  if (mid >= lo && mid <= hi) values.push(charPolyAt(m, mid));
  return [Math.min(...values), Math.max(...values)];
}

/**
 * The same trail as powerTrail, written in the eigenbasis (the eigenvectors are the axes).
 * There each step just multiplies the first number by λ₁ and the second by λ₂.
 * null when A can't be diagonalized.
 */
export function eigenTrail(a: Mat2, v: Vec2, n: number): Vec2[] | null {
  const parts = diagonalize(a);
  if (!parts) return null;
  const start = toHerCoords(parts.P, v);
  if (!start) return null;
  const [l1, l2] = [parts.D[0][0], parts.D[1][1]];
  return Array.from({ length: n + 1 }, (_, k) => [start[0] * l1 ** k + 0, start[1] * l2 ** k + 0] as Vec2);
}

/** A tidy gap between grid lines for a plane that shows −range to range: 1, 2, 5, 10, 20, 50 … (about 5 lines a side). */
export function niceGridStep(range: number): number {
  for (let size = 1; ; size *= 10) {
    for (const k of [1, 2, 5]) if (range / (k * size) <= 6) return k * size;
  }
}
