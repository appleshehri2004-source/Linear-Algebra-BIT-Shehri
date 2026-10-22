// Lesson 1.2: v and w drawn tip-to-tail, with their sum v + w from the origin.
import { useState } from 'react';
import { Vector } from 'mafs';
import { add, clampVec, sub, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import SnapToggle from './SnapToggle';
import './Demo.css';

export default function AddDemo() {
  const [v, setV] = useState<Vec2>([1, 2]);
  const [w, setW] = useState<Vec2>([3, -1]);
  const [snap, setSnap] = useState(true);
  const sum = add(v, w);

  // Moving v carries w's tip along. Keep that tip on the plane, so it can always be grabbed.
  function moveV(newV: Vec2) {
    setV(newV);
    setW(sub(clampVec(add(newV, w), 5), newV));
  }

  return (
    <div>
      <Plane>
        {/* The sum goes first so the draggable arrows are drawn on top of it. */}
        <Vector tip={sum} color="var(--sum)" weight={5} />
        <DragVector value={v} onChange={moveV} snap={snap} label="v" />
        {/* w starts where v ends: walk along v, then along w. */}
        <DragVector value={w} onChange={setW} tail={v} snap={snap} label="w" color="var(--vec2)" />
      </Plane>
      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
        <span className="demo-op">+</span>
        <CoordReadout vector={w} label="w" color="var(--vec2)" />
        <span className="demo-op">=</span>
        <CoordReadout vector={sum} label="v + w" color="var(--sum)" />
      </div>
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
