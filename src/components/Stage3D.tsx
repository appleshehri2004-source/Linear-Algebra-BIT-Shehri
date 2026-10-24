// A 3D version of MatrixPlayground: a 3x3 matrix moves space, with the same Play / Rewind / slider
// as TransformPlayer, a 3x3 MatrixEditor, and buttons for ready-made matrices.
// With showSubspaces (Lessons 2.8.1 and 2.9.1) it also draws the column space in violet and the null space in pink:
// pink arrows on the null space all land on the origin as the matrix plays.
// Use it in a lesson with client:visible, so the 3D code only downloads once it's on screen.
import { useState } from 'react';
import {
  columnSpaceBasis,
  det3,
  matrixAt3,
  matVec3,
  normalize3,
  nullSpaceBasis,
  orthonormalPair,
  rank,
  roundTo,
  type Mat3,
  type Vec3,
} from '../lib/linalg';
import MatrixEditor from './MatrixEditor';
import PlayControls from './PlayControls';
import { usePlayback } from './usePlayback';
import LazyScene3D from './LazyScene3D';
import './Demo.css';

/** A ready-made matrix with a name, shown as a button. */
export interface Preset3 {
  name: string;
  matrix: Mat3;
}

interface Props {
  /** The starting matrix, stored as its columns. */
  matrix: Mat3;
  /** Buttons that load a ready-made matrix and play it. */
  presets?: Preset3[];
  /** Draw the column space (violet) and the null space (pink), and say what the rank is. */
  showSubspaces?: boolean;
  /** false: don't use the word "rank" (for lessons before §2.9, where it is defined). */
  showRank?: boolean;
  /** false: don't show the determinant line (for lessons before Chapter 3). */
  showDet?: boolean;
  /** How far away the camera starts: 1 is normal, 2 is twice as far (for long arrows). */
  zoomOut?: number;
}

/** How a space with this many dimensions looks inside 3D space. */
const SPACE_WORDS = ['just the origin', 'a line', 'a plane', 'all of space'];

/** A few pink arrows on the null space: both ways along a line, or 4 ways across a plane. */
function nullSamples(basis: Vec3[]): Vec3[] {
  const along = (e: Vec3, k: number): Vec3 => [k * e[0], k * e[1], k * e[2]];
  if (basis.length === 1) {
    const e = normalize3(basis[0]);
    return [along(e, 1.5), along(e, -1.5)];
  }
  if (basis.length === 2) {
    const [e1, e2] = orthonormalPair(basis[0], basis[1]);
    return [along(e1, 1.5), along(e1, -1.5), along(e2, 1.5), along(e2, -1.5)];
  }
  return [];
}

/** true when two matrices hold the same numbers. Used to light up the matching preset button. */
function same(a: Mat3, b: Mat3): boolean {
  return a.flat().every((n, i) => n === b.flat()[i]);
}

export default function Stage3D({ matrix: start, presets, showSubspaces = false, showRank = true, showDet = true, zoomOut }: Props) {
  const [matrix, setMatrix] = useState<Mat3>(start);
  const [playKey, setPlayKey] = useState(0);
  const playback = usePlayback({ playKey });

  function load(m: Mat3) {
    setMatrix(m);
    setPlayKey((k) => k + 1);
  }

  const now = matrixAt3(matrix, playback.t);
  // det3 says how much volume is multiplied by; a negative one means space has been flipped over.
  const volume = det3(now);

  // The subspaces belong to the matrix itself (the end of the animation), not to the halfway matrix.
  const r = rank(matrix);
  const columnSpace = showSubspaces ? (columnSpaceBasis(matrix) as Vec3[]) : undefined;
  const nullSpace = showSubspaces ? (nullSpaceBasis(matrix) as Vec3[]) : undefined;
  const nullVectors = nullSpace && nullSamples(nullSpace).map((v) => matVec3(now, v));

  return (
    <div className="stage3d">
      <LazyScene3D matrix={now} zoomOut={zoomOut} columnSpace={columnSpace} nullSpace={nullSpace} nullVectors={nullVectors} />
      <p className="demo-message">Drag to turn the view. Pinch or scroll to zoom.</p>

      <PlayControls playback={playback} />

      {presets && (
        <div className="demo-row">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              className={same(p.matrix, matrix) ? 'demo-button' : 'demo-button secondary'}
              onClick={() => load(p.matrix)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <MatrixEditor value={matrix} onChange={load} />
      {showDet && (
        <p className="demo-status">
          det = {roundTo(volume, 2)}: the cube's volume is now {roundTo(Math.abs(volume), 2)}
          {volume < 0 ? ', and space is flipped over' : ''}.
        </p>
      )}
      {showSubspaces && (
        <p className="demo-status" aria-live="polite">
          {r === 3
            ? `${showRank ? 'Rank 3: n' : 'N'}othing is squished. The column space is all of space, and only the origin lands on 0.`
            : `${showRank ? `Rank ${r}: s` : 'S'}pace is squished onto ${SPACE_WORDS[r]} (the column space, violet). ` +
              `The null space is ${SPACE_WORDS[3 - r]} (pink).`}
          {r < 3 && playback.t > 0.999 && ' Every pink arrow has landed on the origin.'}
        </p>
      )}
    </div>
  );
}
