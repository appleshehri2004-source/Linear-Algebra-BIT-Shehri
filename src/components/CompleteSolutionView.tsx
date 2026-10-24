// Lesson 1.5.1: every solution of A·x = b, for a 2x2 matrix whose columns lie on one line.
// Right: the mixes of A's columns fill a violet line. Drag the yellow b; near the line it snaps onto it.
// Left: while b is on the line, every solution shows as a gold line, parallel to the pink line of solutions
// of A·x = 0: one particular solution p plus any multiple t·v of the direction v. Off the line: "no solution".
// A slider picks one solution x on the gold line, and the output shows A·x landing exactly on b.
import { useState } from 'react';
import { Line, Text, Vector } from 'mafs';
import {
  applyColumns,
  columnSpaceBasis,
  completeSolution,
  formatNumber,
  nullSpaceBasis,
  pointOnSolution,
  roundTo,
  snapToLine,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import MatrixView from './MatrixView';
import CoordReadout from './CoordReadout';
import { SubspaceShape } from './SubspaceView';
import './Demo.css';
import './TransformPlayer.css';

interface Props {
  /** A rank-1 matrix, stored as columns. */
  matrix: Mat2;
  /** Where the yellow b starts. */
  start: Vec2;
  /** The planes show -range to range on both axes. */
  range?: number;
}

/** "(3, 0)" with real minus signs and clean fractions. */
const pair = ([x, y]: number[]) => `(${[x, y].map((n) => formatNumber(n).replace('-', '−')).join(', ')})`;

export default function CompleteSolutionView({ matrix, start, range = 7 }: Props) {
  const [b, setB] = useState<Vec2>(start);
  const [t, setT] = useState(1);

  const [column] = columnSpaceBasis(matrix) as Vec2[];
  const nullSpace = nullSpaceBasis(matrix) as Vec2[];
  // Within 0.4 of a square of the violet line, b jumps onto it, at a tidy point (half-steps of column 1).
  const move = (p: Vec2) => setB(snapToLine(p, column, 0.4, 0.5));

  const all = completeSolution(matrix, b);
  const x = all && (pointOnSolution(all, t) as Vec2);
  const ax = x && (applyColumns(matrix, x) as Vec2);

  return (
    <div>
      <div className="demo-row">
        <MatrixView columns={matrix} label="A" fractions />
        <CoordReadout vector={b} label="b" />
      </div>

      <div className="two-pictures">
        <figure>
          <figcaption>Input: every x with Ax = b</figcaption>
          <Plane range={range}>
            <SubspaceShape basis={nullSpace} color="var(--null)" range={range} />
            {all && (
              <>
                <Line.ThroughPoints
                  point1={all.particular as Vec2}
                  point2={pointOnSolution(all, 1) as Vec2}
                  color="var(--sum)"
                  weight={5}
                />
                <Vector tip={x!} color="var(--vec)" weight={3} />
                <Text x={x![0]} y={x![1]} attach="ne" attachDistance={12} color="var(--vec)" size={20}>
                  x
                </Text>
              </>
            )}
          </Plane>
        </figure>
        <figure>
          <figcaption>Output: drag b</figcaption>
          <Plane range={range}>
            <SubspaceShape basis={[column]} color="var(--space)" range={range} />
            {ax && <Vector tip={ax} color="var(--sum)" weight={6} />}
            <DragVector value={b} onChange={move} label="b" limit={range - 1} />
          </Plane>
        </figure>
      </div>

      {all ? (
        <>
          <p className="demo-status" aria-live="polite">
            b is on the violet line (a mix of A's columns), so there are infinitely many solutions: x = {pair(all.particular)} + t ·{' '}
            {pair(all.directions[0])}
          </p>
          <div className="transform-scrub">
            <label htmlFor="solution-t">t = {roundTo(t, 1)}: x = {pair(x!)}</label>
            <input
              id="solution-t"
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
            />
          </div>
          <p className="demo-message">Slide t: x walks along the gold line, and A·x (gold, right) stays on b.</p>
        </>
      ) : (
        <p className="demo-status" aria-live="polite">
          No solution: b is off the violet line, and no mix of A's columns gives it.
        </p>
      )}
    </div>
  );
}
