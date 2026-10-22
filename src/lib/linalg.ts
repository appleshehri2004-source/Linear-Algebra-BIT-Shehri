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
