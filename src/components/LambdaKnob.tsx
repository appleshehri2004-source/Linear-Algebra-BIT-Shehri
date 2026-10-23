// Lesson 8.2: turn the λ knob and watch A − λI move the plane.
// The big picture shows the plane after A − λI. Underneath: the live det(A − λI), and a small graph
// of the characteristic polynomial λ² − trace·λ + det with its roots marked.
// At a root, det(A − λI) = 0 and the whole plane squishes onto a line. The arrows on the cyan line are
// squashed all the way to 0: they are the eigenvectors for that λ.
// The slider clicks into place at each root, so it is easy to land exactly on det = 0.
// All the maths comes from linalg.ts (shiftByLambda, charPolyAt, meanProduct, eig2, snapNear).
import { useEffect, useId, useState } from 'react';
import { Coordinates, Line, Mafs, Plot, Point } from 'mafs';
import {
  charPoly2,
  charPolyAt,
  charPolyWindow,
  det2,
  eig2,
  formatNumber,
  meanProduct,
  niceGridStep,
  roundTo,
  shiftByLambda,
  snapNear,
  type Mat2,
} from '../lib/linalg';
import MatrixView from './MatrixView';
import TransformPlayer from './TransformPlayer';
import { EigenLines } from './EigenProbe';
import './Demo.css';
import './Plane.css';
import './TransformPlayer.css';

interface Props {
  /** The matrix A, stored as its columns. */
  matrix: Mat2;
  /** Where λ starts. */
  start?: number;
  /** The slider goes from min to max. */
  min?: number;
  max?: number;
  range?: number;
}

/** A number with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

/** "+ 4" or "− 5", for writing a term of the polynomial. */
const signed = (n: number) => (n < 0 ? `− ${show(-n)}` : `+ ${show(n)}`);

/** How close the slider must come to a root to click onto it. */
const CLICK = 0.08;

export default function LambdaKnob({ matrix: a, start = 0, min = -1, max = 6, range = 4 }: Props) {
  const id = useId();
  const [lambda, setLambda] = useState(start);
  const roots = meanProduct(a).lambdas ?? [];
  const shifted = shiftByLambda(a, lambda);
  const det = det2(shifted);
  const atRoot = roots.includes(lambda);
  const { trace, det: detA } = charPoly2(a);

  // The eigen-line for this λ, when λ is a root (EigenLines wants the index into eig2's pairs).
  const eigen = eig2(a);
  const litIndex = eigen.kind === 'lines' ? eigen.pairs.findIndex((p) => p.lambda === lambda) : -1;

  // Mafs can only draw in the browser (see Plane.tsx), so the graph waits until then.
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => setInBrowser(true), []);
  const [low, high] = charPolyWindow(a, [min, max]);
  const pad = (high - low) * 0.1 + 0.5;

  return (
    <div>
      <TransformPlayer matrix={shifted} range={range} t={1} controls={false}>
        {atRoot && litIndex !== -1 && <EigenLines eigen={eigen} lit={[litIndex]} range={range} />}
      </TransformPlayer>

      <div className="transform-scrub">
        <label htmlFor={id}>
          λ = <output htmlFor={id}>{show(lambda)}</output>
        </label>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={0.01}
          value={lambda}
          onChange={(e) => setLambda(snapNear(Number(e.target.value), roots, CLICK))}
        />
        <div className="slider-ends" aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      <div className="demo-row">
        <MatrixView columns={shifted} label="A − λI" />
        <span className="demo-status" style={{ color: atRoot ? 'var(--eigen)' : undefined }}>
          det(A − λI) = {show(det)}
        </span>
      </div>
      <p className="demo-status" aria-live="polite">
        {atRoot
          ? `det = 0 at λ = ${formatNumber(lambda).replace('-', '−')}: the plane squishes onto a line. Every arrow on the cyan line is squashed to 0: those are the eigenvectors for this λ.`
          : 'det is not 0, so nothing but the origin is squashed to 0. Keep turning the knob.'}
      </p>

      <figure className="poly-graph">
        <figcaption>
          det(A − λI) = λ² {signed(-trace)}λ {signed(detA)}
        </figcaption>
        {inBrowser ? (
          <Mafs height={200} viewBox={{ x: [min, max], y: [low - pad, high + pad] }} preserveAspectRatio={false} pan={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: niceGridStep(high - low), labels: false }} />
            <Plot.OfX y={(x) => charPolyAt(a, x)} color="var(--link)" weight={3} />
            {roots.map((r) => (
              <Point key={r} x={r} y={0} color="var(--eigen)" />
            ))}
            <Line.Segment point1={[lambda, low - pad]} point2={[lambda, high + pad]} color="var(--vec)" style="dashed" />
            <Point x={lambda} y={charPolyAt(a, lambda)} color="var(--vec)" />
          </Mafs>
        ) : (
          <div style={{ height: 200 }} />
        )}
        <p className="demo-message">
          {roots.length
            ? `The roots (cyan dots) are at λ = ${roots.map((r) => formatNumber(r).replace('-', '−')).join(' and ')}.`
            : 'The curve never touches 0: there are no real eigenvalues.'}
        </p>
      </figure>
    </div>
  );
}
