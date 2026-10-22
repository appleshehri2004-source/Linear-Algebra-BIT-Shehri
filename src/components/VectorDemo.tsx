// Lesson 1.1: one vector you can drag, with its two numbers shown live underneath.
import { useState } from 'react';
import type { Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import SnapToggle from './SnapToggle';
import './Demo.css';

export default function VectorDemo() {
  // "3 steps east, 2 steps north", like the lesson's question.
  const [v, setV] = useState<Vec2>([3, 2]);
  const [snap, setSnap] = useState(false);

  return (
    <div>
      <Plane>
        <DragVector value={v} onChange={setV} snap={snap} label="v" />
      </Plane>
      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
      </div>
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
