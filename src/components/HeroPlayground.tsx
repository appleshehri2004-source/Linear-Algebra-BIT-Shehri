// The homepage hero: drag î and ĵ and watch the whole plane, and the BIT logo on it, follow.
// - The faint grid stays still; a second grid moves with the matrix. The unit square's image is shaded gold,
//   under the logo.
// - The readout shows the matrix and its determinant, and says in words what the determinant means.
// - Six buttons glide to a ready-made matrix in 400 ms (or jump there, for visitors who asked for less motion).
// - Four number boxes take exact values. Handles also move with the arrow keys after Tab (Mafs does that).
// Every number is a multiple of 0.1 (snapHandle), so the determinant shown is exact. All maths is in linalg.ts.
import { useEffect, useRef, useState } from 'react';
import { MovablePoint, Polygon, Text, Vector } from 'mafs';
import {
  detState,
  easeInOut,
  gridLines,
  HERO_LIMIT,
  heroPresets,
  identity,
  length,
  matVec,
  presetAt,
  roundTo,
  snapHandle,
  transformShape,
  UNIT_SQUARE,
  type DetState,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import { parseNumber } from '../exercises/exercise';
import Plane from './Plane';
import { HALO } from './HomeHalo';
import TestShape from './TestShape';
import Tex from './Tex';
import { MathPath, toPath } from './TransformPlayer';
import './HeroPlayground.css';

/** The plane shows -RANGE to RANGE on both axes; the handles stop at HERO_LIMIT, just inside. */
const RANGE = HERO_LIMIT;
/** How long a button's glide takes, in milliseconds. */
const GLIDE = 400;

// The grid that moves: lines from -2·RANGE to 2·RANGE, so a stretched grid still fills the plane.
// gridLines lists a vertical and a horizontal line for each k from -extent up; the pair for k = 0 is the axes.
const EXTENT = RANGE * 2;
const GRID = gridLines(EXTENT);
const AXES = GRID.slice(2 * EXTENT, 2 * EXTENT + 2);

/** A number as shown: at most 2 decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2) + 0).replace('-', '−');
/** A number inside TeX: negative numbers in brackets, so "2 · (−1)" reads right. */
const tex = (n: number) => {
  const r = roundTo(n, 2) + 0;
  return r < 0 ? `(${r})` : String(r);
};

/** The sentence under the determinant. */
function meaning({ kind, det }: DetState): string {
  if (kind === 'point') return 'Collapsed onto a single point — no inverse.';
  if (kind === 'line') return 'Collapsed onto a line — no inverse.';
  if (kind === 'flipped') return `Flipped — orientation reversed. Area scaled ×${show(-det)}.`;
  return `Area scaled ×${show(det)}.`;
}

/** true when two matrices hold the same four numbers (to 2 places). Lights up the matching button. */
function same(a: Mat2, b: Mat2): boolean {
  return a.flat().every((n, i) => roundTo(n, 2) === roundTo(b.flat()[i], 2));
}

/** An arrow from the origin with a draggable tip and a label, outlined by the halo so it shows over the logo. */
function Handle({ tip, color, label, onMove }: { tip: Vec2; color: string; label: string; onMove: (p: Vec2) => void }) {
  // An arrow squashed to (almost) nothing would still show its arrowhead, so only the handle is drawn then.
  const visible = length(tip) > 0.05;
  return (
    <>
      <g filter={HALO}>
        {visible && <Vector tip={tip} color={color} weight={3} />}
        <MovablePoint point={tip} onMove={(p) => onMove([p[0], p[1]])} constrain={(p) => snapHandle([p[0], p[1]])} color={color} />
      </g>
      {/* 24px: large text, so î's colour is readable enough as a label (3 : 1). Mafs gives text its own outline. */}
      <Text x={tip[0]} y={tip[1]} attach="ne" attachDistance={14} color={color} size={24}>
        {label}
      </Text>
    </>
  );
}

/**
 * Gives the two handles names a screen reader can say, e.g. "î handle, at (1, 0)". Mafs's handles have none.
 * It sits inside the plane, so it runs only once Mafs has drawn the handles. The handles must be drawn î first.
 */
function HandleNames({ matrix }: { matrix: Mat2 }) {
  const marker = useRef<SVGGElement>(null);
  useEffect(() => {
    const handles = marker.current?.closest('svg')?.querySelectorAll('.mafs-movable-point') ?? [];
    const names = ['î', 'ĵ'];
    handles.forEach((handle, i) => {
      const [x, y] = matrix[i];
      handle.setAttribute('role', 'button');
      handle.setAttribute('aria-roledescription', 'draggable handle');
      handle.setAttribute('aria-label', `${names[i]} handle, at (${show(x)}, ${show(y)}). Move it with the arrow keys.`);
    });
  });
  return <g ref={marker} />;
}

/** One number box. It keeps what you type, and snaps it to the grid when you leave the box or press Enter. */
function NumberBox({ value, onChange, label, column }: { value: number; onChange: (n: number) => void; label: string; column: 'i' | 'j' }) {
  const [text, setText] = useState(show(value));
  const [editing, setEditing] = useState(false);

  // When the number changes from outside (a drag, a button), show it, unless you're typing in this box.
  useEffect(() => {
    if (!editing) setText(show(value));
  }, [value, editing]);

  function commit() {
    setEditing(false);
    setText(show(value));
  }

  return (
    <input
      type="text"
      // A normal keyboard: the iPhone number pad has no minus sign.
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={label}
      className={`hero-number ${column}`}
      value={text}
      onFocus={() => setEditing(true)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseNumber(e.target.value);
        if (n !== null) onChange(n);
      }}
    />
  );
}

export default function HeroPlayground() {
  const [matrix, setMatrix] = useState<Mat2>(identity());
  const glide = useRef(0);
  const [ihat, jhat] = matrix;
  const state = detState(matrix);

  // Stop a glide if the hero disappears half way.
  useEffect(() => () => cancelAnimationFrame(glide.current), []);

  /** A drag or a typed number: stop any glide and go straight there. */
  function setColumn(i: 0 | 1, p: Vec2) {
    cancelAnimationFrame(glide.current);
    const snapped = snapHandle(p);
    setMatrix((m) => (i === 0 ? [snapped, m[1]] : [m[0], snapped]));
  }

  /** A button: glide from where we are to the target, or jump if the visitor asked for less motion. */
  function glideTo(target: Mat2) {
    cancelAnimationFrame(glide.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMatrix(target);
      return;
    }
    const from = matrix;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / GLIDE);
      setMatrix(presetAt(from, target, easeInOut(progress)));
      if (progress < 1) glide.current = requestAnimationFrame(step);
    };
    glide.current = requestAnimationFrame(step);
  }

  const movedGrid = GRID.map((line) => line.map((p) => matVec(matrix, p)));
  const movedAxes = AXES.map((line) => line.map((p) => matVec(matrix, p)));
  const square = transformShape(matrix, UNIT_SQUARE);

  const [a, c] = ihat;
  const [b, d] = jhat;
  const matrixTex = `A = \\begin{bmatrix} ${tex(a)} & ${tex(b)} \\\\ ${tex(c)} & ${tex(d)} \\end{bmatrix}`;
  const detTex = `\\det A = ad - bc = ${tex(a)} \\cdot ${tex(d)} - ${tex(b)} \\cdot ${tex(c)} = ${tex(state.det)}`;

  return (
    <div className="hero-playground">
      <figure className="hero-figure" aria-describedby="hero-figure-text">
        <p id="hero-figure-text" className="visually-hidden">
          A coordinate plane with the BIT logo on the unit square. Two handles, î and ĵ, set the columns of the matrix
          A; the grid and the logo move with them. The matrix and its determinant are written below the picture.
        </p>
        <Plane range={RANGE}>
          <MathPath d={toPath(movedGrid)} className="hero-moving-grid" />
          <MathPath d={toPath(movedAxes)} className="hero-moving-axes" />
          <Polygon points={square} color="var(--gold-tint)" fillOpacity={0.6} weight={0} />
          <g style={{ transform: 'var(--mafs-view-transform)' }}>
            {/* useSymbol: the logo is defined once on the homepage (TestShapeSymbols in index.astro). */}
            <TestShape shape="bit-logo" matrix={matrix} flipY={false} useSymbol />
          </g>
          <Polygon points={square} color="var(--gold)" fillOpacity={0} weight={1.5} />
          {/* î first, then ĵ: HandleNames names them in this order, and Tab reaches them in this order. */}
          <Handle tip={ihat} color="var(--i-hat)" label="î" onMove={(p) => setColumn(0, p)} />
          <Handle tip={jhat} color="var(--j-hat)" label="ĵ" onMove={(p) => setColumn(1, p)} />
          <HandleNames matrix={matrix} />
        </Plane>
      </figure>

      <div className="hero-readout">
        <div className="hero-tex">
          <Tex tex={matrixTex} />
          <Tex tex={detTex} />
        </div>
        {/* Read aloud when it changes: only the words, not every number while dragging. */}
        <p className={`hero-meaning ${state.kind}`} aria-live="polite">
          {meaning(state)}
        </p>
      </div>

      <div className="hero-presets" role="group" aria-label="Ready-made matrices">
        {heroPresets.map((p) => (
          <button key={p.name} type="button" aria-pressed={same(p.matrix, matrix)} onClick={() => glideTo(p.matrix)}>
            {p.name}
          </button>
        ))}
      </div>

      <fieldset className="hero-numbers">
        <legend>Type exact numbers (steps of 0.1, from −{HERO_LIMIT} to {HERO_LIMIT})</legend>
        <div className="hero-number-grid">
          <NumberBox column="i" label="î column, top (a)" value={a} onChange={(n) => setColumn(0, [n, c])} />
          <NumberBox column="j" label="ĵ column, top (b)" value={b} onChange={(n) => setColumn(1, [n, d])} />
          <NumberBox column="i" label="î column, bottom (c)" value={c} onChange={(n) => setColumn(0, [a, n])} />
          <NumberBox column="j" label="ĵ column, bottom (d)" value={d} onChange={(n) => setColumn(1, [b, n])} />
        </div>
      </fieldset>
    </div>
  );
}
