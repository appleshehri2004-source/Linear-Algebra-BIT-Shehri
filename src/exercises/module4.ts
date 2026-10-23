// Practice questions for Module 4 (Systems of equations). Same idea as module1.ts to module3.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
// Answers may be fractions: the answer box accepts "3/2" as well as "1.5".
import { det2, equationText, formatNumber, inverse2, matVec, randomSystem, rrefSteps, solve2, type Mat2 } from '../lib/linalg';
import { matTex, pick, randInt, randVec, vecTex, type Generator, type Rand } from './exercise';

/** TeX for a system of equations, one per line, e.g. "2x - y = 1" over "x + y = 5". */
function systemTex(rows: number[][]): string {
  return `\\begin{cases} ${rows.map((row) => equationText(row).replace(/−/g, '-')).join(' \\\\ ')} \\end{cases}`;
}

/** TeX for an augmented matrix [A | b], with a bar before the last column. Stored as rows. */
function augmentedTex(rows: number[][]): string {
  const n = rows[0].length - 1;
  return `\\left[\\begin{array}{${'c'.repeat(n)}|c} ${rows.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{array}\\right]`;
}

/** TeX for "this many copies of" a row: nothing for 1, "2\," for 2, "\tfrac{3}{2}\," for 1.5. k must be positive. */
function multipleTex(k: number): string {
  const [top, bottom] = formatNumber(k).split('/');
  if (bottom) return `\\tfrac{${top}}{${bottom}}\\,`;
  return top === '1' ? '' : `${top}\\,`;
}

/** A random 2-equation system whose second row starts with a number that isn't 0 (so step 1 clears it). */
function systemNeedingStep(rand: Rand): number[][] {
  const rows = randomSystem(2, rand);
  return rows[1][0] === 0 ? systemNeedingStep(rand) : rows;
}

/** A random matrix with whole numbers from -3 to 3 and a determinant from the list. */
function matrixWithDet(rand: Rand, dets: number[]): Mat2 {
  const m: Mat2 = [randVec(rand, 3), randVec(rand, 3)];
  return dets.includes(det2(m)) ? m : matrixWithDet(rand, dets);
}

export const module4: Record<string, Generator> = {
  // ---------- 4.1 A system is a transformation ----------
  '4.1-stretch': (rand) => {
    // A only stretches the axes, so each part of x is found on its own.
    const a: Mat2 = [[randInt(rand, -4, 4, true), 0], [0, randInt(rand, -4, 4, true)]];
    const v = matVec(a, randVec(rand, 3));
    return {
      text: `Which $\\vec{x}$ does $A = ${matTex(a)}$ send to $\\vec{v} = ${vecTex(v)}$?`,
      answer: solve2(a, v)!,
    };
  },

  '4.1-columns': (rand) => {
    const rows = randomSystem(2, rand);
    return {
      text: `Write $${systemTex(rows)}$ as $A\\vec{x} = \\vec{v}$. What is the first column of $A$ (the column that multiplies $x$)?`,
      answer: [rows[0][0], rows[1][0]],
      labels: ['top', 'bottom'],
    };
  },

  '4.1-solve': (rand) => {
    const rows = randomSystem(2, rand);
    return {
      text: `Solve $${systemTex(rows)}$`,
      answer: rrefSteps(rows).solution!,
    };
  },

  // ---------- 4.2 Gaussian elimination ----------
  '4.2-multiplier': (rand) => {
    const rows = systemNeedingStep(rand);
    return {
      text:
        `The first step of elimination on $${augmentedTex(rows)}$ is $R_2 \\to R_2 - k\\,R_1$, ` +
        `which makes the first number of row 2 zero. What is $k$? (A fraction like 3/2 is fine.)`,
      answer: rows[1][0] / rows[0][0],
    };
  },

  '4.2-new-row': (rand) => {
    const rows = systemNeedingStep(rand);
    const k = rows[1][0] / rows[0][0];
    return {
      text:
        `Do the first step of elimination on $${augmentedTex(rows)}$: ` +
        `$R_2 \\to R_2 ${k > 0 ? '-' : '+'} ${multipleTex(Math.abs(k))}R_1$. What is the new row 2?`,
      answer: rrefSteps(rows).steps[1].matrix[1],
      labels: ['1st', '2nd', 'right'],
    };
  },

  '4.2-solve3': (rand) => {
    const rows = randomSystem(3, rand);
    return {
      text: `Solve by elimination: $${systemTex(rows)}$`,
      answer: rrefSteps(rows).solution!,
    };
  },

  // ---------- 4.3 The inverse ----------
  '4.3-inverse-column': (rand) => {
    const a = matrixWithDet(rand, [-2, -1, 1, 2]);
    return {
      text: `$A = ${matTex(a)}$ has $\\det A = ${det2(a)}$. What is the first column of $A^{-1}$?`,
      answer: inverse2(a)![0],
      labels: ['top', 'bottom'],
      note: 'Swap a and d, change the signs of b and c, then divide everything by det A.',
    };
  },

  '4.3-solve-inverse': (rand) => {
    const a = matrixWithDet(rand, [-1, 1]);
    const inv = inverse2(a)!;
    const v = randVec(rand, 3);
    return {
      text:
        `$A = ${matTex(a)}$ and $A^{-1} = ${matTex(inv)}$. ` +
        `Use $A^{-1}$ to solve $A\\vec{x} = ${vecTex(v)}$.`,
      answer: solve2(a, v)!,
    };
  },

  '4.3-no-inverse': (rand) => {
    // Columns (a, c) and (k, d) with d = m·c: det = a·d − k·c = c·(a·m − k), which is 0 when k = a·m.
    const a = randInt(rand, -3, 3, true);
    const c = randInt(rand, -3, 3, true);
    const m = pick(rand, [-2, -1, 1, 2]);
    const d = m * c;
    return {
      text:
        `For which $k$ does $\\begin{bmatrix} ${a} & k \\\\ ${c} & ${d} \\end{bmatrix}$ have no inverse? ` +
        `(Hint: when is the plane squashed flat?)`,
      answer: a * m,
    };
  },
};
