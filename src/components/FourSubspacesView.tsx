// Lesson 4.7: the four fundamental subspaces of a rank-1 2x2 matrix. All four are lines.
// Input (left): the row space (violet) and the null space (pink) meet at a right angle.
// Output (right): the column space (violet) and the left null space (pink) meet at a right angle.
// Drag the green column 1 and slide k (column 2 = k · column 1): the matrix stays rank 1, every line
// moves, and the angles stay 90°. All the maths comes from linalg.ts.
import { useState } from 'react';
import { Polygon, Vector } from 'mafs';
import {
  angleBetween,
  columnSpaceBasis,
  leftNullSpaceBasis,
  normalize,
  nullSpaceBasis,
  parallelogram,
  rank,
  roundTo,
  rowSpaceBasis,
  scale,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import SnapToggle from './SnapToggle';
import MatrixView from './MatrixView';
import { SubspaceShape } from './SubspaceView';
import './Demo.css';
import './TransformPlayer.css';

interface Props {
  /** Where î lands (column 1). */
  column: Vec2;
  /** Column 2 is k copies of column 1. */
  k: number;
  /** The planes show -range to range on both axes. */
  range?: number;
}

/** The little square that marks a right angle where two lines cross at the origin. */
function RightAngle({ u, w }: { u: Vec2; w: Vec2 }) {
  const corners = parallelogram(scale(0.6, normalize(u)), scale(0.6, normalize(w)));
  return <Polygon points={corners} color="var(--text)" fillOpacity={0} weight={1.5} />;
}

/** "90°", or a dash when a line is missing. */
const degrees = (angle: number | null) => (angle === null ? '–' : `${roundTo(angle, 1)}°`);

export default function FourSubspacesView({ column: startColumn, k: startK, range = 5 }: Props) {
  const [column, setColumn] = useState<Vec2>(startColumn);
  const [k, setK] = useState(startK);
  const [snap, setSnap] = useState(true);

  const a: Mat2 = [column, scale(k, column)];
  const ok = rank(a) === 1;
  const [row] = rowSpaceBasis(a) as Vec2[];
  const [nul] = nullSpaceBasis(a) as Vec2[];
  const [col] = columnSpaceBasis(a) as Vec2[];
  const [left] = leftNullSpaceBasis(a) as Vec2[];

  return (
    <div>
      <div className="demo-row">
        <MatrixView columns={a} label="A" fractions />
      </div>

      <div className="two-pictures">
        <figure>
          <figcaption>
            Input: <span className="space">row space</span> ⟂ <span className="null">null space</span>
          </figcaption>
          <Plane range={range}>
            {ok && (
              <>
                <SubspaceShape basis={[row]} color="var(--space)" range={range} />
                <SubspaceShape basis={[nul]} color="var(--null)" range={range} />
                <RightAngle u={row} w={nul} />
              </>
            )}
          </Plane>
        </figure>
        <figure>
          <figcaption>
            Output: <span className="space">column space</span> ⟂ <span className="null">left null space</span>
          </figcaption>
          <Plane range={range}>
            {ok && (
              <>
                <SubspaceShape basis={[col]} color="var(--space)" range={range} />
                <SubspaceShape basis={[left]} color="var(--null)" range={range} />
                <RightAngle u={col} w={left} />
              </>
            )}
            <Vector tip={a[1]} color="var(--jhat)" weight={3} />
            <DragVector value={column} onChange={setColumn} color="var(--ihat)" snap={snap} label="col 1" limit={range - 1} />
          </Plane>
        </figure>
      </div>

      <div className="transform-scrub">
        <label htmlFor="four-k">k = {roundTo(k, 2)}: column 2 (red) = k · column 1 (green)</label>
        <input id="four-k" type="range" min={-2} max={2} step={0.25} value={k} onChange={(e) => setK(Number(e.target.value))} />
      </div>
      <SnapToggle checked={snap} onChange={setSnap} />

      {ok ? (
        <ul className="demo-checklist" aria-live="polite">
          <li>Row space and null space: {degrees(angleBetween(row, nul))}</li>
          <li>Column space and left null space: {degrees(angleBetween(col, left))}</li>
        </ul>
      ) : (
        <p className="demo-status" aria-live="polite">
          Column 1 is 0, so A is the zero matrix (rank 0): the null spaces are whole planes. Drag column 1 away
          from the origin.
        </p>
      )}
    </div>
  );
}
