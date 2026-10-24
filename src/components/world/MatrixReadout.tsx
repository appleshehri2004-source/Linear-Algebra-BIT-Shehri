// Station 2's live readout: [A][x] = [b], with A's first column in î's green, its second in ĵ's red, and x and b
// in yellow, like the arrows. b comes from matVec in linalg.ts. A small ↺ button puts A back to its start.
import { matVec, roundTo, type Mat2, type Vec2 } from '../../lib/linalg';
import type { ThemeColors } from '../../lib/useThemeColors';
import Tex from '../Tex';

/** A number inside TeX: at most 2 decimal places (b can have 2 when A has 1), never "-0". */
const n = (x: number) => String(roundTo(x, 2) + 0);

/**
 * TeX that paints `tex` in a theme colour. KaTeX needs a real colour value, so the theme's colour (read at runtime
 * in World.tsx) is used only if it is a plain hex colour; anything else just inherits the readout's colour.
 */
const paint = (colour: string, tex: string) =>
  /^#[0-9a-f]{3,8}$/i.test(colour) ? `\\textcolor{${colour}}{${tex}}` : tex;

interface Props {
  matrix: Mat2;
  x: Vec2;
  colours: ThemeColors;
  onReset: () => void;
}

export default function MatrixReadout({ matrix, x, colours, onReset }: Props) {
  const [[a, c], [b, d]] = matrix; // stored as columns: î = (a, c), ĵ = (b, d)
  const i = (t: number) => paint(colours.ihat, n(t));
  const j = (t: number) => paint(colours.jhat, n(t));
  const column = ([p, q]: Vec2) => paint(colours.vec, `\\begin{bmatrix} ${n(p)} \\\\ ${n(q)} \\end{bmatrix}`);
  const tex = `\\begin{bmatrix} ${i(a)} & ${j(b)} \\\\ ${i(c)} & ${j(d)} \\end{bmatrix} ${column(x)} = ${column(matVec(matrix, x))}`;

  return (
    <span className="readout-parts">
      <Tex tex={tex} />
      <button type="button" className="readout-reset" aria-label="Put the matrix back to its start" onClick={onReset}>
        ↺
      </button>
    </span>
  );
}
