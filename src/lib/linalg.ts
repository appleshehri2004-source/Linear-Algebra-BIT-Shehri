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
