// Lesson 7.1: Jennifer's grid. Our grid and Jennifer's grid share the origin; Jennifer's is drawn from her
// basis vectors b₁ (green) and b₂ (red), which you can drag. The yellow arrow carries two labels at once:
// its numbers in our language and in hers. Under the plane, P turns her numbers into ours and P⁻¹ turns ours
// into hers. If b₁ and b₂ line up there is no grid for her to use, and the page says "not a basis".
// With `plain` (Lesson 2.9.1, before the Jennifer story) it uses the book's words instead: the standard grid,
// the B-grid, x and [x]_B, and it leaves out the matrices P and P⁻¹ (they come in §4.4).
// All the maths comes from linalg.ts (toOurCoords, toHerCoords, basisGridLines, snapToBasis).
import { useState } from 'react';
import { Text, Vector } from 'mafs';
import {
  basisGridLines,
  formatNumber,
  gridLines,
  inverse2,
  isIndependent,
  snapToBasis,
  snapVec,
  toHerCoords,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import SnapToggle from './SnapToggle';
import MatrixView from './MatrixView';
import { MathPath, toPath } from './TransformPlayer';
import './Demo.css';

interface Props {
  /** Jennifer's basis, stored as columns: [b1, b2] in our numbers. Default b1 = (2, 1), b2 = (-1, 1). */
  basis?: Mat2;
  /** Where the yellow arrow starts, in our numbers. */
  start?: Vec2;
  /** Use the words "standard" and "B" instead of "ours" and "hers", and leave out P and P⁻¹. */
  plain?: boolean;
}

type View = 'ours' | 'hers' | 'both';

const RANGE = 5;
const OUR_GRID = toPath(gridLines(RANGE));

/** A number as a fraction or short decimal, with a real minus sign: 5/3, −1/3, 2. */
const show = (n: number) => formatNumber(n).replace('-', '−');
const pair = ([x, y]: Vec2) => `(${show(x)}, ${show(y)})`;

export default function BasisGridView({ basis = [[2, 1], [-1, 1]], start = [3, 2], plain = false }: Props) {
  const [b1, setB1] = useState<Vec2>(basis[0]);
  const [b2, setB2] = useState<Vec2>(basis[1]);
  const [v, setV] = useState<Vec2>(start);
  const [view, setView] = useState<View>('both');
  const [snap, setSnap] = useState(true);

  const P: Mat2 = [b1, b2];
  const isBasis = isIndependent(b1, b2);
  const her = isBasis ? toHerCoords(P, v) : null;
  const inv = inverse2(P);
  const showOurs = view !== 'hers';
  const showHers = view !== 'ours' && isBasis;
  const side = v[0] > 0 ? 'w' : 'e';

  /** Snap to the corners of the grid you are looking at: hers in the "Hers" view, ours otherwise. */
  function moveV(p: Vec2) {
    if (!snap) setV(p);
    else setV(view === 'hers' && isBasis ? snapToBasis(P, p) : snapVec(p));
  }

  return (
    <div className="basis-grid">
      <div className="demo-row">
        <span className="demo-toggle" role="group" aria-label="Which grid to show">
          {(['ours', 'hers', 'both'] as const).map((name) => (
            <button
              key={name}
              type="button"
              className={`demo-button${name === view ? '' : ' secondary'}`}
              aria-pressed={name === view}
              onClick={() => setView(name)}
            >
              {name === 'ours' ? (plain ? 'Standard' : 'Ours') : name === 'hers' ? (plain ? 'B-grid' : 'Hers') : 'Both'}
            </button>
          ))}
        </span>
      </div>

      <Plane range={RANGE}>
        {showOurs && <MathPath d={OUR_GRID} className="our-grid" />}
        {showHers && <MathPath d={toPath(basisGridLines(P, RANGE * 3))} className="her-grid" />}

        {showOurs && (
          <>
            <Vector tip={[1, 0]} color="var(--ihat)" weight={2} opacity={0.6} />
            <Vector tip={[0, 1]} color="var(--jhat)" weight={2} opacity={0.6} />
          </>
        )}

        <DragVector value={v} onChange={moveV} limit={RANGE} />
        {/* The labels go on the side away from the nearer edge, so they aren't cut off on a phone. */}
        <Text x={v[0]} y={v[1]} attach={side === 'w' ? 'nw' : 'ne'} attachDistance={20} color="var(--vec)" size={15}>
          {plain ? `x = ${pair(v)}` : `ours ${pair(v)}`}
        </Text>
        {/* Both labels show in every view: the arrow is the same, only the language changes. */}
        {her && (
          <Text x={v[0]} y={v[1]} attach={side === 'w' ? 'sw' : 'se'} attachDistance={20} color="var(--grid-moving)" size={15}>
            {plain ? `[x]_B = ${pair(her)}` : `hers ${pair(her)}`}
          </Text>
        )}

        <DragVector value={b1} onChange={setB1} snap={snap} label="b₁" color="var(--ihat)" limit={3} />
        <DragVector value={b2} onChange={setB2} snap={snap} label="b₂" color="var(--jhat)" limit={3} />
      </Plane>
      <p className="demo-message">
        {plain
          ? 'Drag the yellow arrow x. Drag b₁ and b₂ to change the basis B.'
          : 'Drag the yellow arrow. Drag b₁ and b₂ to give Jennifer a different grid.'}
      </p>

      {plain ? (
        !isBasis && (
          <p className="demo-status" aria-live="polite" style={{ color: 'var(--negative)' }}>
            Not a basis: b₁ and b₂ are on one line, so they don't span the plane.
          </p>
        )
      ) : isBasis && her && inv ? (
        <>
          <p className="demo-message">Her numbers → ours:</p>
          <div className="demo-row" aria-live="polite">
            <MatrixView columns={P} label="P" fractions />
            <MatrixView columns={[her]} color="var(--grid-moving)" fractions />
            <span className="demo-op">=</span>
            <MatrixView columns={[v]} color="var(--vec)" fractions />
          </div>
          <p className="demo-message">Our numbers → hers:</p>
          <div className="demo-row">
            <MatrixView columns={inv} label="P⁻¹" fractions />
            <MatrixView columns={[v]} color="var(--vec)" fractions />
            <span className="demo-op">=</span>
            <MatrixView columns={[her]} color="var(--grid-moving)" fractions />
          </div>
        </>
      ) : (
        <p className="demo-status" aria-live="polite" style={{ color: 'var(--negative)' }}>
          Not a basis: b₁ and b₂ are on one line, so her grid squashes flat and P has no inverse.
        </p>
      )}

      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
