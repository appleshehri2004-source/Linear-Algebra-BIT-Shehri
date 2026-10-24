// The homepage world (docs/homepage-brief.md §4): one 3D canvas, fixed behind the whole page, with the
// endless grid, the lattice dots and fog. The camera follows the scroll through the 5 stations (CameraRig).
// index.astro loads it with client:only="react", on top of a still poster of station 1: this canvas starts
// see-through and fades in once its first frame is drawn. Without WebGL it draws nothing and the poster stays.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useThemeColors, useThemeGlow } from '../../lib/useThemeColors';
import { onWorldChange, world } from '../../lib/worldScroll';
import CameraRig from './CameraRig';
import FrameRateWatch from './FrameRateWatch';
import Lattice from './Lattice';
import OriginGlow from './OriginGlow';
import WorldGrid from './WorldGrid';

/** true if this browser can draw WebGL 2 (every modern phone can; very old ones or locked-down ones can't). */
function hasWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

/** Calls onReady once, after the first frame has been drawn. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady); // the frame is on screen by the next one
  });
  return null;
}

export default function World() {
  const colours = useThemeColors();
  const themeGlow = useThemeGlow();
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Off once the world has faded out below station 5: nothing more is drawn until it comes back.
  const [running, setRunning] = useState(true);
  // A struggling device draws fewer pixels and drops the glow (FrameRateWatch below).
  const [dpr, setDpr] = useState(2);
  const [struggling, setStruggling] = useState(false);
  const [webgl] = useState(hasWebGL2);

  // Fade the whole world (canvas and poster) out after station 5, straight on the page: no React re-draw per scroll.
  useEffect(() => {
    const layer = box.current?.closest<HTMLElement>('.world-layer');
    const update = () => {
      if (layer) layer.style.opacity = String(1 - world.out);
      setRunning(world.out < 1);
    };
    update();
    return onWorldChange(update);
  }, []);

  if (!webgl) return null;

  return (
    <div ref={box} className={ready ? 'world-canvas ready' : 'world-canvas'}>
      <Canvas
        // The handles of later stations sit under the page's HTML, so the canvas listens on the whole page wrapper.
        eventSource={document.getElementById('home-root') ?? undefined}
        eventPrefix="client"
        frameloop={running ? 'demand' : 'never'}
        dpr={[1, dpr]}
        camera={{ fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <FrameRateWatch
          onChange={(slow) => {
            setDpr(slow ? 1 : 2);
            setStruggling(slow);
          }}
        />
        <color attach="background" args={[colours.bgDeep]} />
        <fog attach="fog" args={[colours.bgDeep, 8, 30]} />
        <OriginGlow colour={colours.glowTop} strength={struggling ? 0 : themeGlow} />
        <WorldGrid colours={colours} />
        {/* Glowing dots are drawn in the bright text colour (dark mode); flat ink dots in the muted one (paper). */}
        <Lattice colour={themeGlow > 0 ? colours.text : colours.muted} glow={struggling ? 0 : themeGlow} />
        <CameraRig />
        <FirstFrame onReady={() => setReady(true)} />
      </Canvas>
    </div>
  );
}
