// Station 1's live readout: v = [..], w = [..], v + w = [..], each part in its arrow's colour.
// The sum comes from add() in linalg.ts, like every number on screen. KaTeX draws the column vectors.
import { add, roundTo, type Vec2 } from '../../lib/linalg';
import Tex from '../Tex';

/** A number inside TeX: at most 1 decimal place (tips move in steps of 0.1), never "-0". */
const n = (x: number) => String(roundTo(x, 1) + 0);
/** A column vector in TeX. */
const column = ([x, y]: Vec2) => `\\begin{bmatrix} ${n(x)} \\\\ ${n(y)} \\end{bmatrix}`;

export default function VectorsReadout({ v, w }: { v: Vec2; w: Vec2 }) {
  return (
    <span className="readout-parts">
      <span className="vec">
        <Tex tex={`\\mathbf{v} = ${column(v)}`} />
      </span>
      <span className="vec2">
        <Tex tex={`\\mathbf{w} = ${column(w)}`} />
      </span>
      <span className="sum">
        <Tex tex={`\\mathbf{v} + \\mathbf{w} = ${column(add(v, w))}`} />
      </span>
    </span>
  );
}
