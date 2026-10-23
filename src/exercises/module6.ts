// Practice questions for Module 6 (Orthogonality). Same idea as the other module files:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
// Answers may be fractions: the answer box accepts "1/2" as well as "0.5".
import {
  dot3,
  gramSchmidtSteps,
  isIndependent,
  leastSquaresLine,
  length,
  matVec,
  projectionMatrix,
  projectOnto,
  projectOntoPlane,
  sumSquaredErrors,
  type Vec2,
  type Vec3,
} from '../lib/linalg';
import { matTex, pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** A random 3D vector with whole-number parts from -limit to limit. */
function randVec3(rand: Rand, limit = 3): Vec3 {
  return [randInt(rand, -limit, limit), randInt(rand, -limit, limit), randInt(rand, -limit, limit)];
}

/** Three points (t, b) at t = 0, 1, 2 with whole-number heights from 0 to 4. */
function threePoints(rand: Rand): Vec2[] {
  return [0, 1, 2].map((t) => [t, randInt(rand, 0, 4)]);
}

/** "(0, 1), (1, 3), (2, 2)" in TeX. */
function pointsTex(points: Vec2[]): string {
  return points.map(([t, b]) => `$(${t}, ${b})$`).join(', ');
}

/** Two planes through the origin, each given by two arrows that span it, with a description. */
const PLANES: { name: string; u: Vec3; w: Vec3 }[] = [
  { name: 'the floor (the xy-plane), spanned by $(1, 0, 0)$ and $(0, 1, 0)$', u: [1, 0, 0], w: [0, 1, 0] },
  { name: 'the xz-plane, spanned by $(1, 0, 0)$ and $(0, 0, 1)$', u: [1, 0, 0], w: [0, 0, 1] },
  { name: 'the plane spanned by $(1, 1, 0)$ and $(0, 0, 1)$', u: [1, 1, 0], w: [0, 0, 1] },
];

/** Whole-number right triangles: 3-4-5 and 5-12-13 (and the legs swapped). */
const TRIPLES: [number, number, number][] = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13]];

export const module6: Record<string, Generator> = {
  // ---------- 6.1 Orthogonal vectors and subspaces ----------
  '6.1-make-perpendicular': (rand) => {
    // (a, b) · (k, c) = a·k + b·c = 0, so k = −b·c / a.
    const a = randInt(rand, -4, 4, true);
    const b = randInt(rand, -4, 4, true);
    const c = randInt(rand, -4, 4, true);
    return {
      text: `For which number $k$ is $${vecTex([a, b])}$ perpendicular to $\\begin{bmatrix} k \\\\ ${c} \\end{bmatrix}$? (A fraction like 3/2 is fine.)`,
      answer: (-b * c) / a,
    };
  },

  '6.1-dot3': (rand) => {
    const u = randVec3(rand);
    // Half the time, pick w so the answer is 0: they really are perpendicular.
    const w: Vec3 = rand() < 0.5 ? randVec3(rand) : [u[1], -u[0], 0];
    return {
      text: `Work out $${vecTex(u)} \\cdot ${vecTex(w)}$. (If it is 0, the two arrows are perpendicular.)`,
      answer: dot3(u, w),
    };
  },

  '6.1-null-space': (rand) => {
    // Rows (a, b) and (2a, 2b). The null space is the line through (x, 1) with a·x + b = 0: perpendicular to the rows.
    const a = randInt(rand, -4, 4, true);
    const b = randInt(rand, -4, 4, true);
    return {
      text:
        `The matrix $${matTex([[a, 2 * a], [b, 2 * b]])}$ has rows $(${a}, ${b})$ and $(${2 * a}, ${2 * b})$. ` +
        `Its null space is the line through $\\begin{bmatrix} x \\\\ 1 \\end{bmatrix}$, perpendicular to the rows. What is $x$?`,
      answer: -b / a,
    };
  },

  // ---------- 6.2 Projections ----------
  '6.2-onto-line': (rand) => {
    const a = randVec(rand, 3);
    const v = randVec(rand, 4);
    return {
      text: `Project $\\vec{v} = ${vecTex(v)}$ onto the line through $\\vec{a} = ${vecTex(a)}$. (Fractions are fine.)`,
      answer: projectOnto(v, a)!,
    };
  },

  '6.2-matrix': (rand) => {
    const a = randVec(rand, 3);
    return {
      text:
        `The projection matrix onto the line through $\\vec{a} = ${vecTex(a)}$ is $P = \\dfrac{\\vec{a}\\vec{a}^T}{\\vec{a}^T\\vec{a}}$. ` +
        `What is its **first column**? (Fractions are fine.)`,
      answer: projectionMatrix(a)![0],
      labels: ['top', 'bottom'],
    };
  },

  '6.2-onto-plane': (rand) => {
    const { name, u, w } = pick(rand, PLANES);
    const v = randVec3(rand, 4);
    return {
      text: `Project $${vecTex(v)}$ onto ${name}.`,
      answer: projectOntoPlane(v, u, w)!,
    };
  },

  // ---------- 6.3 Least squares ----------
  '6.3-normal': (rand) => {
    const points = threePoints(rand);
    return {
      text:
        `Fit a line $b = C + Dt$ to the points ${pointsTex(points)}. In the normal equations $A^TA\\,x = A^Tb$, ` +
        `what is $A^Tb$? (Its top number is $\\Sigma b$, its bottom number $\\Sigma t\\,b$.)`,
      answer: leastSquaresLine(points)!.Atb,
      labels: ['top', 'bottom'],
    };
  },

  '6.3-fit': (rand) => {
    const points = threePoints(rand);
    const fit = leastSquaresLine(points)!;
    return {
      text: `Find the best line $b = C + Dt$ through ${pointsTex(points)}. (Fractions are fine.)`,
      answer: [fit.C, fit.D],
      labels: ['C', 'D'],
    };
  },

  '6.3-error': (rand) => {
    const points = threePoints(rand);
    const C = randInt(rand, 0, 3);
    const D = randInt(rand, -1, 1);
    return {
      text: `For the line $b = ${C} + ${D === -1 ? '(-1)' : D}t$ and the points ${pointsTex(points)}, what is the sum of the squared vertical errors?`,
      answer: sumSquaredErrors(points, C, D),
    };
  },

  // ---------- 6.4 Gram–Schmidt and orthogonal matrices ----------
  '6.4-gram-schmidt': (rand) => {
    let v1 = randVec(rand, 3);
    let v2 = randVec(rand, 3);
    while (!isIndependent(v1, v2)) [v1, v2] = [randVec(rand, 3), randVec(rand, 3)];
    return {
      text:
        `Gram–Schmidt on $\\vec{v}_1 = ${vecTex(v1)}$ and $\\vec{v}_2 = ${vecTex(v2)}$: keep $\\vec{v}_1$, then take away ` +
        `$\\vec{v}_2$'s shadow on $\\vec{v}_1$. What is $\\vec{w}_2 = \\vec{v}_2 - (\\text{shadow})$, before scaling? (Fractions are fine.)`,
      answer: gramSchmidtSteps(v1, v2)!.w2,
    };
  },

  '6.4-missing': (rand) => {
    // Columns (p/r, q/r) and (x, p/r) are 1 long and at right angles when x = −q/r.
    const [p, q, r] = pick(rand, TRIPLES);
    return {
      text:
        `For which $x$ is $Q = \\begin{bmatrix} ${p}/${r} & x \\\\ ${q}/${r} & ${p}/${r} \\end{bmatrix}$ an orthogonal matrix ` +
        `(columns 1 long and at right angles)? (A fraction is fine.)`,
      answer: -q / r,
    };
  },

  '6.4-shear-length': (rand) => {
    const k = randInt(rand, -3, 3, true);
    const shear: [Vec2, Vec2] = [[1, 0], [k, 1]];
    return {
      text:
        `The shear $${matTex(shear)}$ moves $\\hat{\\jmath} = ${vecTex([0, 1])}$. How long is $\\hat{\\jmath}$ afterwards? ` +
        `(It was 1, so this shear is not orthogonal.) Round to 2 decimal places.`,
      answer: length(matVec(shear, [0, 1])),
    };
  },
};
