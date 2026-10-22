// A 2x2 matrix you can type into. Column 1 (where i-hat lands) is green, column 2 (where j-hat lands) is red.
// The parent keeps the matrix in its state and passes it back in, so dragging arrows elsewhere
// updates these boxes too.
import { useEffect, useState } from 'react';
import { roundTo, type Mat2 } from '../lib/linalg';
import { parseNumber } from '../exercises/exercise';
import './CoordReadout.css';
import './MatrixEditor.css';

interface Props {
  /** The matrix, stored as its columns: [[ihatX, ihatY], [jhatX, jhatY]]. */
  value: Mat2;
  /** Called with the new matrix whenever a box holds a number. */
  onChange: (m: Mat2) => void;
  /** A name shown before the brackets. Default: A. */
  label?: string;
}

/** One number box. It keeps what you typed (even "-" or "1." on the way to a number). */
function NumberCell({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const [text, setText] = useState(String(roundTo(value, 2)));

  // When the number changes from outside (an arrow was dragged), show the new number,
  // unless the box already means that number (so typing "2." isn't rewritten to "2").
  useEffect(() => {
    if (parseNumber(text) !== value) setText(String(roundTo(value, 2)));
  }, [value]);

  return (
    <input
      type="text"
      // A normal keyboard: the iPhone number pad has no minus sign.
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseNumber(e.target.value);
        if (n !== null) onChange(n);
      }}
    />
  );
}

export default function MatrixEditor({ value, onChange, label = 'A' }: Props) {
  /** A copy of the matrix with one number replaced: column col (0 or 1), row row (0 = x, 1 = y). */
  function setEntry(col: 0 | 1, row: 0 | 1, n: number) {
    const columns = value.map((c) => [...c]) as Mat2;
    columns[col][row] = n;
    onChange(columns);
  }

  const names = ['i-hat', 'j-hat'];
  return (
    <div className="matrix-editor">
      <span className="readout-label">{label} =</span>
      <div className="readout-column matrix-editor-grid">
        {/* The boxes go row by row: top row is the x parts, bottom row the y parts. */}
        {([0, 1] as const).map((row) =>
          ([0, 1] as const).map((col) => (
            <span key={`${row}${col}`} className={col === 0 ? 'matrix-cell ihat' : 'matrix-cell jhat'}>
              <NumberCell
                value={value[col][row]}
                onChange={(n) => setEntry(col, row, n)}
                label={`${names[col]} ${row === 0 ? 'x' : 'y'}`}
              />
            </span>
          )),
        )}
      </div>
    </div>
  );
}
