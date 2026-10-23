// Practice questions for Module 8 (Eigenvectors and eigenvalues): part 1 (8.1–8.4) and part 2 (8.5–8.6). Same idea as the other module files:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
import {
  charPoly2,
  charPolyAt,
  det2,
  eig2,
  inverse2,
  matMul,
  matPow,
  matVec,
  meanProduct,
  quadForm,
  scale,
  svd2,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import { matTex, pick, randInt, vecTex, type Generator, type Rand } from './exercise';

/**
 * A random matrix with whole numbers (each at most 9 in size) and two different whole-number eigenvalues.
 * It is built as P D P⁻¹ with det P = ±1, so P⁻¹ has whole numbers too.
 */
function niceMatrix(rand: Rand): Mat2 {
  const P: Mat2 = [[randInt(rand, -2, 2), randInt(rand, -2, 2)], [randInt(rand, -2, 2), randInt(rand, -2, 2)]];
  const inv = Math.abs(det2(P)) === 1 ? inverse2(P) : null;
  const l1 = randInt(rand, -3, 6);
  const l2 = randInt(rand, -3, 6);
  if (!inv || l1 === l2) return niceMatrix(rand);
  const A = matMul(P, matMul([[l1, 0], [0, l2]], inv)).map((c) => c.map((n) => Math.round(n) + 0)) as Mat2;
  return A.flat().every((n) => Math.abs(n) <= 9) ? A : niceMatrix(rand);
}

/** One eigenvalue of a niceMatrix with its eigenvector, picked at random. null unless the eigenvector has whole numbers. */
function wholePair(rand: Rand, A: Mat2): { lambda: number; direction: Vec2 } | null {
  const e = eig2(A);
  if (e.kind !== 'lines') return null;
  const pair = pick(rand, e.pairs);
  return pair.direction.every(Number.isInteger) ? pair : null;
}

/** The two eigenvalues of a niceMatrix, bigger first. */
function lambdasOf(A: Mat2): [number, number] {
  return meanProduct(A).lambdas!;
}

const BOTH = ['bigger λ', 'smaller λ'];

export const module8: Record<string, Generator> = {
  // ---------- 8.1 Vectors that stay on their line ----------
  '8.1-lambda': (rand) => {
    // Columns (a, 0) and (b, d): (b, d − a) is an eigenvector, with λ = d.
    const a = randInt(rand, -3, 4);
    const d = randInt(rand, -3, 4);
    const b = randInt(rand, -3, 3, true);
    if (a === d) return module8['8.1-lambda'](rand);
    const A: Mat2 = [[a, 0], [b, d]];
    const v: Vec2 = [b, d - a];
    return {
      text: `$A = ${matTex(A)}$ keeps $\\vec{v} = ${vecTex(v)}$ on its own line. Work out $A\\vec{v}$: by what number $\\lambda$ is $\\vec{v}$ stretched?`,
      answer: d,
    };
  },

  '8.1-av': (rand) => {
    const A = niceMatrix(rand);
    const pair = wholePair(rand, A);
    if (!pair) return module8['8.1-av'](rand);
    const { lambda, direction } = pair;
    const v = scale(pick(rand, [-2, -1, 1, 2]), direction);
    return {
      text: `$\\vec{v} = ${vecTex(v)}$ is an eigenvector of $A = ${matTex(A)}$ with $\\lambda = ${lambda}$. Without multiplying out, what is $A\\vec{v}$? (Then check by multiplying.)`,
      answer: matVec(A, v),
    };
  },

  '8.1-shear': (rand) => {
    const a = randInt(rand, 2, 5); // a positive stretch, so "a stretch by 3" reads naturally
    const b = randInt(rand, -3, 3, true);
    const A: Mat2 = [[a, 0], [b, a]];
    return {
      text: `$A = ${matTex(A)}$ is a stretch by ${a} followed by a shear. It has only one eigenvalue. What is it?`,
      answer: meanProduct(A).m,
    };
  },

  // ---------- 8.2 det(A − λI) = 0 ----------
  '8.2-det-at': (rand) => {
    const A = niceMatrix(rand);
    const lambda = randInt(rand, -2, 4);
    return {
      text: `$A = ${matTex(A)}$. Work out $\\det(A - ${lambda < 0 ? `(${lambda})` : lambda}I)$.`,
      answer: charPolyAt(A, lambda),
    };
  },

  '8.2-poly': (rand) => {
    const A = niceMatrix(rand);
    const { trace, det } = charPoly2(A);
    return {
      text: `$A = ${matTex(A)}$. Its characteristic polynomial is $\\lambda^2 - b\\lambda + c$. What are $b$ (the trace) and $c$ (the determinant)?`,
      answer: [trace, det],
      labels: ['b', 'c'],
    };
  },

  '8.2-roots': (rand) => {
    const A = niceMatrix(rand);
    return {
      text: `Solve $\\det(A - \\lambda I) = 0$ for $A = ${matTex(A)}$. What are its two eigenvalues?`,
      answer: lambdasOf(A),
      labels: BOTH,
    };
  },

  // ---------- 8.3 The mean-product trick ----------
  '8.3-mp': (rand) => {
    const A = niceMatrix(rand);
    const { m, p } = meanProduct(A);
    return {
      text: `$A = ${matTex(A)}$. Read off $m$ (the mean of the diagonal) and $p$ (the determinant).`,
      answer: [m, p],
      labels: ['m', 'p'],
    };
  },

  '8.3-lambdas': (rand) => {
    const A = niceMatrix(rand);
    return {
      text: `Use $\\lambda = m \\pm \\sqrt{m^2 - p}$ to find the eigenvalues of $A = ${matTex(A)}$.`,
      answer: lambdasOf(A),
      labels: BOTH,
    };
  },

  '8.3-from-mp': (rand) => {
    // Pick the eigenvalues first, then give only their mean and product.
    const l1 = randInt(rand, -3, 8);
    const l2 = randInt(rand, -3, 8);
    if (l1 === l2) return module8['8.3-from-mp'](rand);
    const m = (l1 + l2) / 2;
    const p = l1 * l2;
    return {
      text: `A matrix has $m = ${m}$ and $p = ${p}$. What are its eigenvalues?`,
      answer: [Math.max(l1, l2), Math.min(l1, l2)],
      labels: BOTH,
    };
  },

  // ---------- 8.4 Diagonalization and powers ----------
  '8.4-eigen-power': (rand) => {
    const A = niceMatrix(rand);
    const pair = wholePair(rand, A);
    if (!pair) return module8['8.4-eigen-power'](rand);
    const { lambda, direction } = pair;
    const n = randInt(rand, 2, 4);
    return {
      text: `$\\vec{v} = ${vecTex(direction)}$ is an eigenvector of $A = ${matTex(A)}$ with $\\lambda = ${lambda}$. What is $A^{${n}}\\vec{v}$?`,
      answer: matVec(matPow(A, n), direction).map(Math.round),
    };
  },

  '8.4-diagonal': (rand) => {
    const a = pick(rand, [-2, -1, 2, 3]);
    const d = pick(rand, [-2, -1, 2, 3]);
    const n = randInt(rand, 2, 5);
    return {
      text: `$D = ${matTex([[a, 0], [0, d]])}$. What are the two diagonal numbers of $D^{${n}}$ (top-left, then bottom-right)?`,
      answer: [a ** n, d ** n],
      labels: ['top-left', 'bottom-right'],
    };
  },

  '8.4-fibonacci': (rand) => {
    const n = randInt(rand, 8, 16);
    return {
      text: `$F = ${matTex([[1, 1], [1, 0]])}$ turns $(F_{k+1}, F_k)$ into $(F_{k+2}, F_{k+1})$, starting from $(F_1, F_0) = (1, 0)$. Use it (or the PowerView above) to find $F_{${n}}$.`,
      answer: Math.round(matPow([[1, 1], [1, 0]], n)[1][0]),
    };
  },

  // ---------- 8.5 Symmetric matrices and quadratic forms ----------
  '8.5-quadform': (rand) => {
    const b = randInt(rand, -3, 3);
    const A: Mat2 = [[randInt(rand, -3, 4), b], [b, randInt(rand, -3, 4)]];
    const x: Vec2 = [randInt(rand, -2, 2, true), randInt(rand, -2, 2, true)];
    return {
      text: `$A = ${matTex(A)}$ and $\\vec{x} = ${vecTex(x)}$. Work out $\\vec{x}^{T} A \\vec{x}$ (first $A\\vec{x}$, then its dot product with $\\vec{x}$).`,
      answer: quadForm(A, x),
    };
  },

  '8.5-eigen-axes': (rand) => {
    // Columns (a, b), (b, a): the axes are (1, 1) with λ = a + b and (1, −1) with λ = a − b.
    const a = randInt(rand, -2, 5);
    const b = randInt(rand, 1, 4) * pick(rand, [1, -1]);
    const A: Mat2 = [[a, b], [b, a]];
    return {
      text: `The level curves of $\\vec{x}^{T} A \\vec{x}$ for $A = ${matTex(A)}$ have their axes along $(1, 1)$ and $(1, -1)$, its eigenvectors. What is the eigenvalue along each?`,
      // For an eigenvector q, xᵀAx at q is λ·|q|², and |(1, ±1)|² = 2.
      answer: [quadForm(A, [1, 1]) / 2, quadForm(A, [1, -1]) / 2],
      labels: ['along (1, 1)', 'along (1, −1)'],
    };
  },

  '8.5-trough': (rand) => {
    // Columns (1, b), (b, d): det = d − b². A bowl needs det > 0, so at d = b² it just becomes a trough.
    const b = randInt(rand, -4, 4, true);
    return {
      text: `$A = \\begin{bmatrix} 1 & ${b} \\\\ ${b} & d \\end{bmatrix}$. For $d$ bigger than some number, $\\vec{x}^{T} A \\vec{x}$ is a bowl (positive definite); below it, a saddle. At exactly that number it is a trough (one eigenvalue is 0). What is it?`,
      answer: b * b,
      note: 'Hint: an eigenvalue is 0 exactly when det A = 0.',
    };
  },

  // ---------- 8.6 SVD: every matrix turns a circle into an ellipse ----------
  '8.6-diagonal': (rand) => {
    const p = randInt(rand, -6, 6, true);
    const q = randInt(rand, -6, 6, true);
    if (Math.abs(p) === Math.abs(q)) return module8['8.6-diagonal'](rand);
    const A: Mat2 = [[p, 0], [0, q]];
    return {
      text: `$A = ${matTex(A)}$ turns the unit circle into an ellipse. How long are its two half-axes, $\\sigma_1$ (the longer) and $\\sigma_2$?`,
      answer: svd2(A).sigma,
      labels: ['σ₁', 'σ₂'],
      note: 'A minus sign flips, but lengths are never negative.',
    };
  },

  '8.6-scaled-rotation': (rand) => {
    // Columns (a, b), (−b, a) = √(a² + b²) times a rotation: the circle stays a circle.
    const [a, b] = pick(rand, [[3, 4], [4, 3], [6, 8], [5, 12], [8, 6], [0, 2], [2, 0]] as Vec2[]).map(
      (n) => n * pick(rand, [1, -1]),
    );
    const A: Mat2 = [[a + 0, b + 0], [-b + 0, a + 0]];
    return {
      text: `What are $\\sigma_1$ and $\\sigma_2$ for $A = ${matTex(A)}$? (Hint: the columns have the same length and are at right angles.)`,
      answer: svd2(A).sigma,
      labels: ['σ₁', 'σ₂'],
    };
  },

  '8.6-rank-one': (rand) => {
    // Columns c·u and k·u, both on u's line: the ellipse flattens to a segment of half-length |u|·|(c, k)|.
    const u = pick(rand, [[3, 4], [4, 3], [1, 0], [0, 1], [-3, 4]] as Vec2[]);
    const [c, k] = pick(rand, [[3, 4], [4, -3], [1, 0], [0, 2], [2, 0], [-1, 0]] as Vec2[]);
    const A: Mat2 = [scale(c, u), scale(k, u)].map((col) => col.map((n) => n + 0)) as Mat2;
    return {
      text: `Both columns of $A = ${matTex(A)}$ lie on one line, so the unit circle is squashed flat. What are $\\sigma_1$ and $\\sigma_2$?`,
      answer: svd2(A).sigma,
      labels: ['σ₁', 'σ₂'],
    };
  },
};
