// Shows a vector as a column of two numbers in square brackets, e.g.  v = [3]
//                                                                         [2]
// in the same colour as its arrow. Re-renders (so updates live) whenever the vector changes.
import { roundTo, type Vec2 } from '../lib/linalg';
import './CoordReadout.css';

interface Props {
  vector: Vec2;
  /** A name shown before the column, e.g. "v" or "v + w". */
  label?: string;
  /** A colour such as "var(--vec)". */
  color?: string;
}

export default function CoordReadout({ vector, label, color = 'var(--vec)' }: Props) {
  // Two decimal places, like every other readout on the site (snapping keeps most values whole).
  const [x, y] = vector.map((n) => roundTo(n, 2));

  return (
    <span className="readout" style={{ color }} aria-live="polite">
      {label && <span className="readout-label">{label} =</span>}
      <span className="readout-column" aria-label={`${x}, ${y}`}>
        <span>{x}</span>
        <span>{y}</span>
      </span>
    </span>
  );
}
