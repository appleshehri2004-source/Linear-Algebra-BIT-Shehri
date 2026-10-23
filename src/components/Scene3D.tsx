// The 3D drawing for Stage3D and lesson 2.6, made with react-three-fiber (three.js in React).
// It only draws: the parent works out the matrix (already part way through any animation) and passes it in.
// Maths z points up, so the camera is told that "up" is z.
// Kept light for phones: it only redraws when something changes (frameloop="demand"),
// draws at most 2 screen pixels per CSS pixel, and uses plain 1-pixel lines.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { length3, normalize3, planeCorners, type Mat3, type Vec3 } from '../lib/linalg';
import './Scene3D.css';

interface Props {
  /** The matrix to show right now, stored as its columns. Its columns are where î, ĵ, k̂ are drawn. */
  matrix: Mat3;
  /** Draw the blue k̂ arrow. Off for a 3x2 matrix, which has no k̂. */
  showK?: boolean;
  /** Draw the unit cube, moved by the matrix. */
  showCube?: boolean;
  /** Draw the moving floor grid (the xy-plane, moved by the matrix). */
  showSheet?: boolean;
  /** A yellow vector, given where it is now (already moved by the matrix). */
  vector?: Vec3;
  /** How far away the camera starts: 1 is normal, 2 is twice as far (for long arrows). */
  zoomOut?: number;
  /** A basis of the column space, drawn in violet where it is (it doesn't move): 1 vector is a line, 2 a plane. */
  columnSpace?: Vec3[];
  /** A basis of the null space, drawn in pink in the input and moved by the matrix, so it gets squashed to 0. */
  nullSpace?: Vec3[];
  /** Pink arrows, given where they are now (already moved). One squashed to (almost) 0 is drawn as a dot. */
  nullVectors?: Vec3[];
  /** Draw the î, ĵ, k̂ arrows (the matrix's columns). Off for pictures that only show their own arrows. */
  showBasis?: boolean;
  /** Extra arrows from the origin, e.g. v, w and v × w (Module 5). They don't move with the matrix. */
  arrows?: SceneArrow[];
  /** A see-through flat shape given by its corners in order, e.g. the parallelogram of v and w. */
  patch?: { corners: Vec3[]; colour: Colour };
  /** Plain lines given as pairs of points, e.g. the 12 edges of a slanted box. */
  edges?: { pairs: [Vec3, Vec3][]; colour: Colour };
}

/** One extra arrow: where its tip is, which site colour, and an optional label at the tip. */
export interface SceneArrow {
  tip: Vec3;
  /** Where the arrow starts. Default: the origin. */
  tail?: Vec3;
  colour: Colour;
  label?: string;
}

/** The names of the site colours the 3D picture can use (each is a CSS variable, e.g. vec2 is --vec2). */
export type Colour = keyof ReturnType<typeof readColours>;

/** The site's colours, read from the CSS variables so light and dark mode both work. */
function readColours() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => css.getPropertyValue(name).trim();
  return {
    ihat: get('--ihat'),
    jhat: get('--jhat'),
    khat: get('--khat'),
    vec: get('--vec'),
    vec2: get('--vec2'),
    sum: get('--sum'),
    cross: get('--cross'),
    areaKept: get('--area-kept'),
    faint: get('--grid-faint'),
    moving: get('--grid-moving'),
    muted: get('--muted'),
    space: get('--space'),
    null: get('--null'),
  };
}

/** readColours, read again when the phone or computer switches between light and dark mode. */
function useColours() {
  const [colours, setColours] = useState(readColours);
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setColours(readColours());
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return colours;
}

/** Points for lines in the xy-plane: x = k and y = k for k from -n to n. Each pair of points is one line. */
function floorLines(n: number): Float32Array {
  const points: number[] = [];
  for (let k = -n; k <= n; k++) {
    points.push(k, -n, 0, k, n, 0, -n, k, 0, n, k, 0);
  }
  return new Float32Array(points);
}

/** Lines given as pairs of points. */
function Lines({ points, color, opacity = 1 }: { points: Float32Array; color: string; opacity?: number }) {
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </lineSegments>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

/** An arrow from `tail` (default: the origin) to `tip`: a thin cylinder and a cone, turned to point the right way. */
function Arrow({ tip, tail = [0, 0, 0], color, label }: { tip: Vec3; tail?: Vec3; color: string; label?: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3(...tip).sub(new THREE.Vector3(...tail));
    const len = dir.length();
    // three.js cylinders point up the y-axis, so turn y towards the arrow's direction.
    const q = new THREE.Quaternion().setFromUnitVectors(UP, len > 0 ? dir.clone().normalize() : UP);
    return { position: new THREE.Vector3(...tail), quaternion: q, length: len };
  }, [tip[0], tip[1], tip[2], tail[0], tail[1], tail[2]]);

  if (length < 1e-6) return null;
  const head = Math.min(0.25, length * 0.4);
  const shaft = length - head;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, shaft, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, shaft + head / 2, 0]}>
        <coneGeometry args={[0.09, head, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label && (
        <Html position={[0, length + 0.2, 0]} center className="scene3d-label" style={{ color }}>
          {label}
        </Html>
      )}
    </group>
  );
}

/** A space through the origin from its basis: 1 vector is a long line, 2 vectors a see-through square. 0 or 3 draw nothing. */
function Subspace({ basis, color }: { basis: Vec3[]; color: string }) {
  const shape = useMemo(() => {
    if (basis.length === 1) {
      const e = normalize3(basis[0]);
      return { line: new Float32Array([-4 * e[0], -4 * e[1], -4 * e[2], 4 * e[0], 4 * e[1], 4 * e[2]]) };
    }
    if (basis.length === 2) {
      const [a, b, c, d] = planeCorners(basis[0], basis[1], 3);
      // Two triangles make the square; its 4 edges are the outline.
      return {
        triangles: new Float32Array([...a, ...b, ...c, ...a, ...c, ...d]),
        outline: new Float32Array([...a, ...b, ...b, ...c, ...c, ...d, ...d, ...a]),
      };
    }
    return {};
  }, [basis.flat().join()]);

  return (
    <>
      {shape.line && <Lines points={shape.line} color={color} />}
      {shape.triangles && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[shape.triangles, 3]} />
          </bufferGeometry>
          <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      {shape.outline && <Lines points={shape.outline} color={color} />}
    </>
  );
}

/** A flat shape from its corners (fanned into triangles from the first corner), see-through, with its outline. */
function Patch({ corners, color }: { corners: Vec3[]; color: string }) {
  const shape = useMemo(() => {
    const triangles: number[] = [];
    for (let i = 1; i + 1 < corners.length; i++) triangles.push(...corners[0], ...corners[i], ...corners[i + 1]);
    const outline: number[] = [];
    corners.forEach((c, i) => outline.push(...c, ...corners[(i + 1) % corners.length]));
    return { triangles: new Float32Array(triangles), outline: new Float32Array(outline) };
  }, [corners.flat().join()]);

  return (
    <>
      {/* key: a new size of buffer needs a new geometry (three.js can't grow one in place). */}
      <mesh key={shape.triangles.length}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[shape.triangles, 3]} />
        </bufferGeometry>
        <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Lines key={`o${shape.outline.length}`} points={shape.outline} color={color} />
    </>
  );
}

/** Turn our columns-storage matrix into a three.js 4x4 matrix (three.js's set() takes the numbers row by row). */
function toMatrix4([a, b, c]: Mat3): THREE.Matrix4 {
  return new THREE.Matrix4().set(a[0], b[0], c[0], 0, a[1], b[1], c[1], 0, a[2], b[2], c[2], 0, 0, 0, 0, 1);
}

const FLOOR = floorLines(3);
const AXES = new Float32Array([-3.5, 0, 0, 3.5, 0, 0, 0, -3.5, 0, 0, 3.5, 0, 0, 0, -3.5, 0, 0, 3.5]);
// A box from (0, 0, 0) to (1, 1, 1): three.js boxes are centred, so slide it by half.
const CUBE = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
const CUBE_EDGES = new THREE.EdgesGeometry(CUBE);

export default function Scene3D({
  matrix,
  showK = true,
  showCube = true,
  showSheet = false,
  vector,
  zoomOut = 1,
  columnSpace,
  nullSpace,
  nullVectors,
  showBasis = true,
  arrows,
  patch,
  edges,
}: Props) {
  const colours = useColours();
  const box = useRef<HTMLDivElement>(null);

  // A finger dragging on the picture should turn the view, not scroll the page.
  // CSS asks for this (Scene3D.css), but iPhone Safari doesn't always listen, so stop the scroll here too.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const stopScroll = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', stopScroll, { passive: false });
    return () => el.removeEventListener('touchmove', stopScroll);
  }, []);

  const moved = useMemo(() => toMatrix4(matrix), [matrix.flat().join()]);
  const [ihat, jhat, khat] = matrix;
  const edgePoints = useMemo(() => edges && new Float32Array(edges.pairs.flat(2)), [edges?.pairs.flat(2).join()]);

  return (
    <div className="scene3d" ref={box}>
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [3.6 * zoomOut, -4.4 * zoomOut, 2.8 * zoomOut], up: [0, 0, 1], fov: 40, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        {/* Faint and still: the floor grid and the three axes. */}
        <Lines points={FLOOR} color={colours.faint} />
        <Lines points={AXES} color={colours.muted} opacity={0.6} />
        <Html position={[3.8, 0, 0]} center className="scene3d-axis">x</Html>
        <Html position={[0, 3.8, 0]} center className="scene3d-axis">y</Html>
        <Html position={[0, 0, 3.8]} center className="scene3d-axis">z</Html>

        {/* Everything in this group is moved by the matrix. */}
        <group matrixAutoUpdate={false} matrix={moved}>
          {showSheet && <Lines points={FLOOR} color={colours.moving} />}
          {nullSpace && <Subspace basis={nullSpace} color={colours.null} />}
          {showCube && (
            <>
              <mesh geometry={CUBE}>
                <meshBasicMaterial color={colours.moving} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={CUBE_EDGES}>
                <lineBasicMaterial color={colours.moving} />
              </lineSegments>
            </>
          )}
        </group>

        {showBasis && (
          <>
            <Arrow tip={ihat} color={colours.ihat} label="î" />
            <Arrow tip={jhat} color={colours.jhat} label="ĵ" />
            {showK && <Arrow tip={khat} color={colours.khat} label="k̂" />}
          </>
        )}
        {patch && <Patch corners={patch.corners} color={colours[patch.colour]} />}
        {edges && edgePoints && <Lines points={edgePoints} color={colours[edges.colour]} />}
        {arrows?.map((a, i) => <Arrow key={i} tip={a.tip} tail={a.tail} color={colours[a.colour]} label={a.label} />)}
        {vector && <Arrow tip={vector} color={colours.vec} label="v" />}
        {columnSpace && <Subspace basis={columnSpace} color={colours.space} />}
        {nullVectors?.map((tip, i) =>
          length3(tip) > 0.05 ? (
            <Arrow key={i} tip={tip} color={colours.null} />
          ) : (
            <mesh key={i}>
              <sphereGeometry args={[0.09, 16, 12]} />
              <meshBasicMaterial color={colours.null} />
            </mesh>
          ),
        )}

        {/* Drag with one finger (or the mouse) to orbit; pinch or scroll to zoom. */}
        <OrbitControls enablePan={false} enableDamping minDistance={3} maxDistance={18} />
      </Canvas>
    </div>
  );
}
