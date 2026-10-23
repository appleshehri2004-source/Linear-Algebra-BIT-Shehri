// A square matrix (2x2 or 3x3) you can type into. Column 1 (where i-hat lands) is green,
// column 2 (where j-hat lands) is red, and column 3 (where k-hat lands, in 3D) is blue.
// The parent keeps the matrix in its state and passes it back in, so dragging arrows elsewhere
// updates these boxes too.
import { useEffect, useState } from 'react';
import { roundTo } from '../lib/linalg';
import { parseNumber } from '../exercises/exercise';
import './CoordReadout.css';
import './MatrixEditor.css';

interface Props<M extends number[][]> {
  /** The matrix, stored as its columns: [[ihatX, ihatY], [jhatX, jhatY]] (and k-hat's column in 3D). */
  value: M;
  /** Called with the new matrix whenever a box holds a number. */
  onChange: (m: M) => void;
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

const hats = ['i-hat', 'j-hat', 'k-hat'];
const axes = ['x', 'y', 'z'];
const colours = ['ihat', 'jhat', 'khat'];

export default function MatrixEditor<M extends number[][]>({ value, onChange, label = 'A' }: Props<M>) {
  const size = value.length;

  /** A copy of the matrix with one number replaced: column col, row row (0 = x, 1 = y, 2 = z). */
  function setEntry(col: number, row: number, n: number) {
    const columns = value.map((c) => [...c]) as M;
    columns[col][row] = n;
    onChange(columns);
  }

  const indexes = Array.from({ length: size }, (_, i) => i);
  return (
    <div className="matrix-editor">
      <span className="readout-label">{label} =</span>
      <div className="readout-column matrix-editor-grid" style={{ gridTemplateColumns: `repeat(${size}, auto)` }}>
        {/* The boxes go row by row: top row is the x parts, then the y parts (then z). */}
        {indexes.map((row) =>
          indexes.map((col) => (
            <span key={`${row}${col}`} className={`matrix-cell ${colours[col]}`}>
              <NumberCell
                value={value[col][row]}
                onChange={(n) => setEntry(col, row, n)}
                label={`${hats[col]} ${axes[row]}`}
              />
            </span>
          )),
        )}
      </div>
    </div>
  );
}
