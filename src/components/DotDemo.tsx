// Lesson 1.5: drag v and w. Shows the projection (the "shadow") of w onto v's line,
// the lengths, the angle, and the dot product, coloured by whether it's positive, zero or negative.
import { useState } from 'react';
import { Line, Vector } from 'mafs';
import { angleBetween, dot, length, projectOnto, roundTo, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import SnapToggle from './SnapToggle';
import './Demo.css';

/** Shows a number in brackets if it's negative, e.g. (−1), so "2 × (−1)" reads clearly. */
function bracket(n: number): string {
  const r = roundTo(n, 1);
  return r < 0 ? `(${r})` : String(r);
}

export default function DotDemo() {
  const [v, setV] = useState<Vec2>([3, 1]);
  const [w, setW] = useState<Vec2>([1, 3]);
  const [snap, setSnap] = useState(true);

  const d = roundTo(dot(v, w), 1);
  const angle = angleBetween(v, w);
  const shadow = projectOnto(w, v);

  const sign = d > 0 ? 'positive' : d < 0 ? 'negative' : 'zero';
  const signText = {
    positive: 'positive: they point roughly the same way',
    zero: 'zero: they are at right angles',
    negative: 'negative: they point roughly opposite ways',
  }[sign];

  return (
    <div>
      <Plane>
        {/* v's whole line, so you can see where w's shadow falls. */}
        {length(v) > 0 && <Line.ThroughPoints point1={[0, 0]} point2={v} color="var(--muted)" opacity={0.4} />}
        {shadow && (
          <>
            {/* The dashed drop from w's tip straight down onto v's line. */}
            <Line.Segment point1={w} point2={shadow} color="var(--muted)" style="dashed" />
            <Vector tip={shadow} color="var(--sum)" weight={5} />
          </>
        )}
        <DragVector value={v} onChange={setV} snap={snap} label="v" />
        <DragVector value={w} onChange={setW} snap={snap} label="w" color="var(--vec2)" />
      </Plane>

      <p className="demo-status" aria-live="polite" style={{ color: `var(--${sign})` }}>
        v · w = {bracket(v[0])} × {bracket(w[0])} + {bracket(v[1])} × {bracket(w[1])} = {d}
      </p>
      <p className="demo-message" style={{ color: `var(--${sign})` }}>
        {signText}
      </p>

      <div className="demo-row">
        <span>|v| = {roundTo(length(v), 2)}</span>
        <span>|w| = {roundTo(length(w), 2)}</span>
        <span>angle = {angle === null ? '–' : `${roundTo(angle, 1)}°`}</span>
      </div>

      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
        <CoordReadout vector={w} label="w" color="var(--vec2)" />
        {shadow && <CoordReadout vector={shadow} label="shadow" color="var(--sum)" />}
      </div>
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
