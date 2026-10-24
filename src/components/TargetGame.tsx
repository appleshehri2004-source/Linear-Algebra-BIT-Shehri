// Lesson 1.7.1: drag v and w and see if they're independent. Then play "reach the target":
// move sliders a and b until a·v + b·w lands on the target point.
import { useEffect, useState } from 'react';
import { Point, Vector } from 'mafs';
import { add, isIndependent, length, roundTo, scale, solveCombination, sub, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import ScalarSlider from './ScalarSlider';
import './Demo.css';

const RANGE = 6;
/** How close the tip must get to the target to count as a hit. */
const HIT_DISTANCE = 0.25;

/** A random point with whole-number coordinates from -4 to 4, never the origin. */
function randomTarget(): Vec2 {
  const n = () => Math.floor(Math.random() * 9) - 4;
  const t: Vec2 = [n(), n()];
  return t[0] === 0 && t[1] === 0 ? randomTarget() : t;
}

export default function TargetGame() {
  const [v, setV] = useState<Vec2>([2, 1]);
  const [w, setW] = useState<Vec2>([-1, 2]);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  // The first target is picked after the page loads, so the built page and the browser agree.
  const [target, setTarget] = useState<Vec2 | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => setTarget(randomTarget()), []);

  const tip = add(scale(a, v), scale(b, w));
  const independent = isIndependent(v, w);
  const hit = target !== null && length(sub(tip, target)) <= HIT_DISTANCE;

  function newTarget() {
    setTarget(randomTarget());
    setMessage('');
  }

  function showAnswer() {
    if (!target) return;
    const answer = solveCombination(v, w, target);
    if (!answer) {
      setMessage('v and w lie on one line, so a·v + b·w can only reach points on that line. Drag them apart first.');
      return;
    }
    setA(answer.a);
    setB(answer.b);
    setMessage(`a = ${roundTo(answer.a, 2)}, b = ${roundTo(answer.b, 2)}`);
  }

  return (
    <div>
      <Plane range={RANGE}>
        {target && <Point x={target[0]} y={target[1]} color={hit ? 'var(--positive)' : 'var(--text)'} />}
        <Vector tip={tip} color="var(--sum)" weight={5} />
        <DragVector value={v} onChange={setV} snap label="v" limit={4} />
        <DragVector value={w} onChange={setW} snap label="w" color="var(--vec2)" limit={4} />
      </Plane>

      <p className="demo-status" aria-live="polite" style={{ color: independent ? 'var(--positive)' : 'var(--negative)' }}>
        {independent ? 'independent: v and w point different ways' : 'dependent: v and w lie on one line'}
      </p>

      {/* Sliders go from -4 to 4 in small steps, so the tip can land on the target. */}
      <ScalarSlider label="a" value={a} onChange={setA} min={-4} max={4} step={0.05} />
      <ScalarSlider label="b" value={b} onChange={setB} min={-4} max={4} step={0.05} />

      <p className="demo-status" aria-live="polite">
        {target && (hit ? 'Hit! You reached the target.' : `Target: (${target[0]}, ${target[1]})`)}
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

      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
        <CoordReadout vector={w} label="w" color="var(--vec2)" />
        <CoordReadout vector={tip} label="a·v + b·w" color="var(--sum)" />
      </div>
    </div>
  );
}
