// Lesson 4.3: the inverse is rewinding. "Play A" moves the plane; "Rewind with A⁻¹" plays A⁻¹ after it,
// and every point goes back where it started: A⁻¹A = I.
// A matrix with det 0 squashes the plane onto a line. Then there is no A⁻¹: the Rewind button stays off,
// and two dots that started apart land on the same spot, so nothing could send each one back.
import { useState } from 'react';
import { Point } from 'mafs';
import { det2, identity, inverse2, matMul, matVec, sequenceAt, type Mat2, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixView from './MatrixView';
import { DURATION, usePlayback } from './usePlayback';
import './Demo.css';

interface Preset {
  name: string;
  matrix: Mat2;
}

interface Props {
  /** The matrices to choose from, stored as columns. The first is shown first. */
  presets: Preset[];
  /** A yellow vector that rides along. */
  tracked?: Vec2;
  /** Extra dots that ride along, e.g. two that a det-0 matrix sends to the same spot. */
  points?: Vec2[];
  /** The plane shows -range to range on both axes. */
  range?: number;
}

/** t counts as "there" when it's this close (the animation ends on a float). */
const NEAR = 1e-6;

export default function InverseDemo({ presets, tracked, points = [], range = 5 }: Props) {
  const [index, setIndex] = useState(0);
  const a = presets[index].matrix;
  const inv = inverse2(a);
  const steps = inv ? [a, inv] : [a];

  // t from 0 to 1 covers every step (with an inverse, A and A⁻¹ take half each), so each step takes the usual time.
  const playback = usePlayback({ duration: DURATION * steps.length });
  const { t, playing, animateTo, scrub } = playback;
  const endOfA = inv ? 0.5 : 1;
  const m = sequenceAt(steps, t);

  function choose(i: number) {
    setIndex(i);
    scrub(0);
  }

  return (
    <div>
      {presets.length > 1 && (
        <div className="demo-row">
          {presets.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className={`demo-button${i === index ? '' : ' secondary'}`}
              aria-pressed={i === index}
              onClick={() => choose(i)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="demo-row">
        <MatrixView columns={a} label="A" fractions />
        {inv ? (
          <MatrixView columns={inv} label="A⁻¹" fractions />
        ) : (
          <span className="demo-message">det A = {det2(a)}, so there is no A⁻¹</span>
        )}
      </div>

      <TransformPlayer steps={steps} t={t} controls={false} tracked={tracked} range={range}>
        {points.map((p, i) => {
          const [x, y] = matVec(m, p);
          return <Point key={i} x={x} y={y} color="var(--vec2)" />;
        })}
      </TransformPlayer>

      <div className="demo-row">
        <button type="button" className="demo-button" disabled={playing !== null} onClick={() => animateTo(endOfA, 0)}>
          Play A
        </button>
        <button
          type="button"
          className="demo-button"
          disabled={!inv || playing !== null || t < endOfA - NEAR || t > 1 - NEAR}
          onClick={() => animateTo(1)}
        >
          Rewind with A⁻¹
        </button>
        <button type="button" className="demo-button secondary" disabled={playing !== null} onClick={() => scrub(0)}>
          Start over
        </button>
      </div>

      <p className="demo-status" aria-live="polite">
        {inv && t > 1 - NEAR && 'Back where it started: A⁻¹ undid A.'}
        {!inv && t > 1 - NEAR && "The whole plane is squashed onto a line. You can't unsquish a line."}
      </p>

      {inv && t > 1 - NEAR && (
        <div className="demo-row">
          <MatrixView columns={matMul(inv, a)} label="A⁻¹A" fractions />
          <MatrixView columns={identity()} label="I" fractions />
        </div>
      )}
      {!inv && t > 1 - NEAR && points.length >= 2 && (
        <p className="demo-message">
          The two orange dots started in different places and landed on the same spot. A⁻¹ would have to send
          that one spot back to two places at once, and no matrix can do that.
        </p>
      )}
    </div>
  );
}
