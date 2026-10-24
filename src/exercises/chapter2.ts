// Practice questions for Chapter 2 of Lay's book (Matrix Algebra), written in the style of the book's exercises
// but with our own random numbers. Same idea as chapter1.ts: each generator picks numbers, then asks linalg.ts
// for the correct answer. Ids start with the book section, e.g. "2.1-…".
// (The old composition questions are called "2.4-…" because composition was lesson 2.4 before the site followed
// the book. They stay in module2.ts under those ids, so readers keep their ticks; the new §2.4 questions have
// different names, e.g. "2.4-block-product".)
import {
  addRows,
  applyRowOp,
  blockMatrixTex,
  completeSolution,
  coordinatesIn,
  elementaryRows,
  identityRows,
  inverseRows,
  mulRows,
  nullSpaceBasis,
  pivotColumnsOf,
  rank,
  roundTo,
  scaleRows,
  transpose,
  type RowOp,
} from '../lib/linalg';
import { rowOpTex } from './chapter1';
import { pick, randInt, rowsTex, shuffle, type Generator, type Rand } from './exercise';

/** A random matrix (as rows) of whole numbers from -limit to limit. */
function randomRows(rand: Rand, rowCount: number, columns: number, limit = 3): number[][] {
  return Array.from({ length: rowCount }, () => Array.from({ length: columns }, () => randInt(rand, -limit, limit)));
}

/** "3 \times 2" for a size. */
const size = (rows: number, columns: number) => `${rows} \\times ${columns}`;

/** A row times a column written out: "(1)(2) + (-3)(0) = 2". */
function rowTimesColumn(row: number[], column: number[]): string {
  const terms = row.map((x, k) => `(${x})(${column[k]})`).join(' + ');
  return `${terms} = ${row.reduce((sum, x, k) => sum + x * column[k], 0)}`;
}

/** "3A - 2B", "-A + B": a combination of two matrices, written the usual way. */
function comboTex(r: number, s: number): string {
  const first = r === 1 ? 'A' : r === -1 ? '-A' : `${r}A`;
  const second = Math.abs(s) === 1 ? 'B' : `${Math.abs(s)}B`;
  return `${first} ${s < 0 ? '-' : '+'} ${second}`;
}

/** Every number of a matrix (as rows), row by row: the answer to a question with gridRows. */
const flat = (m: number[][]) => m.flat().map((x) => x + 0);

/**
 * A random invertible 3×3 matrix (as rows) whose inverse has whole numbers too: start from I and do a few
 * "add a multiple of one row to another" operations (which never change that). Numbers stay from -6 to 6.
 */
function wholeInverse3(rand: Rand): { a: number[][]; inverse: number[][] } {
  let a = identityRows(3);
  for (let step = 0; step < 4; step++) {
    const i = randInt(rand, 0, 2);
    const j = (i + randInt(rand, 1, 2)) % 3;
    a = applyRowOp(a, { kind: 'add', i, j, k: pick(rand, [-2, -1, 1, 2]) });
  }
  if (rand() < 0.3) a = applyRowOp(a, { kind: 'swap', i: 0, j: randInt(rand, 1, 2) });
  const inverse = inverseRows(a)!.map((row) => row.map((x) => Math.round(x) + 0));
  const small = (m: number[][]) => m.flat().every((x) => Math.abs(x) <= 6);
  // Too easy (still I, or one step from it) or too big: try again.
  const zeros = a.flat().filter((x) => x === 0).length;
  return small(a) && small(inverse) && zeros <= 4 ? { a, inverse } : wholeInverse3(rand);
}

/** "3x_1 - x_2" for the numbers [3, -1]: a row of a linear formula. */
function linearTex(coefficients: number[], names = ['x_1', 'x_2', 'x_3']): string {
  const terms: string[] = [];
  coefficients.forEach((k, i) => {
    if (k === 0) return;
    const size = Math.abs(k) === 1 ? '' : String(Math.abs(k));
    terms.push(terms.length === 0 ? `${k < 0 ? '-' : ''}${size}${names[i]}` : `${k < 0 ? '-' : '+'} ${size}${names[i]}`);
  });
  return terms.length ? terms.join(' ') : '0';
}

/** A random 2×2 matrix (as rows, no 0s) with ad − bc = ±1, so its inverse has whole numbers too. */
function wholeInverse2(rand: Rand): number[][] {
  const a = randomRows(rand, 2, 2);
  const det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
  return Math.abs(det) === 1 && !a.flat().includes(0) ? a : wholeInverse2(rand);
}

const zero2 = [
  [0, 0],
  [0, 0],
];

/** TeX for a matrix given as a list of columns (handy when the columns are built one by one). */
const matTexRows = (columns: number[][]) => rowsTex(transpose(columns));

/** A matrix (as rows) times a vector. */
const times = (a: number[][], x: number[]) => mulRows(a, x.map((v) => [v]))!.map((row) => row[0]);

/** TeX for a column vector of whole numbers. */
const colTex = (v: number[]) => rowsTex(v.map((x) => [x]));

/** A random 3D vector with whole numbers from -3 to 3, never all 0. */
function randVec3(rand: Rand): number[] {
  const v = [randInt(rand, -3, 3), randInt(rand, -3, 3), randInt(rand, -3, 3)];
  return v.some((x) => x !== 0) ? v : randVec3(rand);
}

/** Two 3D vectors that are not multiples of each other: a basis of the plane they span. */
function independentPair3(rand: Rand): [number[], number[]] {
  const pair: [number[], number[]] = [randVec3(rand), randVec3(rand)];
  return rank(pair) === 2 ? pair : independentPair3(rand);
}

/** "Columns 1, 2 and 4", counting from 1. */
function columnList(cols: number[]): string {
  const names = cols.map((c) => String(c + 1));
  return names.length === 1 ? `Column ${names[0]}` : `Columns ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Sentences that are true of every invertible n×n matrix A, and their opposites, true of every singular one. */
const invertibleFacts = [
  'The columns of $A$ span $\\mathbb{R}^n$.',
  'The equation $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution.',
  '$A$ has $n$ pivot positions.',
  'The transformation $\\mathbf{x} \\mapsto A\\mathbf{x}$ is one-to-one.',
  'The transformation $\\mathbf{x} \\mapsto A\\mathbf{x}$ maps $\\mathbb{R}^n$ onto $\\mathbb{R}^n$.',
  'The columns of $A$ are linearly independent.',
  '$A\\mathbf{x} = \\mathbf{b}$ has a solution for every $\\mathbf{b}$ in $\\mathbb{R}^n$.',
  '$A^T$ is invertible.',
  '$A$ is row equivalent to $I_n$.',
];
const singularFacts = [
  'The columns of $A$ do not span $\\mathbb{R}^n$.',
  'The equation $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution.',
  '$A$ has fewer than $n$ pivot positions.',
  'The transformation $\\mathbf{x} \\mapsto A\\mathbf{x}$ is not one-to-one.',
  'The transformation $\\mathbf{x} \\mapsto A\\mathbf{x}$ does not map $\\mathbb{R}^n$ onto $\\mathbb{R}^n$.',
  'The columns of $A$ are linearly dependent.',
  'For some $\\mathbf{b}$ in $\\mathbb{R}^n$, $A\\mathbf{x} = \\mathbf{b}$ has no solution.',
  '$A^T$ is not invertible.',
  '$A$ is not row equivalent to $I_n$.',
];

export const chapter2: Record<string, Generator> = {
  // ---------- 2.1 Matrix Operations ----------

  // Like the book's "A is 3×5 and B is 5×2: what size is AB? Or is it undefined?"
  '2.1-size': (rand) => {
    const [m, n, q] = [randInt(rand, 1, 5), randInt(rand, 2, 5), randInt(rand, 1, 5)];
    // Two times in three, B has as many rows as A has columns, so AB is defined.
    const p = rand() < 2 / 3 ? n : pick(rand, [1, 2, 3, 4, 5].filter((k) => k !== n));
    const right = p === n ? `$${size(m, q)}$` : 'Not defined';
    const options = [`$${size(m, q)}$`, `$${size(q, m)}$`, `$${size(m, n)}$`, `$${size(p, q)}$`, `$${size(n, p)}$`];
    const wrong = shuffle(rand, [...new Set(options)].filter((o) => o !== right));
    const choices = shuffle(rand, [right, ...wrong.slice(0, 2), ...(right === 'Not defined' ? [] : ['Not defined'])]);
    if (choices.length < 3) return chapter2['2.1-size'](rand);
    return {
      text: `$A$ is $${size(m, n)}$ and $B$ is $${size(p, q)}$. What size is $AB$?`,
      choices,
      answer: choices.indexOf(right),
      why:
        p === n
          ? `The inside numbers match ($${n} = ${p}$), so $AB$ is defined. Its size is the outside numbers: $${size(m, q)}$.`
          : `$A$ has ${n} columns but $B$ has ${p} rows. Each row of $A$ needs one number per row of $B$, so $AB$ is not defined.`,
    };
  },

  // Like the book's "use the row–column rule to find one entry of AB".
  '2.1-entry': (rand) => {
    const a = randomRows(rand, 2, 3);
    const b = randomRows(rand, 3, pick(rand, [2, 3]));
    const [i, j] = [randInt(rand, 0, 1), randInt(rand, 0, b[0].length - 1)];
    const column = b.map((row) => row[j]);
    return {
      text: `$A = ${rowsTex(a)}$ and $B = ${rowsTex(b)}$. What is the entry in row ${i + 1}, column ${j + 1} of $AB$?`,
      answer: mulRows(a, b)![i][j],
      why: `Row ${i + 1} of $A$ times column ${j + 1} of $B$: $${rowTimesColumn(a[i], column)}$.`,
    };
  },

  // Like the book's "compute AB, by columns or by the row–column rule".
  '2.1-product': (rand) => {
    const a = randomRows(rand, 2, 2);
    const b = randomRows(rand, 2, 3);
    return {
      text: `$A = ${rowsTex(a)}$ and $B = ${rowsTex(b)}$. Work out $AB$.`,
      answer: flat(mulRows(a, b)!),
      gridRows: 2,
      why: `$AB$ is $${size(2, 2)}$ times $${size(2, 3)}$, so it is $${size(2, 3)}$. Each column of $AB$ is $A$ times that column of $B$.`,
    };
  },

  // Like the book's "compute 3A − 2B, or say it is undefined".
  '2.1-combo': (rand) => {
    const columns = pick(rand, [2, 3]);
    const a = randomRows(rand, 2, columns);
    const b = randomRows(rand, 2, columns);
    const r = pick(rand, [-1, 2, 3, -2]);
    const s = pick(rand, [1, -1, 2, -2, -3]);
    return {
      text: `$A = ${rowsTex(a)}$ and $B = ${rowsTex(b)}$. Work out $${comboTex(r, s)}$.`,
      answer: flat(addRows(scaleRows(r, a), scaleRows(s, b))!),
      gridRows: 2,
      why: 'Sums and multiples work number by number: multiply every number of $A$ and of $B$, then add the matching numbers.',
    };
  },

  // Like the book's (AB)ᵀ = BᵀAᵀ: the transpose of a product.
  '2.1-transpose': (rand) => {
    const a = randomRows(rand, 2, 3);
    const b = randomRows(rand, 3, 2);
    const ab = mulRows(a, b)!;
    return {
      text: `$A = ${rowsTex(a)}$ and $B = ${rowsTex(b)}$. Work out $(AB)^T$.`,
      answer: flat(transpose(ab)),
      gridRows: 2,
      why: `$AB = ${rowsTex(ab)}$, and its transpose turns rows into columns. That is also $B^TA^T$ (in reverse order). $A^TB^T$ would be $${size(3, 3)}$, a different matrix.`,
    };
  },

  // Like the book's "what value(s) of k, if any, make AB = BA?"
  '2.1-commute': (rand) => {
    const a = randomRows(rand, 2, 2);
    if (a[0][1] === 0 || a[1][0] === 0) return chapter2['2.1-commute'](rand);
    // B = pA + qI always commutes with A. Hide its bottom-right number.
    const [p, q] = [pick(rand, [-2, -1, 1, 2, 3]), randInt(rand, -3, 3)];
    const b = addRows(scaleRows(p, a), scaleRows(q, [[1, 0], [0, 1]]))!;
    const k = b[1][1];
    return {
      text:
        `$A = ${rowsTex(a)}$ and $B = \\begin{bmatrix} ${b[0][0]} & ${b[0][1]} \\\\ ${b[1][0]} & k \\end{bmatrix}$. ` +
        'For which $k$ is $AB = BA$?',
      answer: k,
      why: `Work out both products with $k$ in them and set the top-right numbers equal: that gives one equation for $k$, with answer $k = ${k}$. Check: then $B = ${p === 1 ? '' : p === -1 ? '-' : p}A${q === 0 ? '' : ` ${q < 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}I`}$, and $A$ commutes with itself and with $I$.`,
    };
  },
  // ---------- 2.2 The Inverse of a Matrix ----------

  // Like the book's "find the inverse of this 2×2 matrix".
  '2.2-inverse2': (rand) => {
    const a = randomRows(rand, 2, 2);
    const det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
    if (![-2, -1, 1, 2].includes(det)) return chapter2['2.2-inverse2'](rand);
    const [[p, q], [r, t]] = a;
    return {
      text: `Find the inverse of $A = ${rowsTex(a)}$.`,
      answer: flat(inverseRows(a)!),
      gridRows: 2,
      note: 'Fractions like 1/2 are fine.',
      why: `$ad - bc = (${p})(${t}) - (${q})(${r}) = ${det}$. Swap $a$ and $d$, change the signs of $b$ and $c$, and divide by ${det}: $A^{-1} = \\frac{1}{${det}}${rowsTex([[t, -q], [-r, p]])}$.`,
    };
  },

  // Like the book's "find the elementary matrix that does this row operation".
  '2.2-elementary': (rand) => {
    const kind = pick(rand, ['swap', 'scale', 'add', 'add'] as const);
    const i = randInt(rand, 0, 2);
    const j = (i + randInt(rand, 1, 2)) % 3;
    const op: RowOp =
      kind === 'swap'
        ? { kind, i: Math.min(i, j), j: Math.max(i, j) }
        : kind === 'scale'
          ? { kind, i, k: pick(rand, [-3, -2, 2, 3, 4]) }
          : { kind, i, j, k: pick(rand, [-4, -3, -2, -1, 2, 3, 4]) };
    return {
      text: `Find the $3 \\times 3$ elementary matrix $E$ such that $EA$ is $A$ after the row operation $${rowOpTex(op)}$, for every $3 \\times 3$ matrix $A$.`,
      answer: flat(elementaryRows(3, op)),
      gridRows: 3,
      why: `Do the row operation to the identity matrix $I_3$. Then $EA = E \\cdot A$ does the same operation to $A$.`,
    };
  },

  // Like the book's "find the inverse by row reducing [A I]".
  '2.2-inverse3': (rand) => {
    const { a, inverse } = wholeInverse3(rand);
    return {
      text: `Find the inverse of $A = ${rowsTex(a)}$ by row reducing $[\\,A \\;\\; I\\,]$.`,
      answer: flat(inverse),
      gridRows: 3,
      why: `Row reducing $[\\,A \\;\\; I\\,]$ turns the left half into $I$, and the right half is then $A^{-1}$. Check: $AA^{-1} = I$.`,
    };
  },

  // Like the book's "find one column of A⁻¹ without computing the others".
  '2.2-inverse-column': (rand) => {
    const { a, inverse } = wholeInverse3(rand);
    const j = randInt(rand, 0, 2);
    const e = [0, 0, 0];
    e[j] = 1;
    return {
      text: `$A = ${rowsTex(a)}$ is invertible. Find column ${j + 1} of $A^{-1}$ without working out the other two columns.`,
      answer: inverse.map((row) => row[j]),
      why: `Column ${j + 1} of $A^{-1}$ is $A^{-1}\\mathbf{e}_${j + 1}$, the solution of $A\\mathbf{x} = \\mathbf{e}_${j + 1}$. Row reduce $[\\,A \\;\\; \\mathbf{e}_${j + 1}\\,]$ with $\\mathbf{e}_${j + 1} = ${rowsTex(e.map((x) => [x]))}$.`,
    };
  },
  // ---------- 2.3 Characterizations of Invertible Matrices ----------

  // Like the book's "decide whether the matrix is invertible, with as few calculations as possible".
  '2.3-invertible': (rand) => {
    const kind = pick(rand, ['triangular', 'triangular-zero', 'equal-columns', 'zero-row', 'any', 'any']);
    let a = randomRows(rand, 3, 3);
    let why = '';
    if (kind === 'triangular' || kind === 'triangular-zero') {
      const upper = rand() < 0.5;
      a = a.map((row, r) => row.map((x, c) => ((upper ? c < r : c > r) ? 0 : c === r ? pick(rand, [-3, -2, -1, 1, 2, 3]) : x)));
      if (kind === 'triangular-zero') {
        const d = randInt(rand, 0, 2);
        a[d][d] = 0;
        why = `$A$ is triangular with a 0 on its diagonal, so it has fewer than 3 pivot positions.`;
      } else why = 'A triangular matrix with no 0 on its diagonal already has a pivot in every column: 3 pivot positions.';
    } else if (kind === 'equal-columns') {
      const [i, j] = shuffle(rand, [0, 1, 2]);
      const k = pick(rand, [-2, -1, 1, 2]);
      a.forEach((row) => (row[j] = k * row[i]));
      why = `Column ${j + 1} is ${k === 1 ? 'the same as' : `${k} times`} column ${i + 1}, so the columns are linearly dependent.`;
    } else if (kind === 'zero-row') {
      a[randInt(rand, 0, 2)] = [0, 0, 0];
      why = 'A row of 0s means $A$ has fewer than 3 pivot positions (and its columns cannot span $\\mathbb{R}^3$).';
    }
    const pivots = pivotColumnsOf(a).length;
    if (!why)
      why =
        pivots === 3
          ? 'Row reduce: $A$ has 3 pivot positions, so it is invertible.'
          : `Row reduce: $A$ has only ${pivots} pivot positions, so it is not invertible.`;
    return {
      text: `Is $A = ${rowsTex(a)}$ invertible? Use as little work as you can.`,
      choices: ['Yes', 'No'],
      answer: pivots === 3 ? 0 : 1,
      why,
    };
  },

  // Like the book's "A is a square matrix and [some fact]. What else must be true?" (the Invertible Matrix Theorem).
  '2.3-which-true': (rand) => {
    const invertible = rand() < 0.5;
    const [given, ...others] = shuffle(rand, [...Array(invertibleFacts.length).keys()]);
    const same = invertible ? invertibleFacts : singularFacts;
    const opposite = invertible ? singularFacts : invertibleFacts;
    // One more sentence from the same side (true), and three from the other side (false).
    const right = same[others[0]];
    const wrong = shuffle(rand, others.slice(1)).slice(0, 3).map((i) => opposite[i]);
    const choices = shuffle(rand, [right, ...wrong]);
    return {
      text: `$A$ is an $n \\times n$ matrix, and you know this: "${same[given]}" Which of these must also be true?`,
      choices,
      answer: choices.indexOf(right),
      why: invertible
        ? 'That fact is one of the statements of the Invertible Matrix Theorem, so $A$ is invertible, and every statement of the theorem is true.'
        : 'That fact is the opposite of a statement in the Invertible Matrix Theorem, so $A$ is not invertible, and every statement of the theorem is false.',
    };
  },

  // Like the book's "show that T is invertible and find a formula for T⁻¹".
  '2.3-inverse-map': (rand) => {
    const a = randomRows(rand, 2, 2);
    const det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
    if (![-1, 1].includes(det) || a.flat().includes(0)) return chapter2['2.3-inverse-map'](rand);
    return {
      text: `$T(x_1, x_2) = (${linearTex(a[0])},\; ${linearTex(a[1])})$. $T$ is invertible, and $T^{-1}(\\mathbf{x}) = B\\mathbf{x}$ for a matrix $B$. Find $B$.`,
      answer: flat(inverseRows(a)!),
      gridRows: 2,
      why: `The standard matrix of $T$ is $A = ${rowsTex(a)}$, and $ad - bc = ${det} \\neq 0$, so $A$ is invertible. Then $T^{-1}(\\mathbf{x}) = A^{-1}\\mathbf{x}$, so $B = A^{-1}$.`,
    };
  },
  // ---------- 2.4 Partitioned Matrices ----------

  // Like the book's "compute the block product" (blocks multiply like numbers, keeping their order).
  '2.4-block-product': (rand) => {
    const e = randomRows(rand, 2, 2);
    const p = randomRows(rand, 2, 2);
    const q = randomRows(rand, 2, 2);
    const i2 = identityRows(2);
    return {
      text: `Work out the bottom block of the product $${blockMatrixTex([[i2, zero2], [e, i2]])}${blockMatrixTex([[p], [q]])}$, without multiplying out the whole $4 \\times 4$ matrix.`,
      answer: flat(addRows(mulRows(e, p)!, q)!),
      gridRows: 2,
      why: `Treat the blocks like numbers: the bottom block is $EP + IQ = EP + Q$, with $E = ${rowsTex(e)}$, $P = ${rowsTex(p)}$ and $Q = ${rowsTex(q)}$.`,
    };
  },

  // Like the book's "find formulas for the unknown blocks X, Y, Z".
  '2.4-unknown-block': (rand) => {
    const a = wholeInverse2(rand);
    const b = randomRows(rand, 2, 2);
    const x = scaleRows(-1, mulRows(b, inverseRows(a)!)!).map((row) => row.map((v) => Math.round(v) + 0));
    return {
      text: `Find the block $X$ that makes $\\begin{bmatrix} I & 0 \\\\ X & I \\end{bmatrix}${blockMatrixTex([[a], [b]])} = ${blockMatrixTex([[a], [zero2]])}$.`,
      answer: flat(x),
      gridRows: 2,
      why: `The bottom block says $XA + B = 0$, so $X = -BA^{-1}$. Here $A^{-1} = ${rowsTex(inverseRows(a)!.map((row) => row.map((v) => Math.round(v) + 0)))}$.`,
    };
  },

  // Like the book's inverse of a block upper triangular matrix [A B; 0 C].
  '2.4-block-inverse': (rand) => {
    const a = wholeInverse2(rand);
    const c = wholeInverse2(rand);
    const b = randomRows(rand, 2, 2);
    const round = (m: number[][]) => m.map((row) => row.map((v) => Math.round(v) + 0));
    const [aInv, cInv] = [round(inverseRows(a)!), round(inverseRows(c)!)];
    const topRight = scaleRows(-1, mulRows(mulRows(aInv, b)!, cInv)!);
    return {
      text: `$M = ${blockMatrixTex([[a, b], [zero2, c]])}$ is block upper triangular. Its inverse is $\\begin{bmatrix} A^{-1} & Y \\\\ 0 & C^{-1} \\end{bmatrix}$. Find the block $Y$.`,
      answer: flat(topRight),
      gridRows: 2,
      why: `Multiply $M$ by its inverse: the top-right block is $AY + BC^{-1}$, and it must be $0$. So $Y = -A^{-1}BC^{-1}$, with $A^{-1} = ${rowsTex(aInv)}$ and $C^{-1} = ${rowsTex(cInv)}$.`,
    };
  },
  // ---------- 2.8 Subspaces of Rⁿ ----------

  // Like the book's "is u in Nul A?"
  '2.8-in-nul': (rand) => {
    // Pick u first (last number ±1), then build A's last column so that Au = 0.
    const u = [randInt(rand, -2, 2), randInt(rand, -2, 2), randInt(rand, -2, 2), pick(rand, [-1, 1])];
    const a = randomRows(rand, 3, 3).map((row) => {
      const partial = row.reduce((sum, x, k) => sum + x * u[k], 0);
      return [...row, -partial / u[3] + 0];
    });
    const changed = randInt(rand, 0, 2);
    const nudge = pick(rand, [-1, 1]);
    const test = rand() < 0.5 ? u : u.map((x, k) => (k === changed ? x + nudge : x));
    const au = times(a, test);
    const inside = au.every((x) => x === 0);
    return {
      text: `$A = ${rowsTex(a)}$ and $\\mathbf{u} = ${colTex(test)}$. Is $\\mathbf{u}$ in $\\operatorname{Nul} A$?`,
      choices: ['Yes', 'No'],
      answer: inside ? 0 : 1,
      why: `Just multiply: $A\\mathbf{u} = ${colTex(au)}$${inside ? ', so $\\mathbf{u}$ is in $\\operatorname{Nul} A$.' : ', which is not $\\mathbf{0}$.'}`,
    };
  },

  // Like the book's "is p in Col A?"
  '2.8-in-col': (rand) => {
    const [a1, a2] = independentPair3(rand);
    const a = [0, 1, 2].map((r) => [a1[r], a2[r]]);
    const [c1, c2] = [randInt(rand, -2, 2, true), randInt(rand, -2, 2)];
    const inPlane = a.map((row) => c1 * row[0] + c2 * row[1]);
    const b = rand() < 0.5 ? inPlane : inPlane.map((x, k) => (k === 2 ? x + pick(rand, [-2, -1, 1, 2]) : x));
    const solution = completeSolution([a1, a2], b);
    return {
      text: `$A = ${rowsTex(a)}$ and $\\mathbf{b} = ${colTex(b)}$. Is $\\mathbf{b}$ in $\\operatorname{Col} A$?`,
      choices: ['Yes', 'No'],
      answer: solution ? 0 : 1,
      why: solution
        ? `$A\\mathbf{x} = \\mathbf{b}$ is consistent: $\\mathbf{b} = ${solution.particular[0]}\\mathbf{a}_1 ${solution.particular[1] < 0 ? '-' : '+'} ${Math.abs(solution.particular[1])}\\mathbf{a}_2$.`
        : 'Row reduce $[\\,A \;\; \\mathbf{b}\\,]$: a row $[\\,0 \;\; 0 \;\; c\\,]$ with $c \\neq 0$ appears, so $A\\mathbf{x} = \\mathbf{b}$ is inconsistent.',
    };
  },

  // Like the book's "Nul A is a subspace of Rᵖ and Col A of R^q: find p and q".
  '2.8-sizes': (rand) => {
    const [m, n] = [randInt(rand, 2, 4), randInt(rand, 2, 5)];
    if (m === n) return chapter2['2.8-sizes'](rand);
    const a = randomRows(rand, m, n);
    return {
      text: `$A = ${rowsTex(a)}$. $\\operatorname{Nul} A$ is a subspace of $\\mathbb{R}^p$ and $\\operatorname{Col} A$ is a subspace of $\\mathbb{R}^q$. Find $p$ and $q$.`,
      answer: [n, m],
      labels: ['p', 'q'],
      why: `$\\operatorname{Nul} A$ holds the $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{0}$: one number per column of $A$, so ${n}. $\\operatorname{Col} A$ holds mixes of the columns: one number per row, so ${m}.`,
    };
  },

  // Like the book's "find a basis for Nul A" (with one free unknown, set to 1 so there is one answer).
  '2.8-nul-basis': (rand) => {
    const a = randomRows(rand, 2, 3);
    const pivots = pivotColumnsOf(a);
    const [exact] = nullSpaceBasis(transpose(a));
    // Only whole-number answers (allowing for rounding errors like 2.0000000001).
    if (pivots.join() !== '0,1' || exact.some((x) => Math.abs(x - Math.round(x)) > 1e-9)) return chapter2['2.8-nul-basis'](rand);
    const n = exact.map((x) => Math.round(x) + 0);
    return {
      text: `$A = ${rowsTex(a)}$. $\\operatorname{Nul} A$ is a line, so one vector is a basis. Find the basis vector with $x_3 = 1$.`,
      answer: n,
      labels: ['x₁', 'x₂', 'x₃'],
      why: `Row reduce $[\\,A \;\; \\mathbf{0}\\,]$: $x_1$ and $x_2$ are basic and $x_3$ is free. With $x_3 = 1$ the solution is $${colTex(n)}$, and every solution of $A\\mathbf{x} = \\mathbf{0}$ is a multiple of it.`,
    };
  },

  // Like the book's "find a basis for Col A": the pivot columns of A itself.
  '2.8-col-basis': (rand) => {
    // Three columns of 3 numbers, then a fourth column made of earlier ones (sometimes the second too).
    const columns = [randVec3(rand), randVec3(rand), randVec3(rand)];
    if (rand() < 0.5) columns[1] = columns[0].map((x) => pick(rand, [-2, 2, 3]) * x);
    const [p, q] = [randInt(rand, -2, 2, true), randInt(rand, -2, 2, true)];
    columns.splice(randInt(rand, 2, 3), 0, columns[0].map((x, r) => p * x + q * columns[2][r]));
    const pivots = pivotColumnsOf(transpose(columns));
    const all = [[0, 1], [0, 2], [0, 3], [1, 2], [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3], [0, 1, 2, 3]];
    const right = columnList(pivots);
    // A wrong option must really be wrong: not another set of columns that also happens to be a basis.
    const alsoBasis = (cols: number[]) => cols.length === pivots.length && rank(cols.map((c) => columns[c])) === pivots.length;
    const wrong = shuffle(rand, all.filter((cols) => !alsoBasis(cols)).map(columnList)).slice(0, 3);
    const choices = shuffle(rand, [right, ...wrong]);
    return {
      text: `$A = ${matTexRows(columns)}$. Which of these sets of columns of $A$ is a basis for $\\operatorname{Col} A$?`,
      choices,
      answer: choices.indexOf(right),
      why: `Row reduce $A$: the pivots are in ${right.toLowerCase()}. The pivot columns of $A$ itself (not of its echelon form) are a basis for $\\operatorname{Col} A$; the other columns are mixes of them.`,
    };
  },

  // Like the book's "is this set a basis of R³?"
  '2.8-basis-r3': (rand) => {
    const count = pick(rand, [2, 3, 3, 3, 4]);
    const vectors = Array.from({ length: count }, () => randVec3(rand));
    if (count === 3 && rand() < 0.5) vectors[2] = vectors[0].map((x, r) => pick(rand, [1, -1, 2]) * x + vectors[1][r]);
    const r = rank(vectors);
    const basis = count === 3 && r === 3;
    return {
      text: `Do $${vectors.map(colTex).join(', ')}$ form a basis for $\\mathbb{R}^3$?`,
      choices: ['Yes', 'No'],
      answer: basis ? 0 : 1,
      why:
        count === 2
          ? 'Two vectors span at most a plane, so they cannot span $\\mathbb{R}^3$.'
          : count === 4
            ? 'Four vectors in $\\mathbb{R}^3$ are always linearly dependent.'
            : basis
              ? 'Put them in the columns of a $3 \\times 3$ matrix: it has 3 pivots, so the columns are independent and span $\\mathbb{R}^3$.'
              : `Put them in the columns of a $3 \\times 3$ matrix: it has only ${r} pivots, so they are linearly dependent.`,
    };
  },

  // ---------- 2.9 Dimension and Rank ----------

  // Like the book's "find x from its B-coordinates".
  '2.9-from-coords': (rand) => {
    const [b1, b2] = independentPair3(rand);
    const c = [randInt(rand, -3, 3, true), randInt(rand, -3, 3)];
    return {
      text: `$\\mathcal{B} = \\{\\mathbf{b}_1, \\mathbf{b}_2\\}$ is a basis for a plane $H$ in $\\mathbb{R}^3$, with $\\mathbf{b}_1 = ${colTex(b1)}$ and $\\mathbf{b}_2 = ${colTex(b2)}$. Find $\\mathbf{x}$ if $[\\mathbf{x}]_{\\mathcal{B}} = ${colTex(c)}$.`,
      answer: b1.map((x, r) => c[0] * x + c[1] * b2[r] + 0),
      why: `$[\\mathbf{x}]_{\\mathcal{B}}$ holds the weights: $\\mathbf{x} = ${c[0]}\\mathbf{b}_1 ${c[1] < 0 ? '-' : '+'} ${Math.abs(c[1])}\\mathbf{b}_2$.`,
    };
  },

  // Like the book's "x is in H: find its coordinates relative to the basis B".
  '2.9-coords': (rand) => {
    const [b1, b2] = independentPair3(rand);
    const c = [randInt(rand, -3, 3, true), randInt(rand, -3, 3, true)];
    const x = b1.map((v, r) => c[0] * v + c[1] * b2[r] + 0);
    return {
      text: `$\\mathbf{b}_1 = ${colTex(b1)}$ and $\\mathbf{b}_2 = ${colTex(b2)}$ are a basis $\\mathcal{B}$ for a plane $H$, and $\\mathbf{x} = ${colTex(x)}$ is in $H$. Find $[\\mathbf{x}]_{\\mathcal{B}}$.`,
      answer: coordinatesIn([b1, b2], x)!.map((v) => roundTo(v, 9)), // no rounding errors like 0.9999999999
      labels: ['c₁', 'c₂'],
      why: `Solve $c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 = \\mathbf{x}$ by row reducing $[\\,\\mathbf{b}_1 \;\; \\mathbf{b}_2 \;\; \\mathbf{x}\\,]$: $c_1 = ${c[0]}$, $c_2 = ${c[1]}$.`,
    };
  },

  // Like the book's "find the rank of A and the dimension of Nul A".
  '2.9-dims': (rand) => {
    const n = pick(rand, [4, 5]);
    const r = pick(rand, [1, 2, 2, 3]);
    // r independent-looking columns, the rest mixes of them, then the columns in a random order.
    const base = Array.from({ length: r }, () => randVec3(rand));
    if (rank(base) < r) return chapter2['2.9-dims'](rand);
    const extra = Array.from({ length: n - r }, () => {
      const w = base.map(() => randInt(rand, -2, 2));
      return [0, 1, 2].map((row) => base.reduce((sum, col, k) => sum + w[k] * col[row], 0));
    });
    const columns = shuffle(rand, [...base, ...extra]);
    const rk = rank(columns);
    return {
      text: `$A = ${matTexRows(columns)}$. Find $\\operatorname{rank} A$ and $\\dim \\operatorname{Nul} A$.`,
      answer: [rk, n - rk],
      labels: ['rank A', 'dim Nul A'],
      why: `Row reduce $A$: it has ${rk} pivot column${rk === 1 ? '' : 's'}, so $\\operatorname{rank} A = ${rk}$. The other ${n - rk} column${n - rk === 1 ? ' is' : 's are'} free, so $\\dim \\operatorname{Nul} A = ${n - rk}$. Check: $${rk} + ${n - rk} = ${n}$, the number of columns.`,
    };
  },

  // Like the book's rank theorem questions: "A is 5×7 with rank 3. What is dim Nul A?" and the other way round.
  '2.9-rank-theorem': (rand) => {
    const [m, n] = [randInt(rand, 3, 7), randInt(rand, 3, 8)];
    const r = randInt(rand, 1, Math.min(m, n));
    const askRank = rand() < 0.5;
    return {
      text: askRank
        ? `$A$ is a $${size(m, n)}$ matrix and $\\dim \\operatorname{Nul} A = ${n - r}$. What is $\\operatorname{rank} A$?`
        : `$A$ is a $${size(m, n)}$ matrix with $\\operatorname{rank} A = ${r}$. What is $\\dim \\operatorname{Nul} A$?`,
      answer: askRank ? r : n - r,
      why: `The Rank Theorem: $\\operatorname{rank} A + \\dim \\operatorname{Nul} A = n$, the number of columns, here ${n}. (The ${m} rows don't enter.)`,
    };
  },
};
