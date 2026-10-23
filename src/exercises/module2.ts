// Practice questions for Module 2 (Linear transformations). Same idea as module1.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
import {
  add,
  applyColumns,
  det3,
  matMul,
  matVec,
  matVec3,
  rotY90,
  scale,
  sub,
  type Mat2,
  type Mat3,
  type Vec2,
  type Vec3,
} from '../lib/linalg';
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

/** A random 3D vector with whole-number parts from -limit to limit, never the zero vector. */
function randVec3(rand: Rand, limit = 2): Vec3 {
  const v: Vec3 = [randInt(rand, -limit, limit), randInt(rand, -limit, limit), randInt(rand, -limit, limit)];
  return v.every((n) => n === 0) ? randVec3(rand, limit) : v;
}

/** The hats, written in TeX, for questions about î, ĵ (and k̂). */
const hats = ['\\hat{\\imath}', '\\hat{\\jmath}', '\\hat{k}'];

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

  // ---------- 2.4 Composition = multiplication ----------
  '2.4-two-steps': (rand) => {
    const a = randMatrix(rand);
    const b = randMatrix(rand);
    const v = randVec(rand, 2);
    return {
      text: `First apply $A = ${matTex(a)}$, then $B = ${matTex(b)}$. Where does $${vecTex(v)}$ end up?`,
      answer: matVec(b, matVec(a, v)),
    };
  },

  '2.4-product-column': (rand) => {
    const a = randMatrix(rand);
    const b = randMatrix(rand);
    const col = randInt(rand, 0, 1);
    return {
      text:
        `$A = ${matTex(a)}$ and $B = ${matTex(b)}$. What is column ${col + 1} of $AB$? ` +
        `(Hint: it is where $A$ sends column ${col + 1} of $B$.)`,
      answer: matMul(a, b)[col],
    };
  },

  '2.4-order': (rand) => {
    const first = pick(rand, described);
    const second = pick(rand, described.filter((d) => d !== first));
    const hat = randInt(rand, 0, 1);
    return {
      text: `Take the plane, ${first.words}, then ${second.words}. Where does $${hats[hat]}$ land?`,
      answer: matMul(second.matrix, first.matrix)[hat],
    };
  },

  // ---------- 2.5 Transformations in 3D ----------
  '2.5-matvec3': (rand) => {
    const m: Mat3 = [randVec3(rand), randVec3(rand), randVec3(rand)];
    const v = randVec3(rand);
    return {
      text: `Where does $${vecTex(v)}$ land under $${matTex(m)}$?`,
      answer: matVec3(m, v),
    };
  },

  '2.5-turn': (rand) => {
    const v = randVec3(rand, 3);
    return {
      text:
        `The matrix $${matTex(rotY90())}$ turns space 90° about the y-axis. ` +
        `Where does $${vecTex(v)}$ land?`,
      answer: matVec3(rotY90(), v),
    };
  },

  '2.5-volume': (rand) => {
    const d: Vec3 = [randInt(rand, -3, 3, true), randInt(rand, 1, 3), randInt(rand, 1, 3)];
    const m: Mat3 = [[d[0], 0, 0], [0, d[1], 0], [0, 0, d[2]]];
    return {
      text:
        `$${matTex(m)}$ stretches the unit cube into a box. ` +
        `By what number does it multiply volume? (A negative number means space is flipped.)`,
      answer: det3(m),
    };
  },

  // ---------- 2.6 Non-square matrices ----------
  '2.6-to-number': (rand) => {
    const row = [randInt(rand, -3, 3, true), randInt(rand, -3, 3, true)];
    const v = randVec(rand, 4);
    return {
      text: `The $1 \\times 2$ matrix $${matTex([[row[0]], [row[1]]])}$ squashes the plane onto a number line. Where does $${vecTex(v)}$ land?`,
      answer: applyColumns([[row[0]], [row[1]]], v)[0],
    };
  },

  '2.6-to-3d': (rand) => {
    const columns = [randVec3(rand), randVec3(rand)];
    const v = randVec(rand, 3);
    return {
      text: `Where does the 2D vector $${vecTex(v)}$ land in 3D under $${matTex(columns)}$?`,
      answer: applyColumns(columns, v),
    };
  },

  '2.6-shape': (rand) => {
    const rows = randInt(rand, 1, 4);
    const cols = randInt(rand, 1, 4);
    const askInput = rand() < 0.5;
    return {
      text:
        `A matrix has ${rows} row${rows > 1 ? 's' : ''} and ${cols} column${cols > 1 ? 's' : ''}. ` +
        (askInput
          ? 'How many numbers does a vector need to go into it?'
          : 'How many numbers does the vector that comes out have?'),
      answer: askInput ? cols : rows,
    };
  },
};
