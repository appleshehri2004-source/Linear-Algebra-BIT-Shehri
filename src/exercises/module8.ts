// Practice questions for Module 8 part 1 (Eigenvectors and eigenvalues). Same idea as the other module files:
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
  scale,
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
};
