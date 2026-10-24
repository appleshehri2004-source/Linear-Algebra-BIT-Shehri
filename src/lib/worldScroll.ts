// The homepage's scroll store: one small shared object that says where the scroll is among the 5 stations.
// The page's own script starts it (index.astro). The 3D world reads it every frame, and the station rail listens
// for changes. Reading a plain object each frame costs nothing, unlike React state, which would re-draw React.
//
// It also turns on Lenis (smooth mouse-wheel scrolling) on computers with a mouse. Phones keep the phone's own
// scrolling, and nobody gets it with "reduce motion" switched on (docs/homepage-brief.md §7).
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { stationAt, type SectionBox, type WorldScroll } from './world';

/** The shared state. Only this file writes to it. */
export const world: WorldScroll & {
  /** The mouse's place on screen, from −1 to 1 each way (0, 0 in the middle). Stays 0 on touch screens. */
  pointer: [number, number];
  /** true when the visitor asked for less motion: the camera cuts instead of flying, nothing floats. */
  reduced: boolean;
  /** true on a computer with a mouse (not a phone or tablet). */
  finePointer: boolean;
} = { s: 0, hold: 0, out: 0, pointer: [0, 0], reduced: false, finePointer: false };

type Listener = () => void;
const listeners = new Set<Listener>();

/** Call `fn` whenever the scroll or the mouse moves. Returns a function that stops it. */
export function onWorldChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let lenis: Lenis | null = null;
let sections: HTMLElement[] = [];
let boxes: SectionBox[] = [];

/** Measure where each station section is on the page (again after the window or the page changes size). */
function measure() {
  boxes = sections.map((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight }));
  update();
}

function update() {
  if (boxes.length === 0) return;
  Object.assign(world, stationAt(window.scrollY, boxes, window.innerHeight));
  listeners.forEach((fn) => fn());
}

/** Start the store for these station sections, top to bottom. Safe to call once per page. */
export function startWorldScroll(stationSections: HTMLElement[]) {
  sections = stationSections;
  world.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  world.finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (world.finePointer && !world.reduced) {
    // smoothWheel: the mouse wheel glides. syncTouch off: touch scrolling stays native.
    // anchors: links like #station-matrix glide too. autoRaf: Lenis runs its own animation loop.
    lenis = new Lenis({ smoothWheel: true, syncTouch: false, anchors: true, autoRaf: true });
  }

  window.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(measure).observe(document.body);
  measure();

  if (world.finePointer && !world.reduced) {
    window.addEventListener(
      'pointermove',
      (e) => {
        world.pointer = [(e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1];
        listeners.forEach((fn) => fn());
      },
      { passive: true },
    );
  }
}

/** Scroll so that station k (0 to 4) sits in the middle of its still part. */
export function scrollToStation(k: number) {
  const box = boxes[k];
  if (!box) return;
  const y = box.top + box.height / 2 - window.innerHeight / 2;
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: world.reduced ? 'auto' : 'smooth' });
}
