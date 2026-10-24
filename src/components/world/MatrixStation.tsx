// Station 2, the matrix (docs/homepage-brief.md §5): î (green) and ĵ (red) are the matrix's columns, and a
// yellow arrow shows b = A·x for x = (2, 1). Its tip sits on the lattice dot that started at (2, 1): multiplying
// by A means following the dot.
//
// The bending itself happens in World.tsx: the lattice, this file's MovingGrid and the logo sit in one group
// that A transforms. This part draws what must NOT be bent (arrows keep their round thickness).
import type { MutableRefObject } from 'react';
import * as THREE from 'three';
import { matVec, type Mat2, type Vec2 } from '../../lib/linalg';
import type { ThemeColors } from '../../lib/useThemeColors';
import Arrow3D from './Arrow3D';
import HandleAnchors from './HandleAnchors';

/** How far the moving grid reaches from the origin (it fades into the fog well before that). */
const REACH = 12;

/** The moving grid's lines (x = k and y = k), as pairs of three.js points, before any matrix moves them. */
function gridLines(): Float32Array {
  const points: number[] = [];
  for (let k = -REACH; k <= REACH; k++) {
    // Maths (x, y) → three.js (x, height, −y); a hair above the fixed grid.
    points.push(k, 0.005, REACH, k, 0.005, -REACH, -REACH, 0.005, -k, REACH, 0.005, -k);
  }
  return new Float32Array(points);
}
const GRID = gridLines();

/** The brighter grid that moves with the matrix (it goes inside World's moved group). */
export function MovingGrid({ colour, opacity }: { colour: string; opacity: number }) {
  if (opacity <= 0.01) return null;
  return (
    <lineSegments renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[GRID, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={colour} transparent opacity={0.75 * opacity} depthWrite={false} />
    </lineSegments>
  );
}

interface Props {
  /** The matrix as it is drawn right now (already slid in from the identity by `shown`). */
  matrix: Mat2;
  /** The vector x in A·x = b. */
  x: Vec2;
  /** 0 to 1: how much the station is there (it fades in and out with the scroll). */
  shown: number;
  colours: ThemeColors;
  glow: number;
  handles: MutableRefObject<(HTMLElement | null)[]>;
  cameraOut: MutableRefObject<THREE.Camera | null>;
}

export default function MatrixStation({ matrix, x, shown, colours, glow, handles, cameraOut }: Props) {
  return (
    <>
      {shown > 0.01 && (
        <>
          <Arrow3D tip={matVec(matrix, x)} colour={colours.vec} thickness={0.045} glow={glow} opacity={shown} />
          <Arrow3D tip={matrix[0]} colour={colours.ihat} glow={glow} opacity={shown} />
          <Arrow3D tip={matrix[1]} colour={colours.jhat} glow={glow} opacity={shown} />
        </>
      )}
      {/* The handles sit on the columns' tips. */}
      <HandleAnchors tips={() => [matrix[0], matrix[1]]} buttons={handles} cameraOut={cameraOut} />
    </>
  );
}
