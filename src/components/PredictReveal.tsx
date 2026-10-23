// Guess first, then watch. The learner taps where they think the yellow vector will land.
// "Reveal" plays the transformation; then a dashed line joins the guess to the real answer
// and says how far off the guess was.
// With `guessArea`, the learner types a number instead: the area the unit square will have.
import { useEffect, useId, useState, type FormEvent } from 'react';
import { Line, Point, Text } from 'mafs';
import { clampVec, det2, distance, isClose, matVec, roundTo, sequenceAt, snapVec, type Mat2, type Vec2 } from '../lib/linalg';
import { parseNumber } from '../exercises/exercise';
import TransformPlayer from './TransformPlayer';
import { PatchShape, areaSentence } from './AreaPatch';
import './Demo.css';

interface Props {
  /** The transformation, stored as its columns. Give this or `steps`. */
  matrix?: Mat2;
  /** Several matrices that play one after another (first one first). */
  steps?: Mat2[];
  /** The vector whose landing spot the learner predicts. Leave out with `guessArea`. */
  vector?: Vec2;
  /** Guess the unit square's new area (type a number) instead of where a vector lands. */
  guessArea?: boolean;
  /** The plane shows -range to range on both axes. */
  range?: number;
}

type Phase = 'guess' | 'playing' | 'done';

export default function PredictReveal(props: Props) {
  return props.guessArea ? <AreaGuess {...props} /> : <PointGuess {...props} vector={props.vector ?? [1, 0]} />;
}

/** Type a number for the area, press Reveal, watch the square, and see how close you were. */
function AreaGuess({ matrix, steps, range = 5 }: Props) {
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<Phase>('guess');
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  const all = steps ?? [matrix!];
  const answer = det2(sequenceAt(all, 1));
  const guess = parseNumber(typed);

  useEffect(() => {
    if (phase === 'playing' && t === 1) setPhase('done');
  }, [phase, t]);

  function reveal(e: FormEvent) {
    e.preventDefault();
    if (guess === null) return;
    setPhase('playing');
    setPlayKey((k) => k + 1);
  }

  function tryAgain() {
    setTyped('');
    setT(0);
    setPhase('guess');
  }

  return (
    <div className="predict-reveal">
      <TransformPlayer
        matrix={matrix}
        steps={steps}
        range={range}
        t={t}
        onTChange={setT}
        playKey={playKey}
        controls={phase === 'done'}
      >
        <PatchShape m={sequenceAt(all, t)} range={range} />
      </TransformPlayer>

      {phase === 'guess' && (
        <form className="demo-row" onSubmit={reveal}>
          <label htmlFor={inputId}>Your guess for the new area:</label>
          <input
            id={inputId}
            className="predict-number"
            inputMode="decimal"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button type="submit" className="demo-button" disabled={guess === null}>
            Reveal
          </button>
        </form>
      )}

      {phase === 'playing' && <p className="demo-message">Watch the square…</p>}

      {phase === 'done' && guess !== null && (
        <>
          <p className="demo-status" aria-live="polite">
            {isClose(guess, answer) ? 'Spot on! ' : `You guessed ${guess}. `}
            {areaSentence(answer)}
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

function PointGuess({ matrix, steps, vector, range = 5 }: Props & { vector: Vec2 }) {
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
