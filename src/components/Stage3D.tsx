// A 3D version of MatrixPlayground: a 3x3 matrix moves space, with the same Play / Rewind / slider
// as TransformPlayer, a 3x3 MatrixEditor, and buttons for ready-made matrices.
// Use it in a lesson with client:visible, so the 3D code only downloads once it's on screen.
import { useState } from 'react';
import { det3, matrixAt3, roundTo, type Mat3 } from '../lib/linalg';
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
}

/** true when two matrices hold the same numbers. Used to light up the matching preset button. */
function same(a: Mat3, b: Mat3): boolean {
  return a.flat().every((n, i) => n === b.flat()[i]);
}

export default function Stage3D({ matrix: start, presets }: Props) {
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

  return (
    <div className="stage3d">
      <LazyScene3D matrix={now} />
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
      <p className="demo-status">
        det = {roundTo(volume, 2)}: the cube's volume is now {roundTo(Math.abs(volume), 2)}
        {volume < 0 ? ', and space is flipped over' : ''}.
      </p>
    </div>
  );
}
