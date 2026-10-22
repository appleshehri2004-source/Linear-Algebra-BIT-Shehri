// All the math for the site lives here. Components call these functions
// and never compute math themselves.

/** A 2D vector [x, y]. */
export type Vec2 = [number, number];

/** A 2x2 matrix stored as its columns: [ihat, jhat]. */
export type Mat2 = [Vec2, Vec2];

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
