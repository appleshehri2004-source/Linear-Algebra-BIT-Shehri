// Lesson 2.2.2: finding A⁻¹ by row reducing [A | I], one row operation at a time, with Previous / Play / Next step.
// The row that just changed is highlighted and the operation is written above it. At the end the left half is I
// and the right half is A⁻¹, or a row of 0s on the left shows that A has no inverse.
// Use it in a lesson as <InverseStepper client:visible matrices={[{ name: '2×2', rows: [[2, 1], [5, 3]] }]} />.
// Rows, not columns, like EliminationPlayer. All the maths comes from inverseSteps in linalg.ts.
import { useEffect, useMemo, useState } from 'react';
import { formatNumber, inverseSteps } from '../lib/linalg';
import './Demo.css';
import './EliminationPlayer.css';

interface Choice {
  /** The button text, e.g. "3×3". */
  name: string;
  /** The square matrix A, as rows. */
  rows: number[][];
}

interface Props {
  /** The matrices to choose from. The first one is shown first. */
  matrices: Choice[];
}

/** Time between steps while playing, in milliseconds. */
const STEP_TIME = 1600;

export default function InverseStepper({ matrices }: Props) {
  const [rows, setRows] = useState(matrices[0].rows);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { steps, inverse } = useMemo(() => inverseSteps(rows), [rows]);
  const last = steps.length - 1;
  const current = steps[step];
  const n = rows.length;

  function choose(newRows: number[][]) {
    setPlaying(false);
    setRows(newRows);
    setStep(0);
  }

  // While playing, take the next step every STEP_TIME; stop at the end.
  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep(step + 1), step === 0 ? 400 : STEP_TIME);
    return () => clearTimeout(timer);
  }, [playing, step, last]);

  function play() {
    if (playing) return setPlaying(false);
    if (step >= last) setStep(0); // Play at the end starts again from the beginning.
    setPlaying(true);
  }

  return (
    <div className="elimination">
      {matrices.length > 1 && (
        <div className="demo-row">
          {matrices.map((m) => (
            <button
              key={m.name}
              type="button"
              className="demo-button secondary"
              aria-pressed={m.rows === rows}
              onClick={() => choose(m.rows)}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      <p className="elim-op" aria-live="polite">
        <span className="elim-count">
          Step {step} of {last}
        </span>
        {step === 0 ? 'Start: A on the left, I on the right' : current.description}
      </p>

      <div className="elim-matrix-wrap">
        <table className="elim-matrix" aria-label="The matrix [A | I]">
          <tbody>
            {current.matrix.map((row, r) => (
              <tr key={r} className={current.changedRow === r ? 'changed' : undefined}>
                <th scope="row">R{r + 1}</th>
                {row.map((x, c) => (
                  <td key={c} className={c === n ? 'elim-rhs' : undefined}>
                    {formatNumber(x).replace('-', '−')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="demo-row">
        <button type="button" className="demo-button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Previous
        </button>
        <button type="button" className="demo-button" onClick={play}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="demo-button secondary" disabled={step === last} onClick={() => setStep(step + 1)}>
          Next step
        </button>
      </div>

      {step === last && (
        <p className="demo-status">{inverse ? 'Done: the right half is A⁻¹.' : 'A is not invertible.'}</p>
      )}
    </div>
  );
}
