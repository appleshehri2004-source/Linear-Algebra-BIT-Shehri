// One arrow in the 3D world, from `tail` to `tip` (maths points on the plane), lying just above the floor:
// a thin round shaft and a cone at the tip. In dark mode a wider, see-through copy around it makes it glow.
import { useMemo } from 'react';
import * as THREE from 'three';
import { toWorld } from '../../lib/world';
import type { Vec2 } from '../../lib/linalg';

/** How high above the floor arrows lie, so they never flicker against the grid lines. */
export const ARROW_LIFT = 0.04;
const HEAD_LENGTH = 0.36;
const UP = new THREE.Vector3(0, 1, 0);

interface Props {
  tip: Vec2;
  tail?: Vec2;
  colour: string;
  /** Shaft thickness (radius, in plane units). The sum is drawn a little thicker. */
  thickness?: number;
  /** 0 to 1: the theme's glow (0 = no glow copy). */
  glow: number;
  /** 0 to 1: how solid the arrow is (it fades out when you leave its station). */
  opacity?: number;
}

/** Where the arrow sits: its start, its direction and its length, in three.js coordinates. */
function placement(tail: Vec2, tip: Vec2) {
  const start = new THREE.Vector3(...toWorld(tail)).setY(ARROW_LIFT);
  const end = new THREE.Vector3(...toWorld(tip)).setY(ARROW_LIFT);
  const along = end.clone().sub(start);
  const length = along.length();
  // The cylinder and cone are made standing up (along y); this turn lays them along the arrow.
  const turn = new THREE.Quaternion().setFromUnitVectors(UP, length > 1e-9 ? along.clone().normalize() : UP);
  return { start, length, turn };
}

export default function Arrow3D({ tip, tail = [0, 0], colour, thickness = 0.035, glow, opacity = 1 }: Props) {
  const { start, length, turn } = useMemo(() => placement(tail, tip), [tail[0], tail[1], tip[0], tip[1]]);
  if (length < 1e-6) return null; // a zero arrow is just a point: nothing to draw

  // A short arrow gets a shorter head, so the head never pokes out behind the tail.
  const head = Math.min(HEAD_LENGTH, length * 0.45);
  const shaft = length - head;
  const material = { color: colour, transparent: opacity < 1, opacity, toneMapped: false };
  const glowMaterial = {
    color: colour,
    transparent: true,
    opacity: 0.16 * glow * opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  };

  return (
    <group position={start} quaternion={turn}>
      {/* The shaft, from the tail up to where the head starts. */}
      <mesh position-y={shaft / 2}>
        <cylinderGeometry args={[thickness, thickness, shaft, 12]} />
        <meshBasicMaterial {...material} />
      </mesh>
      {/* The head: a cone whose point is exactly at the tip. */}
      <mesh position-y={shaft + head / 2}>
        <coneGeometry args={[thickness * 3.4, head, 20]} />
        <meshBasicMaterial {...material} />
      </mesh>
      {glow > 0 && (
        <>
          <mesh position-y={shaft / 2}>
            <cylinderGeometry args={[thickness * 2, thickness * 2, shaft, 12]} />
            <meshBasicMaterial {...glowMaterial} />
          </mesh>
          <mesh position-y={shaft + head / 2}>
            <coneGeometry args={[thickness * 4.6, head * 1.15, 20]} />
            <meshBasicMaterial {...glowMaterial} />
          </mesh>
        </>
      )}
    </group>
  );
}
