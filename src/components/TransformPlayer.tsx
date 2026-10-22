// Shows the whole plane being moved by a matrix (or by a non-linear rule, for counter-examples).
// The faint grid from <Plane> stays still; a brighter grid moves from "nothing changed" (t = 0)
// to "fully transformed" (t = 1). i-hat (green) and j-hat (red) ride along, and so can one yellow vector.
// Play, Pause, Rewind and a slider control t. Put extra Mafs drawings inside it as children.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Text, Vector } from 'mafs';
import {
  easeInOut,
  gridLines,
  identity,
  lerp,
  mapAt,
  matrixAt,
  matVec,
  roundTo,
  type Mat2,
  type PointMap,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import './Demo.css';
import './TransformPlayer.css';

/** How long a full play (t from 0 to 1) takes, in milliseconds. */
const DURATION = 1500;

interface Props {
  /** The matrix to show, stored as its columns. Give this or `map`. */
  matrix?: Mat2;
  /** A rule that may not be linear (for counter-examples). Used when there's no `matrix`. */
  map?: PointMap;
  /** A vector that moves with the grid, drawn in yellow. */
  tracked?: Vec2;
  /** The name drawn next to the tracked vector's tip. Default: v. */
  trackedLabel?: string;
  /** Extra lines (lists of points) drawn in yellow that move with the grid, e.g. a diagonal. */
  lines?: Vec2[][];
  /** The plane shows -range to range on both axes. */
  range?: number;
  /** Show the green i-hat and red j-hat arrows. Turn off when the children draw their own (e.g. draggable ones). */
  showBasis?: boolean;
  /** Optional: the parent controls t (0 to 1). Leave out and the player keeps t itself. */
  t?: number;
  /** Called every time t changes (each animation frame, or when the slider moves). */
  onTChange?: (t: number) => void;
  /** Change this number to play the animation again from the start (e.g. after typing a new matrix). */
  playKey?: number;
  children?: ReactNode;
}

/** Turn lines (lists of points) into one SVG path, so the browser draws the whole grid in one go. */
function toPath(lines: Vec2[][]): string {
  return lines.map((line) => 'M' + line.map(([x, y]) => `${x} ${y}`).join('L')).join('');
}

/** An SVG path drawn in maths coordinates, the same way Mafs draws its own curves. */
function MathPath({ d, className }: { d: string; className: string }) {
  return (
    <path
      d={d}
      className={className}
      fill="none"
      style={{ transform: 'var(--mafs-view-transform)', vectorEffect: 'non-scaling-stroke' }}
    />
  );
}

export default function TransformPlayer({
  matrix,
  map,
  tracked,
  trackedLabel = 'v',
  lines,
  range = 5,
  showBasis = true,
  t: controlledT,
  onTChange,
  playKey,
  children,
}: Props) {
  const sliderId = useId();
  const [ownT, setOwnT] = useState(0);
  const t = controlledT ?? ownT;
  const [playing, setPlaying] = useState<'forward' | 'backward' | null>(null);
  const frame = useRef(0);

  // The animation loop runs outside React's normal flow, so it reads the latest callback from here.
  const onTChangeRef = useRef(onTChange);
  onTChangeRef.current = onTChange;
  const lastT = useRef(t);
  function setT(n: number) {
    lastT.current = n;
    setOwnT(n);
    onTChangeRef.current?.(n);
  }

  // If the parent changed t itself (e.g. an arrow is being dragged), stop animating so we don't fight it.
  useEffect(() => {
    if (controlledT !== undefined && controlledT !== lastT.current) {
      lastT.current = controlledT;
      stop();
    }
  }, [controlledT]);

  // Stop the animation when the component goes away.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function stop() {
    cancelAnimationFrame(frame.current);
    setPlaying(null);
  }

  /** Animate t from `from` to `target` (1 for Play, 0 for Rewind), easing in and out. */
  function animateTo(target: 0 | 1, from = t) {
    stop();
    // Play from the end starts again from the beginning.
    if (target === 1 && from === 1) from = 0;
    if (from === target) return;
    // A shorter distance takes a shorter time, so the speed feels the same.
    const duration = DURATION * Math.abs(target - from);
    const start = performance.now();
    setPlaying(target === 1 ? 'forward' : 'backward');
    const step = (now: number) => {
      const s = Math.min(1, (now - start) / duration);
      setT(lerp(from, target, easeInOut(s)));
      if (s < 1) frame.current = requestAnimationFrame(step);
      else setPlaying(null);
    };
    frame.current = requestAnimationFrame(step);
  }

  // When playKey changes (not when the page first loads), play from the start.
  const firstPlayKey = useRef(playKey);
  useEffect(() => {
    if (playKey !== firstPlayKey.current) animateTo(1, 0);
  }, [playKey]);

  // A matrix keeps lines straight, so each grid line only needs its two ends; it reaches far past the
  // edge so stretched lines still cover the plane. A non-linear map can curve lines, so cut each into
  // short pieces (4 per square).
  const extent = matrix ? range * 2 : range + 1;
  const source = useMemo(() => gridLines(extent, matrix ? 1 : extent * 8), [extent, matrix === undefined]);

  // Where a point is at time t.
  const m: Mat2 = matrix ? matrixAt(matrix, t) : identity();
  const place = (p: Vec2): Vec2 => (matrix ? matVec(m, p) : mapAt(map ?? ((q) => q), p, t));

  const moved = source.map((line) => line.map(place));
  // gridLines lists the lines from k = -extent upwards, a vertical and a horizontal one for each k.
  // The pair for k = 0 is the y-axis and x-axis: draw those thicker.
  const axes = moved.slice(2 * extent, 2 * extent + 2);

  const extra = lines?.map((line) => line.map(place));

  const origin = place([0, 0]);
  const ihat = place([1, 0]);
  const jhat = place([0, 1]);
  const trackedTip = tracked && place(tracked);

  return (
    <div className="transform-player">
      <Plane range={range}>
        <MathPath d={toPath(moved)} className="moving-grid" />
        <MathPath d={toPath(axes)} className="moving-axes" />
        {extra && <MathPath d={toPath(extra)} className="moving-extra" />}
        {showBasis && (
          <>
            <Vector tail={origin} tip={ihat} color="var(--ihat)" weight={3} />
            <Vector tail={origin} tip={jhat} color="var(--jhat)" weight={3} />
          </>
        )}
        {trackedTip && (
          <>
            <Vector tail={origin} tip={trackedTip} color="var(--vec)" weight={4} />
            <Text x={trackedTip[0]} y={trackedTip[1]} attach="ne" attachDistance={12} color="var(--vec)" size={20}>
              {trackedLabel}
            </Text>
          </>
        )}
        {children}
      </Plane>

      <div className="demo-row">
        <button
          type="button"
          className="demo-button"
          onClick={() => (playing === 'forward' ? stop() : animateTo(1))}
        >
          {playing === 'forward' ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="demo-button secondary"
          onClick={() => (playing === 'backward' ? stop() : animateTo(0))}
        >
          {playing === 'backward' ? 'Pause' : 'Rewind'}
        </button>
      </div>

      <div className="transform-scrub">
        <label htmlFor={sliderId}>
          t = <output htmlFor={sliderId}>{roundTo(t, 2).toFixed(2)}</output>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => {
            stop();
            setT(Number(e.target.value));
          }}
        />
        <div className="slider-ends" aria-hidden="true">
          <span>before</span>
          <span>after</span>
        </div>
      </div>
    </div>
  );
}
