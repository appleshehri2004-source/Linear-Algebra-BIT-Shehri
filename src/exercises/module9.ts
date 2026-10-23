// Practice questions for Module 9 (Abstract vector spaces), lessons 9.1–9.3. Same idea as the other module files:
// each generator picks random numbers, then asks linalg.ts for the correct answer.
// Polynomials are coefficient lists, constant first: [5, 4, 5, 1] is x³ + 5x² + 4x + 5.
import { addPoly, derivePoly, evalPoly, polyTex, scalePoly, type Poly } from '../lib/linalg';
import { pick, randInt, type Generator, type Rand } from './exercise';

/** A random polynomial with `size` whole-number coefficients, the top one never 0 (so the degree is size − 1). */
function randomPoly(rand: Rand, size: number, limit = 5): Poly {
  return Array.from({ length: size }, (_, i) => randInt(rand, -limit, limit, i === size - 1));
}

/** "(−2)" for a negative number, so "f(−2)" and "3·(−2)" read clearly. */
const paren = (n: number) => (n < 0 ? `(${n})` : String(n));

const UP_TO_X2 = ['number', 'times x', 'times x²'];

export const module9: Record<string, Generator> = {
  // ---------- 9.1 Functions are vectors too ----------
  '9.1-sum-at': (rand) => {
    const f = randomPoly(rand, 2);
    const g = randomPoly(rand, 3);
    const x = randInt(rand, -3, 3);
    return {
      text: `$f(x) = ${polyTex(f)}$ and $g(x) = ${polyTex(g)}$. What is $(f + g)(${x})$?`,
      answer: evalPoly(addPoly(f, g), x),
    };
  },

  '9.1-scale-at': (rand) => {
    const f = randomPoly(rand, 3);
    const c = randInt(rand, -4, 4, true);
    const x = randInt(rand, -2, 3);
    return {
      text: `$f(x) = ${polyTex(f)}$. What is the height of $${c}f$ at $x = ${x}$, that is $(${c}f)(${x})$?`,
      answer: evalPoly(scalePoly(c, f), x),
    };
  },

  '9.1-combination': (rand) => {
    const f = randomPoly(rand, 3);
    const g = randomPoly(rand, 3);
    const a = randInt(rand, -3, 3, true);
    const b = randInt(rand, -3, 3, true);
    return {
      text: `$f(x) = ${polyTex(f)}$ and $g(x) = ${polyTex(g)}$. Write $${a}f + ${paren(b)}g$ as a polynomial. What are its coefficients?`,
      answer: addPoly(scalePoly(a, f), scalePoly(b, g)),
      labels: UP_TO_X2,
    };
  },

  // ---------- 9.2 The derivative is a matrix ----------
  '9.2-derivative': (rand) => {
    const p = randomPoly(rand, 4);
    return {
      text: `$p(x) = ${polyTex(p)}$ is the vector $(${p.join(', ')})$. Multiply by the derivative matrix $D$: what are the coefficients of $p'(x)$?`,
      answer: derivePoly(p).slice(0, 3), // the x³ place is always 0
      labels: UP_TO_X2,
    };
  },

  '9.2-twice': (rand) => {
    const p = randomPoly(rand, 4);
    return {
      text: `$p(x) = ${polyTex(p)}$. Apply $D$ twice ($D^2 p$, the second derivative). What are its coefficients?`,
      answer: derivePoly(derivePoly(p)).slice(0, 2),
      labels: ['number', 'times x'],
    };
  },

  '9.2-slope-at': (rand) => {
    const p = randomPoly(rand, 4, 4);
    const x = randInt(rand, -2, 2);
    return {
      text: `$p(x) = ${polyTex(p)}$. Use $Dp$ to find the slope of the curve at $x = ${x}$, that is $p'(${x})$.`,
      answer: evalPoly(derivePoly(p), x),
    };
  },

  // ---------- 9.3 The eight axioms ----------
  '9.3-degree-two': (rand) => {
    // Two degree-2 polynomials whose x² parts cancel.
    const top = randInt(rand, -4, 4, true);
    const p = [randInt(rand, -5, 5), randInt(rand, -5, 5), top];
    const q = [randInt(rand, -5, 5), randInt(rand, -5, 5, true), -top];
    return {
      text: `$p(x) = ${polyTex(p)}$ and $q(x) = ${polyTex(q)}$ both have degree exactly 2. What are the coefficients of $p + q$? (Its degree shows why "degree exactly 2" is not a vector space.)`,
      answer: addPoly(p, q),
      labels: UP_TO_X2,
    };
  },

  '9.3-shifted': (rand) => {
    const k = randInt(rand, -5, 5, true);
    const x = pick(rand, [0, 1, 2]);
    return {
      text: `$S$ is the set of all polynomials with $p(${x}) = ${k}$. If $p$ and $q$ are both in $S$, what is $(p + q)(${x})$? (So is $S$ closed under addition?)`,
      answer: 2 * k,
    };
  },

  '9.3-negative': (rand) => {
    const p = randomPoly(rand, 4);
    return {
      text: `In the space of polynomials of degree at most 3, every $p$ needs a $-p$ with $p + (-p) = 0$. For $p(x) = ${polyTex(p)}$, what are the coefficients of $-p$?`,
      answer: scalePoly(-1, p),
      labels: ['number', 'times x', 'times x²', 'times x³'],
    };
  },
};
