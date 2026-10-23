// Lesson 6.4: a rotation next to a shear, played together with one Play button.
// Each picture marks the corner between î and ĵ with a small square. The rotation keeps it a square
// (lengths 1, angle 90°): an orthogonal matrix. The shear slants it and stretches ĵ: not orthogonal.
// All the maths comes from linalg.ts (matrixAt, rightAngleMark, isOrthogonalMatrix, angleBetween).
import { Polygon } from 'mafs';
import {
  angleBetween,
  isOrthogonalMatrix,
  length,
  matrixAt,
  rightAngleMark,
  roundTo,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import PlayControls from './PlayControls';
import MatrixView from './MatrixView';
import { usePlayback } from './usePlayback';
import './Demo.css';

interface Props {
  /** The two matrices to compare, with names, e.g. a rotation and a shear. */
  pictures: { name: string; matrix: Mat2 }[];
}

const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

function Picture({ name, matrix, t }: { name: string; matrix: Mat2; t: number }) {
  const [i, j] = matrixAt(matrix, t);
  const mark = rightAngleMark<Vec2>([0, 0], i, j, 0.4);
  const angle = angleBetween(i, j);
  const orthogonal = isOrthogonalMatrix(matrix);

  return (
    <figure>
      <figcaption>{name}</figcaption>
      <MatrixView columns={matrix} label="M" />
      <TransformPlayer matrix={matrix} t={t} controls={false} range={2}>
        {mark && <Polygon points={mark} color="var(--text)" fillOpacity={0.15} weight={1.5} />}
      </TransformPlayer>
      <ul className="demo-checklist" aria-live="polite">
        <li>length of î = {show(length(i))}, of ĵ = {show(length(j))}</li>
        <li>angle between them = {angle === null ? '–' : `${show(angle)}°`}</li>
        {t === 1 && (
          <li style={{ color: orthogonal ? 'var(--positive)' : 'var(--negative)' }}>
            {orthogonal ? 'Orthogonal ✓ lengths and right angles kept' : 'Not orthogonal ✗ the square is bent'}
          </li>
        )}
      </ul>
    </figure>
  );
}

export default function OrthogonalCompare({ pictures }: Props) {
  const playback = usePlayback();
  return (
    <div>
      <div className="two-pictures">
        {pictures.map((p) => (
          <Picture key={p.name} name={p.name} matrix={p.matrix} t={playback.t} />
        ))}
      </div>
      <PlayControls playback={playback} />
    </div>
  );
}
