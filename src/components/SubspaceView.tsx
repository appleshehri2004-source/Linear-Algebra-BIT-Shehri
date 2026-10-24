// Lessons 2.8.1 and 2.9.1: column space, null space and rank, with the input plane and the output plane side by side.
// Input (left): the null space in pink, with a few pink vectors on it.
// Output (right): the grid moves like in TransformPlayer, and the column space is violet.
// On Play the pink vectors ride along and all land on the origin: that is what "A squashes them to 0" means.
// All the maths comes from linalg.ts (rank, columnSpaceBasis, nullSpaceBasis).
import { useState } from 'react';
import { Line, Point, Polygon, Text, Vector } from 'mafs';
import { columnSpaceBasis, length, matrixAt, matVec, nullSpaceBasis, rank, scale, type Mat2, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import Plane from './Plane';
import PlayControls from './PlayControls';
import MatrixView from './MatrixView';
import { usePlayback } from './usePlayback';
import './Demo.css';

interface Preset {
  name: string;
  matrix: Mat2;
}

interface Props {
  /** The matrices to choose from, stored as columns. The first is shown first. */
  presets: Preset[];
  /** The planes show -range to range on both axes. */
  range?: number;
  /** false: don't use the word "rank" (for lessons before §2.9, where it is defined). */
  showRank?: boolean;
}

/** "the whole plane", "a line" or "just the origin", for a space with this many dimensions inside the plane. */
export function spaceWords(dimensions: number): string {
  return ['just the origin', 'a line', 'the whole plane'][dimensions];
}

/**
 * Draws a space through the origin, from its basis: no vectors is a dot at the origin, one is a line
 * through it, two is the whole plane (lightly shaded).
 */
export function SubspaceShape({ basis, color, range }: { basis: Vec2[]; color: string; range: number }) {
  if (basis.length === 0) return <Point x={0} y={0} color={color} />;
  if (basis.length === 1) return <Line.ThroughPoints point1={[0, 0]} point2={basis[0]} color={color} weight={4} />;
  const r = range + 1;
  return <Polygon points={[[-r, -r], [r, -r], [r, r], [-r, r]]} color={color} fillOpacity={0.12} weight={0} />;
}

/** A few vectors in the null space, to watch them land on 0. Spread along the line, or round a circle if it's the whole plane. */
function sampleVectors(basis: Vec2[]): Vec2[] {
  if (basis.length === 0) return [];
  if (basis.length === 1) {
    const unit = scale(1 / length(basis[0]), basis[0]);
    return [-3, -1.5, 1.5, 3].map((k) => scale(k, unit));
  }
  return [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [2.5 * Math.cos(a), 2.5 * Math.sin(a)] as Vec2;
  });
}

/** Pink arrows. An arrow too short to see becomes a dot (at the end of Play, on the origin). */
function NullVectors({ tips }: { tips: Vec2[] }) {
  return (
    <>
      {tips.map((tip, i) => (
        <g key={i}>
          {length(tip) > 0.15 ? (
            <Vector tip={tip} color="var(--null)" weight={3} />
          ) : (
            <Point x={tip[0]} y={tip[1]} color="var(--null)" />
          )}
        </g>
      ))}
    </>
  );
}

export default function SubspaceView({ presets, range = 4, showRank = true }: Props) {
  const [index, setIndex] = useState(0);
  const a = presets[index].matrix;
  const playback = usePlayback();
  const { t, scrub } = playback;

  const r = rank(a);
  const columnSpace = columnSpaceBasis(a) as Vec2[];
  const nullSpace = nullSpaceBasis(a) as Vec2[];
  const samples = sampleVectors(nullSpace);
  const now = matrixAt(a, t);
  const moved = samples.map((v) => matVec(now, v));
  // The far ends of the null space line, moved too: the pink line shrinks to a dot as t goes to 1.
  const lineEnds = nullSpace.length === 1 ? [scale(-2 * range, nullSpace[0]), scale(2 * range, nullSpace[0])] : null;

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
      </div>

      <div className="two-pictures">
        <figure>
          <figcaption>Input: the null space</figcaption>
          <Plane range={range}>
            <SubspaceShape basis={nullSpace} color="var(--null)" range={range} />
            <NullVectors tips={samples} />
          </Plane>
        </figure>
        <figure>
          <figcaption>Output: the column space</figcaption>
          <TransformPlayer matrix={a} t={t} controls={false} range={range}>
            <SubspaceShape basis={columnSpace} color="var(--space)" range={range} />
            {lineEnds && (
              <Line.Segment point1={matVec(now, lineEnds[0])} point2={matVec(now, lineEnds[1])} color="var(--null)" weight={3} />
            )}
            <NullVectors tips={moved} />
            {t > 0.999 && samples.length > 0 && (
              <Text x={0} y={0} attach="ne" attachDistance={14} color="var(--null)" size={18}>
                all here
              </Text>
            )}
          </TransformPlayer>
        </figure>
      </div>

      <PlayControls playback={playback} />

      <p className="demo-status" aria-live="polite">
        {showRank ? `Rank ${r}: the` : 'The'} column space is {spaceWords(r)}, and the null space is {spaceWords(2 - r)}.
      </p>
      <p className="demo-message">
        {r === 2 && 'Nothing is squashed: only the origin itself lands on the origin.'}
        {r === 1 && t > 0.999 && 'Every pink vector landed on the origin: A squashed the whole pink line to 0.'}
        {r === 0 && t > 0.999 && 'Everything landed on the origin: the whole plane is the null space.'}
      </p>
    </div>
  );
}
