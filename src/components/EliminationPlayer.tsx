// Gaussian elimination, one row operation at a time. Shows the augmented matrix [A | b] with
// Previous / Next step / Play buttons; the row that just changed is highlighted, and the operation is written above it.
// For 2 equations it also draws them as two lines on a plane. Each step turns a line, but the lines
// always cross at the same point: row operations never change the solution.
// Use it in a lesson as <EliminationPlayer client:visible systems={[{ name: '2×2', rows: [[1, 2, 5], [3, 4, 6]] }]} />.
// Rows, not columns: [1, 2, 5] means x + 2y = 5. All the maths comes from rrefSteps in linalg.ts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line, Point } from 'mafs';
import {
  consistency,
  easeInOut,
  equationLine,
  equationText,
  formatNumber,
  lerpRows,
  randomSystem,
  rrefSteps,
} from '../lib/linalg';
import Plane from './Plane';
import './Demo.css';
import './EliminationPlayer.css';

interface System {
  /** The button text, e.g. "2 equations". */
  name: string;
  /** The augmented matrix as rows: [[1, 2, 5], [3, 4, 6]] is x + 2y = 5, 3x + 4y = 6. */
  rows: number[][];
}

interface Props {
  /** The systems to choose from. The first one is shown first. */
  systems: System[];
  /** Show a "Random system" button (same size as the system on screen). */
  random?: boolean;
  /** The plane shows -range to range (2 equations only). */
  range?: number;
}

/** Time between steps while playing, in milliseconds. */
const STEP_TIME = 1600;
/** How long a line takes to turn to its new place, in milliseconds. */
const SLIDE_TIME = 600;
/** Each row's colour: R1 blue, R2 purple, R3 teal. Not green or red, which mean î and ĵ. */
const ROW_COLOURS = ['var(--row1)', 'var(--row2)', 'var(--row3)'];

export default function EliminationPlayer({ systems, random = false, range = 6 }: Props) {
  const [rows, setRows] = useState(systems[0].rows);
  const [step, setStep] = useState(0);
  // The step the lines are turning from, and how far they've turned (0 to 1).
  const [from, setFrom] = useState(0);
  const [slide, setSlide] = useState(1);
  const [playing, setPlaying] = useState(false);
  const frame = useRef(0);

  const { steps, solution } = useMemo(() => rrefSteps(rows), [rows]);
  const last = steps.length - 1;
  const current = steps[step];
  const names = ['x', 'y', 'z'];

  /** Go to step n, turning the lines from where they are now. */
  function goTo(n: number) {
    setFrom(step);
    setStep(n);
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const s = Math.min(1, (now - start) / SLIDE_TIME);
      setSlide(s);
      if (s < 1) frame.current = requestAnimationFrame(tick);
    };
    setSlide(0);
    frame.current = requestAnimationFrame(tick);
  }

  function choose(newRows: number[][]) {
    cancelAnimationFrame(frame.current);
    setPlaying(false);
    setRows(newRows);
    setStep(0);
    setFrom(0);
    setSlide(1);
  }

  // While playing, take the next step every STEP_TIME; stop at the end.
  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => goTo(step + 1), step === 0 ? 400 : STEP_TIME);
    return () => clearTimeout(timer);
  }, [playing, step, last]);

  // Stop the animation when the component goes away.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function play() {
    if (playing) return setPlaying(false);
    if (step >= last) choose(rows); // Play at the end starts again from the beginning.
    setPlaying(true);
  }

  // The lines in the picture, part way between the last step and this one.
  const drawn = lerpRows(steps[from].matrix, current.matrix, easeInOut(slide));
  const ghost = current.changedRow !== null && from !== step ? steps[from].matrix[current.changedRow] : null;
  const ghostLine = ghost ? equationLine(ghost) : null;
  const size = rows.length;

  return (
    <div className="elimination">
      {(systems.length > 1 || random) && (
        <div className="demo-row">
          {systems.map((s) => (
            <button
              key={s.name}
              type="button"
              className="demo-button secondary"
              aria-pressed={s.rows === rows}
              onClick={() => choose(s.rows)}
            >
              {s.name}
            </button>
          ))}
          {random && (
            <button type="button" className="demo-button secondary" onClick={() => choose(randomSystem(size as 2 | 3))}>
              Random system
            </button>
          )}
        </div>
      )}

      <p className="elim-op" aria-live="polite">
        <span className="elim-count">
          Step {step} of {last}
        </span>
        {step === 0 ? 'The system as given' : current.description}
      </p>

      <div className="elim-matrix-wrap">
        <table className="elim-matrix">
          <tbody>
            {current.matrix.map((row, r) => (
              <tr key={r} className={current.changedRow === r ? 'changed' : undefined}>
                <th scope="row" style={{ color: ROW_COLOURS[r] }}>
                  R{r + 1}
                </th>
                {row.map((n, c) => (
                  <td key={c} className={c === size ? 'elim-rhs' : undefined}>
                    {formatNumber(n).replace('-', '−')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="elim-equations">
        {current.matrix.map((row, r) => (
          <li key={r} style={{ color: ROW_COLOURS[r] }}>
            {equationText(row)}
          </li>
        ))}
      </ul>

      <div className="demo-row">
        <button type="button" className="demo-button secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>
          Previous
        </button>
        <button type="button" className="demo-button" onClick={play}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="demo-button secondary" disabled={step === last} onClick={() => goTo(step + 1)}>
          Next step
        </button>
      </div>

      {step === last && (
        <p className="demo-status">
          {solution
            ? `Solved: ${solution.map((n, i) => `${names[i]} = ${formatNumber(n).replace('-', '−')}`).join(', ')}`
            : consistency(rows).consistent
              ? 'Infinitely many solutions'
              : 'No solution: the system is inconsistent'}
        </p>
      )}

      {/* The picture only works for 2 equations in 2 unknowns: each row is then a line in the plane. */}
      {size === 2 && rows[0].length === 3 && (
        <Plane range={range}>
          {ghostLine && slide < 1 && (
            <Line.ThroughPoints
              point1={ghostLine[0]}
              point2={ghostLine[1]}
              color={ROW_COLOURS[current.changedRow!]}
              style="dashed"
              opacity={0.5 * (1 - slide)}
            />
          )}
          {drawn.map((row, r) => {
            const line = equationLine(row);
            return (
              line && (
                <Line.ThroughPoints
                  key={r}
                  point1={line[0]}
                  point2={line[1]}
                  color={ROW_COLOURS[r]}
                  weight={current.changedRow === r ? 4 : 2.5}
                />
              )
            );
          })}
          {solution && <Point x={solution[0]} y={solution[1]} color="var(--vec)" />}
        </Plane>
      )}
    </div>
  );
}
