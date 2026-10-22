// Lesson 1.2: a slider stretches, shrinks, or flips a vector u into k·u.
import { useState } from 'react';
import { Vector } from 'mafs';
import { scale, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import ScalarSlider from './ScalarSlider';
import './Demo.css';

const RANGE = 6; // a bigger plane, so 3·u still fits

export default function ScaleDemo() {
  const [u, setU] = useState<Vec2>([2, 1]);
  const [k, setK] = useState(1);
  const ku = scale(k, u);

  return (
    <div>
      <Plane range={RANGE}>
        {/* k·u goes first so u's draggable tip stays on top. */}
        <Vector tip={ku} color="var(--sum)" weight={5} />
        <DragVector value={u} onChange={setU} snap label="u" limit={RANGE} />
      </Plane>
      <ScalarSlider label="k" value={k} onChange={setK} min={-3} max={3} step={0.1} />
      <div className="demo-row">
        <CoordReadout vector={u} label="u" />
        <CoordReadout vector={ku} label="k·u" color="var(--sum)" />
      </div>
    </div>
  );
}
