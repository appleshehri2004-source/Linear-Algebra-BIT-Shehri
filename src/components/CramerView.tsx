// Lesson 4.8: Cramer's rule as areas.
// Input (left): drag the yellow x. The parallelogram made by î and x has area y (base 1, height y).
// Output (right): the matrix sends î to column 1 and x to v, and multiplies every area by det(A).
// So the parallelogram made by column 1 and v has area det(A)·y, and y = that area / det(A).
// "Find x" does the same with x and ĵ. All the maths comes from cramerPicture and cramer2 in linalg.ts.
import { useState } from 'react';
import { Polygon, Text, Vector } from 'mafs';
import { centroid, cramer2, cramerPicture, det2, formatNumber, matVec, type Mat2, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import TransformPlayer from './TransformPlayer';
import DragVector from './DragVector';
import SnapToggle from './SnapToggle';
import MatrixView from './MatrixView';
import CoordReadout from './CoordReadout';
import './Demo.css';

interface Props {
  /** The matrix A, stored as columns. Its determinant must not be 0. */
  matrix: Mat2;
  /** Where the yellow input x starts. */
  start: Vec2;
  /** The planes show -range to range on both axes. */
  range?: number;
}

/** "−3" with a real minus sign, and fractions like 1/2. */
const show = (n: number) => formatNumber(n).replace('-', '−');

/** Blue for a positive area, purple for a flipped (negative) one, like Module 3. */
const fill = (area: number) => (area < 0 ? 'var(--area-flipped)' : 'var(--area-kept)');

/** The parallelogram, lightly filled, with its signed area written in the middle. */
function Patch({ corners, area }: { corners: Vec2[]; area: number }) {
  const [cx, cy] = centroid(corners);
  return (
    <>
      <Polygon points={corners} color={fill(area)} fillOpacity={0.3} weight={2} />
      <Text x={cx} y={cy} color={fill(area)} size={18}>
        {show(area)}
      </Text>
    </>
  );
}

export default function CramerView({ matrix, start, range = 5 }: Props) {
  const [x, setX] = useState<Vec2>(start);
  const [unknown, setUnknown] = useState<0 | 1>(1);
  const [snap, setSnap] = useState(true);

  const det = det2(matrix);
  const v = matVec(matrix, x);
  const cramer = cramer2(matrix, v);
  if (!cramer) return <p className="demo-message">det A = 0, so Cramer's rule can't be used.</p>;
  const picture = cramerPicture(matrix, x, unknown);
  const name = unknown === 1 ? 'y' : 'x';
  const basisName = unknown === 1 ? 'î' : 'ĵ';
  const columnName = unknown === 1 ? 'column 1' : 'column 2';

  return (
    <div>
      <div className="demo-row">
        {([1, 0] as const).map((u) => (
          <button
            key={u}
            type="button"
            className={`demo-button${u === unknown ? '' : ' secondary'}`}
            aria-pressed={u === unknown}
            onClick={() => setUnknown(u)}
          >
            Find {u === 1 ? 'y' : 'x'}
          </button>
        ))}
      </div>

      <div className="demo-row">
        <MatrixView columns={matrix} label="A" fractions />
        <CoordReadout vector={x} label="x" />
        <CoordReadout vector={v} label="v = Ax" />
      </div>

      <div className="two-pictures">
        <figure>
          <figcaption>
            Input: {basisName} and x, area = {name}
          </figcaption>
          <Plane range={range}>
            <Patch corners={picture.input} area={picture.inputArea} />
            <Vector tip={[1, 0]} color="var(--ihat)" weight={3} />
            <Vector tip={[0, 1]} color="var(--jhat)" weight={3} />
            <DragVector value={x} onChange={setX} snap={snap} step={1} label="x" limit={3} />
          </Plane>
        </figure>
        <figure>
          <figcaption>
            Output: {columnName} and v, area = det(A)·{name}
          </figcaption>
          {/* TransformPlayer moves `tracked` by the matrix itself, so give it x: it draws A·x = v. */}
          <TransformPlayer matrix={matrix} t={1} controls={false} tracked={x} trackedLabel="v" range={range}>
            <Patch corners={picture.output} area={picture.outputArea} />
          </TransformPlayer>
        </figure>
      </div>

      <SnapToggle checked={snap} onChange={setSnap} />

      <ul className="demo-checklist" aria-live="polite">
        <li>
          Input area = {show(picture.inputArea)}: that is {name}.
        </li>
        <li>
          Output area = {show(picture.outputArea)}: every area was multiplied by det(A) = {show(det)}.
        </li>
        <li>
          {name} = {show(picture.outputArea)} ÷ {show(det)} = {show(cramer.solution[unknown])}
        </li>
      </ul>
    </div>
  );
}
