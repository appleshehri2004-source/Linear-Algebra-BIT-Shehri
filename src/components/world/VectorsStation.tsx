// Station 1, Vectors (docs/homepage-brief.md §5): v, w and v + w on the plane, inside the 3D world.
// Two faint dashed copies close the parallelogram: w drawn again from v's tip, and v from w's tip. Both walks end
// at the tip of v + w, which is what adding vectors means.
//
// This part only draws. v and w live in World.tsx, and the HTML handles (TipHandles.tsx) change them;
// HandleAnchors keeps those handles over v's and w's tips.
import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ThemeColors } from '../../lib/useThemeColors';
import { add, scale, type Vec2 } from '../../lib/linalg';
import { stationPresence, toWorld } from '../../lib/world';
import { world } from '../../lib/worldScroll';
import Arrow3D, { ARROW_LIFT } from './Arrow3D';
import HandleAnchors from './HandleAnchors';

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
  const group = useRef<THREE.Group>(null);
  // Where the tips are on screen right now (shrunk with the station as it packs away), for the handles.
  const tips = useRef<Vec2[]>([v, w]);

  useFrame(() => {
    // Pack the station away as you scroll on: everything shrinks back into the origin.
    const shown = stationPresence(world.s, 0);
    if (group.current) {
      group.current.scale.setScalar(Math.max(1e-3, shown));
      group.current.visible = shown > 0.01;
    }
    tips.current = [scale(shown, v), scale(shown, w)];
  });

  const sum = add(v, w);
  // The dashed sides of the parallelogram, just above the floor.
  const lift = (p: Vec2) => {
    const [x, , z] = toWorld(p);
    return [x, ARROW_LIFT, z] as [number, number, number];
  };
  const dashed = { dashed: true, dashSize: 0.18, gapSize: 0.12, lineWidth: 1.5, transparent: true, opacity: 0.55 };

  return (
    <>
      <group ref={group}>
        <Line points={[lift(v), lift(sum)]} color={colours.vec2} {...dashed} />
        <Line points={[lift(w), lift(sum)]} color={colours.vec} {...dashed} />
        <Arrow3D tip={sum} colour={colours.sum} thickness={0.05} glow={glow} />
        <Arrow3D tip={v} colour={colours.vec} glow={glow} />
        <Arrow3D tip={w} colour={colours.vec2} glow={glow} />
      </group>
      {/* After the group, so it reads the tips this frame's useFrame above has just worked out. */}
      <HandleAnchors tips={tips} buttons={handles} cameraOut={cameraOut} />
    </>
  );
}
