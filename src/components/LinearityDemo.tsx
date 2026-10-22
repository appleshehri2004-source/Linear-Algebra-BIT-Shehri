// Lesson 2.1: one linear transformation and three that are not. Pick one with the buttons; the grid
// and a yellow diagonal line move. A checklist says which of the "linear" rules each one keeps.
// (The rules are written out by hand for each example; the lesson explains how to test them.)
import { useState } from 'react';
import {
  bendDiagonal,
  bendLines,
  segmentPoints,
  shiftOrigin,
  type Mat2,
  type PointMap,
} from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import './Demo.css';

interface Example {
  name: string;
  matrix?: Mat2;
  map?: PointMap;
  /** Every straight line (not only grid lines) stays straight. */
  linesStraight: boolean;
  originStays: boolean;
  /** Grid lines stay parallel and evenly spaced. */
  gridEven: boolean;
  /** What to look at, in one sentence. */
  look: string;
}

const examples: Example[] = [
  {
    name: 'Linear',
    matrix: [[1, 0.5], [-0.5, 1]],
    linesStraight: true,
    originStays: true,
    gridEven: true,
    look: 'Grid lines stay straight, parallel and evenly spaced, the origin stays put, and so does the diagonal.',
  },
  {
    name: 'Curved lines',
    map: bendLines,
    linesStraight: false,
    originStays: true,
    gridEven: false,
    look: 'The origin stays put, but the horizontal lines bend into curves.',
  },
  {
    name: 'Moved origin',
    map: shiftOrigin,
    linesStraight: true,
    originStays: false,
    gridEven: true,
    look: 'Everything looks tidy, but the whole plane slides: the origin ends up at (1, 1).',
  },
  {
    name: 'Sneaky',
    map: bendDiagonal,
    linesStraight: false,
    originStays: true,
    gridEven: true,
    look: 'The grid looks untouched! But watch the yellow diagonal line.',
  },
];

// The diagonal line y = x, cut into many short pieces so it can bend smoothly.
const diagonal = [segmentPoints([-5, -5], [5, 5], 200)];

function Check({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li style={{ color: ok ? 'var(--positive)' : 'var(--negative)' }}>
      {ok ? '✓' : '✗'} {children}
    </li>
  );
}

export default function LinearityDemo() {
  const [chosen, setChosen] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const ex = examples[chosen];
  const linear = ex.linesStraight && ex.originStays;

  return (
    <div>
      <div className="demo-row" role="group" aria-label="Choose a transformation">
        {examples.map((e, i) => (
          <button
            key={e.name}
            type="button"
            className={i === chosen ? 'demo-button' : 'demo-button secondary'}
            aria-pressed={i === chosen}
            onClick={() => {
              setChosen(i);
              setPlayKey((k) => k + 1); // play the new one from the start
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      <TransformPlayer matrix={ex.matrix} map={ex.map} lines={diagonal} playKey={playKey} />

      <p className="demo-message">{ex.look}</p>
      <ul className="demo-checklist" aria-live="polite">
        <Check ok={ex.originStays}>The origin stays put</Check>
        <Check ok={ex.gridEven}>Grid lines stay parallel and evenly spaced</Check>
        <Check ok={ex.linesStraight}>Every straight line stays straight (look at the diagonal)</Check>
      </ul>
      <p className="demo-status" style={{ color: linear ? 'var(--positive)' : 'var(--negative)' }}>
        {linear ? 'Linear' : 'Not linear'}
      </p>
    </div>
  );
}
