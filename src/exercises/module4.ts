// Practice questions for Module 4 (Systems of equations). Same idea as module1.ts to module3.ts:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
// Answers may be fractions: the answer box accepts "3/2" as well as "1.5".
import {
  columnSpaceBasis,
  completeSolution,
  cramer2,
  cramerPicture,
  det2,
  det3,
  formatNumber,
  inverse2,
  leftNullSpaceBasis,
  matVec,
  nullSpaceBasis,
  pointOnSolution,
  randomSystem,
  rank,
  rowSpaceBasis,
  rrefSteps,
  solve2,
  type Mat2,
  type Mat3,
  type Vec2,
} from '../lib/linalg';
import { augmentedTex, matTex, pick, randInt, randVec, systemTex, vecTex, type Generator, type Rand } from './exercise';

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

/** A rank-1 matrix: column 2 is k copies of column 1 (k is a whole number, not 0). */
function rankOne(rand: Rand, column?: Vec2): { a: Mat2; c: Vec2; k: number } {
  const c = column ?? randVec(rand, 3);
  const k = randInt(rand, -3, 3, true);
  return { a: [c, [k * c[0], k * c[1]]], c, k };
}

/** A column (p, q) whose top number p isn't 0. */
function topNotZero(rand: Rand): Vec2 {
  return [pick(rand, [-2, -1, 1, 2]), randInt(rand, -3, 3)];
}

/** A random 3D column of whole numbers from -2 to 2. */
function rand3(rand: Rand): [number, number, number] {
  return [randInt(rand, -2, 2), randInt(rand, -2, 2), randInt(rand, -2, 2)];
}

/** A 3x3 matrix (as columns) with rank 1, 2 or 3, made by building some columns out of the others. */
function matrix3WithRank(rand: Rand, target: 1 | 2 | 3): Mat3 {
  const c1 = rand3(rand);
  const c2 = rand3(rand);
  const mix = (p: number, q: number) => c1.map((n, i) => p * n + q * c2[i]) as [number, number, number];
  const m: Mat3 =
    target === 3 ? [c1, c2, rand3(rand)] : target === 2 ? [c1, c2, mix(randInt(rand, -2, 2), randInt(rand, -2, 2))] : [c1, mix(2, 0), mix(-1, 0)];
  // Retry if the random columns happened to give a different rank (e.g. c2 was a copy of c1).
  if (rank(m) !== target || (target === 3 && det3(m) === 0)) return matrix3WithRank(rand, target);
  return m;
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
      text: `Write $${systemTex(rows)}$ as $A\\mathbf{x} = \\mathbf{b}$. What is the first column of $A$ (the column that multiplies $x$)?`,
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

  // ---------- 4.5 Rank, column space and null space ----------
  '4.5-rank': (rand) => {
    const a = pick(rand, [1, 2]) === 1 ? rankOne(rand).a : matrixWithDet(rand, [-3, -2, -1, 1, 2, 3]);
    return {
      text: `What is the rank of $A = ${matTex(a)}$? (How many dimensions does the column space have?)`,
      answer: rank(a),
    };
  },

  '4.5-null': (rand) => {
    const { a } = rankOne(rand);
    const [n] = nullSpaceBasis(a);
    return {
      text:
        `$A = ${matTex(a)}$ squashes a whole line to $\\vec{0}$: its null space. ` +
        `That line goes through $(x, 1)$. What is $x$?`,
      answer: n[0] / n[1],
      note: 'Column 2 is a multiple of column 1. Which mix of them gives 0?',
    };
  },

  '4.5-rank3': (rand) => {
    const m = matrix3WithRank(rand, pick(rand, [1, 2, 3] as const));
    return {
      text: `What is the rank of the 3×3 matrix $${matTex(m)}$? (Is any column made of the others?)`,
      answer: rank(m),
    };
  },

  // ---------- 4.6 The complete solution ----------
  '4.6-particular': (rand) => {
    const { a, c } = rankOne(rand, topNotZero(rand));
    const s = randInt(rand, -3, 3, true);
    const b: Vec2 = [s * c[0], s * c[1]];
    return {
      text: `$A\\vec{x} = ${vecTex(b)}$ with $A = ${matTex(a)}$ has infinitely many solutions. Find the one with $y = 0$.`,
      answer: completeSolution(a, b)!.particular,
    };
  },

  '4.6-another': (rand) => {
    const { a, c } = rankOne(rand, topNotZero(rand));
    const s = randInt(rand, -3, 3, true);
    const b: Vec2 = [s * c[0], s * c[1]];
    const all = completeSolution(a, b)!;
    return {
      text:
        `$A = ${matTex(a)}$ and $\\vec{b} = ${vecTex(b)}$: one solution of $A\\vec{x} = \\vec{b}$ is $${vecTex(all.particular)}$. ` +
        `Find another solution of $A\\vec{x} = \\vec{b}$: the one with $y = 1$.`,
      answer: pointOnSolution(all, 1),
      note: 'Add a vector from the null space to the solution you know.',
    };
  },

  '4.6-solvable': (rand) => {
    const { a } = rankOne(rand, topNotZero(rand));
    const [col] = columnSpaceBasis(a);
    const top = col[0] * randInt(rand, -3, 3, true);
    return {
      text:
        `$A = ${matTex(a)}$. For which number $c$ does $A\\vec{x} = \\begin{bmatrix} ${top} \\\\ c \\end{bmatrix}$ ` +
        `have a solution? (When is it a mix of the columns of $A$?)`,
      answer: (top * col[1]) / col[0],
    };
  },

  // ---------- 4.7 The four fundamental subspaces ----------
  '4.7-row-space': (rand) => {
    const { a } = rankOne(rand);
    const [row] = rowSpaceBasis(a);
    return {
      text: `The row space of $A = ${matTex(a)}$ is a line through $(1, y)$. What is $y$?`,
      answer: row[1] / row[0],
    };
  },

  '4.7-left-null': (rand) => {
    const { a } = rankOne(rand, topNotZero(rand));
    const [left] = leftNullSpaceBasis(a);
    return {
      text:
        `The left null space of $A = ${matTex(a)}$ is a line through $(x, 1)$, at right angles to the column space. ` +
        `What is $x$? (A fraction like 2/3 is fine.)`,
      answer: left[0] / left[1],
    };
  },

  '4.7-dimensions': (rand) => {
    // 3 columns of 2 numbers: a 2x3 matrix, rank 1 or 2.
    const c: Vec2 = randVec(rand, 3);
    const columns =
      pick(rand, [1, 2]) === 1
        ? [c, [2 * c[0], 2 * c[1]], [-c[0], -c[1]]]
        : [c, randVec(rand, 3), randVec(rand, 3)];
    const r = rank(columns);
    return {
      text:
        `$A = ${matTex(columns)}$ has 2 rows and 3 columns. How many dimensions do its null space ` +
        `and its left null space have? (Find the rank first.)`,
      answer: [3 - r, 2 - r],
      labels: ['null space', 'left null space'],
    };
  },

  // ---------- 4.8 Cramer's rule ----------
  '4.8-top': (rand) => {
    const a = matrixWithDet(rand, [-3, -2, -1, 1, 2, 3]);
    const v = matVec(a, randVec(rand, 3));
    return {
      text:
        `Cramer's rule for $${matTex(a)}\\vec{x} = ${vecTex(v)}$ gives $y = \\det B \\,/\\, \\det A$, ` +
        `where $B$ is $A$ with column 2 swapped for $\\vec{v}$. What is $\\det B$?`,
      answer: cramer2(a, v)!.numerators[1],
    };
  },

  '4.8-solve': (rand) => {
    const a = matrixWithDet(rand, [-2, -1, 1, 2]);
    const v = matVec(a, randVec(rand, 3));
    return {
      text: `Use Cramer's rule to solve $${matTex(a)}\\vec{x} = ${vecTex(v)}$.`,
      answer: cramer2(a, v)!.solution,
    };
  },

  '4.8-area': (rand) => {
    const a = matrixWithDet(rand, [-3, -2, 2, 3]);
    const x = randVec(rand, 3);
    const p = cramerPicture(a, x, 1);
    return {
      text:
        `$\\vec{x} = ${vecTex(x)}$. What is the signed area of the parallelogram made by $\\hat{\\imath}$ and $\\vec{x}$, ` +
        `and of the one it becomes after $A = ${matTex(a)}$ ($\\det A = ${det2(a)}$)?`,
      answer: [p.inputArea, p.outputArea],
      labels: ['before', 'after'],
    };
  },
};
