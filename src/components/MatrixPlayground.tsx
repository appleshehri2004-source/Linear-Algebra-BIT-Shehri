// A TransformPlayer and a MatrixEditor sharing one matrix. Typing a number plays the animation
// with the new matrix; dragging the tip of i-hat (green) or j-hat (red) changes the numbers and
// jumps to the end (t = 1), so the arrow stays under your finger.
// Optionally a yellow vector v rides along; drag its tip to change v.
// Optionally: a live line "x·(column 1) + y·(column 2) = Av", and buttons for ready-made matrices.
import { useState } from 'react';
import { matrixAt, matVec, roundTo, snapVec, solveCombination, type Mat2, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixEditor from './MatrixEditor';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import './Demo.css';

/** A ready-made matrix with a name, shown as a button. */
export interface Preset {
  name: string;
  matrix: Mat2;
}

interface Props {
  /** The starting matrix, stored as its columns. */
  matrix: Mat2;
  /** A starting vector v that moves with the grid. Leave out for no v. */
  tracked?: Vec2;
  /** The plane shows -range to range on both axes. */
  range?: number;
  /** Show v's numbers times the columns, added up: "x·(column 1) + y·(column 2) = Av". Needs `tracked`. */
  showCombination?: boolean;
  /** Buttons that load a ready-made matrix and play it. */
  presets?: Preset[];
}

/** true when two matrices hold the same four numbers. Used to light up the matching preset button. */
function same(a: Mat2, b: Mat2): boolean {
  return a.flat().every((n, i) => n === b.flat()[i]);
}

export default function MatrixPlayground({ matrix: start, tracked, range = 5, showCombination = false, presets }: Props) {
  const [matrix, setMatrix] = useState<Mat2>(start);
  const [v, setV] = useState<Vec2 | undefined>(tracked);
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  // Where i-hat, j-hat and v are drawn right now (part way through the animation, unless t = 1).
  const now = matrixAt(matrix, t);
  const [ihat, jhat] = now;

  /** Dragging an arrow changes the matrix: show the finished picture. */
  function drag(m: Mat2) {
    setMatrix(m);
    setT(1);
  }

  /** Typing a number changes the matrix: play the animation with it. */
  function type(m: Mat2) {
    setMatrix(m);
    setPlayKey((k) => k + 1);
  }

  /**
   * The tip of v was dragged to `point`. v's numbers are "how many i-hats plus how many j-hats"
   * reach that point, rounded to whole numbers. If i-hat and j-hat lie on one line, most points
   * can't be reached that way, so v stays put.
   */
  function dragV(point: Vec2) {
    const c = solveCombination(ihat, jhat, point);
    if (c) setV(snapVec([c.a, c.b]));
  }

  return (
    <div>
      {presets && (
        <div className="demo-row" role="group" aria-label="Ready-made matrices">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              className={same(p.matrix, matrix) ? 'demo-button' : 'demo-button secondary'}
              aria-pressed={same(p.matrix, matrix)}
              onClick={() => type(p.matrix)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      <TransformPlayer matrix={matrix} range={range} t={t} onTChange={setT} playKey={playKey} showBasis={false}>
        {v && <DragVector value={matVec(now, v)} onChange={dragV} label="v" limit={range} />}
        <DragVector value={jhat} onChange={(p) => drag([matrix[0], p])} color="var(--jhat)" snap label="ĵ" limit={range} />
        <DragVector value={ihat} onChange={(p) => drag([p, matrix[1]])} color="var(--ihat)" snap label="î" limit={range} />
      </TransformPlayer>
      <MatrixEditor value={matrix} onChange={type} />
      {v && showCombination && (
        // Uses the finished matrix (not the part-way one), so the numbers don't flicker while it plays.
        <div className="demo-row" aria-label="v's numbers times the columns">
          <span className="readout-coef vec">{roundTo(v[0], 2)}</span>
          <CoordReadout vector={matrix[0]} color="var(--ihat)" />
          <span className="demo-op">+</span>
          <span className="readout-coef vec">{roundTo(v[1], 2)}</span>
          <CoordReadout vector={matrix[1]} color="var(--jhat)" />
          <span className="demo-op">=</span>
          <CoordReadout vector={matVec(matrix, v)} />
        </div>
      )}
    </div>
  );
}
