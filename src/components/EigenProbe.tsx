// Lesson 8.1: hunting for the vectors that stay on their own line.
// A yellow probe v (2 long) sweeps round the circle, or you drag it. A·v is drawn in orange next to it.
// Whenever A·v lands back on v's line, that line lights up (cyan), stays drawn, and gets its λ.
// "Watch the whole plane move" plays A on a fan of arrows: the ones on lit lines stay on them,
// every other arrow gets knocked off its line.
// All the maths comes from linalg.ts (eig2, nearEigenLine, snapToEigenLine, lineAngle, spokes).
import { useEffect, useRef, useState } from 'react';
import { Line, MovablePoint, Text, Vector } from 'mafs';
import {
  angleOf,
  eig2,
  formatNumber,
  lineAngle,
  matVec,
  nearEigenLine,
  normalize,
  roundTo,
  scale,
  snapToEigenLine,
  spokes,
  unitAt,
  type Eigen,
  type Mat2,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import TransformPlayer from './TransformPlayer';
import './Demo.css';

interface Choice {
  /** The button text, e.g. "Rotation 90°". */
  name: string;
  /** The matrix, stored as its columns. */
  matrix: Mat2;
}

interface Props {
  /** One matrix, or several to switch between with buttons (the first is shown first). */
  matrices: Choice[];
  /** The plane shows -range to range on both axes. */
  range?: number;
}

/** How long the probe is, and how fast it sweeps (degrees per second: one full turn in 8 s). */
const PROBE = 2;
const SPEED = 45;
/** How close (in degrees) the probe must come to an eigen-line to light it up. */
const LIGHT = 1.5;

/** A number with a real minus sign: 2 + √5 shows as 4.24, −1/2 as −1/2. */
const show = (n: number) => formatNumber(n).replace('-', '−');

/**
 * The lit eigen-lines, each labelled with its λ. Drop it inside a <Plane> or a <TransformPlayer>.
 * For kind 'every', `angles` says which lines to draw (every line is an eigen-line, so draw the ones found).
 * `labelAt`: how far out the λ labels sit, as a share of range.
 * `band`: draw each line as a wide see-through band, so arrows moving along it stay visible inside it.
 */
export function EigenLines({
  eigen,
  lit,
  angles = [],
  range,
  band = false,
  labelAt = 0.6,
}: {
  eigen: Eigen;
  lit: number[];
  angles?: number[];
  range: number;
  band?: boolean;
  labelAt?: number;
}) {
  if (eigen.kind === 'none') return null;
  const lines =
    eigen.kind === 'every'
      ? angles.map((deg) => ({ direction: unitAt(deg), lambda: eigen.lambda, labelled: deg === angles[0] }))
      : lit.map((i) => ({ ...eigen.pairs[i], labelled: true }));
  return (
    <>
      {lines.map(({ direction, lambda, labelled }, k) => {
        // Label the line part-way out, just above it, so it clears the axis numbers at the edge.
        const tip = scale(range * labelAt, normalize(direction));
        return (
          <g key={k}>
            <Line.ThroughPoints
              point1={[0, 0]}
              point2={direction}
              color="var(--eigen)"
              weight={band ? 10 : 3}
              opacity={band ? 0.35 : 0.85}
            />
            {labelled && (
              <Text x={tip[0]} y={tip[1]} attach="ne" attachDistance={8} color="var(--eigen)" size={18}>
                λ = {show(lambda)}
              </Text>
            )}
          </g>
        );
      })}
    </>
  );
}

export default function EigenProbe({ matrices, range = 4 }: Props) {
  const [choice, setChoice] = useState(0);
  const a = matrices[choice].matrix;
  const eigen = eig2(a);

  const [angle, setAngle] = useState(30);
  const [sweeping, setSweeping] = useState(false);
  /** Which eigen-lines have lit up (indexes into eigen.pairs). For kind 'every': which angles (0, 10, … 170). */
  const [lit, setLit] = useState<number[]>([]);
  const [litAngles, setLitAngles] = useState<number[]>([]);
  /** How many degrees the probe has swept since the last reset: after 360, every line has had its chance. */
  const [swept, setSwept] = useState(0);
  const [wholePlane, setWholePlane] = useState(false);

  // Start fresh whenever another matrix is picked.
  useEffect(() => {
    setLit([]);
    setLitAngles([]);
    setSwept(0);
    setSweeping(false);
    setWholePlane(false);
  }, [choice]);

  const v = scale(PROBE, unitAt(angle));
  const av = matVec(a, v);
  const on = nearEigenLine(eigen, v, LIGHT);

  // Light the line the probe is on (and keep it lit).
  useEffect(() => {
    if (on === null) return;
    if (eigen.kind === 'every') {
      const deg = (Math.round(angle / 10) * 10) % 180;
      setLitAngles((list) => (list.includes(deg) ? list : [...list, deg]));
    } else if (!lit.includes(on)) {
      setLit((list) => [...list, on]);
    }
  }, [on, angle, eigen.kind]);

  // The sweep: turn the probe by SPEED degrees per second until a full turn is done.
  const frame = useRef(0);
  useEffect(() => {
    if (!sweeping) return;
    let last = performance.now();
    const step = (now: number) => {
      // At most 1 degree per frame, so a slow frame can't jump over a line.
      const turn = Math.min(1, ((now - last) / 1000) * SPEED);
      last = now;
      setAngle((deg) => (deg + turn) % 360);
      setSwept((s) => s + turn);
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [sweeping]);

  // One full turn is enough: stop there.
  useEffect(() => {
    if (swept >= 360) setSweeping(false);
  }, [swept]);

  /** Dragging the probe: it stays 2 long, and snaps onto an eigen-line when it comes close. */
  function drag(p: Vec2) {
    setSweeping(false);
    if (Math.hypot(p[0], p[1]) < 0.1) return;
    setAngle(angleOf(snapToEigenLine(eigen, p) ?? p));
  }

  function sweep() {
    // After a full turn, a new sweep starts counting again.
    if (!sweeping && swept >= 360) setSwept(0);
    setSweeping(!sweeping);
  }

  let status: string;
  if (on !== null) {
    const lambda = eigen.kind === 'every' ? eigen.lambda : eigen.kind === 'lines' ? eigen.pairs[on].lambda : 0;
    status = `A·v = ${show(lambda)}·v: A·v stays on v's line ✓`;
  } else {
    status = `A·v is knocked ${roundTo(lineAngle(v, av), 0)}° off v's line.`;
  }

  const found = eigen.kind === 'every' ? (litAngles.length > 0 ? 'every line' : 'none yet') : String(lit.length);
  let summary = '';
  if (swept >= 360) {
    if (eigen.kind === 'none') summary = 'A full turn, and no line ever lit up: this matrix knocks every arrow off its line.';
    else if (eigen.kind === 'every') summary = `Every line lit up: every vector is an eigenvector, with λ = ${show(eigen.lambda)}.`;
    else summary = `A full turn found ${lit.length} line${lit.length === 1 ? '' : 's'}. That's all of them.`;
  }

  const fan = spokes(12, PROBE, eigen.kind === 'lines' ? eigen.pairs.map((p) => p.direction) : []);
  const allLit = eigen.kind === 'lines' ? eigen.pairs.map((_, i) => i) : [];
  const allAngles = Array.from({ length: 18 }, (_, k) => k * 10);

  return (
    <div>
      {matrices.length > 1 && (
        <div className="demo-row">
          <div className="demo-toggle" role="group" aria-label="Pick a matrix">
            {matrices.map((m, i) => (
              <button
                key={m.name}
                type="button"
                className={`demo-button${i === choice ? '' : ' secondary'}`}
                aria-pressed={i === choice}
                onClick={() => setChoice(i)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {wholePlane ? (
        <TransformPlayer matrix={a} range={range} lines={fan} playKey={choice}>
          <EigenLines eigen={eigen} lit={allLit} angles={allAngles} range={range} band />
        </TransformPlayer>
      ) : (
        <>
          <Plane range={range}>
            <EigenLines eigen={eigen} lit={lit} angles={litAngles} range={range} />
            <Line.ThroughPoints point1={[0, 0]} point2={v} color="var(--muted)" style="dashed" opacity={0.5} />
            <Vector tip={av} color="var(--vec2)" weight={4} />
            <Text x={av[0]} y={av[1]} attach="ne" attachDistance={10} color="var(--vec2)" size={18}>
              A·v
            </Text>
            <Vector tip={v} color="var(--vec)" weight={4} />
            <MovablePoint point={v} onMove={drag} color="var(--vec)" />
          </Plane>
          <p className="demo-status" aria-live="polite">{status}</p>
          <div className="demo-row">
            <button type="button" className="demo-button" onClick={sweep}>
              {sweeping ? 'Pause' : 'Sweep round'}
            </button>
            <span>Lines found: {found}</span>
          </div>
          {summary && <p className="demo-message">{summary}</p>}
        </>
      )}

      <div className="demo-row">
        <button type="button" className="demo-button secondary" onClick={() => setWholePlane((w) => !w)}>
          {wholePlane ? 'Back to the probe' : 'Watch the whole plane move'}
        </button>
      </div>
      {wholePlane && (
        <p className="demo-message">
          {eigen.kind === 'none'
            ? 'Press Play: every yellow arrow is knocked off its line.'
            : 'Press Play: arrows on the cyan lines stay on them; every other arrow is knocked off its line.'}
        </p>
      )}
    </div>
  );
}
