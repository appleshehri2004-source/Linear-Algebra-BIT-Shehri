// Practice questions for Module 1 (Vectors). Each one is a small generator function:
// it picks random numbers, then asks linalg.ts for the correct answer.
// A lesson shows one with <Exercise id="1.2-add" client:visible />.
import {
  add,
  dot,
  isIndependent,
  length,
  projectOnto,
  scale,
  solveCombination,
  type Vec2,
} from '../lib/linalg';
import { pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** "3 steps east", "1 step south": turns a signed number into words. */
function steps(n: number, positive: string, negative: string): string {
  const count = Math.abs(n);
  return `${count} ${count === 1 ? 'step' : 'steps'} ${n > 0 ? positive : negative}`;
}

/** Two random vectors that point in different directions. */
function independentPair(rand: Rand, limit = 3): [Vec2, Vec2] {
  const v = randVec(rand, limit);
  const w = randVec(rand, limit);
  return isIndependent(v, w) ? [v, w] : independentPair(rand, limit);
}

export const module1: Record<string, Generator> = {
  // ---------- 1.1 What is a vector ----------
  '1.1-walk': (rand) => {
    const v: Vec2 = [randInt(rand, -5, 5, true), randInt(rand, -5, 5, true)];
    return {
      text: `Walk ${steps(v[0], 'east', 'west')} and ${steps(v[1], 'north', 'south')}. Which vector is that?`,
      answer: v,
    };
  },

  '1.1-trip': (rand) => {
    const first: Vec2 = [randInt(rand, -4, 4, true), 0];
    const second: Vec2 = [0, randInt(rand, -4, 4, true)];
    const third: Vec2 = [randInt(rand, -4, 4, true), 0];
    return {
      text:
        `Walk ${steps(first[0], 'east', 'west')}, then ${steps(second[1], 'north', 'south')}, ` +
        `then ${steps(third[0], 'east', 'west')}. Which single vector gets you to the same place?`,
      answer: add(add(first, second), third),
    };
  },

  // ---------- 1.2 Adding and scaling ----------
  '1.2-add': (rand) => {
    const v = randVec(rand);
    const w = randVec(rand);
    return {
      text: `Work out $${vecTex(v)} + ${vecTex(w)}$.`,
      answer: add(v, w),
    };
  },

  '1.2-scale': (rand) => {
    const k = pick(rand, [-3, -2, -1, -0.5, 0.5, 2, 3]);
    const v = randVec(rand);
    return {
      text: `Work out $${k} ${vecTex(v)}$.`,
      answer: scale(k, v),
    };
  },

  '1.2-find-k': (rand) => {
    const k = pick(rand, [-3, -2, -1, 2, 3]);
    const v = randVec(rand, 3);
    return {
      text: `Which number $k$ turns $${vecTex(v)}$ into $${vecTex(scale(k, v))}$?`,
      answer: k,
    };
  },

  // ---------- 1.3 Linear combinations and span ----------
  '1.3-combo': (rand) => {
    const a = randInt(rand, -3, 3, true);
    const b = randInt(rand, -3, 3, true);
    const v = randVec(rand, 3);
    const w = randVec(rand, 3);
    return {
      text: `With $\\vec{v} = ${vecTex(v)}$, $\\vec{w} = ${vecTex(w)}$, $a = ${a}$ and $b = ${b}$, work out $a\\vec{v} + b\\vec{w}$.`,
      answer: add(scale(a, v), scale(b, w)),
    };
  },

  '1.3-line': (rand) => {
    const b = randInt(rand, -3, 3, true);
    const v = randVec(rand, 3);
    const w = randVec(rand, 3);
    return {
      text:
        `Keep $a = 1$ fixed and change only $b$, so the tip of $\\vec{v} + b\\vec{w}$ moves along a straight line. ` +
        `With $\\vec{v} = ${vecTex(v)}$ and $\\vec{w} = ${vecTex(w)}$, which $b$ puts the tip at $${vecTex(add(v, scale(b, w)))}$?`,
      answer: b,
    };
  },

  // ---------- 1.4 Independence and basis ----------
  '1.4-solve': (rand) => {
    const [v, w] = independentPair(rand);
    const target = add(scale(randInt(rand, -3, 3), v), scale(randInt(rand, -3, 3), w));
    // independentPair makes sure v and w are independent, so there is always an answer.
    const { a, b } = solveCombination(v, w, target)!;
    return {
      text: `Find $a$ and $b$ so that $a${vecTex(v)} + b${vecTex(w)} = ${vecTex(target)}$.`,
      answer: [a, b],
      labels: ['a', 'b'],
    };
  },

  '1.4-dependent': (rand) => {
    // v needs a non-zero bottom number, or every k would work.
    const v: Vec2 = [randInt(rand, -3, 3, true), randInt(rand, -3, 3, true)];
    const w = scale(pick(rand, [-3, -2, 2, 3]), v);
    return {
      text: `Which number $k$ makes $${vecTex(v)}$ and $\\begin{bmatrix} k \\\\ ${w[1]} \\end{bmatrix}$ dependent (on the same line)?`,
      answer: w[0],
    };
  },

  // ---------- 1.5 Length, angle and dot product ----------
  '1.5-dot': (rand) => {
    const v = randVec(rand);
    const w = randVec(rand);
    return {
      text: `Work out the dot product $${vecTex(v)} \\cdot ${vecTex(w)}$.`,
      answer: dot(v, w),
    };
  },

  '1.5-length': (rand) => {
    const v = randVec(rand, 5);
    return {
      text: `How long is $${vecTex(v)}$?`,
      answer: length(v),
      note: 'Round to 2 decimal places.',
    };
  },

  '1.5-project': (rand) => {
    const v = randVec(rand, 3);
    const w = randVec(rand, 4);
    return {
      text: `Project $\\vec{w} = ${vecTex(w)}$ onto the line through $\\vec{v} = ${vecTex(v)}$.`,
      // randVec never gives the zero vector, so the projection always exists.
      answer: projectOnto(w, v)!,
      note: 'Round to 2 decimal places.',
    };
  },
};
