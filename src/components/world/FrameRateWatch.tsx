// Watches how smoothly the world moves and tells World when the device is struggling (docs/homepage-brief.md §7:
// "lower dpr and turn off glow on weak devices"). drei's PerformanceMonitor can't do this here: it counts frames
// per second, but this world only draws while something moves, so a still page looks like "0 fps" to it.
// This one only counts the frames drawn while moving (movingFrameRate in src/lib/world.ts).
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { movingFrameRate } from '../../lib/world';

/** Below this many frames per second while moving, the device counts as struggling. */
const SLOW = 45;
/** Above this, a struggling device has recovered. */
const SMOOTH = 57;
/** After this many changes back and forth, it stops changing (better than flickering between the two). */
const MAX_CHANGES = 3;

export default function FrameRateWatch({ onChange }: { onChange: (struggling: boolean) => void }) {
  const gaps = useRef<number[]>([]);
  const struggling = useRef(false);
  const changes = useRef(0);

  useFrame((_, delta) => {
    if (changes.current >= MAX_CHANGES) return;
    gaps.current.push(delta);
    if (gaps.current.length > 90) gaps.current.shift();
    const fps = movingFrameRate(gaps.current);
    if (fps === null) return;
    const now = struggling.current ? fps < SMOOTH : fps < SLOW;
    if (now !== struggling.current) {
      struggling.current = now;
      changes.current += 1;
      gaps.current = []; // judge the new setting on fresh frames
      onChange(now);
    }
  });

  return null;
}
