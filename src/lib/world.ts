// The maths of the homepage world (docs/homepage-brief.md §4): where the scroll is among the 5 stations,
// where the camera should be, and where the lattice dots sit. Plain numbers only: nothing here draws,
// so it can all be tested. The drawing is in src/components/world/.
//
// Directions: three.js points y up, so the maths plane lies flat in three.js's x–z floor.
// The maths point (x, y) is drawn at (x, 0, −y): x to the right, y away from a camera that looks from the front.
import { easeInOut, lerp, matVec, type Mat2, type Vec2 } from './linalg';

export type Vec3 = [number, number, number];

/** Where a station's camera sits, seen from the origin. Angles are in degrees. */
export interface StationPose {
  /** Turn around the vertical axis: 0 looks from the front (from −y towards +y), positive turns to the right. */
  azimuth: number;
  /** Height angle: 0 looks along the floor, 90 looks straight down. */
  elevation: number;
  /** How far the camera is from the point it looks at. */
  distance: number;
  /** The point it looks at is this high above the origin (the plane is at 0). */
  lookHeight: number;
  /** Extra turn, in degrees, while you scroll through the station (0: the camera stays put). */
  sweep: number;
}

/** One station section's place on the page, in pixels from the top. */
export interface SectionBox {
  top: number;
  height: number;
}

/** Where the scroll is among the stations. */
export interface WorldScroll {
  /** 0 to (stations − 1). A whole number means "at that station"; 2.5 is halfway from station 3 to 4 (counting from 1). */
  s: number;
  /** 0 to 1: how far through the current station's still part (only whole-number s). */
  hold: number;
  /** 0 to 1: how far the world has faded out after the last station (0 = fully there). */
  out: number;
}

/** The middle part of each section (as a fraction of its height) where the camera holds still. */
export const HOLD_START = 0.25;
export const HOLD_END = 0.75;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Where the scroll is among the stations, measured at the middle of the screen.
 * In each section's middle half the camera holds still (s is a whole number, `hold` runs 0 → 1);
 * from the end of one middle half to the start of the next, s runs smoothly to the next whole number.
 */
export function stationAt(scrollY: number, sections: SectionBox[], viewport: number): WorldScroll {
  const centre = scrollY + viewport / 2;
  const holdStart = (k: number) => sections[k].top + HOLD_START * sections[k].height;
  const holdEnd = (k: number) => sections[k].top + HOLD_END * sections[k].height;
  const last = sections.length - 1;

  // The world fades out when the last section's bottom comes up through the bottom of the screen.
  const lastBottom = sections[last].top + sections[last].height;
  const out = clamp01((scrollY + viewport - lastBottom) / (0.6 * viewport));

  if (centre <= holdStart(0)) return { s: 0, hold: 0, out };
  for (let k = 0; k <= last; k++) {
    if (centre <= holdEnd(k)) {
      if (centre >= holdStart(k)) return { s: k, hold: (centre - holdStart(k)) / (holdEnd(k) - holdStart(k)), out };
      // Between station k − 1 and station k.
      const t = (centre - holdEnd(k - 1)) / (holdStart(k) - holdEnd(k - 1));
      return { s: k - 1 + t, hold: 0, out };
    }
  }
  return { s: last, hold: 1, out };
}

/** The camera's place and the point it looks at, both in three.js coordinates. */
export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

/** One station's pose as numbers, with its sweep already turned by `hold`. */
function poseNumbers(p: StationPose, hold: number) {
  return { azimuth: p.azimuth + p.sweep * hold, elevation: p.elevation, distance: p.distance, lookHeight: p.lookHeight };
}

/**
 * Where the camera should be for scroll position s (and `hold` inside a station).
 * Between two stations it slides from one pose to the next along a sphere around the origin (so it swings
 * round instead of cutting through the middle), eased so it starts and stops gently.
 * `aspect` is the screen's width ÷ height: on a tall phone screen the camera steps back so the middle still fits.
 */
export function cameraPose(s: number, hold: number, stations: StationPose[], aspect = 16 / 9): CameraPose {
  const k = Math.min(stations.length - 1, Math.max(0, Math.floor(s)));
  const t = s - k;
  let n = poseNumbers(stations[k], t > 0 ? 1 : hold);
  if (t > 0 && k + 1 < stations.length) {
    const next = poseNumbers(stations[k + 1], 0);
    const e = easeInOut(t);
    n = {
      azimuth: lerp(n.azimuth, next.azimuth, e),
      elevation: lerp(n.elevation, next.elevation, e),
      distance: lerp(n.distance, next.distance, e),
      lookHeight: lerp(n.lookHeight, next.lookHeight, e),
    };
  }
  const distance = n.distance * portraitStepBack(aspect);
  const az = (n.azimuth * Math.PI) / 180;
  const el = (n.elevation * Math.PI) / 180;
  return {
    position: [
      distance * Math.cos(el) * Math.sin(az),
      n.lookHeight + distance * Math.sin(el),
      distance * Math.cos(el) * Math.cos(az),
    ],
    target: [0, n.lookHeight, 0],
  };
}

/** How much further back the camera goes on a tall screen: 1 on a wide screen, up to 1.6 on a phone held upright. */
export function portraitStepBack(aspect: number): number {
  return aspect >= 1 ? 1 : Math.min(1.6, 1 + 0.9 * (1 - aspect));
}

/** The maths point (x, y) in three.js coordinates, on the floor. */
export function toWorld([x, y]: Vec2): Vec3 {
  return [x, 0, -y + 0];
}

/**
 * The lattice: every whole-number point (x, y) with −n ≤ x, y ≤ n, moved by A, in three.js coordinates,
 * as one flat list [x0, y0, z0, x1, y1, z1, …] (the shape three.js wants for points).
 */
export function latticePoints(n: number, A: Mat2): Float32Array {
  const side = 2 * n + 1;
  const out = new Float32Array(side * side * 3);
  let i = 0;
  for (let y = -n; y <= n; y++) {
    for (let x = -n; x <= n; x++) {
      out.set(toWorld(matVec(A, [x, y])), i);
      i += 3;
    }
  }
  return out;
}

/** Gaps between frames longer than this (in seconds) mean "nothing moved, so nothing was drawn", not "slow". */
export const IDLE_GAP = 0.2;

/**
 * The frame rate while the world is actually moving: the average over these gaps between frames,
 * leaving out idle pauses (the world only draws when something moves, so a still page has long gaps).
 * null until there are enough moving frames to judge.
 */
export function movingFrameRate(gaps: number[], enough = 40): number | null {
  const moving = gaps.filter((g) => g > 0 && g < IDLE_GAP);
  if (moving.length < enough) return null;
  return moving.length / moving.reduce((a, b) => a + b, 0);
}
