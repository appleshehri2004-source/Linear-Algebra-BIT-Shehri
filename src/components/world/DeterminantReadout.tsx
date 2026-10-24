// Station 3's live readout: "det A = ad − bc = 1.5 · 1 − 0.5 · 0.5 = 1.25", with each number in the colour of the
// column it came from (î green, ĵ red), and under it what that means for area ("Area ×1.25", "Flipped over…").
// The TeX and the words come from determinantTex / determinantMeaning in content/home.ts, built on detState in
// linalg.ts, so the number always matches the rest of the site.
import { determinantMeaning, determinantTex } from '../../content/home';
import type { Mat2 } from '../../lib/linalg';
import type { ThemeColors } from '../../lib/useThemeColors';
import Tex from '../Tex';
import { paint, ResetButton } from './MatrixReadout';

interface Props {
  matrix: Mat2;
  colours: ThemeColors;
  onReset: () => void;
}

export default function DeterminantReadout({ matrix, colours, onReset }: Props) {
  const tex = determinantTex(matrix, (column, t) => paint(column === 0 ? colours.ihat : colours.jhat, t));
  return (
    <span className="readout-parts">
      <span className="readout-stack">
        <Tex tex={tex} />
        <span className="readout-meaning">{determinantMeaning(matrix)}</span>
      </span>
      <ResetButton onReset={onReset} />
    </span>
  );
}
