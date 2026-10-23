// A 3x2 matrix: 2D in, 3D out. On the left, the input plane with a yellow vector v you can drag.
// On the right, 3D space: Play lifts the flat floor (a copy of the input plane) up to where the
// matrix puts it, a tilted sheet through the origin, and v rides along.
import { useState } from 'react';
import { applyColumns, liftColumns, matrixAt3, matVec3, roundTo, type Vec2, type Vec3 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import MatrixView from './MatrixView';
import PlayControls from './PlayControls';
import LazyScene3D from './LazyScene3D';
import { usePlayback } from './usePlayback';
import './Demo.css';
import './NonSquareDemo.css';

interface Props {
  /** The two columns of the 3x2 matrix: where î and ĵ land in 3D. */
  columns: [Vec3, Vec3];
  /** The starting input vector. */
  vector: Vec2;
}

export default function NonSquareDemo({ columns, vector }: Props) {
  const [v, setV] = useState<Vec2>(vector);
  const playback = usePlayback();

  const now = matrixAt3(liftColumns(columns), playback.t);
  const out = applyColumns(columns, v);

  return (
    <div className="non-square-demo">
      <div className="non-square-views">
        <figure>
          <figcaption>Input: the plane (2 numbers)</figcaption>
          <Plane range={3}>
            <DragVector value={v} onChange={setV} snap label="v" limit={3} />
          </Plane>
        </figure>
        <figure>
          <figcaption>Output: 3D space (3 numbers)</figcaption>
          <LazyScene3D matrix={now} showK={false} showCube={false} showSheet zoomOut={1.6} vector={matVec3(now, [v[0], v[1], 0])} />
        </figure>
      </div>

      <PlayControls playback={playback} />

      <div className="demo-row">
        <MatrixView columns={columns} label="A" />
        <span className="demo-op">·</span>
        <MatrixView columns={[[v[0], v[1]]]} color="var(--vec)" />
        <span className="demo-op">=</span>
        <MatrixView columns={[out]} color="var(--vec)" />
      </div>
      <p className="demo-message">
        {roundTo(v[0], 2)} × (green column) + {roundTo(v[1], 2)} × (red column)
      </p>
    </div>
  );
}
