// Keeps a station's HTML grab handles (TipHandles.tsx) over the 3D tips they move. Every frame it works out where
// each tip appears on screen and moves its button there. It lives inside the 3D scene because it needs the camera;
// it also hands the camera out, so the handles can turn a finger's spot into a point on the plane.
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec2 } from '../../lib/linalg';
import { toWorld } from '../../lib/world';
import { ARROW_LIFT } from './Arrow3D';

interface Props {
  /**
   * Where the tips are right now, as maths points on the plane, in the same order as the buttons. It's a function,
   * asked every frame at the moment the buttons move: a value worked out elsewhere could be one frame old, and on a
   * phone (where nothing is drawn until something moves) the rings were left behind their arrows.
   */
  tips: () => Vec2[];
  /** The handle buttons on the page. */
  buttons: MutableRefObject<(HTMLElement | null)[]>;
  /** Filled in here: the camera. */
  cameraOut: MutableRefObject<THREE.Camera | null>;
}

const point = new THREE.Vector3();

export default function HandleAnchors({ tips, buttons, cameraOut }: Props) {
  const { camera, size } = useThree();
  cameraOut.current = camera;

  useFrame(() => {
    tips().forEach((tip, k) => {
      const el = buttons.current[k];
      if (!el) return;
      // Project the tip from 3D onto the screen (−1…1 each way), then into pixels.
      point
        .set(...toWorld(tip))
        .setY(ARROW_LIFT)
        .project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.dataset.placed = ''; // until this first happens, the handle stays hidden (world.css)
    });
  });

  return null;
}
