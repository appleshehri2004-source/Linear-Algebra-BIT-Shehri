// The homepage world (docs/homepage-brief.md §4): one 3D canvas, fixed behind the whole page, with the
// endless grid, the lattice dots and fog. The camera follows the scroll through the 5 stations (CameraRig).
// index.astro loads it with client:only="react", on top of a still poster of station 1: this canvas starts
// see-through and fades in once its first frame is drawn. Without WebGL it draws nothing and the poster stays.
//
// It also holds the stations' state (station 1: the arrows v and w; stations 2 and 3: the matrix A). The 3D parts draw
// it inside the canvas; the handles and the readouts are ordinary HTML, put into their places on the page with
// React portals.
//
// The lattice sits in a "moved" group with station 2's moving grid and logo (and station 3's area patch): the
// group's transform is the matrix, so all of them bend together. Stations 2 and 3 share the matrix, so the world
// stays bent from one to the other; away from them it slides back to the identity (flat).
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MATRIX_START, MATRIX_X, VECTORS_START } from '../../content/home';
import { add, detState, identity, lerpMatrix, roundTo, sub, type Mat2, type Vec2 } from '../../lib/linalg';
import { useThemeColors, useThemeGlow } from '../../lib/useThemeColors';
import { presenceAcross, snapTip, stationPresence, worldMatrix4 } from '../../lib/world';
import { onWorldChange, world } from '../../lib/worldScroll';
import AreaPatch3D, { UnitSquareOutline } from './AreaPatch3D';
import CameraRig from './CameraRig';
import DeterminantReadout from './DeterminantReadout';
import FrameRateWatch from './FrameRateWatch';
import Lattice from './Lattice';
import LogoPlane from './LogoPlane';
import MatrixReadout from './MatrixReadout';
import MatrixStation, { MovingGrid } from './MatrixStation';
import OriginGlow from './OriginGlow';
import TipHandles from './TipHandles';
import VectorsReadout from './VectorsReadout';
import VectorsStation from './VectorsStation';
import WorldGrid from './WorldGrid';

/** true if this browser can draw WebGL 2 (every modern phone can; very old ones or locked-down ones can't). */
function hasWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

const IDENTITY = identity();

/** Calls onReady once, after the first frame has been drawn. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady); // the frame is on screen by the next one
  });
  return null;
}

export default function World() {
  const colours = useThemeColors();
  const themeGlow = useThemeGlow();
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Off once the world has faded out below station 5: nothing more is drawn until it comes back.
  const [running, setRunning] = useState(true);
  // A struggling device draws fewer pixels and drops the glow (FrameRateWatch below).
  const [dpr, setDpr] = useState(2);
  const [struggling, setStruggling] = useState(false);
  const [webgl] = useState(hasWebGL2);

  // Station 1: the two arrows. The handle buttons and the camera are shared between the page and the canvas.
  const [v, setV] = useState<Vec2>(VECTORS_START.v);
  const [w, setW] = useState<Vec2>(VECTORS_START.w);
  const handleButtons = useRef<(HTMLElement | null)[]>([]);
  const camera = useRef<THREE.Camera | null>(null);
  // Stations 2 and 3: the matrix, changed by dragging î's and ĵ's tips (its columns).
  const [matrix, setMatrix] = useState<Mat2>(MATRIX_START);
  const setColumn = (k: 0 | 1) => (p: Vec2) => setMatrix((m) => (k === 0 ? [p, m[1]] : [m[0], p]));
  const matrixButtons = useRef<(HTMLElement | null)[]>([]);
  // How much stations 2–3 are there (0 to 1): it slides the matrix in from the identity as you arrive at station 2,
  // and back out after station 3. Then each station's own things: station 2's b arrow, station 3's area patch.
  // Rounded, so React only re-draws when they really change.
  const [matrixShown, setMatrixShown] = useState(0);
  const [matrixOnly, setMatrixOnly] = useState(0);
  const [detShown, setDetShown] = useState(0);
  const drawnMatrix = lerpMatrix(IDENTITY, matrix, matrixShown);
  const moved = useMemo(
    () => new THREE.Matrix4().set(...(worldMatrix4(drawnMatrix) as Parameters<THREE.Matrix4['set']>)),
    [drawnMatrix.flat().join()],
  );

  // The spots on the page (index.astro) where the handles and the readouts go.
  const handleLayer = document.getElementById('world-handles');
  const vectorsReadout = document.getElementById('readout-vectors');
  const matrixReadout = document.getElementById('readout-matrix');
  const determinantReadout = document.getElementById('readout-determinant');

  // Fade the whole world (canvas and poster) out after station 5, straight on the page: no React re-draw per scroll.
  useEffect(() => {
    const layer = box.current?.closest<HTMLElement>('.world-layer');
    const update = () => {
      if (layer) layer.style.opacity = String(1 - world.out);
      setRunning(world.out < 1);
      setMatrixShown(roundTo(presenceAcross(world.s, 1, 2), 3));
      setMatrixOnly(roundTo(stationPresence(world.s, 1), 3));
      setDetShown(roundTo(stationPresence(world.s, 2), 3));
    };
    update();
    return onWorldChange(update);
  }, []);

  if (!webgl) return null;

  const glow = struggling ? 0 : themeGlow;

  return (
    <>
      {handleLayer &&
        createPortal(
          <TipHandles
            stations={[0]}
            buttons={handleButtons}
            camera={camera}
            tips={[
              { name: 'v', value: v, set: setV, colourClass: 'vec' },
              { name: 'w', value: w, set: setW, colourClass: 'vec2' },
              // Dragging the sum keeps v and moves w, so that v + w lands under the finger.
              {
                name: 'v + w',
                value: add(v, w),
                set: (p: Vec2) => setW(snapTip(sub(p, v), false)),
                colourClass: 'sum',
              },
            ]}
          />,
          handleLayer,
        )}
      {handleLayer &&
        createPortal(
          <TipHandles
            stations={[1, 2]}
            buttons={matrixButtons}
            camera={camera}
            tips={[
              { name: 'î', value: matrix[0], set: setColumn(0), colourClass: 'ihat' },
              { name: 'ĵ', value: matrix[1], set: setColumn(1), colourClass: 'jhat' },
            ]}
          />,
          handleLayer,
        )}
      {vectorsReadout && createPortal(<VectorsReadout v={v} w={w} />, vectorsReadout)}
      {matrixReadout &&
        createPortal(
          <MatrixReadout matrix={matrix} x={MATRIX_X} colours={colours} onReset={() => setMatrix(MATRIX_START)} />,
          matrixReadout,
        )}
      {determinantReadout &&
        createPortal(
          <DeterminantReadout matrix={matrix} colours={colours} onReset={() => setMatrix(MATRIX_START)} />,
          determinantReadout,
        )}
      <div ref={box} className={ready ? 'world-canvas ready' : 'world-canvas'}>
        <Canvas
          // The handles of later stations sit under the page's HTML, so the canvas listens on the whole page wrapper.
          eventSource={document.getElementById('home-root') ?? undefined}
          eventPrefix="client"
          frameloop={running ? 'demand' : 'never'}
          dpr={[1, dpr]}
          camera={{ fov: 42, near: 0.1, far: 200 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <FrameRateWatch
            onChange={(slow) => {
              setDpr(slow ? 1 : 2);
              setStruggling(slow);
            }}
          />
          <color attach="background" args={[colours.bgDeep]} />
          <fog attach="fog" args={[colours.bgDeep, 8, 30]} />
          <OriginGlow colour={colours.glowTop} strength={glow} />
          <WorldGrid colours={colours} />
          {/* Glowing dots are drawn in the bright text colour (dark mode); flat ink dots in the muted one (paper). */}
          {/* The moved group: everything in it is transformed by the matrix (the identity away from station 2). */}
          <group matrixAutoUpdate={false} matrix={moved}>
            <Lattice colour={themeGlow > 0 ? colours.text : colours.muted} glow={glow} />
            <MovingGrid colour={colours.moving} opacity={matrixShown} />
            <AreaPatch3D kind={detState(drawnMatrix).kind} colours={colours} opacity={detShown} />
            {/* At station 3 the logo turns partly see-through, so the area shading shows through it. */}
            <LogoPlane opacity={matrixShown * (1 - 0.55 * detShown)} />
          </group>
          <UnitSquareOutline colour={colours.muted} opacity={detShown} />
          <MatrixStation
            matrix={drawnMatrix}
            x={MATRIX_X}
            shown={matrixShown}
            bShown={matrixOnly}
            colours={colours}
            glow={glow}
            handles={matrixButtons}
            cameraOut={camera}
          />
          <VectorsStation v={v} w={w} colours={colours} glow={glow} handles={handleButtons} cameraOut={camera} />
          <CameraRig />
          <FirstFrame onReady={() => setReady(true)} />
        </Canvas>
      </div>
    </>
  );
}
