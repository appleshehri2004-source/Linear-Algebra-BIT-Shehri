// Lesson 5.1: duality. A tilted number line through the origin, along the orange unit vector û.
// Drag the yellow v: a dashed line drops it straight onto the number line, and the number where it lands
// is shown next to û · v. They are always equal (dualityNumbers in linalg.ts works them out two different ways).
// Drag the orange handle out on the line (3 along it, away from the busy origin) to turn the line. The k slider makes u = k·û, and every number gets multiplied by k.
// î and ĵ drop onto the line too: they land at exactly u's x and y, the two numbers of the 1x2 matrix.
import { useState } from 'react';
import { Line, MovablePoint, Point, Text, Vector } from 'mafs';
import { dualityNumbers, length, normalize, numberLineTicks, roundTo, scale, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import SnapToggle from './SnapToggle';
import ScalarSlider from './ScalarSlider';
import MatrixView from './MatrixView';
import CoordReadout from './CoordReadout';
import './Demo.css';

interface Props {
  /** The direction of the number line. It is made 1 long. Default (0.6, 0.8). */
  direction?: Vec2;
  /** Where the yellow v starts. */
  start?: Vec2;
}

/** Two decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');
/** A negative number in brackets, so "0.6 × (−2)" reads clearly. */
const bracket = (n: number) => (roundTo(n, 2) < 0 ? `(${show(n)})` : show(n));

const RANGE = 5;

export default function DualityView({ direction = [0.6, 0.8], start = [4, 3] }: Props) {
  const [uHat, setUHat] = useState<Vec2>(normalize(direction));
  const [v, setV] = useState<Vec2>(start);
  const [k, setK] = useState(1);
  const [snap, setSnap] = useState(true);

  const u = scale(k, uHat);
  const n = dualityNumbers(v, uHat, k);
  const iLands = dualityNumbers([1, 0], uHat, k);
  const jLands = dualityNumbers([0, 1], uHat, k);
  const ticks = numberLineTicks(uHat, 6);
  const handle = ticks.find((t) => t.value === -3)!.point;

  /** Dragging the handle turns the line; û stays 1 long. */
  function turn(p: Vec2) {
    // The handle sits at −3 on the line, so û points the opposite way to it.
    if (length(p) > 0.5) setUHat(normalize(scale(-1, p)));
  }

  return (
    <div>
      <Plane range={RANGE}>
        {/* The number line: a long line along û, with whole numbers marked. */}
        <Line.ThroughPoints point1={[0, 0]} point2={uHat} color="var(--vec2)" opacity={0.6} />
        {ticks.map((t) => (
          <Line.Segment key={t.value} point1={t.ends[0]} point2={t.ends[1]} color="var(--vec2)" opacity={0.8} />
        ))}
        {ticks
          .filter((t) => t.value !== 0 && t.value % 2 === 0)
          .map((t) => (
            <Text key={t.value} x={t.point[0]} y={t.point[1]} attach="se" attachDistance={10} color="var(--vec2)" size={13}>
              {String(t.value).replace('-', '−')}
            </Text>
          ))}

        {/* Where î and ĵ land: at û's x and û's y. */}
        <Line.Segment point1={[1, 0]} point2={iLands.landing} color="var(--ihat)" style="dashed" />
        <Line.Segment point1={[0, 1]} point2={jLands.landing} color="var(--jhat)" style="dashed" />
        <Vector tip={[1, 0]} color="var(--ihat)" weight={3} />
        <Vector tip={[0, 1]} color="var(--jhat)" weight={3} />
        <Point x={iLands.landing[0]} y={iLands.landing[1]} color="var(--ihat)" />
        <Point x={jLands.landing[0]} y={jLands.landing[1]} color="var(--jhat)" />

        {/* u = k·û, drawn thin when it is longer or shorter than û. */}
        {k !== 1 && <Vector tip={u} color="var(--vec2)" weight={2} opacity={0.5} />}

        {/* v's dashed drop onto the line, and the point where it lands. */}
        <Line.Segment point1={v} point2={n.landing} color="var(--muted)" style="dashed" />
        <Point x={n.landing[0]} y={n.landing[1]} color="var(--sum)" />
        <Text x={n.landing[0]} y={n.landing[1]} attach="e" attachDistance={14} color="var(--sum)" size={16}>
          {show(n.position)}
        </Text>

        <DragVector value={v} onChange={setV} snap={snap} label="v" limit={RANGE} />

        <Vector tip={uHat} color="var(--vec2)" weight={4} />
        <Text x={uHat[0]} y={uHat[1]} attach="nw" attachDistance={12} color="var(--vec2)" size={18}>
          û
        </Text>
        <MovablePoint point={handle} onMove={turn} color="var(--vec2)" />
      </Plane>
      <p className="demo-message">Drag v. Drag the orange dot at −3 to turn the number line.</p>

      <ul className="demo-checklist" aria-live="polite">
        <li>v lands at {show(n.position)} on the number line.</li>
        {k !== 1 && (
          <li>
            u = {show(k)}·û, so the number is {show(n.position)} × {show(k)} = {show(n.value)}
          </li>
        )}
        <li>
          u · v = {bracket(u[0])} × {bracket(v[0])} + {bracket(u[1])} × {bracket(v[1])} = {show(n.dot)}{' '}
          {roundTo(n.value, 2) === roundTo(n.dot, 2) ? '✓ the same' : ''}
        </li>
        <li style={{ color: 'var(--ihat)' }}>
          î → {show(iLands.value)} = u's x
        </li>
        <li style={{ color: 'var(--jhat)' }}>
          ĵ → {show(jLands.value)} = u's y
        </li>
      </ul>

      <div className="demo-row">
        <MatrixView columns={[[u[0]], [u[1]]]} label="1x2 matrix" />
        <span className="demo-op">=</span>
        <span className="readout" style={{ color: 'var(--vec2)' }}>
          u tipped on its side
        </span>
        <CoordReadout vector={u} label="u" color="var(--vec2)" />
      </div>

      <ScalarSlider value={k} onChange={setK} label="k (u = k·û)" min={-3} max={3} step={0.5} />
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
