// Lesson 1.3: sliders a and b build a·v + b·w. The tip leaves a trail, so you can see
// every place a·v + b·w can reach (the "span"). "Sweep" runs a and b through their ranges for you.
import { useEffect, useRef, useState } from 'react';
import { Line, Polyline, Vector } from 'mafs';
import { add, isIndependent, length, scale, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import ScalarSlider from './ScalarSlider';
import './Demo.css';

const RANGE = 6;
const MIN = -3;
const MAX = 3;
/** How many slider steps the sweep takes per animation frame (about 60 frames a second). */
const STEPS_PER_FRAME = 6;

/** The (a, b) pairs a sweep visits: b runs up, then down, for each a, like mowing a lawn. */
function sweepPath(fixedA: number | null): [number, number][] {
  const values: number[] = [];
  for (let i = MIN * 10; i <= MAX * 10; i++) values.push(i / 10);
  if (fixedA !== null) return values.map((b) => [fixedA, b]);
  const rows: [number, number][] = [];
  values
    .filter((_, i) => i % 3 === 0) // a goes up in steps of 0.3
    .forEach((a, row) => {
      const bs = row % 2 === 0 ? values : [...values].reverse();
      bs.forEach((b) => rows.push([a, b]));
    });
  return rows;
}

export default function SpanTracer() {
  const [v, setV] = useState<Vec2>([2, 1]);
  const [w, setW] = useState<Vec2>([-1, 1]);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [fixA, setFixA] = useState(false);
  const [trail, setTrail] = useState<Vec2[]>([]);
  const [sweeping, setSweeping] = useState(false);
  const frame = useRef(0);

  const combo = (a: number, b: number) => add(scale(a, v), scale(b, w));
  const tip = combo(a, b);

  // Stop any running sweep when the component goes away.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function stopSweep() {
    cancelAnimationFrame(frame.current);
    setSweeping(false);
  }

  /** Move the sliders and leave a trail point where the tip lands. */
  function moveTo(newA: number, newB: number) {
    setA(newA);
    setB(newB);
    setTrail((t) => [...t, combo(newA, newB)]);
  }

  function sweep() {
    stopSweep();
    const path = sweepPath(fixA ? a : null);
    // Tips are worked out now, with today's v and w (dragging stops the sweep anyway).
    const tips = path.map(([pa, pb]) => combo(pa, pb));
    setTrail([]);
    setSweeping(true);
    let i = 0;
    const step = () => {
      const next = Math.min(i + STEPS_PER_FRAME, path.length);
      // Take the new points now: React runs the setTrail function later, after i has moved on.
      const newPoints = tips.slice(i, next);
      setTrail((t) => [...t, ...newPoints]);
      setA(path[next - 1][0]);
      setB(path[next - 1][1]);
      i = next;
      if (i < path.length) frame.current = requestAnimationFrame(step);
      else setSweeping(false);
    };
    frame.current = requestAnimationFrame(step);
  }

  /** Dragging v or w changes the whole picture, so the old trail no longer fits: clear it. */
  function drag(set: (x: Vec2) => void) {
    return (x: Vec2) => {
      stopSweep();
      set(x);
      setTrail([]);
    };
  }

  // What the span looks like: a point, a line, or the whole plane.
  let spanLabel = 'span = the whole plane';
  if (!isIndependent(v, w)) {
    spanLabel = length(v) === 0 && length(w) === 0 ? 'span = a point (just the origin)' : 'span = a line';
  }

  return (
    <div>
      <Plane range={RANGE}>
        {trail.length > 1 && <Polyline points={trail} color="var(--sum)" weight={2} />}
        {/* With a fixed, a·v + b·w can only move along this line, parallel to w. */}
        {fixA && length(w) > 0 && (
          <Line.ThroughPoints point1={scale(a, v)} point2={combo(a, 1)} color="var(--muted)" style="dashed" />
        )}
        <Vector tip={tip} color="var(--sum)" weight={5} />
        <DragVector value={v} onChange={drag(setV)} snap label="v" limit={4} />
        <DragVector value={w} onChange={drag(setW)} snap label="w" color="var(--vec2)" limit={4} />
      </Plane>

      <p className="demo-status" aria-live="polite">
        {spanLabel}
      </p>

      <ScalarSlider
        label="a"
        value={a}
        min={MIN}
        max={MAX}
        disabled={fixA}
        onChange={(n) => {
          stopSweep();
          moveTo(n, b);
        }}
      />
      <ScalarSlider
        label="b"
        value={b}
        min={MIN}
        max={MAX}
        onChange={(n) => {
          stopSweep();
          moveTo(a, n);
        }}
      />

      <label className="snap-toggle">
        <input
          type="checkbox"
          checked={fixA}
          onChange={(e) => {
            stopSweep();
            setFixA(e.target.checked);
            setTrail([]);
          }}
        />
        Fix a (only b changes)
      </label>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={sweeping ? stopSweep : sweep}>
          {sweeping ? 'Stop' : 'Sweep'}
        </button>
        <button
          type="button"
          className="demo-button secondary"
          onClick={() => {
            stopSweep();
            setTrail([]);
          }}
        >
          Clear trail
        </button>
      </div>

      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
        <CoordReadout vector={w} label="w" color="var(--vec2)" />
        <CoordReadout vector={tip} label="a·v + b·w" color="var(--sum)" />
      </div>
    </div>
  );
}
