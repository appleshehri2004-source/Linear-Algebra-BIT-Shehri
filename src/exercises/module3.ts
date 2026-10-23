// Practice questions for Module 3 (The determinant). Same idea as module1.ts and module2.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
import { det2, det3, matMul, type Mat2, type Mat3 } from '../lib/linalg';
import { matTex, pick, randInt, randVec, type Generator, type Rand } from './exercise';

/** A random matrix with whole numbers from -3 to 3, stored as columns. */
function randMatrix(rand: Rand): Mat2 {
  return [randVec(rand, 3), randVec(rand, 3)];
}

/** A random matrix whose determinant is not 0 and has the sign asked for. */
function matrixWithSign(rand: Rand, sign: 1 | -1): Mat2 {
  const m = randMatrix(rand);
  return Math.sign(det2(m)) === sign ? m : matrixWithSign(rand, sign);
}

export const module3: Record<string, Generator> = {
  // ---------- 3.1 Area scaling ----------
  '3.1-rectangle': (rand) => {
    const m: Mat2 = [[randInt(rand, 1, 4), 0], [0, randInt(rand, 1, 4)]];
    return {
      text: `The matrix $${matTex(m)}$ stretches the unit square into a rectangle. What is its area?`,
      answer: det2(m),
    };
  },

  '3.1-blob': (rand) => {
    const m = matrixWithSign(rand, 1);
    const area = randInt(rand, 2, 5);
    return {
      text:
        `A blob has area ${area}. What is its area after the transformation $${matTex(m)}$? ` +
        `(Hint: first find how much the unit square's area is multiplied by.)`,
      answer: det2(m) * area,
    };
  },

  '3.1-shear': (rand) => {
    const k = randInt(rand, -3, 3, true);
    const shear: Mat2 = [[1, 0], [k, 1]];
    const [w, h] = [randInt(rand, 2, 4), randInt(rand, 2, 4)];
    return {
      text: `The shear $${matTex(shear)}$ slants a ${w} by ${h} rectangle. What is the slanted shape's area?`,
      answer: det2(shear) * w * h,
    };
  },

  // ---------- 3.2 Orientation ----------
  '3.2-flipped': (rand) => {
    const m = matrixWithSign(rand, -1);
    return {
      text: `What is the signed area of the unit square after $${matTex(m)}$? (Flipped over means negative.)`,
      answer: det2(m),
    };
  },

  '3.2-flat': (rand) => {
    // î lands on (x, p) and ĵ on (q, r). The area is x·r − q·p, which is 0 when x = q·p / r.
    const r = pick(rand, [1, 2]);
    const p = r === 2 ? pick(rand, [-2, 2, 4]) : randInt(rand, -3, 3, true);
    const q = randInt(rand, -3, 3, true);
    return {
      text:
        `$\\hat{\\jmath}$ lands on $(${q}, ${r})$ and $\\hat{\\imath}$ lands on $(x, ${p})$. ` +
        `For which $x$ is the area 0 (the plane squashed onto a line)?`,
      answer: (q * p) / r,
    };
  },

  // ---------- 3.3 Computing determinants ----------
  '3.3-det2': (rand) => {
    const m = randMatrix(rand);
    return {
      text: `Work out $\\det ${matTex(m)}$ by hand: $ad - bc$.`,
      answer: det2(m),
    };
  },

  '3.3-det3-triangle': (rand) => {
    // Zeros below the diagonal: the determinant is the three diagonal numbers multiplied.
    const m: Mat3 = [
      [randInt(rand, -3, 3, true), 0, 0],
      [randInt(rand, -3, 3), randInt(rand, -3, 3, true), 0],
      [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -3, 3, true)],
    ];
    return {
      text: `Work out $\\det ${matTex(m)}$. (Look at the zeros first.)`,
      answer: det3(m),
    };
  },

  '3.3-det3': (rand) => {
    const n = () => randInt(rand, -2, 2);
    const m: Mat3 = [[n(), n(), n()], [n(), n(), n()], [n(), n(), n()]];
    return {
      text: `Work out $\\det ${matTex(m)}$ by hand.`,
      answer: det3(m),
    };
  },

  // ---------- 3.4 det(AB) = det(A) det(B) ----------
  '3.4-product': (rand) => {
    const a = randMatrix(rand);
    const b = randMatrix(rand);
    return {
      text: `$A = ${matTex(a)}$ and $B = ${matTex(b)}$. What is $\\det(AB)$? (No need to multiply the matrices.)`,
      answer: det2(matMul(a, b)),
    };
  },

  '3.4-power': (rand) => {
    const d = pick(rand, [-3, -2, 2, 3]);
    const power = randInt(rand, 2, 3);
    return {
      text: `$\\det(A) = ${d}$. What is $\\det(A^${power})$, the determinant of doing $A$ ${power} times in a row?`,
      answer: d ** power,
    };
  },

  '3.4-missing': (rand) => {
    const da = pick(rand, [-4, -2, -1, 2, 3, 5]);
    const db = randInt(rand, -4, 4, true);
    return {
      text: `$\\det(AB) = ${da * db}$ and $\\det(A) = ${da}$. What is $\\det(B)$?`,
      answer: db,
    };
  },
};
