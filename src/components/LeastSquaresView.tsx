// Lesson 6.3: least squares.
// Drag the yellow points. The violet line b = C + D·t is the best fit: it makes the sum of the squared
// vertical errors (the pink segments) as small as it can be. Under the picture are the normal equations
// Aᵀ A x = Aᵀ b with today's numbers, updating while you drag.
// "Try your own line" adds sliders for C and D and an orange line of your own. The best line stays faint
// underneath, and the two errors are shown side by side: yours is never smaller.
// All the maths comes from linalg.ts (leastSquaresLine, lineErrors, sumSquaredErrors, clampToBox).
import { useState } from 'react';
import { Line, MovablePoint } from 'mafs';
import {
  clampToBox,
  leastSquaresLine,
  lineErrors,
  roundTo,
  snapVec,
  sumSquaredErrors,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import MatrixView from './MatrixView';
import ScalarSlider from './ScalarSlider';
import SnapToggle from './SnapToggle';
import './Demo.css';

interface Props {
  /** The starting points (t, b). */
  points: Vec2[];
}

/** The part of the plane the picture shows; points can't be dragged outside it. */
const XS: [number, number] = [-0.5, 5.5];
const YS: [number, number] = [-0.5, 4.5];
const MAX_POINTS = 6;

/** Three decimal places, with a real minus sign. */
const show = (n: number, places = 3) => String(roundTo(n, places)).replace('-', '−');
/** "b = 2 + 0.5·t", or "b = 2 − 0.5·t" when D is negative. */
const lineText = (C: number, D: number, places = 3) =>
  `b = ${show(C, places)} ${D < 0 ? '−' : '+'} ${show(Math.abs(D), places)}·t`;

export default function LeastSquaresView({ points: start }: Props) {
  const [points, setPoints] = useState<Vec2[]>(start);
  const [snap, setSnap] = useState(false);
  const [own, setOwn] = useState(false);
  const [C, setC] = useState(1);
  const [D, setD] = useState(0);

  const fit = leastSquaresLine(points);
  const best = fit && sumSquaredErrors(points, fit.C, fit.D);
  const yours = sumSquaredErrors(points, C, D);
  // The line whose errors are drawn: yours while you're trying your own, the best one otherwise.
  const shown = own ? { C, D } : fit;

  function move(i: number, p: Vec2) {
    let q = clampToBox(p, XS, YS);
    if (snap) q = snapVec(q, 1);
    setPoints(points.map((old, k) => (k === i ? q : old)));
  }
  function addPoint() {
    setPoints([...points, [points.length % 5 + 0.5, 3]]);
  }

  // A has a row (1, t) for each point, stored as its 2 columns: all 1s, then the t's. b is the heights.
  const A = [points.map(() => 1), points.map(([t]) => t)];
  const b = points.map(([, h]) => h);

  return (
    <div>
      <Plane x={XS} y={YS}>
        {fit && (
          <Line.ThroughPoints
            point1={[0, fit.C]}
            point2={[1, fit.C + fit.D]}
            color="var(--space)"
            opacity={own ? 0.35 : 1}
            weight={own ? 2 : 3}
          />
        )}
        {own && <Line.ThroughPoints point1={[0, C]} point2={[1, C + D]} color="var(--vec2)" weight={3} />}
        {shown &&
          lineErrors(points, shown.C, shown.D).map(([p, q], i) => (
            <Line.Segment key={i} point1={p} point2={q} color="var(--null)" weight={3} />
          ))}
        {points.map((p, i) => (
          <MovablePoint key={i} point={p} onMove={(q) => move(i, q)} color="var(--vec)" />
        ))}
      </Plane>

      {fit ? (
        <p className="demo-status" aria-live="polite" style={{ color: 'var(--space)' }}>
          Best line: {lineText(fit.C, fit.D)} &nbsp;·&nbsp; sum of squared errors = {show(best!)}
        </p>
      ) : (
        <p className="demo-message">All the points have the same t, so many lines fit equally well. Drag one sideways.</p>
      )}

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={() => setOwn(!own)}>
          {own ? 'Back to the best line' : 'Try your own line'}
        </button>
        <button type="button" className="demo-button secondary" onClick={addPoint} disabled={points.length >= MAX_POINTS}>
          Add a point
        </button>
        <button type="button" className="demo-button secondary" onClick={() => setPoints(points.slice(0, -1))} disabled={points.length <= 2}>
          Remove a point
        </button>
      </div>

      {own && (
        <>
          <div className="demo-row">
            <ScalarSlider label="C" value={C} onChange={setC} min={-2} max={4} step={0.05} />
            <ScalarSlider label="D" value={D} onChange={setD} min={-2} max={2} step={0.05} />
          </div>
          <ul className="demo-checklist" aria-live="polite">
            <li style={{ color: 'var(--vec2)' }}>
              Your line {lineText(C, D, 2)}: sum of squared errors = {show(yours)}
            </li>
            {fit && (
              <li style={{ color: 'var(--space)' }}>
                Best line: {show(best!)}.{' '}
                {roundTo(yours - best!, 3) === 0
                  ? 'You found it (to 3 decimal places)! No line can do better.'
                  : `Yours is ${show(yours - best!)} more. Keep trying: you can get close, but never below.`}
              </li>
            )}
          </ul>
        </>
      )}

      {fit && (
        <>
          <p className="demo-message">The normal equations Aᵀ A x = Aᵀ b, with x = (C, D):</p>
          <div className="demo-row">
            <MatrixView columns={A} label="A" />
            <MatrixView columns={[b]} label="b" color="var(--vec)" />
          </div>
          <div className="demo-row">
            <MatrixView columns={fit.AtA} label="AᵀA" />
            <MatrixView columns={[[fit.C, fit.D]]} label="x" color="var(--space)" />
            <MatrixView columns={[fit.Atb]} label="= Aᵀb" color="var(--vec)" />
          </div>
          <p className="demo-message">
            Where the numbers come from: AᵀA holds n = {points.length} (the number of points), Σt and Σt². Aᵀb holds Σb
            and Σt·b.
          </p>
        </>
      )}
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
