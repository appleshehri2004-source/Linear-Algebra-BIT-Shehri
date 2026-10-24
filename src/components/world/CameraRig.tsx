// Moves the camera. Every frame it asks "where should the camera be for this scroll?" (cameraPose in
// src/lib/world.ts) and glides part of the way there (maath's damp), so the camera never jumps, even after a
// fast flick of the scroll. With "reduce motion" on, it cuts straight to the nearest station instead.
//
// Two small touches, only on a computer with a mouse and without "reduce motion":
// - the camera leans a little towards the mouse (about 1.5°), so the world feels like it floats;
// - it sways very slowly when idle ("breathing").
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import * as THREE from 'three';
import { STATIONS } from '../../content/home';
import { cameraPose } from '../../lib/world';
import { onWorldChange, world } from '../../lib/worldScroll';

const POSES = STATIONS.map((s) => s.pose);
/** How long the glide takes to cover most of the way, in seconds. Bigger is lazier. */
const GLIDE = 0.45;
/** The mouse lean and the idle sway, in radians. */
const LEAN = (1.5 * Math.PI) / 180;
const SWAY = (0.8 * Math.PI) / 180;
const UP = new THREE.Vector3(0, 1, 0);

export default function CameraRig() {
  const { camera, invalidate, scene, size } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.6, 0));
  const goal = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());
  const first = useRef(true);

  // Draw a new frame whenever the scroll or the mouse moves (the world only draws when asked: frameloop "demand").
  useEffect(() => onWorldChange(() => invalidate()), [invalidate]);

  useFrame((state, rawDelta) => {
    // After a pause (nothing moved, so nothing was drawn) the time since the last frame can be seconds.
    // Gliding by that much in one step would be a jump, so count at most 1/30 of a second per frame.
    const delta = Math.min(rawDelta, 1 / 30);
    const floating = world.finePointer && !world.reduced;

    // Reduce motion: hold each station until the halfway point, then cut to the next. No glide.
    const s = world.reduced ? Math.round(world.s) : world.s;
    const pose = cameraPose(s, world.reduced ? 0 : world.hold, POSES, size.width / size.height);
    goal.current.set(...pose.position);
    goalTarget.current.set(...pose.target);

    if (floating) {
      // Turn the camera's spot around the point it looks at: sideways with the mouse and the slow sway,
      // up and down with the mouse.
      offset.current.subVectors(goal.current, goalTarget.current);
      const sway = Math.sin(state.clock.elapsedTime * 0.25) * SWAY;
      offset.current.applyAxisAngle(UP, -world.pointer[0] * LEAN + sway);
      const side = new THREE.Vector3().crossVectors(UP, offset.current).normalize();
      offset.current.applyAxisAngle(side, world.pointer[1] * LEAN);
      goal.current.addVectors(goalTarget.current, offset.current);
    }

    let moving = false;
    if (world.reduced || first.current) {
      // Cut: go straight there (also on the very first frame, so the world doesn't fly in from nowhere).
      camera.position.copy(goal.current);
      target.current.copy(goalTarget.current);
      first.current = false;
    } else {
      moving = easing.damp3(camera.position, goal.current, GLIDE, delta);
      moving = easing.damp3(target.current, goalTarget.current, GLIDE, delta) || moving;
    }
    camera.lookAt(target.current);

    // The fog starts a little before the origin and is thick by three times the distance, whatever station you're at.
    const distance = camera.position.distanceTo(target.current);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = distance * 0.9;
      scene.fog.far = distance * 3.2;
    }

    // Keep drawing while the camera is still gliding, or always while it floats (unless the world has faded out).
    if ((moving || floating) && world.out < 1) invalidate();
  });

  return null;
}
