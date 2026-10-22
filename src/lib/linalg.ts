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
  return a * d - b * c;
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
