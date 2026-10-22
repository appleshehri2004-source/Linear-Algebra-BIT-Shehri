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
