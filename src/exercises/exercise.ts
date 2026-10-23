// The shared shape of a practice question, plus helpers for making and checking them.
// Each lesson's questions live in a module file (e.g. module1.ts) as small generator functions.
import { isClose, roundTo, type Vec2 } from '../lib/linalg';

/** One question, with its correct answer already worked out by linalg.ts. */
export interface Question {
  /** The question. Put maths between dollar signs, e.g. "Work out $\\vec{v} + \\vec{w}$." */
  text: string;
  /** A single number, or a vector (two or three numbers). */
  answer: number | number[];
  /** Names for the answer boxes when the answer is a vector. Default: x, y (and z). */
  labels?: string[];
  /** A short hint about rounding, e.g. "Round to 2 decimal places." */
  note?: string;
}

/** A random number from 0 up to (not including) 1, like Math.random. Tests pass in a repeatable one. */
export type Rand = () => number;

/** Makes a new random question each time it's called. */
export type Generator = (rand: Rand) => Question;

/** A random whole number from lo to hi (both included). nonZero: skip 0. */
export function randInt(rand: Rand, lo: number, hi: number, nonZero = false): number {
  const n = lo + Math.floor(rand() * (hi - lo + 1));
  return nonZero && n === 0 ? randInt(rand, lo, hi, true) : n;
}

/** Pick one item from a list at random. */
export function pick<T>(rand: Rand, items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

/** A random vector with whole-number parts from -limit to limit, never the zero vector. */
export function randVec(rand: Rand, limit = 4): Vec2 {
  const v: Vec2 = [randInt(rand, -limit, limit), randInt(rand, -limit, limit)];
  return v[0] === 0 && v[1] === 0 ? randVec(rand, limit) : v;
}

/** TeX for a column vector, e.g. vecTex([3, -1]) draws [3 over -1] in square brackets. Works for 3D too. */
export function vecTex(v: number[]): string {
  return `\\begin{bmatrix} ${v.map((n) => roundTo(n, 2)).join(' \\\\ ')} \\end{bmatrix}`;
}

/**
 * TeX for a matrix of any size. It is stored as columns, so column 1 (i-hat) is the left column:
 * matTex([[1, -2], [3, 0]]) draws [1 3 over -2 0].
 */
export function matTex(columns: number[][]): string {
  const rows = columns[0].map((_, r) => columns.map((col) => roundTo(col[r], 2)).join(' & '));
  return `\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}`;
}

/** The correct answer as TeX, for showing after two wrong tries. */
export function answerTex(q: Question): string {
  return typeof q.answer === 'number' ? String(roundTo(q.answer, 2)) : vecTex(q.answer);
}

/**
 * Read a typed number. Accepts "-2", "−2" (a typographic minus), "2.5", "2,5" and fractions like "-9/2".
 * Gives null for anything that isn't a number, e.g. "", "abc", "1/" or "1/0".
 */
export function parseNumber(typed: string): number | null {
  const parts = typed.split('/');
  if (parts.length === 2) {
    const top = parseNumber(parts[0]);
    const bottom = parseNumber(parts[1]);
    return top === null || bottom === null || bottom === 0 ? null : top / bottom;
  }
  if (parts.length > 2) return null;
  const cleaned = typed.trim().replace(/[−–]/g, '-').replace(',', '.');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** true when every typed number is within 0.01 of the correct answer. */
export function checkAnswer(q: Question, typed: number[]): boolean {
  const correct = typeof q.answer === 'number' ? [q.answer] : q.answer;
  return correct.length === typed.length && correct.every((c, i) => isClose(typed[i], c));
}
