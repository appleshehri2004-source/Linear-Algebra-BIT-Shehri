// Lesson 9.2: a polynomial is a vector of 4 numbers, and the derivative is a 4x4 matrix.
// Four sliders set c0 to c3 in p(x) = c0 + c1·x + c2·x² + c3·x³. The yellow curve and the column of
// coefficients follow along live. "Take the derivative" shows D times that column, with D's 1, 2, 3
// boxed (they sit just above the main diagonal), and draws the answer p′ in orange.
// All the maths comes from linalg.ts (evalPoly, derivativeMatrix, derivePoly, polyTex).
import { useEffect, useState } from 'react';
import { Coordinates, Mafs, Plot } from 'mafs';
import { derivativeMatrix, derivePoly, evalPoly, polyTex, type Poly } from '../lib/linalg';
import MatrixView from './MatrixView';
import ScalarSlider from './ScalarSlider';
import Tex from './Tex';
import 'mafs/core.css';
import './Demo.css';
import './Plane.css';
import './PolynomialVector.css';

interface Props {
  /** The starting coefficients, constant first: [5, 4, 5, 1] is x³ + 5x² + 4x + 5. */
  start?: Poly;
}

const D = derivativeMatrix(4);
/** Box the numbers 1, 2, 3 in D: in column k, row k − 1. */
const nonZero = D.map((col) => col.map((n) => n !== 0));

/** Each slider's name and range. x³ gets a smaller range, or the curve shoots off the picture. */
const SLIDERS = [
  { label: 'c₀ (the number)', min: -10, max: 10, step: 1 },
  { label: 'c₁ (times x)', min: -10, max: 10, step: 1 },
  { label: 'c₂ (times x²)', min: -6, max: 6, step: 0.5 },
  { label: 'c₃ (times x³)', min: -2, max: 2, step: 0.25 },
];

export default function PolynomialVector({ start = [5, 4, 5, 1] }: Props) {
  const [p, setP] = useState<Poly>(start);
  const [derived, setDerived] = useState(false);
  const dp = derivePoly(p);

  // Mafs can only draw in the browser (see Plane.tsx), so the graph waits until then.
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => setInBrowser(true), []);

  const setCoefficient = (k: number, value: number) => setP(p.map((c, i) => (i === k ? value : c)));

  return (
    <div>
      <p className="demo-status poly-name">
        <span className="vec">
          <Tex tex={`p(x) = ${polyTex(p)}`} />
        </span>
        {derived && (
          <>
            <br />
            <span className="vec2">
              <Tex tex={`p'(x) = ${polyTex(dp)}`} />
            </span>
          </>
        )}
      </p>

      <figure className="poly-graph">
        {inBrowser ? (
          <Mafs height={320} viewBox={{ x: [-5, 3], y: [-15, 30] }} preserveAspectRatio={false} pan={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 5 }} />
            <Plot.OfX y={(x) => evalPoly(p, x)} color="var(--vec)" weight={4} />
            {derived && <Plot.OfX y={(x) => evalPoly(dp, x)} color="var(--vec2)" weight={3} />}
          </Mafs>
        ) : (
          <div style={{ height: 320 }} />
        )}
      </figure>

      <div className="poly-sliders">
        {SLIDERS.map((s, k) => (
          <ScalarSlider key={k} {...s} value={p[k]} onChange={(v) => setCoefficient(k, v)} />
        ))}
      </div>

      <div className="demo-row poly-product">
        {derived ? (
          <>
            <MatrixView columns={D} label="D" color="var(--text)" highlight={nonZero} />
            <MatrixView columns={[p]} color="var(--vec)" />
            <span className="demo-op">=</span>
            <MatrixView columns={[dp]} color="var(--vec2)" />
          </>
        ) : (
          <MatrixView columns={[p]} label="p as a vector" color="var(--vec)" />
        )}
      </div>
      <p className="demo-message">
        {derived
          ? 'The boxed 1, 2, 3 are the powers coming down: x² → 2x, x³ → 3x². Each moves one place up the column.'
          : 'Top to bottom: the number, then how many x, x² and x³.'}
      </p>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={() => setDerived(!derived)}>
          {derived ? 'Hide the derivative' : 'Take the derivative'}
        </button>
        {derived && (
          <button type="button" className="demo-button secondary" onClick={() => setP(dp)}>
            Make p′ the new p
          </button>
        )}
        <button type="button" className="demo-button secondary" onClick={() => setP(start)}>
          Reset
        </button>
      </div>
    </div>
  );
}
