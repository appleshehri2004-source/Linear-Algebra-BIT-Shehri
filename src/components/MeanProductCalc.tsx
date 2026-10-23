// Lesson 8.3: the mean-product trick. Type any 2x2 matrix.
// m is the mean of the two diagonal numbers (= the mean of the eigenvalues),
// p is the determinant (= the product of the eigenvalues), and then λ = m ± √(m² − p).
// Buttons load the lesson's examples. All the maths comes from linalg.ts (meanProduct).
import { useState } from 'react';
import { formatNumber, meanProduct, roundTo, type Mat2 } from '../lib/linalg';
import MatrixEditor from './MatrixEditor';
import './Demo.css';

interface Props {
  /** The matrix shown first, stored as its columns. */
  start: Mat2;
  /** Matrices to load with one tap, stored as columns. */
  examples?: Mat2[];
}

/** A clean number: fractions where they're simple, 2 decimals otherwise, real minus signs. */
const show = (n: number) => formatNumber(n).replace('-', '−');
/** A negative number in brackets, so "2² − (−1)" doesn't read as "2² − −1". */
const paren = (n: number) => (n < 0 ? `(${show(n)})` : show(n));
/** √gap, with the decimal too when gap isn't a perfect square: "3", or "√5 ≈ 2.24". */
const rootText = (gap: number, root: number) =>
  Number.isInteger(roundTo(root, 9)) ? show(root) : `√${show(gap)} ≈ ${show(roundTo(root, 2))}`;

export default function MeanProductCalc({ start, examples = [] }: Props) {
  const [a, setA] = useState<Mat2>(start);
  const { m, p, gap, root, lambdas } = meanProduct(a);
  // Stored as columns: a[0] = (top-left, bottom-left), a[1] = (top-right, bottom-right).
  const [[d1, low], [right, d2]] = a;

  return (
    <div>
      <div className="demo-row">
        <MatrixEditor value={a} onChange={setA} />
      </div>
      {examples.length > 0 && (
        <div className="demo-row">
          {examples.map((ex) => (
            <button key={ex.flat().join()} type="button" className="demo-button secondary" onClick={() => setA(ex)}>
              Load [{show(ex[0][0])} {show(ex[1][0])}; {show(ex[0][1])} {show(ex[1][1])}]
            </button>
          ))}
        </div>
      )}

      <ol className="mean-product-steps">
        <li>
          <strong>m</strong> = mean of the diagonal = ({show(d1)} + {paren(d2)}) / 2 = <strong>{show(m)}</strong>
        </li>
        <li>
          <strong>p</strong> = det = {paren(d1)}·{paren(d2)} − {paren(right)}·{paren(low)} = <strong>{show(p)}</strong>
        </li>
        <li>
          m² − p = {paren(m)}² − {paren(p)} = <strong>{show(gap)}</strong>
        </li>
        <li aria-live="polite">
          {lambdas ? (
            <>
              λ = m ± √(m² − p) = {show(m)} ± {rootText(gap, root)}, so{' '}
              <strong>
                λ = {show(lambdas[0])}
                {lambdas[0] !== lambdas[1] && ` and λ = ${show(lambdas[1])}`}
              </strong>
              {lambdas[0] === lambdas[1] && ' (the same λ twice)'}
            </>
          ) : (
            <>
              m² − p is negative, and no real number squares to a negative: <strong>no real eigenvalues</strong>.
            </>
          )}
        </li>
      </ol>
      {lambdas && (
        <p className="demo-message">
          Check: the two λs average to m = {show(m)} and multiply to p = {show(p)}.
        </p>
      )}
    </div>
  );
}
