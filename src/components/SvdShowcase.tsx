// The homepage's SVD showcase: the BIT logo goes through A = U Σ Vᵀ one step at a time.
// Step 1, Vᵀ, turns; step 2, Σ, stretches along the axes; step 3, U, turns into place. The unit circle's outline
// becomes an ellipse, and î and ĵ ride along, so the turns show even though the logo is round.
// Each step button plays just that step; Play all plays the three in about 3.6 s (under 5 s, so no pause button).
// Visitors who asked for less motion jump straight to the end of a step. All the maths is svdSteps / svdStepsAt
// in linalg.ts; the matrix is SVD_SHOWCASE_MATRIX in content/home.ts (tested: det > 0, clear turns).
import { Polygon } from 'mafs';
import {
  gridLines,
  matVec,
  roundTo,
  rotationAngle,
  stepShown,
  svdSteps,
  svdStepsAt,
  transformShape,
  unitCircle,
  type Mat2,
} from '../lib/linalg';
import { SVD_SHOWCASE_MATRIX } from '../content/home';
import { HaloArrow } from './HomeHalo';
import Plane from './Plane';
import TestShape from './TestShape';
import Tex from './Tex';
import { MathPath, toPath } from './TransformPlayer';
import { usePlayback } from './usePlayback';
import './SvdShowcase.css';

const A = SVD_SHOWCASE_MATRIX;
const { Vt, S, R } = svdSteps(A);
/** How long one step plays, in milliseconds. */
const STEP_TIME = 1200;
const RANGE = 2;
// The grid that moves: lines from -2·RANGE to 2·RANGE, so a stretched grid still fills the plane.
// gridLines lists a vertical and a horizontal line for each k from -extent up; the pair for k = 0 is the axes.
const EXTENT = RANGE * 2;
const GRID = gridLines(EXTENT);
const AXES = GRID.slice(2 * EXTENT, 2 * EXTENT + 2);
const CIRCLE = unitCircle();

/** A number as shown: at most 2 decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2) + 0).replace('-', '−');
/** A matrix (stored as columns) in TeX, numbers rounded to 2 places. */
const texMatrix = ([[a, c], [b, d]]: Mat2) =>
  `\\begin{bmatrix} ${roundTo(a, 2) + 0} & ${roundTo(b, 2) + 0} \\\\ ${roundTo(c, 2) + 0} & ${roundTo(d, 2) + 0} \\end{bmatrix}`;
/** "turn 42° clockwise" or "turn 37° anticlockwise". */
const turn = (m: Mat2) => {
  const degrees = rotationAngle(m) ?? 0;
  return `turn ${Math.round(Math.abs(degrees))}° ${degrees < 0 ? 'clockwise' : 'anticlockwise'}`;
};

const STEPS = [
  { button: '1 rotate', label: 'Vᵀ', tex: 'V^{\\mathsf{T}}', matrix: Vt, sentence: `Step 1, Vᵀ: ${turn(Vt)}, so the directions A stretches most and least lie along the axes.` },
  { button: '2 stretch', label: 'Σ', tex: '\\Sigma', matrix: S, sentence: `Step 2, Σ: stretch ×${show(S[0][0])} along x and ×${show(S[1][1])} along y. The circle becomes an ellipse.` },
  { button: '3 rotate', label: 'U', tex: 'U', matrix: R, sentence: `Step 3, U: ${turn(R)} into place. The logo now sits exactly where A puts it.` },
];

export default function SvdShowcase() {
  const playback = usePlayback({ duration: 3 * STEP_TIME });
  const { t } = playback;
  const m = svdStepsAt(A, t);
  // The step being shown: none at the start, then 0, 1 or 2 (the one playing, or the last one finished).
  const step = stepShown(3, t);

  /** Play from `from` to `to` (fractions of the whole: step k runs from k/3 to (k+1)/3), or jump there. */
  function play(from: number, to: number) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) playback.scrub(to);
    else playback.animateTo(to, from);
  }

  const movedGrid = GRID.map((line) => line.map((p) => matVec(m, p)));
  const movedAxes = AXES.map((line) => line.map((p) => matVec(m, p)));

  return (
    <div className="svd-showcase">
      <figure className="svd-figure" aria-describedby="svd-figure-text">
        <p id="svd-figure-text" className="visually-hidden">
          A coordinate plane with the BIT logo on the unit square and the unit circle around the origin. The steps turn,
          stretch and turn the plane; the circle becomes an ellipse.
        </p>
        <Plane range={RANGE}>
          <MathPath d={toPath(movedGrid)} className="svd-moving-grid" />
          <MathPath d={toPath(movedAxes)} className="svd-moving-axes" />
          <g style={{ transform: 'var(--mafs-view-transform)' }}>
            {/* useSymbol: the logo is defined once on the homepage (TestShapeSymbols in index.astro). */}
            <TestShape shape="bit-logo" matrix={m} flipY={false} useSymbol />
          </g>
          <Polygon points={transformShape(m, CIRCLE)} color="var(--gold)" fillOpacity={0} weight={2} />
          <HaloArrow tip={m[0]} color="var(--i-hat)" label="î" />
          <HaloArrow tip={m[1]} color="var(--j-hat)" label="ĵ" />
        </Plane>
      </figure>

      <div className="svd-side">
        {/* The buttons come first, so on a phone they sit right under the picture they move. */}
        <div className="svd-buttons" role="group" aria-label="Play the steps">
          {STEPS.map((s, k) => (
            <button key={s.button} type="button" className={step === k ? 'active' : undefined} onClick={() => play(k / 3, (k + 1) / 3)}>
              {s.button}
            </button>
          ))}
          <button type="button" onClick={() => play(0, 1)}>
            Play all
          </button>
          <button type="button" onClick={() => playback.scrub(0)}>
            Reset
          </button>
        </div>
        {/* Read aloud when the step changes. */}
        <p className="svd-sentence" aria-live="polite">
          {step === null ? 'Press a step, or Play all.' : STEPS[step].sentence}
        </p>
        <div className="svd-equation">
          <Tex tex={`A = ${texMatrix(A)}`} />
          <span className="svd-approx">
            <Tex tex="\approx" />
          </span>
        </div>
        {/* U Σ Vᵀ reads right to left: Vᵀ acts first. So the boxes are shown U, Σ, Vᵀ, numbered 3, 2, 1. */}
        <ol className="svd-factors" reversed>
          {[...STEPS].reverse().map((s) => (
            <li key={s.label} className={step !== null && STEPS[step] === s ? 'svd-factor active' : 'svd-factor'}>
              <Tex tex={`${s.tex} = ${texMatrix(s.matrix)}`} />
              <span className="svd-factor-name">{s.button}</span>
            </li>
          ))}
        </ol>
        <p className="svd-note">Read right to left: Vᵀ acts first, then Σ, then U.</p>

      </div>
    </div>
  );
}
