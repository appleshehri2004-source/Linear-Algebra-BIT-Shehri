// The lattice: a small dot on every whole-number point of the plane, 65 × 65 of them (−32 to 32: past the fog).
// Each dot sits at A·p (latticePoints in src/lib/world.ts), so when a later station changes the matrix A,
// the whole background moves with it: the background IS the vector space. For now A is the identity.
//
// All dots are one three.js "points" object: one draw for all 4,225 of them. Each dot's look comes from a
// tiny picture painted at runtime (no image file): a solid round middle, with a soft glow around it in dark mode.
import { useMemo } from 'react';
import * as THREE from 'three';
import { identity, type Mat2 } from '../../lib/linalg';
import { mask } from '../../lib/useThemeColors';
import { latticePoints } from '../../lib/world';

/** How far the lattice reaches from the origin in each direction. */
const REACH = 32;
const IDENTITY = identity();

/** Paints one dot, white (the material tints it): with glow, a solid middle and a soft halo; without, a crisp dot. */
function dotTexture(glow: number): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  if (glow > 0) {
    // A small solid middle, then a soft glow that fades smoothly to nothing (no hard ring).
    gradient.addColorStop(0, mask(1));
    gradient.addColorStop(0.16, mask(1));
    gradient.addColorStop(0.28, mask(0.55 * glow));
    gradient.addColorStop(0.55, mask(0.12 * glow));
    gradient.addColorStop(1, mask(0));
  } else {
    // A crisp round ink dot (the edge softened by a hair so it isn't jagged).
    gradient.addColorStop(0, mask(1));
    gradient.addColorStop(0.8, mask(1));
    gradient.addColorStop(1, mask(0));
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface Props {
  /** The dot colour (from the theme). */
  colour: string;
  /** 0 (no glow) to 1: the theme's --glow, or 0 when the device is struggling. */
  glow: number;
  /** The matrix that moves every dot. */
  matrix?: Mat2;
}

export default function Lattice({ colour, glow, matrix = IDENTITY }: Props) {
  const positions = useMemo(() => latticePoints(REACH, matrix), [matrix.flat().join()]);
  const texture = useMemo(() => dotTexture(glow), [glow]);
  // With glow the dot picture is mostly halo, so it's drawn bigger to keep the solid middle about the same size.
  const size = glow > 0 ? 0.5 : 0.09;

  return (
    // renderOrder 1: drawn after the grid, so the dots sit on top of its lines.
    <points renderOrder={1}>
      <bufferGeometry key={positions.length}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        key={glow > 0 ? 'glow' : 'flat'}
        map={texture}
        color={colour}
        size={size}
        sizeAttenuation
        transparent
        depthWrite={false}
        // Glowing dots add light where they overlap (like real light); flat ink dots just cover what's behind.
        blending={glow > 0 ? THREE.AdditiveBlending : THREE.NormalBlending}
        fog
      />
    </points>
  );
}
