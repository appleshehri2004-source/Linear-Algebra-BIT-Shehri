// Lesson 7.2: the same transformation, from Jennifer's point of view.
// Left: three steps, one after another. Her numbers for x are drawn as if they were ours; P turns them into
// our numbers (the arrow moves to where it really is), M turns it 90°, and P⁻¹ turns the answer back into
// her numbers. Right: her matrix P⁻¹MP, applied in one go. One Play button drives both pictures,
// and when they finish the page checks that both arrows end at the same point.
// All the maths comes from linalg.ts (changeOfBasisMatrix, sequenceAt, currentStep).
import {
  changeOfBasisMatrix,
  currentStep,
  distance,
  formatNumber,
  inverse2,
  matVec,
  sequenceAt,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import PlayControls from './PlayControls';
import MatrixView from './MatrixView';
import { DURATION, usePlayback } from './usePlayback';
import './Demo.css';

interface Props {
  /** Jennifer's basis, stored as columns: [b1, b2] in our numbers. Its determinant must not be 0. */
  basis: Mat2;
  /** The transformation in our numbers, e.g. a 90° turn [[0, 1], [-1, 0]]. */
  matrix: Mat2;
  /** The vector, in Jennifer's numbers. */
  vector: Vec2;
  /** What M does, in a few words, for the captions. Default: "turn 90°". */
  name?: string;
  range?: number;
}

const show = (n: number) => formatNumber(n).replace('-', '−');
const pair = ([x, y]: Vec2) => `(${show(x)}, ${show(y)})`;

export default function ChangeOfBasisPlayer({ basis: P, matrix: M, vector: x, name = 'turn 90°', range = 4 }: Props) {
  const playback = usePlayback({ duration: DURATION * 3 });
  const inv = inverse2(P);
  const her = changeOfBasisMatrix(P, M);
  if (!inv || !her) return <p className="demo-message">b₁ and b₂ are on one line: not a basis.</p>;

  const steps = [P, M, inv];
  const { t } = playback;
  const step = currentStep(3, t);
  const captions = [
    `Step 1: her numbers → ours (P)`,
    `Step 2: ${name} (M)`,
    `Step 3: back to her numbers (P⁻¹)`,
  ];
  const caption = t === 0 ? 'Start: her numbers, drawn on our grid' : t === 1 ? 'Done: the answer in her numbers' : captions[step];

  // Where each arrow is right now, and where they both end.
  const leftNow = matVec(sequenceAt(steps, t), x);
  const rightNow = matVec(sequenceAt([her], t), x);
  const leftEnd = matVec(sequenceAt(steps, 1), x);
  const rightEnd = matVec(her, x);
  const same = distance(leftEnd, rightEnd) < 1e-9;

  return (
    <div>
      <div className="demo-row">
        <MatrixView columns={inv} label="P⁻¹" fractions />
        <MatrixView columns={M} label="M" fractions />
        <MatrixView columns={P} label="P" fractions />
      </div>
      <div className="demo-row">
        <MatrixView columns={her} label="her matrix P⁻¹MP" fractions />
      </div>

      <div className="two-pictures">
        <figure>
          <figcaption aria-live="polite">{caption}</figcaption>
          <TransformPlayer steps={steps} t={t} controls={false} tracked={x} trackedLabel="x" range={range} />
          <p className="demo-message">now at {pair(leftNow)}</p>
        </figure>
        <figure>
          <figcaption>Her matrix, in one go</figcaption>
          <TransformPlayer matrix={her} t={t} controls={false} tracked={x} trackedLabel="x" range={range} />
          <p className="demo-message">now at {pair(rightNow)}</p>
        </figure>
      </div>

      <PlayControls playback={playback} />

      <p className="demo-status" aria-live="polite" style={{ color: t === 1 && same ? 'var(--positive)' : undefined }}>
        {t === 1
          ? same
            ? `Both end at ${pair(leftEnd)} ✓ the same`
            : `They end in different places: ${pair(leftEnd)} and ${pair(rightEnd)}`
          : `Her vector ${pair(x)}: press Play and watch where both arrows end.`}
      </p>
    </div>
  );
}
