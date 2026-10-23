// Lesson 9.1: functions add like vectors, one height at a time.
// Green is c·f (a wave), red is g (a ramp), yellow is their sum c·f + g.
// Drag the yellow handle along the x-axis: at that x, a bar stacks the green height and the red height,
// and its top lands exactly on the yellow curve. The slider sets c, which stretches or flips the wave.
// All the maths comes from linalg.ts (waveF, rampG, addFn, scaleFn, clampToBox).
import { useState } from 'react';
import { Line, MovablePoint, Plot, Point } from 'mafs';
import { addFn, clampToBox, rampG, roundTo, scaleFn, waveF, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import ScalarSlider from './ScalarSlider';
import './Demo.css';
import './FunctionSumView.css';

/** The plane shows x from -6 to 6. The handle stays inside that. */
const X_RANGE: [number, number] = [-6, 6];

/** A number with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

export default function FunctionSumView() {
  const [x, setX] = useState(1.5);
  const [c, setC] = useState(1);

  const f = scaleFn(c, waveF);
  const sum = addFn(f, rampG);
  const fx = f(x);
  const gx = rampG(x);
  const total = sum(x);

  // Only sideways moves count: the handle is pinned to the x-axis.
  const move = (p: Vec2) => setX(roundTo(clampToBox(p, X_RANGE, [0, 0])[0], 2));

  return (
    <div>
      <ul className="fn-legend" aria-label="Curves">
        <li className="ihat">c·f, where f(x) = 2 sin x</li>
        <li className="jhat">g(x) = 0.5x + 1</li>
        <li className="vec">c·f + g</li>
      </ul>

      <Plane range={6} x={X_RANGE} y={[-6, 6]}>
        <Plot.OfX y={f} color="var(--ihat)" weight={2.5} />
        <Plot.OfX y={rampG} color="var(--jhat)" weight={2.5} />
        <Plot.OfX y={sum} color="var(--vec)" weight={4} />

        {/* The dashed line at x, then the stacked bar: green from 0 up to c·f(x), red on top of that. */}
        <Line.Segment point1={[x, -6]} point2={[x, 6]} color="var(--muted)" style="dashed" opacity={0.5} />
        <Line.Segment point1={[x, 0]} point2={[x, fx]} color="var(--ihat)" weight={6} />
        <Line.Segment point1={[x, fx]} point2={[x, total]} color="var(--jhat)" weight={6} />
        <Point x={x} y={fx} color="var(--ihat)" />
        <Point x={x} y={gx} color="var(--jhat)" />
        <Point x={x} y={total} color="var(--vec)" />

        <MovablePoint point={[x, 0]} onMove={move} color="var(--vec)" />
      </Plane>

      <p className="demo-status fn-sum" aria-live="polite">
        At x = {show(x)}: <span className="ihat">{show(fx)}</span> + <span className="jhat">{show(gx)}</span> ={' '}
        <span className="vec">{show(total)}</span>
      </p>
      <p className="demo-message">The bar is green stacked on red. Its top always lands on the yellow curve.</p>

      <ScalarSlider label="c (scales f)" value={c} onChange={setC} min={-2} max={2} step={0.1} />
    </div>
  );
}
