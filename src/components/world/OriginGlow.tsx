// A soft pool of light lying on the plane around the origin, where every station happens. It's the same colour
// as the glow at the top of the lesson pages (--glow-top), so the homepage and the lessons feel like one place.
// In light mode --glow-top is see-through, so there's no pool on paper.
import { useMemo } from 'react';
import * as THREE from 'three';
import { mask, splitAlpha } from '../../lib/useThemeColors';

/** A round picture: bright in the middle, fading to nothing at the edge. */
function poolTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, mask(1));
  gradient.addColorStop(0.4, mask(0.35));
  gradient.addColorStop(1, mask(0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** `colour` is the theme's --glow-top (a see-through blue in dark mode); `strength` is its --glow (0 turns it off). */
export default function OriginGlow({ colour, strength }: { colour: string; strength: number }) {
  const texture = useMemo(poolTexture, []);
  const { color, opacity } = splitAlpha(colour);
  if (strength <= 0 || opacity <= 0) return null;
  return (
    // Lies flat on the floor (turned −90° about x), 22 units across, a hair below the grid so it never covers a line.
    <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
      <planeGeometry args={[22, 22]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={Math.min(1, opacity * 4 * strength)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
