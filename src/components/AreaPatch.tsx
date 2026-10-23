// The unit square turning into a parallelogram as a transformation plays, with its signed area shown live.
// Blue while the area is positive. When the determinant goes negative the patch turns purple, gets
// stripes, and a label says "orientation flipped" (so the flip doesn't rely on colour alone).
// Optionally: a small blob that scales by the same factor, draggable î and ĵ tips, a matrix editor,
// the "ad − bc" sum with today's numbers, and buttons for ready-made matrices.
//
// <PatchShape> is the drawing on its own. Put it inside any <TransformPlayer> (e.g. PredictReveal does).
import { useId, useState } from 'react';
import { Polygon, Text } from 'mafs';
import {
  BLOB,
  centroid,
  det2,
  matrixAt,
  matVec,
  orientation,
  polygonArea,
  roundTo,
  stripeLines,
  transformShape,
  UNIT_SQUARE,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixEditor from './MatrixEditor';
import DragVector from './DragVector';
import type { Preset } from './MatrixPlayground';
import './Demo.css';
import './AreaPatch.css';

/** The colour for each way the patch can face. */
const COLOURS = { kept: 'var(--area-kept)', flat: 'var(--zero)', flipped: 'var(--area-flipped)' };

/** Turn corners into a closed SVG path in maths coordinates. */
function toPath(points: Vec2[]): string {
  return 'M' + points.map(([x, y]) => `${x} ${y}`).join('L') + 'Z';
}

/** Turn separate lines into one SVG path. */
function linesPath(lines: Vec2[][]): string {
  return lines.map((line) => 'M' + line.map(([x, y]) => `${x} ${y}`).join('L')).join('');
}

interface ShapeProps {
  /** The matrix right now (part way through the animation, unless t = 1). */
  m: Mat2;
  /** Also draw the blob and its area. */
  blob?: boolean;
  /** The plane's range, so the "orientation flipped" label can sit in its top-left corner. */
  range?: number;
}

/** The moving unit square (and blob), drawn inside a <Plane>. */
export function PatchShape({ m, blob = false, range = 5 }: ShapeProps) {
  // useId gives something like «r1»; keep only letters and numbers so it works inside url(#…).
  const clip = 'patch-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const square = transformShape(m, UNIT_SQUARE);
  const area = polygonArea(square);
  const facing = orientation(area);
  const colour = COLOURS[facing];
  const centre = matVec(m, [0.5, 0.5]);

  const blobNow = transformShape(m, BLOB);
  const blobCentre = centroid(blobNow);

  return (
    <>
      <Polygon points={square} color={colour} fillOpacity={facing === 'flipped' ? 0.2 : 0.3} weight={2} />
      {facing === 'flipped' && (
        // Stripes: diagonal lines, cut to the parallelogram's outline by a clip path.
        <g style={{ transform: 'var(--mafs-view-transform)' }}>
          <clipPath id={clip}>
            <path d={toPath(square)} />
          </clipPath>
          {/* The colour goes on the element itself: Mafs's own stylesheet would turn a class's colour grey. */}
          <path
            d={linesPath(stripeLines(square, 0.35))}
            clipPath={`url(#${clip})`}
            className="area-stripes"
            style={{ stroke: 'var(--area-flipped)' }}
          />
        </g>
      )}
      <Text x={centre[0]} y={centre[1]} color={colour} size={18}>
        {String(roundTo(area, 2))}
      </Text>
      {facing === 'flipped' && (
        // In the top-left corner, so it never covers the arrows.
        <Text x={-range} y={range} attach="se" attachDistance={6} color={colour} size={16}>
          orientation flipped
        </Text>
      )}

      {blob && (
        <>
          <Polygon points={blobNow} color="var(--vec)" fillOpacity={0.35} weight={2} />
          <Text x={blobCentre[0]} y={blobCentre[1]} color="var(--text)" size={14}>
            {String(roundTo(polygonArea(blobNow), 2))}
          </Text>
        </>
      )}
    </>
  );
}

/** One sentence about the area, for under the plane. */
export function areaSentence(area: number): string {
  const facing = orientation(area);
  if (facing === 'flat') return 'Area 0: the square is squashed flat onto a line.';
  if (facing === 'flipped') return `Area ${roundTo(area, 2)}: orientation flipped (the square is turned over).`;
  return `Area ${roundTo(area, 2)}`;
}

interface Props {
  /** The starting matrix, stored as its columns. */
  matrix: Mat2;
  /** Buttons that load a ready-made matrix and play it. */
  presets?: Preset[];
  /** Drag the tips of î and ĵ (they snap to half squares). */
  draggable?: boolean;
  /** Also show a blob that scales by the same factor. */
  blob?: boolean;
  /** Show a matrix you can type into. */
  editor?: boolean;
  /** Show "det = a·d − b·c" with the matrix's numbers. */
  showFormula?: boolean;
  /** The plane shows -range to range on both axes. */
  range?: number;
}

/** true when two matrices hold the same four numbers. Used to light up the matching preset button. */
function same(a: Mat2, b: Mat2): boolean {
  return a.flat().every((n, i) => n === b.flat()[i]);
}

export default function AreaPatch({
  matrix: start,
  presets,
  draggable = false,
  blob = false,
  editor = false,
  showFormula = false,
  range = 5,
}: Props) {
  const [matrix, setMatrix] = useState<Mat2>(start);
  // With arrows to drag, start on the finished picture, so the arrows are where the matrix says.
  const [t, setT] = useState(draggable ? 1 : 0);
  const [playKey, setPlayKey] = useState(0);

  const now = matrixAt(matrix, t);
  const area = det2(now);
  const facing = orientation(area);
  const [[a, c], [b, d]] = matrix;
  const blobBefore = polygonArea(BLOB);

  /** Dragging an arrow changes the matrix: show the finished picture. */
  function drag(m: Mat2) {
    setMatrix(m);
    setT(1);
  }

  /** A preset or typed number: play the animation with it. */
  function load(m: Mat2) {
    setMatrix(m);
    setPlayKey((k) => k + 1);
  }

  return (
    <div className="area-patch">
      {presets && (
        <div className="demo-row" role="group" aria-label="Ready-made matrices">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              className={same(p.matrix, matrix) ? 'demo-button' : 'demo-button secondary'}
              aria-pressed={same(p.matrix, matrix)}
              onClick={() => load(p.matrix)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <TransformPlayer matrix={matrix} range={range} t={t} onTChange={setT} playKey={playKey} showBasis={!draggable}>
        <PatchShape m={now} blob={blob} range={range} />
        {draggable && (
          <>
            <DragVector value={now[1]} onChange={(p) => drag([matrix[0], p])} color="var(--jhat)" snap step={0.5} label="ĵ" limit={range} />
            <DragVector value={now[0]} onChange={(p) => drag([p, matrix[1]])} color="var(--ihat)" snap step={0.5} label="î" limit={range} />
          </>
        )}
      </TransformPlayer>

      <p className={`demo-status area-status ${facing}`} aria-live="polite">
        {facing === 'flipped' && <span aria-hidden="true">⟲ </span>}
        {areaSentence(area)}
      </p>
      {blob && (
        <p className="demo-message">
          Blob: {roundTo(blobBefore, 2)} → {roundTo(polygonArea(transformShape(now, BLOB)), 2)}, also × {roundTo(area, 2)}
        </p>
      )}

      {editor && <MatrixEditor value={matrix} onChange={load} />}

      {showFormula && (
        <p className="area-formula" aria-label={`det = ${a} times ${d} minus ${b} times ${c} = ${det2(matrix)}`}>
          det = <span className="ihat">{roundTo(a, 2)}</span>·<span className="jhat">{roundTo(d, 2)}</span> −{' '}
          <span className="jhat">{roundTo(b, 2)}</span>·<span className="ihat">{roundTo(c, 2)}</span> ={' '}
          <strong>{roundTo(det2(matrix), 2)}</strong>
        </p>
      )}
    </div>
  );
}
