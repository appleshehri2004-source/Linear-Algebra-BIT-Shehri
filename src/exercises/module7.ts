// Practice questions for Module 7 (Change of basis). Same idea as the other module files:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
// Answers may be fractions: the answer box accepts "5/3" as well as "1.67".
import { changeOfBasisMatrix, det2, matVec, toHerCoords, toOurCoords, type Mat2 } from '../lib/linalg';
import { matTex, pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** A random basis [b1, b2] with whole numbers from -3 to 3 whose determinant is one of `dets`. */
function basisWithDet(rand: Rand, dets: number[]): Mat2 {
  const P: Mat2 = [randVec(rand, 3), randVec(rand, 3)];
  return dets.includes(det2(P)) ? P : basisWithDet(rand, dets);
}

/** A few transformations with names, written in our numbers. */
const MOVES: { name: string; m: Mat2 }[] = [
  { name: 'turns everything 90° anticlockwise', m: [[0, 1], [-1, 0]] },
  { name: 'shears: î stays, ĵ moves to (1, 1)', m: [[1, 0], [1, 1]] },
  { name: 'flips everything across the x-axis', m: [[1, 0], [0, -1]] },
  { name: 'stretches x by 2', m: [[2, 0], [0, 1]] },
];

/** "b₁ = (2, 1) and b₂ = (−1, 1)" in TeX. */
function basisTex([b1, b2]: Mat2): string {
  return `$\\vec{b}_1 = ${vecTex(b1)}$ and $\\vec{b}_2 = ${vecTex(b2)}$`;
}

export const module7: Record<string, Generator> = {
  // ---------- 7.1 Jennifer's grid ----------
  '7.1-to-ours': (rand) => {
    const P = basisWithDet(rand, [-3, -2, -1, 1, 2, 3]);
    const her = randVec(rand, 3);
    return {
      text: `Jennifer's basis is ${basisTex(P)}. She writes a vector as $${vecTex(her)}$. What is it in our numbers?`,
      answer: toOurCoords(P, her),
    };
  },

  '7.1-to-hers': (rand) => {
    const P = basisWithDet(rand, [-3, -2, -1, 1, 2, 3]);
    const ours = randVec(rand, 4);
    return {
      text: `Jennifer's basis is ${basisTex(P)}. What is our vector $${vecTex(ours)}$ in her numbers? (Fractions like 5/3 are fine.)`,
      // basisWithDet never gives determinant 0, so her numbers always exist.
      answer: toHerCoords(P, ours)!,
    };
  },

  '7.1-not-basis': (rand) => {
    // b1 = (k, a) and b2 = (c, d) line up when k·d − c·a = 0, so k = c·a / d.
    const a = randInt(rand, -3, 3, true);
    const c = randInt(rand, -3, 3, true);
    const d = pick(rand, [-2, -1, 1, 2]);
    return {
      text:
        `For which number $k$ are $\\begin{bmatrix} k \\\\ ${a} \\end{bmatrix}$ and $${vecTex([c, d])}$ **not** a basis ` +
        `(they lie on one line)? (A fraction like 3/2 is fine.)`,
      answer: (c * a) / d,
    };
  },

  // ---------- 7.2 The same transformation, her point of view ----------
  '7.2-column': (rand) => {
    const P = basisWithDet(rand, [-1, 1]);
    const { name, m } = pick(rand, MOVES);
    const her = changeOfBasisMatrix(P, m)!;
    return {
      text:
        `Jennifer's basis is ${basisTex(P)}. In our numbers, $M = ${matTex(m)}$ ${name}. ` +
        `What is the **first column** of her matrix $P^{-1} M P$?`,
      answer: her[0],
      labels: ['top', 'bottom'],
    };
  },

  '7.2-apply': (rand) => {
    const P = basisWithDet(rand, [-1, 1]);
    const { name, m } = pick(rand, MOVES);
    const x = randVec(rand, 2);
    return {
      text:
        `Jennifer's basis is ${basisTex(P)}, and $M = ${matTex(m)}$ ${name}. She has the vector $${vecTex(x)}$ ` +
        `in her numbers. Where does $M$ send it, in her numbers? (Turn it into ours, apply $M$, turn it back.)`,
      answer: matVec(changeOfBasisMatrix(P, m)!, x),
    };
  },

  '7.2-stretch': (rand) => {
    const P = basisWithDet(rand, [-3, -2, -1, 1, 2, 3]);
    const k = pick(rand, [-2, 2, 3, 4]);
    const m: Mat2 = [[k, 0], [0, k]];
    return {
      text: `Jennifer's basis is ${basisTex(P)}. $M = ${matTex(m)}$ stretches every arrow by ${k}. What is the **first column** of her matrix $P^{-1} M P$?`,
      answer: changeOfBasisMatrix(P, m)![0],
      labels: ['top', 'bottom'],
    };
  },
};
