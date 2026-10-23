// Lesson 8.6: every matrix turns the unit circle into an ellipse (or a segment, or a point).
// Two arrows at right angles on the circle, v₁ (yellow) and v₂ (orange), land on the ellipse's half-axes, σ₁u₁ and σ₂u₂.
// "Direct" plays A in one go. "Three steps" plays A = UΣVᵀ one piece at a time: Vᵀ turns v₁ and v₂ onto the axes,
// Σ stretches along the axes, and U turns them into place. Both end on exactly the same matrix (svdStepsAt).
// The dashed ellipse is where the circle will end up. All the maths comes from linalg.ts (svd2, svdSteps, svdStepsAt …).
import { useState } from 'react';
import { Point, Polyline, Text, Vector } from 'mafs';
import {
  currentStep,
  det2,
  fitRange,
  formatNumber,
  isClose,
  length,
  matrixAt,
  matVec,
  roundTo,
  svd2,
  svdSteps,
  svdStepsAt,
  transformShape,
  transpose,
  unitCircle,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixEditor from './MatrixEditor';
import MatrixView from './MatrixView';
import './Demo.css';

interface Example {
  /** The button text, e.g. "Rotation". */
  name: string;
  /** The matrix, stored as its columns. */
  matrix: Mat2;
  /** A sentence about what to notice, shown under the picture. */
  note?: string;
}

interface Props {
  examples: Example[];
}

type Mode = 'direct' | 'steps';

const CIRCLE = unitCircle();
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');
const exact = (n: number) => formatNumber(n).replace('-', '−');

/** An arrow from the origin, or a dot when it has been squashed to (almost) nothing. */
function ArrowOrDot({ tip, color, label }: { tip: Vec2; color: string; label: string }) {
  return (
    <>
      {length(tip) > 0.05 ? <Vector tip={tip} color={color} weight={3} /> : <Point x={0} y={0} color={color} />}
      <Text x={tip[0]} y={tip[1]} attach={length(tip) > 0.05 ? 'ne' : 'sw'} attachDistance={10} color={color} size={17}>
        {label}
      </Text>
    </>
  );
}

export default function SVDView({ examples }: Props) {
  const [choice, setChoice] = useState<number | null>(0);
  const [a, setA] = useState<Mat2>(examples[0].matrix);
  const [mode, setMode] = useState<Mode>('direct');
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  function pick(i: number) {
    setChoice(i);
    setA(examples[i].matrix);
    setT(0);
  }

  function edit(m: Mat2) {
    setChoice(null);
    setA(m);
  }

  /** Switch between Direct and Three steps, and play the new way from the start. */
  function choose(next: Mode) {
    setMode(next);
    setPlayKey((k) => k + 1);
  }

  const { U, sigma, V } = svd2(a);
  const { S } = svdSteps(a);
  const flipped = S[1][1] < 0;
  const path = mode === 'direct' ? { at: (s: number) => matrixAt(a, s), steps: 1 } : { at: (s: number) => svdStepsAt(a, s), steps: 3 };
  const m = path.at(t);

  const target = transformShape(a, CIRCLE);
  const range = fitRange(target, 2);
  const done = t === 1;

  const step = currentStep(3, t);
  const captions = [
    'Step 1, Vᵀ: turn the circle so v₁ lies on the x-axis and v₂ on the y-axis. Nothing gets longer.',
    `Step 2, Σ: stretch along the axes, × ${show(sigma[0])} along x and × ${show(sigma[1])} along y${
      flipped ? ', and flip y over (det A < 0)' : ''
    }. ${sigma[1] === 0 ? 'It flattens to a segment.' : isClose(sigma[0], sigma[1], 1e-9) ? 'Equal stretches: still a circle.' : "Now it's an ellipse."}`,
    'Step 3, U: turn the ellipse into place. Its half-axes are now σ₁u₁ and σ₂u₂.',
  ];

  return (
    <div>
      <div className="demo-row">
        <div className="demo-toggle" role="group" aria-label="Pick an example">
          {examples.map((ex, i) => (
            <button
              key={ex.name}
              type="button"
              className={`demo-button${i === choice ? '' : ' secondary'}`}
              aria-pressed={i === choice}
              onClick={() => pick(i)}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-row">
        <div className="demo-toggle" role="group" aria-label="How to play A">
          <button type="button" className={`demo-button${mode === 'direct' ? '' : ' secondary'}`} aria-pressed={mode === 'direct'} onClick={() => choose('direct')}>
            Direct
          </button>
          <button type="button" className={`demo-button${mode === 'steps' ? '' : ' secondary'}`} aria-pressed={mode === 'steps'} onClick={() => choose('steps')}>
            Three steps
          </button>
        </div>
      </div>

      <TransformPlayer path={path} t={t} onTChange={setT} playKey={playKey} range={range} showBasis={false}>
        {/* Where the circle will end up: dashed, and it doesn't move. */}
        <Polyline points={target} color="var(--muted)" weight={1.5} style="dashed" />
        <Polyline points={transformShape(m, CIRCLE)} color="var(--vec)" weight={3} />
        <ArrowOrDot tip={matVec(m, V[0])} color="var(--vec)" label={done ? 'σ₁u₁' : 'v₁'} />
        <ArrowOrDot tip={matVec(m, V[1])} color="var(--vec2)" label={done ? 'σ₂u₂' : 'v₂'} />
      </TransformPlayer>

      <p className="demo-message" aria-live="polite">
        {mode === 'direct'
          ? done
            ? 'Done in one go. Now try Three steps: it ends on exactly this ellipse.'
            : 'Direct: A moves the circle all at once.'
          : t === 0
            ? 'Three steps: press Play.'
            : done
              ? 'Done in three steps: the same ellipse as Direct, because U·Σ·Vᵀ = A.'
              : captions[step]}
      </p>

      <MatrixEditor value={a} onChange={edit} />

      <div className="demo-row">
        <MatrixView columns={U} label="U" />
        <MatrixView columns={[[sigma[0], 0], [0, sigma[1]]]} label="Σ" />
        <MatrixView columns={transpose(V)} label="Vᵀ" />
      </div>
      <ul className="demo-checklist" aria-live="polite">
        <li>
          σ₁ = {exact(sigma[0])}, σ₂ = {exact(sigma[1])}: the ellipse's half-axes are {show(sigma[0])} and {show(sigma[1])} long.
        </li>
        <li>
          σ₁ × σ₂ = {show(sigma[0] * sigma[1])} = |det A| = {show(Math.abs(det2(a)))}: the circle's area is multiplied by this.
        </li>
        {sigma[1] === 0 && <li>σ₂ = 0: A squashes the plane onto a line, so the ellipse is flat, a segment.</li>}
        {flipped && <li>det A &lt; 0, so A flips the plane: U includes a flip (shown during the stretch in Three steps).</li>}
      </ul>
      {choice !== null && examples[choice].note && <p className="demo-message">{examples[choice].note}</p>}
    </div>
  );
}
