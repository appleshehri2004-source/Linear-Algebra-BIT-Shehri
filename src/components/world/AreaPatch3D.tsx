// Station 3's area picture.
// - AreaPatch3D: the unit square, shaded and outlined. It sits inside World's moved group, so the matrix turns it
//   into the parallelogram made by î and ĵ: its area is |det A|. Blue when the area keeps its way round (det > 0),
//   purple when it's flipped over (det < 0), grey when it's squashed flat (det = 0): the lessons' colours.
// - UnitSquareOutline: a faint dashed outline of the original unit square (area 1), which does NOT move, so you can
//   compare the old area with the new.
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { DetState } from '../../lib/linalg';
import type { ThemeColors } from '../../lib/useThemeColors';
import { toWorld } from '../../lib/world';

/** The unit square's corners in three.js coordinates, just above the grids and below the logo. */
const CORNERS = (
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ] as const
).map(([x, y]) => {
  const [X, , Z] = toWorld([x, y]);
  return [X, 0.012, Z] as [number, number, number];
});

/** The colour for what the matrix does to area. */
export function areaColour(kind: DetState['kind'], colours: ThemeColors): string {
  if (kind === 'flipped') return colours.areaFlipped;
  if (kind === 'scaled') return colours.areaKept;
  return colours.zero;
}

interface Props {
  kind: DetState['kind'];
  colours: ThemeColors;
  /** 0 to 1: how much station 3 is there. */
  opacity: number;
}

export default function AreaPatch3D({ kind, colours, opacity }: Props) {
  if (opacity <= 0.01) return null;
  const colour = areaColour(kind, colours);
  const [x, , z] = toWorld([0.5, 0.5]);
  return (
    <group>
      {/* The shading: drawn on both sides, so it still shows after a flip. */}
      <mesh position={[x, 0.01, z]} rotation-x={-Math.PI / 2} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={colour}
          transparent
          opacity={0.38 * opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <Line points={CORNERS} color={colour} lineWidth={2} transparent opacity={opacity} />
    </group>
  );
}

/** The original unit square, dashed and faint. It stays put (it goes outside the moved group). */
export function UnitSquareOutline({ colour, opacity }: { colour: string; opacity: number }) {
  if (opacity <= 0.01) return null;
  return (
    <Line
      points={CORNERS}
      color={colour}
      lineWidth={1.5}
      dashed
      dashSize={0.08}
      gapSize={0.06}
      transparent
      opacity={0.7 * opacity}
    />
  );
}
