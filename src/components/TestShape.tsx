// A shape for a matrix to act on: the BIT logo, or a plain letter F for pages that can't use the logo.
// Both fill the unit square, from (0, 0) to (1, 1), so î and ĵ run along the shape's bottom and left edges.
//
// The matrix is applied with ONE SVG transform on a group, never by redrawing the paths, so even the 66-path logo
// costs nothing to move. Put it inside an <svg> whose viewBox is in maths units, e.g. viewBox="-2 -2 4 4".
//
// Screens count y downwards; maths counts y upwards. TestShape flips y once, in its outer group, so the matrix inside
// is the maths matrix exactly (src/components/TestShape.test.ts proves it). Inside Mafs, which flips y itself, this
// component isn't the right one as it stands (session 4 deals with that).
//
// Many copies on one page (the chapter cards): put <TestShapeSymbols /> in the page once and give each copy useSymbol,
// so the logo's paths are in the page once and every copy points at them with <use>.
import { svgMatrix, type Mat2 } from '../lib/linalg';
// The logo's SVG file as text (Vite's ?raw), so it can be placed inside our own drawing.
import logoSvg from '../assets/bit-logo.svg?raw';

export type ShapeName = 'bit-logo' | 'neutral';

interface Props {
  shape: ShapeName;
  /** The matrix that moves the shape, stored as its columns. */
  matrix: Mat2;
  /** Point at the shape defined once by <TestShapeSymbols /> instead of drawing it again. */
  useSymbol?: boolean;
}

// The logo file split into its picture size (viewBox) and its contents (everything inside the outer <svg> tag).
const logoViewBox = logoSvg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1 1';
const logoInside = logoSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/** The letter F in the unit square, maths coordinates (y up): a stem, a long top bar and a shorter middle bar. */
const F_POINTS = '0.15,0.05 0.35,0.05 0.35,0.45 0.65,0.45 0.65,0.62 0.35,0.62 0.35,0.75 0.85,0.75 0.85,0.95 0.15,0.95';

/** The shape itself, unmoved, in maths coordinates. */
function ShapeBody({ shape }: { shape: ShapeName }) {
  if (shape === 'neutral') return <polygon points={F_POINTS} style={{ fill: 'var(--ink-2)' }} />;
  // The logo file counts y downwards from its top edge. translate + scale(1, -1) stands it upright in maths
  // coordinates, and the nested <svg> shrinks its viewBox to exactly 1 × 1.
  return (
    <g transform="translate(0 1) scale(1 -1)">
      <svg x={0} y={0} width={1} height={1} viewBox={logoViewBox} dangerouslySetInnerHTML={{ __html: logoInside }} />
    </g>
  );
}

const symbolId = (shape: ShapeName) => `test-shape-${shape}`;

export default function TestShape({ shape, matrix, useSymbol = false }: Props) {
  const [a, b, c, d, e, f] = svgMatrix(matrix);
  return (
    // aria-hidden: the picture around it carries the text description.
    <g transform="scale(1 -1)" aria-hidden="true">
      <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}>
        {useSymbol ? <use href={`#${symbolId(shape)}`} /> : <ShapeBody shape={shape} />}
      </g>
    </g>
  );
}

/** Both shapes, defined once for <TestShape useSymbol />. Put it inside an <svg> on the page. */
export function TestShapeSymbols() {
  return (
    <defs>
      {(['bit-logo', 'neutral'] as const).map((shape) => (
        <symbol key={shape} id={symbolId(shape)} overflow="visible">
          <ShapeBody shape={shape} />
        </symbol>
      ))}
    </defs>
  );
}
