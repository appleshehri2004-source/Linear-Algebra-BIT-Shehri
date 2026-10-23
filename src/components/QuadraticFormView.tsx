// Lesson 8.5: a symmetric matrix A gives every point x one number, xᵀAx (the quadratic form).
// The plane shows its level curves: the points where xᵀAx is 1, 2, 4, 8 (orange) or −1, −2, −4, −8 (violet).
// A bowl (positive definite) gives ellipses; a saddle (indefinite) gives hyperbolas. Either way, the
// cyan eigenvectors of A are the curves' axes. Drag the yellow x to read xᵀAx anywhere.
// "Show in 3D" draws the surface z = xᵀAx itself, with the same curves lifted to their heights.
// All the maths comes from linalg.ts (eigSym2, quadForm, definiteness, levelCurves, quadSurface …).
import { useState } from 'react';
import { Line, Text } from 'mafs';
import {
  definiteness,
  eigSym2,
  identity3,
  levelCurves,
  normalize,
  quadForm,
  quadSurface,
  roundTo,
  scale,
  surfaceAlong,
  surfaceContours,
  type Definiteness,
  type Mat2,
  type Vec2,
  type Vec3,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import MatrixEditor from './MatrixEditor';
import LazyScene3D from './LazyScene3D';
import { MathPath, toPath } from './TransformPlayer';
import './Demo.css';
import './QuadraticFormView.css';

/** A ready-made symmetric matrix with a name, shown as a button. */
interface Preset {
  name: string;
  matrix: Mat2;
}

interface Props {
  /** The starting matrix, stored as its columns. Keep it symmetric: top-right = bottom-left. */
  matrix: Mat2;
  presets?: Preset[];
  /** Start with the 3D surface showing. */
  start3D?: boolean;
}

const RANGE = 3;
/** The levels drawn, both in 2D and on the 3D surface. 0 is drawn too (only a saddle or trough has a curve there). */
const UP = [1, 2, 4, 8];
const DOWN = [-1, -2, -4, -8];
/** The 3D surface: a disc this wide, squashed to this tall. */
const RADIUS = 2.5;
const HEIGHT = 1.6;

const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

/** What each shape is called, and what it looks like. */
const SHAPES: Record<Definiteness, string> = {
  'positive definite': 'Both eigenvalues are above 0: xᵀAx > 0 for every x except 0. The surface is a bowl and the level curves are ellipses.',
  'negative definite': 'Both eigenvalues are below 0: xᵀAx < 0 for every x except 0. An upside-down bowl; the level curves are ellipses again (at negative heights).',
  indefinite: 'One eigenvalue is above 0 and one below: xᵀAx is positive along one eigenvector and negative along the other. The surface is a saddle and the level curves are hyperbolas.',
  'positive semidefinite': 'One eigenvalue is 0: along that eigenvector xᵀAx stays 0. The surface is a trough and the level curves are pairs of straight lines.',
  'negative semidefinite': 'One eigenvalue is 0 and the other below 0: an upside-down trough. The level curves are pairs of straight lines.',
  zero: 'A is all zeros, so xᵀAx is 0 everywhere: a flat floor.',
};

/** true when two matrices hold the same numbers. Lights up the matching preset button. */
const same = (a: Mat2, b: Mat2) => a.flat().every((n, i) => n === b.flat()[i]);

export default function QuadraticFormView({ matrix, presets = [], start3D = false }: Props) {
  const [a, setA] = useState<Mat2>(matrix);
  const [x, setX] = useState<Vec2>([1, 1]);
  const [in3D, setIn3D] = useState(start3D);

  /**
   * A symmetric matrix has only 3 numbers of its own: typing in one corner copies it to the other.
   * Whichever corner changed wins.
   */
  function edit(next: Mat2) {
    const topRight = next[1][0] !== a[1][0] ? next[1][0] : next[0][1];
    setA([[next[0][0], topRight], [topRight, next[1][1]]]);
  }

  const { values, vectors } = eigSym2(a);
  const kind = definiteness(a);
  const up = toPath(UP.flatMap((c) => levelCurves(a, c, RANGE * 1.5)));
  const down = toPath(DOWN.flatMap((c) => levelCurves(a, c, RANGE * 1.5)));
  const zero = toPath(kind === 'zero' ? [] : levelCurves(a, 0, RANGE * 1.5));
  const value = quadForm(a, x);

  return (
    <div className="quadform">
      {presets.length > 0 && (
        <div className="demo-row">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              className={`demo-button${same(p.matrix, a) ? '' : ' secondary'}`}
              aria-pressed={same(p.matrix, a)}
              onClick={() => setA(p.matrix)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="demo-row">
        <div className="demo-toggle" role="group" aria-label="Flat map or 3D surface">
          <button type="button" className={`demo-button${in3D ? ' secondary' : ''}`} aria-pressed={!in3D} onClick={() => setIn3D(false)}>
            Level curves
          </button>
          <button type="button" className={`demo-button${in3D ? '' : ' secondary'}`} aria-pressed={in3D} onClick={() => setIn3D(true)}>
            Show in 3D
          </button>
        </div>
      </div>

      {in3D ? (
        <Surface3D a={a} vectors={vectors} />
      ) : (
        <Plane range={RANGE}>
          {vectors.map((q, i) => {
            const label = scale(RANGE * 0.8, normalize(q));
            return (
              <g key={i}>
                <Line.ThroughPoints point1={[0, 0]} point2={q} color="var(--eigen)" weight={2} />
                <Text x={label[0]} y={label[1]} attach="n" attachDistance={10} color="var(--eigen)" size={16}>
                  λ{i === 0 ? '₁' : '₂'} = {show(values[i])}
                </Text>
              </g>
            );
          })}
          <MathPath d={up} className="quadform-up" />
          <MathPath d={down} className="quadform-down" />
          <MathPath d={zero} className="quadform-zero" />
          <DragVector value={x} onChange={setX} label="x" limit={RANGE} />
        </Plane>
      )}

      <MatrixEditor value={a} onChange={edit} />

      <ul className="demo-checklist" aria-live="polite">
        {!in3D && (
          <li style={{ color: 'var(--vec)' }}>
            x = ({show(x[0])}, {show(x[1])}): xᵀAx = {show(value)}
          </li>
        )}
        <li style={{ color: 'var(--eigen)' }}>
          Eigenvalues {show(values[0])} and {show(values[1])}, along ({show(vectors[0][0])}, {show(vectors[0][1])}) and (
          {show(vectors[1][0])}, {show(vectors[1][1])}): at right angles.
        </li>
        <li>
          <strong>{kind[0].toUpperCase() + kind.slice(1)}.</strong> {SHAPES[kind]}
        </li>
      </ul>
      <p className="demo-message">
        <span className="quadform-key-up">Orange</span>: xᵀAx = 1, 2, 4, 8. <span className="quadform-key-down">Violet</span>: −1,
        −2, −4, −8. Grey: 0.{in3D && ' Drag to turn the view. Pinch or scroll to zoom.'}
      </p>
    </div>
  );
}

/** The 3D surface z = xᵀAx, with the level curves at their heights and the cuts above the two eigenvectors. */
function Surface3D({ a, vectors }: { a: Mat2; vectors: [Vec2, Vec2] }) {
  const ups = surfaceContours(a, UP, RADIUS, HEIGHT);
  const downs = surfaceContours(a, DOWN, RADIUS, HEIGHT);
  const along: Vec3[][] = vectors.map((q) => surfaceAlong(a, q, RADIUS, HEIGHT));
  return (
    <div className="stage3d">
      <LazyScene3D
        matrix={identity3()}
        showBasis={false}
        showCube={false}
        zoomOut={1.3}
        surface={quadSurface(a, RADIUS, HEIGHT)}
        curves={[
          { lines: ups, colour: 'vec2' },
          { lines: downs, colour: 'space' },
          { lines: along, colour: 'eigen' },
        ]}
      />
    </div>
  );
}
