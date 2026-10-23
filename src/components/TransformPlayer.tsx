// Shows the whole plane being moved by a matrix (or by a non-linear rule, for counter-examples).
// The faint grid from <Plane> stays still; a brighter grid moves from "nothing changed" (t = 0)
// to "fully transformed" (t = 1). i-hat (green) and j-hat (red) ride along, and so can one yellow vector.
// Play, Pause, Rewind and a slider control t. Put extra Mafs drawings inside it as children.
import { useMemo, type ReactNode } from 'react';
import { Text, Vector } from 'mafs';
import {
  gridLines,
  identity,
  mapAt,
  matrixAt,
  matVec,
  sequenceAt,
  type Mat2,
  type PointMap,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import PlayControls from './PlayControls';
import { DURATION, usePlayback } from './usePlayback';
import './Demo.css';
import './TransformPlayer.css';

interface Props {
  /** The matrix to show, stored as its columns. Give this, `steps` or `map`. */
  matrix?: Mat2;
  /** Several matrices that play one after another (first one first). Each gets its own share of t. */
  steps?: Mat2[];
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
  /** false hides the Play / Rewind buttons and the slider (e.g. until a prediction is made). */
  controls?: boolean;
  /** Called with the point (in maths coordinates) when the plane is clicked or tapped. */
  onPlaneClick?: (p: Vec2) => void;
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
  steps,
  map,
  tracked,
  trackedLabel = 'v',
  lines,
  range = 5,
  showBasis = true,
  t: controlledT,
  onTChange,
  playKey,
  controls = true,
  onPlaneClick,
  children,
}: Props) {
  // A sequence of matrices takes longer to play: the usual time for each step.
  const playback = usePlayback({ t: controlledT, onTChange, playKey, duration: DURATION * (steps?.length ?? 1) });
  const { t } = playback;

  // A matrix keeps lines straight, so each grid line only needs its two ends; it reaches far past the
  // edge so stretched lines still cover the plane. A non-linear map can curve lines, so cut each into
  // short pieces (4 per square).
  const linear = matrix !== undefined || steps !== undefined;
  const extent = linear ? range * 2 : range + 1;
  const source = useMemo(() => gridLines(extent, linear ? 1 : extent * 8), [extent, linear]);

  // Where a point is at time t.
  const m: Mat2 = steps ? sequenceAt(steps, t) : matrix ? matrixAt(matrix, t) : identity();
  const place = (p: Vec2): Vec2 => (linear ? matVec(m, p) : mapAt(map ?? ((q) => q), p, t));

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
      <Plane range={range} onClick={onPlaneClick}>
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

      {controls && <PlayControls playback={playback} />}
    </div>
  );
}
