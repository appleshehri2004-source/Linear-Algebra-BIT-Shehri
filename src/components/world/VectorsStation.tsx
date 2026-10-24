// Station 1, Vectors (docs/homepage-brief.md §5): v, w and v + w on the plane, inside the 3D world.
// Two faint dashed copies close the parallelogram: w drawn again from v's tip, and v from w's tip. Both walks end
// at the tip of v + w, which is what adding vectors means.
//
// This part only draws. v and w live in World.tsx, and the HTML handles (TipHandles.tsx) change them. Every
// frame, it also works out where v's and w's tips appear on screen and moves those handles there.
import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { add, type Vec2 } from '../../lib/linalg';
import type { ThemeColors } from '../../lib/useThemeColors';
import { toWorld } from '../../lib/world';
import { world } from '../../lib/worldScroll';
import Arrow3D, { ARROW_LIFT } from './Arrow3D';

/** How solid the station is for scroll position s: fully there at station 1, gone by halfway to station 2. */
export function vectorsShown(s: number): number {
  const t = Math.min(1, Math.max(0, (s - 0.1) / 0.45));
  return 1 - t * t * (3 - 2 * t); // smoothstep, so it eases out instead of stopping sharply
}

interface Props {
  v: Vec2;
  w: Vec2;
  colours: ThemeColors;
  glow: number;
  /** The two handle buttons on the page (v's, then w's), moved here every frame to sit over the tips. */
  handles: MutableRefObject<(HTMLElement | null)[]>;
  /** Filled in here: the camera, so the handles can turn a finger's spot into a point on the plane. */
  cameraOut: MutableRefObject<THREE.Camera | null>;
}

export default function VectorsStation({ v, w, colours, glow, handles, cameraOut }: Props) {
  const { camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const shown = useRef(1);
  const point = new THREE.Vector3();
  cameraOut.current = camera;

  useFrame(() => {
    // Pack the station away as you scroll on: everything shrinks back into the origin.
    shown.current = vectorsShown(world.s);
    if (group.current) {
      group.current.scale.setScalar(Math.max(1e-3, shown.current));
      group.current.visible = shown.current > 0.01;
    }
    // Put each handle over its tip: project the tip from 3D onto the screen (−1…1 each way), then into pixels.
    [v, w].forEach((tip, k) => {
      const el = handles.current[k];
      if (!el) return;
      point
        .set(...toWorld(tip))
        .setY(ARROW_LIFT)
        .multiplyScalar(shown.current)
        .project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  const sum = add(v, w);
  // The dashed sides of the parallelogram, just above the floor.
  const lift = (p: Vec2) => {
    const [x, , z] = toWorld(p);
    return [x, ARROW_LIFT, z] as [number, number, number];
  };
  const dashed = { dashed: true, dashSize: 0.18, gapSize: 0.12, lineWidth: 1.5, transparent: true, opacity: 0.55 };

  return (
    <group ref={group}>
      <Line points={[lift(v), lift(sum)]} color={colours.vec2} {...dashed} />
      <Line points={[lift(w), lift(sum)]} color={colours.vec} {...dashed} />
      <Arrow3D tip={sum} colour={colours.sum} thickness={0.05} glow={glow} />
      <Arrow3D tip={v} colour={colours.vec} glow={glow} />
      <Arrow3D tip={w} colour={colours.vec2} glow={glow} />
    </group>
  );
}
