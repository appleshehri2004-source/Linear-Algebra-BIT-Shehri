// Shows any matrix (stored as its columns) in square brackets, read-only.
// Column 1 is green, column 2 red, column 3 blue, like i-hat, j-hat and k-hat.
// `highlight` marks some numbers with a yellow box, e.g. the ones that differ between two matrices.
import { formatNumber, roundTo } from '../lib/linalg';
import './CoordReadout.css';
import './MatrixEditor.css';

interface Props {
  /** The columns, e.g. [[1, 0], [1, 1]] for a 2x2 or [[2, -1, -2], [0, 1, 1]] for a 3x2. */
  columns: number[][];
  /** A name shown before the brackets. */
  label?: string;
  /** Same shape as columns: true marks a number. */
  highlight?: boolean[][];
  /** One colour for every number, e.g. "var(--vec)" for a vector. Default: green, red, blue columns. */
  color?: string;
  /** Show clean fractions (1/3, -9/2) instead of decimals rounded to 2 places. */
  fractions?: boolean;
}

const colours = ['ihat', 'jhat', 'khat'];

export default function MatrixView({ columns, label, highlight, color, fractions = false }: Props) {
  const rows = columns[0].length;
  return (
    <span className="readout matrix-view" style={color ? { color } : undefined}>
      {label && <span className="readout-label">{label} =</span>}
      <span
        className="readout-column matrix-editor-grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, auto)` }}
      >
        {/* Row by row: the grid fills left to right, so each row lists one number from every column. */}
        {Array.from({ length: rows }, (_, r) =>
          columns.map((col, c) => (
            <span
              key={`${r}${c}`}
              className={`matrix-view-cell ${color ? '' : colours[c] ?? ''}${highlight?.[c]?.[r] ? ' marked' : ''}`}
            >
              {fractions ? formatNumber(col[r]).replace('-', '−') : roundTo(col[r], 2)}
            </span>
          )),
        )}
      </span>
    </span>
  );
}
