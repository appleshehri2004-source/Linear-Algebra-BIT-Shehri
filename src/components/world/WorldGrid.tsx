// The faint, fixed, endless grid on the floor of the world: one line per unit, a stronger line every 5th.
// It's drei's Grid, a single flat shape whose lines are drawn by the graphics card, so "endless" costs nothing.
// It never moves with a matrix: the moving grid (Phase 4) will be separate lines on top, like in the lessons.
import { useEffect, useRef } from 'react';
import { Grid } from '@react-three/drei';
import type * as THREE from 'three';
import { blendOver, type ThemeColors } from '../../lib/useThemeColors';

export default function WorldGrid({ colours }: { colours: ThemeColors }) {
  const grid = useRef<THREE.Mesh>(null);
  // The grid is see-through paint on the floor, so it mustn't hide anything "below" it. Without this, the lower
  // half of each lattice dot (a flat picture facing the camera, half of it under the floor) was cut off.
  useEffect(() => {
    if (grid.current) (grid.current.material as THREE.Material).depthWrite = false;
  }, []);
  // drei's Grid takes solid colours only, so mix the see-through theme colours into the fog colour first.
  // In 3D the thin lines look weaker than on a flat page, so they're drawn a bit stronger (boost).
  return (
    <Grid
      ref={grid}
      infiniteGrid
      cellSize={1}
      sectionSize={5}
      cellThickness={0.9}
      sectionThickness={1.1}
      cellColor={blendOver(colours.faint, colours.bgDeep, 3.2)}
      sectionColor={blendOver(colours.gridMajor, colours.bgDeep, 2)}
      // Fade out with distance from the origin (fadeFrom 0), not from the camera: the space is brightest
      // where the logo lives and melts into the fog all around it.
      fadeFrom={0}
      fadeDistance={34}
      fadeStrength={1.4}
    />
  );
}
