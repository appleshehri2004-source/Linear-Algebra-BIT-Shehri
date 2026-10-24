// The BIT logo lying on the unit square, from (0, 0) to (1, 1). It sits inside the world's "moved" group, so a
// matrix stretches, shears or flips it like everything else (a flip shows its mirrored back).
// The picture is the logo file the site already hosts (src/assets/bit-logo.svg), drawn once onto a canvas.
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import logoUrl from '../../assets/bit-logo.svg?url';
import { toWorld } from '../../lib/world';

/** The texture's size in pixels: sharp even when the logo is stretched across a big screen. */
const SIZE = 1024;

/** Draws the SVG logo onto a square canvas and makes a three.js texture of it. */
async function logoTexture(): Promise<THREE.CanvasTexture> {
  // Give the SVG a pixel size first: some browsers (Safari) draw an SVG without one at a tiny default size.
  const text = await fetch(logoUrl).then((r) => r.text());
  const sized = text.replace('<svg ', `<svg width="${SIZE}" height="${SIZE}" `);
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  canvas.getContext('2d')!.drawImage(image, 0, 0, SIZE, SIZE);
  URL.revokeObjectURL(url);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4; // stays crisp when seen at a slant
  return texture;
}

/** How high the logo lies: above the grids, below the arrows. */
const LOGO_LIFT = 0.02;

export default function LogoPlane({ opacity }: { opacity: number }) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    logoTexture().then((t) => !cancelled && setTexture(t));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!texture || opacity <= 0.01) return null;
  const [x, , z] = toWorld([0.5, 0.5]); // the middle of the unit square
  return (
    // A flat 1 × 1 square, turned to lie on the floor with the picture's top towards +y.
    <mesh position={[x, LOGO_LIFT, z]} rotation-x={-Math.PI / 2} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
