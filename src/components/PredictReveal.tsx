// Guess first, then watch. The learner taps where they think the yellow vector will land.
// "Reveal" plays the transformation; then a dashed line joins the guess to the real answer
// and says how far off the guess was.
import { useEffect, useState } from 'react';
import { Line, Point, Text } from 'mafs';
import { clampVec, distance, matVec, roundTo, sequenceAt, snapVec, type Mat2, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import './Demo.css';

interface Props {
  /** The transformation, stored as its columns. Give this or `steps`. */
  matrix?: Mat2;
  /** Several matrices that play one after another (first one first). */
  steps?: Mat2[];
  /** The vector whose landing spot the learner predicts. */
  vector: Vec2;
  /** The plane shows -range to range on both axes. */
  range?: number;
}

type Phase = 'guess' | 'playing' | 'done';

export default function PredictReveal({ matrix, steps, vector, range = 5 }: Props) {
  const [guess, setGuess] = useState<Vec2 | null>(null);
  const [phase, setPhase] = useState<Phase>('guess');
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  // Where the vector really lands: at the end of the whole animation.
  const answer = matVec(sequenceAt(steps ?? [matrix!], 1), vector);
  const off = guess && distance(guess, answer);

  // Once the animation reaches the end, show how far off the guess was.
  useEffect(() => {
    if (phase === 'playing' && t === 1) setPhase('done');
  }, [phase, t]);

  function tap(p: Vec2) {
    if (phase !== 'guess') return;
    // Snap to half squares: precise enough to be fair, easy to hit with a finger.
    setGuess(snapVec(clampVec(p, range), 0.5));
  }

  function reveal() {
    setPhase('playing');
    setPlayKey((k) => k + 1);
  }

  function tryAgain() {
    setGuess(null);
    setT(0);
    setPhase('guess');
  }

  return (
    <div className="predict-reveal">
      <TransformPlayer
        matrix={matrix}
        steps={steps}
        tracked={vector}
        range={range}
        t={t}
        onTChange={setT}
        playKey={playKey}
        controls={phase === 'done'}
        onPlaneClick={tap}
      >
        {guess && (
          <>
            {phase === 'done' && <Line.Segment point1={guess} point2={answer} color="var(--vec2)" style="dashed" />}
            <Point x={guess[0]} y={guess[1]} color="var(--vec2)" />
            <Text x={guess[0]} y={guess[1]} attach="sw" attachDistance={12} color="var(--vec2)" size={16}>
              guess
            </Text>
          </>
        )}
      </TransformPlayer>

      {phase === 'guess' && (
        <>
          <p className="demo-message">
            {guess
              ? `Your guess: (${guess[0]}, ${guess[1]}). Tap again to move it, or press Reveal.`
              : 'Tap the plane where you think v will land.'}
          </p>
          <div className="demo-row">
            <button type="button" className="demo-button" disabled={!guess} onClick={reveal}>
              Reveal
            </button>
          </div>
        </>
      )}

      {phase === 'playing' && <p className="demo-message">Watch where v goes…</p>}

      {phase === 'done' && guess && off !== null && (
        <>
          <p className="demo-status" aria-live="polite">
            {off < 0.01
              ? `Spot on! v landed exactly on (${roundTo(answer[0], 2)}, ${roundTo(answer[1], 2)}).`
              : `v landed on (${roundTo(answer[0], 2)}, ${roundTo(answer[1], 2)}). Your guess was ${roundTo(off, 2)} away.`}
          </p>
          <div className="demo-row">
            <button type="button" className="demo-button secondary" onClick={tryAgain}>
              Try again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
