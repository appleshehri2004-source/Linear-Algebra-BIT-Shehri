// Practice questions for Module 5 (Duality and the cross product). Same idea as module1.ts to module4.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
import { boxVolume, cross2, cross3, dualityNumbers, normalize, projectToLine, type Vec2, type Vec3 } from '../lib/linalg';
import { pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** A random unit vector with tidy parts, like (0.6, 0.8) or (−0.8, 0.6) (from the 3-4-5 triangle) or (0, 1). */
function tidyUnit(rand: Rand): Vec2 {
  const [a, b] = pick(rand, [[3, 4], [4, 3], [5, 0], [0, 5]] as Vec2[]);
  return normalize([a * pick(rand, [1, -1]), b * pick(rand, [1, -1])]);
}

/** A random 3D vector with whole numbers from -2 to 2, never the zero vector. */
function rand3(rand: Rand): Vec3 {
  const v: Vec3 = [randInt(rand, -2, 2), randInt(rand, -2, 2), randInt(rand, -2, 2)];
  return v.every((n) => n === 0) ? rand3(rand) : v;
}

export const module5: Record<string, Generator> = {
  // ---------- 5.1 Duality ----------
  '5.1-land': (rand) => {
    const u = tidyUnit(rand);
    const v = randVec(rand, 4);
    return {
      text: `A number line goes through the origin along the unit vector $\\hat{u} = ${vecTex(u)}$. Where on it does $\\vec{v} = ${vecTex(v)}$ land?`,
      answer: projectToLine(v, u),
      note: 'Round to 2 decimal places.',
    };
  },

  '5.1-basis': (rand) => {
    const u = tidyUnit(rand);
    const v = randVec(rand, 4);
    return {
      text:
        `On a tilted number line, $\\hat{\\imath}$ lands at $${u[0]}$ and $\\hat{\\jmath}$ lands at $${u[1]}$. ` +
        `Where does $\\vec{v} = ${vecTex(v)}$ land?`,
      answer: projectToLine(v, u),
      note: 'Round to 2 decimal places.',
    };
  },

  '5.1-scaled': (rand) => {
    const u = tidyUnit(rand);
    const k = randInt(rand, 2, 4);
    const v = randVec(rand, 3);
    const n = dualityNumbers(v, u, k);
    return {
      text:
        `$\\vec{v} = ${vecTex(v)}$ lands at $${Math.round(n.position * 100) / 100}$ on the number line along $\\hat{u} = ${vecTex(u)}$. ` +
        `What number does the $1 \\times 2$ matrix for $\\vec{u} = ${k}\\hat{u}$ give for $\\vec{v}$?`,
      answer: n.value,
      note: 'Round to 2 decimal places.',
    };
  },

  // ---------- 5.2 The cross product ----------
  '5.2-area': (rand) => {
    const v = randVec(rand, 4);
    const w = randVec(rand, 4);
    return {
      text: `What is the signed area $\\vec{v} \\times \\vec{w}$ of the parallelogram made by $\\vec{v} = ${vecTex(v)}$ and $\\vec{w} = ${vecTex(w)}$?`,
      answer: cross2(v, w),
    };
  },

  '5.2-cross': (rand) => {
    const v = rand3(rand);
    const w = rand3(rand);
    return {
      text: `Work out $${vecTex(v)} \\times ${vecTex(w)}$.`,
      answer: cross3(v, w),
    };
  },

  '5.2-swap': (rand) => {
    const v = rand3(rand);
    const w = rand3(rand);
    return {
      text: `$\\vec{v} \\times \\vec{w} = ${vecTex(cross3(v, w))}$. What is $\\vec{w} \\times \\vec{v}$?`,
      answer: cross3(w, v),
    };
  },

  // ---------- 5.3 Why the formula works ----------
  '5.3-volume': (rand) => {
    const p = rand3(rand);
    const v = rand3(rand);
    const w = rand3(rand);
    return {
      text:
        `What is the signed volume of the slanted box made by $${vecTex(p)}$, $\\vec{v} = ${vecTex(v)}$ and $\\vec{w} = ${vecTex(w)}$? ` +
        `(Work out $\\vec{v} \\times \\vec{w}$ first, then dot it with the first vector.)`,
      answer: boxVolume(p, v, w).volume,
    };
  },

  '5.3-height': (rand) => {
    // v and w lie flat on the floor (z = 0), so the box's height is just how far p is above or below the floor.
    const flat = (): Vec3 => {
      const [x, y] = randVec(rand, 3);
      return [x, y, 0];
    };
    let v = flat();
    let w = flat();
    while (cross2([v[0], v[1]], [w[0], w[1]]) === 0) {
      v = flat();
      w = flat();
    }
    const p: Vec3 = [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -4, 4, true)];
    return {
      text:
        `$\\vec{v} = ${vecTex(v)}$ and $\\vec{w} = ${vecTex(w)}$ lie on the floor. How high is $${vecTex(p)}$ above their parallelogram, ` +
        `measured along $\\vec{v} \\times \\vec{w}$? (Negative if it is on the other side.)`,
      answer: boxVolume(p, v, w).height,
    };
  },
};
