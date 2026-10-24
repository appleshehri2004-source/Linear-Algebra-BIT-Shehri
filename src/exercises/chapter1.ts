// Practice questions for Chapter 1 of Lay's book (Linear Equations in Linear Algebra), written in the
// style of the book's exercises but with our own random numbers. Same idea as module1.ts: each generator
// picks numbers, then asks linalg.ts for the correct answer. Ids start with the book section, e.g. "1.1-…".
// (Older questions that Chapter 1 lessons also use keep their old ids in module1.ts to module4.ts,
// so readers who solved them keep their ticks.)
import {
  applyColumns,
  applyRowOp,
  completeSolution,
  cross3,
  equationText,
  consistency,
  echelonKind,
  formatNumber,
  inverseRowOp,
  matMul,
  nullSpaceBasis,
  pivotColumnsOf,
  randomSystem,
  transpose,
  type Mat2,
  type RowOp,
  type Vec3,
} from '../lib/linalg';
import { augmentedTex, matTex, pick, randInt, systemTex, type Generator, type Rand } from './exercise';

/** TeX for a matrix given as ROWS (the way row operations see it), not as columns like matTex. */
function rowsTex(rows: number[][]): string {
  return `\\begin{bmatrix} ${rows.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
}

/** TeX for a number used as a multiplier: "3", "\tfrac{1}{3}", "-\tfrac{1}{2}". */
function numberTex(k: number): string {
  const [top, bottom] = formatNumber(Math.abs(k)).split('/');
  const size = bottom ? `\\tfrac{${top}}{${bottom}}` : top;
  return k < 0 ? `-${size}` : size;
}

/** TeX for a row operation, with rows counted from 1 the way the lessons write them: "R_3 \to R_3 - 2R_1". */
export function rowOpTex(op: RowOp): string {
  if (op.kind === 'swap') return `R_${op.i + 1} \\leftrightarrow R_${op.j + 1}`;
  if (op.kind === 'scale') return `R_${op.i + 1} \\to ${numberTex(op.k)}R_${op.i + 1}`;
  const size = Math.abs(op.k) === 1 ? '' : numberTex(Math.abs(op.k));
  return `R_${op.i + 1} \\to R_${op.i + 1} ${op.k < 0 ? '-' : '+'} ${size}R_${op.j + 1}`;
}

/** A random row operation on a matrix with this many rows. Whole-number multipliers from -3 to 3. */
function randomRowOp(rand: Rand, rowCount: number, kind = pick(rand, ['swap', 'scale', 'add'] as const)): RowOp {
  const i = randInt(rand, 0, rowCount - 1);
  let j = randInt(rand, 0, rowCount - 2);
  if (j >= i) j++; // a different row from i
  if (kind === 'swap') return { kind, i: Math.min(i, j), j: Math.max(i, j) };
  if (kind === 'scale') return { kind, i, k: pick(rand, [-3, -2, 2, 3]) };
  return { kind, i, j, k: randInt(rand, -3, 3, true) };
}

/** A random matrix (as rows) of whole numbers from -4 to 4, with no two rows the same. */
function randomRows(rand: Rand, rowCount: number, columns: number): number[][] {
  const rows = Array.from({ length: rowCount }, () => Array.from({ length: columns }, () => randInt(rand, -4, 4)));
  const texts = rows.map((r) => r.join(','));
  return new Set(texts).size === rowCount ? rows : randomRows(rand, rowCount, columns);
}

/** Put a list in a random order (Fisher–Yates). */
function shuffle<T>(rand: Rand, items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const same = (a: number[][], b: number[][]) => a.every((row, r) => row.every((x, c) => x === b[r][c]));

/**
 * A random matrix (as rows) in echelon form: a staircase of leading entries in the given columns,
 * random numbers to their right, and rows of 0s below. reduced: every leading entry 1 with 0s above it.
 */
function staircase(rand: Rand, rowCount: number, columns: number, pivots: number[], reduced: boolean): number[][] {
  const m = Array.from({ length: rowCount }, () => new Array<number>(columns).fill(0));
  pivots.forEach((c, r) => {
    m[r][c] = reduced ? 1 : pick(rand, [1, 2, 3, -1, -2]);
    for (let k = c + 1; k < columns; k++) m[r][k] = randInt(rand, -4, 4);
  });
  if (reduced) pivots.forEach((c, r) => m.forEach((row, s) => s !== r && (row[c] = 0)));
  return m;
}

/** Some increasing column numbers from 0 to columns − 1: where a staircase's leading entries go. */
function randomPivots(rand: Rand, count: number, columns: number): number[] {
  const all = shuffle(rand, [...Array(columns).keys()]).slice(0, count);
  return all.sort((a, b) => a - b);
}

/** "columns 1, 2 and 4", counting from 1. */
function columnList(cols: number[]): string {
  const names = cols.map((c) => String(c + 1));
  return `Columns ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The left side (as columns) and right side of a system stored as an augmented matrix of rows. */
function split(rows: number[][]): { columns: number[][]; b: number[] } {
  return { columns: transpose(rows.map((row) => row.slice(0, -1))), b: rows.map((row) => row[row.length - 1]) };
}

/** TeX for a column vector whose entries may include a letter, e.g. colTex([3, -1, 'h']). */
function colTex(v: (number | string)[]): string {
  return `\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;
}

/** A random 3D vector with whole numbers from -3 to 3, never all 0. */
function randVec3(rand: Rand): number[] {
  const v = [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -3, 3)];
  return v.some((x) => x !== 0) ? v : randVec3(rand);
}

/** Two 3D vectors that are not multiples of each other: their span is a plane. */
function independentPair3(rand: Rand): [number[], number[]] {
  const a1 = randVec3(rand);
  const a2 = randVec3(rand);
  return pivotColumnsOf(transpose([a1, a2])).length === 2 ? [a1, a2] : independentPair3(rand);
}

/**
 * A 2x3 matrix (as rows) with pivots in columns 1 and 2, so z is the free unknown: a reduced echelon form
 * [1 0 p; 0 1 q] hidden by a few row operations.
 */
function hiddenTwoByThree(rand: Rand): number[][] {
  let rows = [
    [1, 0, randInt(rand, -3, 3)],
    [0, 1, randInt(rand, -3, 3)],
  ];
  rows = applyRowOp(rows, { kind: 'add', i: 1, j: 0, k: randInt(rand, -2, 2, true) });
  rows = applyRowOp(rows, { kind: 'add', i: 0, j: 1, k: randInt(rand, -2, 2, true) });
  if (rand() < 0.5) rows = applyRowOp(rows, { kind: 'scale', i: 1, k: pick(rand, [2, -1, 3]) });
  return rows;
}

/** How many solutions a system (augmented matrix, as rows) has: 'none', 'one' or 'many'. */
function solutionCount(rows: number[][]): 'none' | 'one' | 'many' {
  if (!consistency(rows).consistent) return 'none';
  const unknowns = rows[0].length - 1;
  return pivotColumnsOf(rows.map((row) => row.slice(0, -1))).length === unknowns ? 'one' : 'many';
}

export const chapter1: Record<string, Generator> = {
  // ---------- 1.1 Systems of Linear Equations ----------

  // Like the book's "find the row operation that turns one matrix into the other, and the one that undoes it".
  '1.1-which-op': (rand) => {
    const a = randomRows(rand, 3, 3);
    const op = randomRowOp(rand, 3);
    const b = applyRowOp(a, op);
    // A row of zeros can make an operation change nothing; then there'd be nothing to spot.
    if (same(a, b)) return chapter1['1.1-which-op'](rand);
    // Three wrong options, one of each kind if possible, none of which also turns A into B.
    const wrong: RowOp[] = [];
    const seen = new Set([rowOpTex(op)]);
    while (wrong.length < 3) {
      const other = randomRowOp(rand, 3, (['swap', 'scale', 'add'] as const)[wrong.length]);
      if (seen.has(rowOpTex(other)) || same(applyRowOp(a, other), b)) continue;
      seen.add(rowOpTex(other));
      wrong.push(other);
    }
    const options = shuffle(rand, [op, ...wrong]);
    return {
      text: `Which row operation turns $A = ${rowsTex(a)}$ into $B = ${rowsTex(b)}$?`,
      choices: options.map((o) => `$${rowOpTex(o)}$`),
      answer: options.indexOf(op),
      why: `Only one row changed (or two swapped places). To get from $B$ back to $A$, undo it with $${rowOpTex(inverseRowOp(op))}$.`,
    };
  },

  // Like the book's "determine if the system is consistent; do not completely solve it".
  '1.1-consistent': (rand) => {
    const [r1, r2] = randomRows(rand, 2, 4);
    const kind = pick(rand, ['inconsistent', 'inconsistent', 'many', 'one']);
    let r3: number[];
    if (kind === 'one') r3 = randomRows(rand, 1, 4)[0];
    else {
      // Equation 3 is a mix of equations 1 and 2 on the left. On the right it agrees (many solutions) or not (none).
      const p = randInt(rand, -2, 2, true);
      const q = randInt(rand, -2, 2, true);
      r3 = r1.map((x, c) => p * x + q * r2[c]);
      if (kind === 'inconsistent') r3[3] += pick(rand, [-3, -2, -1, 1, 2, 3]);
    }
    const rows = [r1, r2, r3];
    const { consistent, contradiction } = consistency(rows);
    return {
      text: `The augmented matrix of a system is $${augmentedTex(rows)}$. Is the system consistent (does it have at least one solution)? Decide without solving it completely.`,
      choices: ['Yes, consistent', 'No, inconsistent'],
      answer: consistent ? 0 : 1,
      why: consistent
        ? 'Row reduction never produces a row that says $0 = c$ with $c \\ne 0$, so at least one solution exists.'
        : `Row reduction produces a row $[\\,0 \\;\\; 0 \\;\\; 0 \\mid ${formatNumber(contradiction!)}\\,]$, which says $0 = ${formatNumber(contradiction!)}$. No numbers can make that true.`,
    };
  },

  // Like the book's "find the values of h for which the matrix is the augmented matrix of a consistent system".
  '1.1-h-consistent': (rand) => {
    const a = randInt(rand, -4, 4, true);
    const b = randInt(rand, -4, 4, true);
    const c = randInt(rand, -5, 5);
    const k = pick(rand, [-3, -2, 2, 3]);
    const leftover = k * c === 0 ? 'h' : `h ${k * c > 0 ? '-' : '+'} ${Math.abs(k * c)}`;
    return {
      text:
        `For which value of $h$ is $\\left[\\begin{array}{cc|c} ${a} & ${b} & ${c} \\\\ ${k * a} & ${k * b} & h \\end{array}\\right]$ ` +
        'the augmented matrix of a consistent system?',
      answer: k * c,
      why:
        `$R_2 \\to R_2 ${k > 0 ? '-' : '+'} ${Math.abs(k)}R_1$ clears the left side of row 2 and leaves $0 = ${leftover}$. ` +
        `That is only true when $h = ${k * c}$. For any other $h$ the two equations are parallel lines that never meet.`,
    };
  },

  // ---------- 1.2 Row Reduction and Echelon Forms ----------

  // Like the book's "which matrices are in reduced echelon form, and which only in echelon form?"
  '1.2-echelon-kind': (rand) => {
    const target = pick(rand, ['reduced', 'echelon', 'neither'] as const);
    const pivots = randomPivots(rand, randInt(rand, 2, 3), 4);
    let m = staircase(rand, 3, 4, pivots, target === 'reduced');
    if (target === 'echelon' && echelonKind(m) === 'reduced') m[0][pivots[0]] = 2; // make sure it isn't reduced
    if (target === 'neither') {
      const way = pick(rand, ['zero row on top', 'number under a pivot', 'rows swapped']);
      if (way === 'zero row on top' && pivots.length < 3) m = [m[2], m[0], m[1]];
      else if (way === 'number under a pivot') m[1][pivots[0]] = randInt(rand, -3, 3, true);
      else m = [m[1], m[0], m[2]];
    }
    const kind = echelonKind(m);
    const why = {
      reduced: 'It is a staircase, and every leading entry is 1 with only 0s above and below it.',
      echelon: 'It is a staircase (each leading entry is to the right of the one above, with 0s below it), but not every leading entry is a 1 with 0s above it.',
      neither: 'It is not a staircase: a row of 0s sits above a non-zero row, or a leading entry is not to the right of the one above it.',
    };
    return {
      text: `Which form is $${rowsTex(m)}$ in?`,
      choices: ['Reduced echelon form', 'Echelon form, but not reduced', 'Neither'],
      answer: ['reduced', 'echelon', 'neither'].indexOf(kind),
      why: why[kind],
    };
  },

  // Like the book's "row reduce, locate the pivot positions and list the pivot columns".
  '1.2-pivot-columns': (rand) => {
    const pivots = randomPivots(rand, randInt(rand, 2, 3), 4);
    let m = staircase(rand, 3, 4, pivots, false);
    // Hide the staircase with a few replacements: they never change which columns are pivot columns.
    for (let i = 0; i < 3; i++) m = applyRowOp(m, randomRowOp(rand, 3, 'add'));
    const right = pivotColumnsOf(m);
    // Wrong options: other sets of 2 or 3 columns out of 4.
    const sets: number[][] = [];
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) sets.push([a, b], ...[...Array(4).keys()].filter((c) => c > b).map((c) => [a, b, c]));
    const others = shuffle(rand, sets.filter((s) => s.join() !== right.join())).slice(0, 3);
    const options = shuffle(rand, [right, ...others]);
    return {
      text: `Row reduce $A = ${rowsTex(m)}$ to echelon form. Which columns of $A$ are pivot columns?`,
      choices: options.map(columnList),
      answer: options.findIndex((o) => o.join() === right.join()),
      why: `An echelon form has its leading entries in ${columnList(right).toLowerCase()}. Those are the pivot columns; the other columns' unknowns are free.`,
    };
  },

  // Like the book's "find the general solution of the system whose augmented matrix is given".
  '1.2-general-solution': (rand) => {
    // Start from a reduced echelon form with z free, then hide it with row operations.
    const [p, q, a, c] = [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -5, 5), randInt(rand, -5, 5)];
    let rows = [
      [1, 0, p, a],
      [0, 1, q, c],
    ];
    rows = applyRowOp(rows, { kind: 'add', i: 1, j: 0, k: randInt(rand, -2, 2, true) });
    rows = applyRowOp(rows, { kind: 'add', i: 0, j: 1, k: randInt(rand, -2, 2, true) });
    if (rand() < 0.5) rows = applyRowOp(rows, { kind: 'scale', i: 0, k: pick(rand, [2, -1, 3]) });
    const { columns, b } = split(rows);
    const { particular, directions } = completeSolution(columns, b)!;
    const [dir] = directions;
    return {
      text:
        `Find the general solution of the system with augmented matrix $${augmentedTex(rows)}$ (unknowns $x, y, z$). ` +
        'Write it as $x = a + bz$ and $y = c + dz$, with $z$ free. What are $a, b, c, d$?',
      answer: [particular[0], dir[0], particular[1], dir[1]],
      labels: ['a', 'b', 'c', 'd'],
      why: `The reduced echelon form is $${augmentedTex([[1, 0, p, a], [0, 1, q, c]])}$. Column 3 has no pivot, so $z$ is free; the rows say $x + ${p}z = ${a}$ and $y + ${q}z = ${c}$.`.replace(/\+ -/g, '- '),
    };
  },

  // The existence and uniqueness theorem: no solution, exactly one, or infinitely many?
  '1.2-how-many': (rand) => {
    const size = pick(rand, [2, 3]);
    const target = pick(rand, ['none', 'one', 'many'] as const);
    let rows: number[][];
    if (target === 'one') rows = randomSystem(size as 2 | 3, rand);
    else {
      rows = randomRows(rand, size - 1, size + 1);
      // The last equation mixes the others on the left; on the right it agrees ('many') or not ('none').
      const ks = rows.map(() => randInt(rand, -2, 2, true));
      const last = rows[0].map((_, c) => rows.reduce((sum, row, r) => sum + ks[r] * row[c], 0));
      if (target === 'none') last[size] += pick(rand, [-2, -1, 1, 2]);
      rows = [...rows, last];
    }
    const count = solutionCount(rows);
    const why = {
      none: 'An echelon form has a row $[\\,0 \\; \\cdots \\; 0 \\mid c\\,]$ with $c \\ne 0$: the last column is a pivot column, so the system is inconsistent.',
      one: 'The system is consistent and every unknown gets a pivot, so there are no free unknowns.',
      many: 'The system is consistent (no row $0 = c$), but a column has no pivot, so its unknown is free.',
    };
    return {
      text: `How many solutions does the system with augmented matrix $${augmentedTex(rows)}$ have?`,
      choices: ['No solution', 'Exactly one', 'Infinitely many'],
      answer: ['none', 'one', 'many'].indexOf(count),
      why: why[count],
    };
  },
  // ---------- 1.3 Vector Equations ----------

  // Like the book's "determine if b is a linear combination of a1 and a2".
  '1.3-in-span': (rand) => {
    const [a1, a2] = independentPair3(rand);
    const [c1, c2] = [randInt(rand, -3, 3, true), randInt(rand, -3, 3)];
    const b = a1.map((x, i) => c1 * x + c2 * a2[i]);
    if (rand() < 0.5) b[randInt(rand, 0, 2)] += pick(rand, [-2, -1, 1, 2]);
    const rows = transpose([a1, a2, b]);
    const solution = completeSolution([a1, a2], b);
    return {
      text: `Is $\\mathbf{b} = ${colTex(b)}$ a linear combination of $\\mathbf{a}_1 = ${colTex(a1)}$ and $\\mathbf{a}_2 = ${colTex(a2)}$? (Is $\\mathbf{b}$ in $\\operatorname{Span}\\{\\mathbf{a}_1, \\mathbf{a}_2\\}$?)`,
      choices: ['Yes', 'No'],
      answer: solution ? 0 : 1,
      why: solution
        ? `Row reducing $${augmentedTex(rows)}$ gives a consistent system: $\\mathbf{b} = ${formatNumber(solution.particular[0])}\\,\\mathbf{a}_1 + ${formatNumber(solution.particular[1])}\\,\\mathbf{a}_2$.`.replace(/\+ -/g, '- ')
        : `Row reducing the augmented matrix $${augmentedTex(rows)}$ produces a row $0 = c$ with $c \\ne 0$, so no weights work.`,
    };
  },

  // Like the book's "for what value of h is b in the plane spanned by a1 and a2?"
  '1.3-h-span': (rand) => {
    const [a1, a2] = independentPair3(rand);
    // The top two rows must decide the weights on their own.
    if (a1[0] * a2[1] - a1[1] * a2[0] === 0) return chapter1['1.3-h-span'](rand);
    const [c1, c2] = [randInt(rand, -3, 3, true), randInt(rand, -3, 3, true)];
    const b = a1.map((x, i) => c1 * x + c2 * a2[i]);
    return {
      text: `For which value of $h$ is $\\mathbf{b} = ${colTex([b[0], b[1], 'h'])}$ in the plane spanned by $\\mathbf{a}_1 = ${colTex(a1)}$ and $\\mathbf{a}_2 = ${colTex(a2)}$?`,
      answer: b[2],
      why: `The first two rows of $[\\,\\mathbf{a}_1 \\;\\; \\mathbf{a}_2 \\mid \\mathbf{b}\\,]$ force the weights $${c1}$ and $${c2}$. Then the third row needs $h = ${c1}\\cdot(${a1[2]}) + ${c2}\\cdot(${a2[2]}) = ${b[2]}$.`,
    };
  },

  // ---------- 1.4 The Matrix Equation Ax = b ----------

  // Like the book's "compute the product using the definition and the row-vector rule".
  '1.4-ax': (rand) => {
    const [m, n] = pick(rand, [[2, 3], [3, 2], [3, 3]]);
    const columns = Array.from({ length: n }, () => Array.from({ length: m }, () => randInt(rand, -3, 3)));
    const x = Array.from({ length: n }, () => randInt(rand, -3, 3));
    const ax = applyColumns(columns, x);
    const parts = columns.map((col, j) => `${x[j] < 0 ? `(${x[j]})` : x[j]}${colTex(col)}`).join(' + ');
    return {
      text: `Compute $A\\mathbf{x}$ for $A = ${matTex(columns)}$ and $\\mathbf{x} = ${colTex(x)}$.`,
      answer: ax,
      labels: ['entry 1', 'entry 2', 'entry 3'],
      why: `$A\\mathbf{x}$ is the columns of $A$ weighted by the entries of $\\mathbf{x}$: $${parts} = ${colTex(ax)}$.`,
    };
  },

  // Like the book's "do the columns of A span R^m? Does Ax = b have a solution for every b?"
  '1.4-span-rm': (rand) => {
    const shape = pick(rand, ['3x3', '3x3', '3x2', '3x4']);
    const n = shape === '3x2' ? 2 : shape === '3x4' ? 4 : 3;
    const columns = Array.from({ length: n }, () => randVec3(rand));
    // Half the time, build every column after the first two out of those two, so the columns only fill a plane.
    if (n >= 3 && rand() < 0.5) {
      for (let j = 2; j < n; j++) {
        const [p, q] = [randInt(rand, -2, 2), randInt(rand, -2, 2, true)];
        columns[j] = columns[0].map((x, r) => p * x + q * columns[1][r]);
      }
    }
    const pivots = pivotColumnsOf(transpose(columns)).length;
    return {
      text: `Do the columns of $A = ${matTex(columns)}$ span $\\mathbb{R}^3$? (Equivalently: does $A\\mathbf{x} = \\mathbf{b}$ have a solution for every $\\mathbf{b}$ in $\\mathbb{R}^3$?)`,
      choices: ['Yes', 'No'],
      answer: pivots === 3 ? 0 : 1,
      why:
        pivots === 3
          ? 'An echelon form of $A$ has a pivot in every one of its 3 rows.'
          : n === 2
            ? 'With only 2 columns, $A$ has at most 2 pivots, so one of its 3 rows has no pivot.'
            : `An echelon form of $A$ has only ${pivots} pivots, so a row has no pivot.`,
    };
  },

  // Like the book's "show that Ax = b does not have a solution for every b, and describe the b that work".
  '1.4-condition': (rand) => {
    const [a1, a2] = independentPair3(rand);
    const n = cross3(a1 as Vec3, a2 as Vec3);
    // The plane of the columns is n·b = 0. Writing it as b3 = p b1 + q b2 needs n3 ≠ 0.
    if (n[2] === 0) return chapter1['1.4-condition'](rand);
    const p = -n[0] / n[2] + 0;
    const q = -n[1] / n[2] + 0;
    return {
      text:
        `$A = ${matTex([a1, a2])}$. The equation $A\\mathbf{x} = \\mathbf{b}$ has a solution exactly when $b_3 = p\\,b_1 + q\\,b_2$. ` +
        'Find $p$ and $q$. (Fractions like 3/2 are fine.)',
      answer: [p, q],
      labels: ['p', 'q'],
      why: `Row reduce $[\\,A \\mid \\mathbf{b}\\,]$ with letters for $\\mathbf{b}$: the last row ends as $[\\,0 \\;\\; 0 \\mid \\text{a multiple of } (b_3 - p\\,b_1 - q\\,b_2)\\,]$, and the system is consistent only when that is 0. Here $p = ${formatNumber(p)}$ and $q = ${formatNumber(q)}$.`,
    };
  },

  // ---------- 1.5 Solution Sets of Linear Systems ----------

  // Like the book's "determine if the homogeneous system has a nontrivial solution".
  '1.5-nontrivial': (rand) => {
    const shape = pick(rand, ['2x3', '3x3', '3x3']);
    let rows: number[][];
    if (shape === '2x3') rows = randomRows(rand, 2, 3);
    else {
      rows = randomRows(rand, 3, 3);
      // Half the time, make the third equation a mix of the first two: then a free unknown appears.
      if (rand() < 0.5) {
        const [p, q] = [randInt(rand, -2, 2, true), randInt(rand, -2, 2)];
        rows[2] = rows[0].map((x, c) => p * x + q * rows[1][c]);
      }
    }
    const pivots = pivotColumnsOf(rows).length;
    const homogeneous = rows.map((row) => [...row, 0]);
    return {
      text: `Does this homogeneous system have a nontrivial solution (one that isn't all 0s)? $${systemTex(homogeneous)}$`,
      choices: ['Yes', 'No'],
      answer: pivots < 3 ? 0 : 1,
      why:
        pivots < 3
          ? `Row reducing gives only ${pivots} pivots for 3 unknowns, so at least one unknown is free, and choosing it non-zero gives a nontrivial solution.`
          : 'Row reducing gives a pivot in every column, so there are no free unknowns: the only solution is $x = y = z = 0$.',
    };
  },

  // Like the book's "describe all solutions of Ax = 0 in parametric vector form".
  '1.5-parametric': (rand) => {
    const rows = hiddenTwoByThree(rand);
    const [v] = nullSpaceBasis(transpose(rows));
    return {
      text:
        `Write the solutions of $A\\mathbf{x} = \\mathbf{0}$ in parametric vector form $\\mathbf{x} = t\\,\\mathbf{v}$, for $A = ${rowsTex(rows)}$. ` +
        'Scale $\\mathbf{v}$ so that its last entry is 1.',
      answer: v,
      labels: ['v₁', 'v₂', 'v₃'],
      why: `Row reducing $A$ leaves $z$ free. Setting $z = 1$ and solving for $x$ and $y$ gives $\\mathbf{v} = ${colTex(v.map(formatNumber))}$; every solution is a multiple of it, a line through the origin.`,
    };
  },

  // Like the book's "describe the solutions of Ax = b in parametric vector form, and compare with Ax = 0".
  '1.5-parametric-b': (rand) => {
    const left = hiddenTwoByThree(rand);
    const x0 = [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -3, 3)];
    const b = left.map((row) => row.reduce((sum, a, c) => sum + a * x0[c], 0));
    const { particular: p, directions } = completeSolution(transpose(left), b)!;
    const [v] = directions;
    return {
      text:
        `Write the solutions of $A\\mathbf{x} = \\mathbf{b}$ as $\\mathbf{x} = \\mathbf{p} + t\\,\\mathbf{v}$, for $A = ${rowsTex(left)}$ and $\\mathbf{b} = ${colTex(b)}$. ` +
        'Take $\\mathbf{p}$ with last entry 0, and $\\mathbf{v}$ with last entry 1.',
      answer: [...p, ...v],
      labels: ['p₁', 'p₂', 'p₃', 'v₁', 'v₂', 'v₃'],
      why: `$\\mathbf{p} = ${colTex(p.map(formatNumber))}$ is one solution (with $z = 0$), and $t\\,\\mathbf{v}$ runs through every solution of $A\\mathbf{x} = \\mathbf{0}$. The solutions of $A\\mathbf{x} = \\mathbf{b}$ are that line, slid over to pass through $\\mathbf{p}$.`,
    };
  },

  // ---------- 1.7 Linear Independence ----------

  // Like the book's "determine if the vectors are linearly independent".
  '1.7-independent': (rand) => {
    const vectors = [randVec3(rand), randVec3(rand), randVec3(rand)];
    if (rand() < 0.5) {
      // Build v3 out of v1 and v2, so the set is dependent.
      const [p, q] = [randInt(rand, -2, 2, true), randInt(rand, -2, 2)];
      vectors[2] = vectors[0].map((x, r) => p * x + q * vectors[1][r]);
    }
    const pivots = pivotColumnsOf(transpose(vectors)).length;
    return {
      text: `Are $${colTex(vectors[0])}, ${colTex(vectors[1])}, ${colTex(vectors[2])}$ linearly independent?`,
      choices: ['Yes, independent', 'No, dependent'],
      answer: pivots === 3 ? 0 : 1,
      why:
        pivots === 3
          ? 'Put them in the columns of a matrix and row reduce: every column gets a pivot, so $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution.'
          : `Put them in the columns of a matrix and row reduce: only ${pivots} columns get a pivot, so there is a free unknown and a nontrivial solution of $A\\mathbf{x} = \\mathbf{0}$.`,
    };
  },

  // Like the book's "find the value(s) of h for which the vectors are linearly dependent".
  '1.7-h-dependent': (rand) => {
    const [v1, v2] = independentPair3(rand);
    if (v1[0] * v2[1] - v1[1] * v2[0] === 0) return chapter1['1.7-h-dependent'](rand);
    const [c1, c2] = [randInt(rand, -2, 2, true), randInt(rand, -2, 2, true)];
    const v3 = v1.map((x, i) => c1 * x + c2 * v2[i]);
    return {
      text: `For which value of $h$ are $${colTex(v1)}, ${colTex(v2)}, ${colTex([v3[0], v3[1], 'h'])}$ linearly dependent?`,
      answer: v3[2],
      why: `The first two vectors are not multiples of each other, so the set is dependent exactly when the third is a mix of them. Its top two entries force $${c1}$ of the first plus $${c2}$ of the second, so $h = ${v3[2]}$.`,
    };
  },

  // Like the book's "determine by inspection whether the vectors are linearly independent".
  '1.7-inspection': (rand) => {
    const reason = pick(rand, ['zero', 'too many', 'multiple', 'none'] as const);
    let vectors: number[][];
    if (reason === 'too many') vectors = [randVec3(rand), randVec3(rand), randVec3(rand), randVec3(rand)];
    else if (reason === 'zero') vectors = shuffle(rand, [...independentPair3(rand), [0, 0, 0]]);
    else if (reason === 'multiple') {
      const [a, b] = independentPair3(rand);
      vectors = shuffle(rand, [a, b, a.map((x) => pick(rand, [-2, 2, 3]) * x)]);
    } else {
      vectors = [randVec3(rand), randVec3(rand), randVec3(rand)];
    }
    const hasZero = vectors.some((v) => v.every((x) => x === 0));
    const nonZero = vectors.filter((v) => v.some((x) => x !== 0));
    const multiples = nonZero.some((v, i) => nonZero.some((w, j) => i < j && pivotColumnsOf(transpose([v, w])).length < 2));
    // The quick tests must point at exactly one answer; otherwise make a new set.
    const fits = { zero: hasZero, 'too many': vectors.length > 3, multiple: multiples, none: false };
    const matching = (Object.keys(fits) as (keyof typeof fits)[]).filter((k) => fits[k]);
    const answer = matching.length === 0 ? 'none' : matching.length === 1 ? matching[0] : null;
    if (answer !== reason) return chapter1['1.7-inspection'](rand);
    const choices = {
      zero: 'It contains the zero vector',
      'too many': 'It has more vectors than entries in each vector',
      multiple: 'Two non-zero vectors are multiples of each other',
      none: 'None of these: row reduce to find out',
    };
    const why = {
      zero: '$1 \\cdot \\mathbf{0}$ plus 0 times the others is a nontrivial way to make $\\mathbf{0}$, so the set is dependent.',
      'too many': 'Four vectors in $\\mathbb{R}^3$ make a $3 \\times 4$ matrix: at most 3 pivots for 4 columns, so a free unknown, so dependent.',
      multiple: 'If $\\mathbf{w} = c\\,\\mathbf{v}$, then $c\\,\\mathbf{v} - \\mathbf{w} = \\mathbf{0}$ is a nontrivial combination, so the set is dependent.',
      none: 'No quick test applies, so you have to row reduce the matrix with these columns and count pivots.',
    };
    const order = ['zero', 'too many', 'multiple', 'none'] as const;
    return {
      text: `Which quick test, if any, shows that $${vectors.map(colTex).join(', ')}$ are linearly dependent?`,
      choices: order.map((k) => choices[k]),
      answer: order.indexOf(reason),
      why: why[reason],
    };
  },

  // ---------- 1.8 Introduction to Linear Transformations ----------

  // Like the book's "find a vector x whose image under T is b, and determine whether x is unique".
  '1.8-find-x': (rand) => {
    const [a1, a2] = independentPair3(rand);
    const x = [randInt(rand, -3, 3), randInt(rand, -3, 3)];
    const b = applyColumns([a1, a2], x);
    return {
      text: `$T(\\mathbf{x}) = A\\mathbf{x}$ with $A = ${matTex([a1, a2])}$. Find $\\mathbf{x}$ in $\\mathbb{R}^2$ with $T(\\mathbf{x}) = ${colTex(b)}$.`,
      answer: completeSolution([a1, a2], b)!.particular,
      labels: ['x₁', 'x₂'],
      why: `Row reduce $[\\,A \\mid \\mathbf{b}\\,]$. Both columns get a pivot, so there is no free unknown and this $\\mathbf{x}$ is the only one.`,
    };
  },

  // Like the book's "is b in the range of the linear transformation x ↦ Ax?"
  '1.8-in-range': (rand) => {
    const [a1, a2] = independentPair3(rand);
    const b = applyColumns([a1, a2], [randInt(rand, -2, 2, true), randInt(rand, -2, 2)]);
    if (rand() < 0.5) b[randInt(rand, 0, 2)] += pick(rand, [-2, -1, 1, 2]);
    const reachable = completeSolution([a1, a2], b) !== null;
    return {
      text: `$T(\\mathbf{x}) = A\\mathbf{x}$ with $A = ${matTex([a1, a2])}$. Is $\\mathbf{b} = ${colTex(b)}$ in the range of $T$?`,
      choices: ['Yes', 'No'],
      answer: reachable ? 0 : 1,
      why: reachable
        ? '$A\\mathbf{x} = \\mathbf{b}$ is consistent, so some $\\mathbf{x}$ has image $\\mathbf{b}$.'
        : 'Row reducing $[\\,A \\mid \\mathbf{b}\\,]$ gives a row $0 = c$ with $c \\ne 0$: no $\\mathbf{x}$ has image $\\mathbf{b}$.',
    };
  },

  // ---------- 1.9 The Matrix of a Linear Transformation ----------

  // Like the book's "find the standard matrix of T", from a picture in words or from T(e1), T(e2).
  '1.9-standard-matrix': (rand) => {
    const moves: { words: string; m: Mat2 }[] = [
      { words: 'rotates the plane 90° anticlockwise', m: [[0, 1], [-1, 0]] },
      { words: 'rotates the plane 90° clockwise', m: [[0, -1], [1, 0]] },
      { words: 'rotates the plane 180°', m: [[-1, 0], [0, -1]] },
      { words: 'reflects through the x-axis', m: [[1, 0], [0, -1]] },
      { words: 'reflects through the y-axis', m: [[-1, 0], [0, 1]] },
      { words: 'reflects through the line y = x', m: [[0, 1], [1, 0]] },
      { words: 'reflects through the line y = −x', m: [[0, -1], [-1, 0]] },
      { words: 'projects onto the x-axis', m: [[1, 0], [0, 0]] },
    ];
    const k = randInt(rand, -3, 3, true);
    moves.push({ words: `is the horizontal shear that sends $\\mathbf{e}_2$ to $\\mathbf{e}_2 ${k > 0 ? '+' : '-'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\mathbf{e}_1$ and keeps $\\mathbf{e}_1$`, m: [[1, 0], [k, 1]] });
    const style = pick(rand, ['one move', 'two moves', 'images']);
    if (style === 'images') {
      // T: R2 -> R3 given by where e1 and e2 go.
      const [c1, c2] = [randVec3(rand), randVec3(rand)];
      return {
        text: `$T : \\mathbb{R}^2 \\to \\mathbb{R}^3$ is linear, with $T(\\mathbf{e}_1) = ${colTex(c1)}$ and $T(\\mathbf{e}_2) = ${colTex(c2)}$. What is its standard matrix?`,
        answer: [c1[0], c2[0], c1[1], c2[1], c1[2], c2[2]],
        gridRows: 3,
        why: 'The standard matrix has $T(\\mathbf{e}_1)$ and $T(\\mathbf{e}_2)$ as its columns.',
      };
    }
    const first = pick(rand, moves);
    let m = first.m;
    let words = first.words;
    if (style === 'two moves') {
      const second = pick(rand, moves.filter((x) => x !== first));
      m = matMul(second.m, first.m);
      words = `first ${first.words}, then ${second.words.replace(/^is /, 'does ')}`;
    }
    return {
      text: `$T : \\mathbb{R}^2 \\to \\mathbb{R}^2$ ${words}. What is its standard matrix?`,
      // Row by row: m is stored as columns.
      answer: [m[0][0], m[1][0], m[0][1], m[1][1]].map((x) => x + 0),
      gridRows: 2,
      why: `Follow $\\mathbf{e}_1$ and $\\mathbf{e}_2$: they end at $${colTex(m[0].map((x) => x + 0))}$ and $${colTex(m[1].map((x) => x + 0))}$, and those are the columns.`,
    };
  },

  // Like the book's "determine if the linear transformation is (a) one-to-one and (b) onto".
  '1.9-one-to-one-onto': (rand) => {
    const [m, n] = pick(rand, [[2, 2], [3, 3], [3, 2], [2, 3]]);
    const columns = Array.from({ length: n }, () => Array.from({ length: m }, () => randInt(rand, -3, 3)));
    // Square ones: half the time make the last column a mix of the others, so it can't be either.
    if (m === n && rand() < 0.5) columns[n - 1] = columns[0].map((x, r) => pick(rand, [2, -1, 3]) * x + (n === 3 ? columns[1][r] : 0));
    const rank = pivotColumnsOf(transpose(columns)).length;
    if (rank === 0) return chapter1['1.9-one-to-one-onto'](rand);
    const oneToOne = rank === n;
    const onto = rank === m;
    const names = ['x_1', 'x_2', 'x_3'].slice(0, n);
    const formula = transpose(columns).map((row) => equationText([...row, 0], names).replace(/ = 0$/, '').replace(/−/g, '-'));
    const choices = ['One-to-one and onto', 'One-to-one, but not onto', 'Onto, but not one-to-one', 'Neither'];
    return {
      text: `Is $T(${names.join(', ')}) = (${formula.join(',\\; ')})$ one-to-one? Is it onto $\\mathbb{R}^${m}$?`,
      choices,
      answer: oneToOne ? (onto ? 0 : 1) : onto ? 2 : 3,
      why:
        `Its standard matrix is $${matTex(columns)}$, and an echelon form has ${rank} pivot${rank === 1 ? '' : 's'}. ` +
        `One-to-one needs a pivot in every column (${n}); onto needs a pivot in every row (${m}).`,
    };
  },
};
