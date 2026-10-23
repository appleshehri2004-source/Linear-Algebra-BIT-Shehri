// Lesson 4.1: solving A·x = v as a game. Drag the yellow x; the gold arrow A·x (where A sends x) moves live.
// Get A·x onto the target v. That x is the solution of the system.
// The green and red arrows are A's columns (where î and ĵ land), so A·x = x₁·(column 1) + x₂·(column 2).
import { useEffect, useState } from 'react';
import { Point, Text, Vector } from 'mafs';
import { distance, formatNumber, matVec, solve2, type Mat2, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import MatrixView from './MatrixView';
import './Demo.css';

interface Props {
  /** The matrix A, stored as its columns. Must have det ≠ 0. */
  matrix: Mat2;
  /** The plane shows -range to range on both axes. */
  range?: number;
}

/** A target A·x for a random x with whole numbers from -2 to 2, never x = 0, that fits on the plane. */
function randomTarget(matrix: Mat2, range: number): Vec2 {
  const n = () => Math.floor(Math.random() * 5) - 2;
  const x: Vec2 = [n(), n()];
  const v = matVec(matrix, x);
  const fits = Math.abs(v[0]) <= range - 1 && Math.abs(v[1]) <= range - 1;
  return (x[0] === 0 && x[1] === 0) || !fits ? randomTarget(matrix, range) : v;
}

/** "−9/2", with a proper minus sign. */
const show = (n: number) => formatNumber(n).replace('-', '−');

export default function SolveGame({ matrix, range = 6 }: Props) {
  const [x, setX] = useState<Vec2>([1, 0]);
  // The target is picked after the page loads, so the built page and the browser agree.
  const [target, setTarget] = useState<Vec2 | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => setTarget(randomTarget(matrix, range)), []);

  const ax = matVec(matrix, x);
  const hit = target !== null && distance(ax, target) < 0.01;
  const [col1, col2] = matrix;

  function newTarget() {
    setTarget(randomTarget(matrix, range));
    setMessage('');
  }

  function showAnswer() {
    if (!target) return;
    const answer = solve2(matrix, target);
    if (answer) {
      setX(answer);
      setMessage(`x = (${show(answer[0])}, ${show(answer[1])})`);
    }
  }

  return (
    <div>
      <div className="demo-row">
        <MatrixView columns={matrix} label="A" />
      </div>
      <Plane range={range}>
        <Vector tip={col1} color="var(--ihat)" weight={2} opacity={0.6} />
        <Vector tip={col2} color="var(--jhat)" weight={2} opacity={0.6} />
        {target && (
          <>
            <Point x={target[0]} y={target[1]} color={hit ? 'var(--positive)' : 'var(--text)'} />
            <Text x={target[0]} y={target[1]} attach="sw" attachDistance={10} size={18} color="var(--text)">
              v
            </Text>
          </>
        )}
        <Vector tip={ax} color="var(--sum)" weight={5} />
        <Text x={ax[0]} y={ax[1]} attach="se" attachDistance={12} size={18} color="var(--sum)">
          Ax
        </Text>
        <DragVector value={x} onChange={setX} snap step={0.5} label="x" limit={range - 1} />
      </Plane>

      <p className="demo-status" aria-live="polite" style={hit ? { color: 'var(--positive)' } : undefined}>
        {target &&
          (hit
            ? `Hit! A sends x = (${show(x[0])}, ${show(x[1])}) to v.`
            : `Target: v = (${show(target[0])}, ${show(target[1])})`)}
      </p>

      <div className="demo-row">
        <CoordReadout vector={x} label="x" />
        <CoordReadout vector={ax} label="Ax" color="var(--sum)" />
      </div>
      <p className="demo-message">
        A·x = {show(x[0])}·<span className="ihat">(column 1)</span> {x[1] < 0 ? '−' : '+'} {show(Math.abs(x[1]))}·
        <span className="jhat">(column 2)</span>
      </p>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={newTarget}>
          New target
        </button>
        <button type="button" className="demo-button secondary" onClick={showAnswer}>
          Show answer
        </button>
      </div>
      {message && <p className="demo-message">{message}</p>}
    </div>
  );
}
