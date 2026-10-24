// The grab handles for a station's arrow tips (station 1: v and w; station 2: î and ĵ): real HTML buttons laid
// over the 3D tips (HandleAnchors.tsx moves them there every frame). Why buttons and not 3D objects:
// - A phone decides "scroll or not" from what's under the finger when the touch starts. These buttons say
//   touch-action: none, so dragging a tip never scrolls the page, and swiping anywhere else always does.
// - A keyboard can Tab to them and move a tip with the arrow keys; a screen reader can say their names.
import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent, type KeyboardEvent } from 'react';
import * as THREE from 'three';
import { roundTo, type Vec2 } from '../../lib/linalg';
import { fromWorld, rayToFloor, snapTip, stationPresence, type Vec3 } from '../../lib/world';
import { onWorldChange, world } from '../../lib/worldScroll';
import { ARROW_LIFT } from './Arrow3D';

/** A number as a screen reader should say it: at most 1 decimal place, with a real minus sign. */
const say = (n: number) => String(roundTo(n, 1) + 0).replace('-', '−');

interface Tip {
  /** What it's called: "v", "w", "v + w", "î", "ĵ". */
  name: string;
  value: Vec2;
  /** Where the tip should go (already snapped). For v + w this moves w, so the sum's tip lands there. */
  set: (p: Vec2) => void;
  /** The CSS class of its colour (vec, vec2, sum, ihat, jhat), for the ring. */
  colourClass: string;
}

interface Props {
  /** The stations these handles belong to (0 = station 1): they're only awake there. */
  stations: number[];
  tips: Tip[];
  /** Filled in here with the buttons, so HandleAnchors can move them over the tips. */
  buttons: MutableRefObject<(HTMLElement | null)[]>;
  /** The 3D camera (HandleAnchors fills it in), to turn a finger's spot into a point on the plane. */
  camera: MutableRefObject<THREE.Camera | null>;
}

const ray = new THREE.Raycaster();

/**
 * The point on the plane under the screen spot (x, y), in maths coordinates. null if that spot looks at the sky.
 * It measures the 3D canvas itself, not the window: on an iPhone the two differ while Safari's address bar grows
 * and shrinks, and using the window's size made a drag aim at the wrong spot (sometimes the sky: no move at all).
 */
function planePointAt(x: number, y: number, camera: THREE.Camera): Vec2 | null {
  const canvas = document.querySelector('.world-canvas canvas');
  const box = canvas?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  ray.setFromCamera(
    new THREE.Vector2(((x - box.left) / box.width) * 2 - 1, 1 - ((y - box.top) / box.height) * 2),
    camera,
  );
  const { origin, direction } = ray.ray;
  // The arrows lie ARROW_LIFT above the floor, so aim at that height: move the line down by it and hit the floor.
  const hit = rayToFloor([origin.x, origin.y - ARROW_LIFT, origin.z], direction.toArray() as Vec3);
  return hit && fromWorld(hit);
}

export default function TipHandles({ stations, tips, buttons, camera }: Props) {
  // Only usable while you're at this station (its arrows are packed away elsewhere).
  const [active, setActive] = useState(true);
  // The soft pulsing ring invites a first drag; it stops once you've moved a tip.
  const [touched, setTouched] = useState(false);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setActive(Math.max(...stations.map((k) => stationPresence(world.s, k))) > 0.6);
    update();
    return onWorldChange(update);
  }, [stations.join()]);

  /** Move tip k to the plane point under the finger or mouse. */
  function aim(k: number, e: PointerEvent<HTMLButtonElement>) {
    if (!camera.current) return;
    const p = planePointAt(e.clientX, e.clientY, camera.current);
    if (p) tips[k].set(snapTip(p));
  }

  function onPointerDown(k: number, e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault(); // no text selection, no focus jump
    e.currentTarget.setPointerCapture(e.pointerId); // keep getting moves even if the finger leaves the button
    dragging.current = k;
    setTouched(true);
    aim(k, e); // the tip comes to the finger straight away, even before it moves
  }

  function onPointerMove(k: number, e: PointerEvent<HTMLButtonElement>) {
    if (dragging.current === k) aim(k, e);
  }

  function onPointerUp() {
    dragging.current = null;
  }

  function onKeyDown(k: number, e: KeyboardEvent<HTMLButtonElement>) {
    const step = e.shiftKey ? 1 : 0.1;
    const moves: Record<string, Vec2> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault(); // the arrow keys move the tip, not the page
    const [x, y] = tips[k].value;
    tips[k].set(snapTip([x + move[0], y + move[1]], false));
    setTouched(true);
  }

  return (
    <>
      {tips.map((tip, k) => (
        <button
          key={tip.name}
          type="button"
          ref={(el) => {
            buttons.current[k] = el;
          }}
          className={`tip-handle ${tip.colourClass}${touched ? '' : ' invite'}${active ? '' : ' asleep'}`}
          // Asleep (away from its station): not tappable, and skipped by Tab and screen readers.
          tabIndex={active ? 0 : -1}
          aria-hidden={!active}
          aria-label={`Arrow ${tip.name} tip, at (${say(tip.value[0])}, ${say(tip.value[1])}). Move it with the arrow keys.`}
          onPointerDown={(e) => onPointerDown(k, e)}
          onPointerMove={(e) => onPointerMove(k, e)}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => onKeyDown(k, e)}
        />
      ))}
    </>
  );
}
