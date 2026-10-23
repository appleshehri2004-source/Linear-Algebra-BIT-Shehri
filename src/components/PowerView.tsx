// Lesson 8.4: apply A again and again. "Step" applies A once more; the n slider jumps to any step.
// The yellow dots are v, Av, A²v, …; the arrow is Aⁿv.
// "Eigenbasis view" draws the same trail in the eigenvectors' own numbers. There, every step just
// multiplies the first number by λ₁ and the second by λ₂: A is only stretching the two axes.
// All the maths comes from linalg.ts (powerTrail, eigenTrail, eig2, powerParts, fitRange, niceGridStep).
import { useEffect, useId, useState } from 'react';
import { Point, Polyline, Text, Vector } from 'mafs';
import {
  eig2,
  eigenTrail,
  fitRange,
  formatNumber,
  niceGridStep,
  powerParts,
  powerTrail,
  roundTo,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import MatrixView from './MatrixView';
import { EigenLines } from './EigenProbe';
import './Demo.css';
import './TransformPlayer.css';

interface Example {
  /** The button text, e.g. "Fibonacci". */
  name: string;
  /** The matrix, stored as its columns. */
  matrix: Mat2;
  /** The starting vector. */
  vector: Vec2;
  /** The n slider goes up to this. */
  maxN: number;
  /** A fixed plane size and grid gap (e.g. for Markov, where everything stays between 0 and 1). Default: zoom to fit. */
  range?: number;
  gridStep?: number;
  /** A sentence about what to notice, shown under the picture. */
  note?: string;
}

interface Props {
  examples: Example[];
}

const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');
const exact = (n: number) => formatNumber(n).replace('-', '−');

export default function PowerView({ examples }: Props) {
  const id = useId();
  const [choice, setChoice] = useState(0);
  const { matrix: a, vector: v, maxN, note } = examples[choice];
  const [n, setN] = useState(0);
  const [eigenView, setEigenView] = useState(false);

  useEffect(() => setN(0), [choice]);

  const eigen = eig2(a);
  const ours = powerTrail(a, v, n);
  const theirs = eigenTrail(a, v, n);
  const shown = eigenView && theirs ? theirs : ours;
  const tip = shown[n];
  const parts = powerParts(a, n);

  // Zoom so every dot so far fits (unless the example fixes the size).
  const range = examples[choice].range ?? fitRange(shown);
  const gridStep = examples[choice].gridStep ?? niceGridStep(range);
  const lambdas = eigen.kind === 'lines' ? eigen.pairs.map((p) => p.lambda) : [];

  return (
    <div>
      {examples.length > 1 && (
        <div className="demo-row">
          <div className="demo-toggle" role="group" aria-label="Pick an example">
            {examples.map((ex, i) => (
              <button
                key={ex.name}
                type="button"
                className={`demo-button${i === choice ? '' : ' secondary'}`}
                aria-pressed={i === choice}
                onClick={() => setChoice(i)}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="demo-row">
        <div className="demo-toggle" role="group" aria-label="Which numbers to draw in">
          <button
            type="button"
            className={`demo-button${eigenView ? ' secondary' : ''}`}
            aria-pressed={!eigenView}
            onClick={() => setEigenView(false)}
          >
            Our view
          </button>
          <button
            type="button"
            className={`demo-button${eigenView ? '' : ' secondary'}`}
            aria-pressed={eigenView}
            onClick={() => setEigenView(true)}
            disabled={!theirs}
          >
            Eigenbasis view
          </button>
        </div>
      </div>

      <Plane range={range} gridStep={gridStep}>
        {eigenView && theirs ? (
          <>
            {/* In the eigenbasis, the eigenvectors ARE the axes. */}
            {/* Labels at the far ends of the axes, out of the way of the dots. */}
            <Text x={range} y={0} attach="sw" attachDistance={8} color="var(--eigen)" size={16}>
              e₁: × {show(lambdas[0])} each step
            </Text>
            <Text x={0} y={range * 0.92} attach="e" attachDistance={8} color="var(--eigen)" size={16}>
              e₂: × {show(lambdas[1])}
            </Text>
            <Vector tip={[tip[0], 0]} color="var(--ihat)" weight={3} />
            <Vector tail={[tip[0], 0]} tip={tip} color="var(--jhat)" weight={3} />
          </>
        ) : (
          <EigenLines eigen={eigen} lit={lambdas.map((_, i) => i)} range={range} labelAt={0.9} />
        )}
        {n > 0 && <Polyline points={shown} color="var(--vec)" weight={1.5} />}
        {shown.map((p, k) => (
          <Point key={k} x={p[0]} y={p[1]} color="var(--vec)" opacity={k === n ? 1 : 0.5} />
        ))}
        <Vector tip={tip} color="var(--vec)" weight={4} />
        <Text x={tip[0]} y={tip[1]} attach="ne" attachDistance={10} color="var(--vec)" size={18}>
          {n === 0 ? 'v' : n === 1 ? 'Av' : `A${toSuperscript(n)}v`}
        </Text>
      </Plane>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={() => setN(Math.min(maxN, n + 1))} disabled={n === maxN}>
          Step (apply A once more)
        </button>
        <button type="button" className="demo-button secondary" onClick={() => setN(0)} disabled={n === 0}>
          Start over
        </button>
      </div>

      <div className="transform-scrub">
        <label htmlFor={id}>
          n = <output htmlFor={id}>{n}</output>
        </label>
        <input id={id} type="range" min={0} max={maxN} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
        <div className="slider-ends" aria-hidden="true">
          <span>0</span>
          <span>{maxN}</span>
        </div>
      </div>

      <div className="demo-row">
        {/* Two decimals (CoordReadout shows one), so Markov's 2/3 and 1/3 read as 0.67 and 0.33. */}
        <MatrixView columns={[ours[n]]} label={n === 0 ? 'v' : `A${toSuperscript(n)}v`} color="var(--vec)" />
        {theirs && (
          <span>
            in eigen-numbers: ({show(theirs[n][0])}, {show(theirs[n][1])})
          </span>
        )}
      </div>
      {parts && (
        <div className="demo-row">
          <span>A{toSuperscript(n)} = P Dⁿ P⁻¹:</span>
          <MatrixView columns={parts.P} label="P" fractions />
          <MatrixView columns={parts.Dn} label={`D${toSuperscript(n)}`} />
        </div>
      )}
      {lambdas.length === 2 && (
        <p className="demo-message">
          λ₁ = {exact(lambdas[0])}, λ₂ = {exact(lambdas[1])}. {note}
        </p>
      )}
    </div>
  );
}

/** 12 → "¹²", for writing powers like A¹². */
function toSuperscript(n: number): string {
  const digits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(n)
    .split('')
    .map((d) => digits[Number(d)])
    .join('');
}
