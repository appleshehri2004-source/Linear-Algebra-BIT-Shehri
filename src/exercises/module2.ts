// Practice questions for Module 2 (Linear transformations). Same idea as module1.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
import { add, matVec, scale, sub, type Mat2, type Vec2 } from '../lib/linalg';
import { matTex, pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** "+ 2", "- 2" or nothing (for 0), for writing a rule like "x + 2" or "x - 2" without "+ -2" or "+ 0". */
function plus(n: number): string {
  if (n === 0) return '';
  return n < 0 ? ` - ${-n}` : ` + ${n}`;
}

/** "3x", or just "x" when the number is 1. */
function times(k: number, name: string): string {
  return k === 1 ? name : `${k}${name}`;
}

/** A random matrix with whole numbers from -3 to 3, stored as columns. */
function randMatrix(rand: Rand): Mat2 {
  return [randVec(rand, 3), randVec(rand, 3)];
}

/** The transformations from the 2.3 gallery, with their matrices (stored as columns). */
const gallery: { name: string; matrix: Mat2 }[] = [
  { name: 'rotate 90° anticlockwise', matrix: [[0, 1], [-1, 0]] },
  { name: 'shear', matrix: [[1, 0], [1, 1]] },
  { name: 'scale x by 3 and y by 2', matrix: [[3, 0], [0, 2]] },
  { name: 'reflect over the y-axis', matrix: [[-1, 0], [0, 1]] },
  { name: 'project onto the x-axis', matrix: [[1, 0], [0, 0]] },
];

/** Moves described in words only: the learner has to picture where î and ĵ go. */
const described: { words: string; matrix: Mat2 }[] = [
  { words: 'rotate it 90° anticlockwise', matrix: [[0, 1], [-1, 0]] },
  { words: 'rotate it 90° clockwise', matrix: [[0, -1], [1, 0]] },
  { words: 'reflect it over the x-axis', matrix: [[1, 0], [0, -1]] },
  { words: 'reflect it over the y-axis', matrix: [[-1, 0], [0, 1]] },
  { words: 'project it onto the x-axis', matrix: [[1, 0], [0, 0]] },
  { words: 'project it onto the y-axis', matrix: [[0, 0], [0, 1]] },
];

export const module2: Record<string, Generator> = {
  // ---------- 2.1 What makes a transformation linear ----------
  '2.1-origin': (rand) => {
    const a = randInt(rand, 1, 3);
    const c = randInt(rand, 1, 3);
    const shift: Vec2 = [randInt(rand, -3, 3, true), randInt(rand, -3, 3)];
    return {
      text:
        `A rule moves every point $(x, y)$ to $(${times(a, 'x')}${plus(shift[0])},\\ ${times(c, 'y')}${plus(shift[1])})$. ` +
        `Where does the origin land? (If it isn't $(0, 0)$, the rule is not linear.)`,
      answer: shift,
    };
  },

  '2.1-scale': (rand) => {
    const v = randVec(rand, 3);
    const w = randVec(rand, 3);
    const k = pick(rand, [-2, 2, 3]);
    return {
      text: `$T$ is linear and $T\\left(${vecTex(v)}\\right) = ${vecTex(w)}$. What is $T\\left(${vecTex(scale(k, v))}\\right)$?`,
      answer: scale(k, w),
    };
  },

  '2.1-add': (rand) => {
    const u = randVec(rand, 3);
    const v = randVec(rand, 3);
    const p = randVec(rand, 3);
    const q = randVec(rand, 3);
    return {
      text:
        `$T$ is linear, $T\\left(${vecTex(u)}\\right) = ${vecTex(p)}$ and $T\\left(${vecTex(v)}\\right) = ${vecTex(q)}$. ` +
        `What is $T\\left(${vecTex(add(u, v))}\\right)$?`,
      answer: add(p, q),
    };
  },

  // ---------- 2.2 Matrix times vector, from the columns ----------
  '2.2-matvec': (rand) => {
    const m = randMatrix(rand);
    const v = randVec(rand, 3);
    return {
      text: `Where does $${vecTex(v)}$ land under $${matTex(m)}$?`,
      answer: matVec(m, v),
    };
  },

  '2.2-arrows': (rand) => {
    const ihat = randVec(rand, 3);
    const jhat = randVec(rand, 3);
    const v = randVec(rand, 3);
    return {
      text:
        `A matrix sends $\\hat{\\imath}$ to $${vecTex(ihat)}$ and $\\hat{\\jmath}$ to $${vecTex(jhat)}$. ` +
        `Where does $${vecTex(v)}$ land?`,
      answer: matVec([ihat, jhat], v),
    };
  },

  '2.2-find-column': (rand) => {
    const ihat = randVec(rand, 3);
    const jhat = randVec(rand, 3);
    const lands = matVec([ihat, jhat], [1, 1]);
    return {
      text:
        `A matrix has first column $${vecTex(ihat)}$, and it sends $${vecTex([1, 1])}$ to $${vecTex(lands)}$. ` +
        `What is its second column?`,
      // (1, 1) lands on column 1 + column 2, so column 2 = where (1, 1) lands - column 1.
      answer: sub(lands, ihat),
    };
  },

  // ---------- 2.3 A gallery of transformations ----------
  '2.3-named': (rand) => {
    const { name, matrix } = pick(rand, gallery);
    const v = randVec(rand, 3);
    return {
      text: `The matrix $${matTex(matrix)}$ does this: ${name}. Where does $${vecTex(v)}$ land?`,
      answer: matVec(matrix, v),
    };
  },

  '2.3-describe': (rand) => {
    const { words, matrix } = pick(rand, described);
    const v = randVec(rand, 4);
    return {
      text: `Take the vector $${vecTex(v)}$ and ${words}. Where does it land?`,
      answer: matVec(matrix, v),
    };
  },
};
