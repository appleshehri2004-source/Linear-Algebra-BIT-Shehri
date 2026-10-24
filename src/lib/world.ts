// The maths of the homepage world (docs/homepage-brief.md §4): where the scroll is among the 5 stations,
// where the camera should be, and where the lattice dots sit. Plain numbers only: nothing here draws,
// so it can all be tested. The drawing is in src/components/world/.
//
// Directions: three.js points y up, so the maths plane lies flat in three.js's x–z floor.
// The maths point (x, y) is drawn at (x, 0, −y): x to the right, y away from a camera that looks from the front.
import { clampVec, easeInOut, lerp, matVec, snapVec, type Mat2, type Vec2 } from './linalg';

export type Vec3 = [number, number, number];

/** Where a station's camera sits, seen from the origin. Angles are in degrees. */
export interface StationPose {
  /** Turn around the vertical axis: 0 looks from the front (from −y towards +y), positive turns to the right. */
  azimuth: number;
  /** Height angle: 0 looks along the floor, 90 looks straight down. */
  elevation: number;
  /** How far the camera is from the point it looks at. */
  distance: number;
  /** The point it looks at is this high above the plane (the plane is at 0). */
  lookHeight: number;
  /** The maths point (x, y) on the plane that the camera looks at, e.g. the middle of the station's picture.
   *  Leave it out to look at the origin. */
  look?: Vec2;
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
  const [lookX, lookY] = p.look ?? [0, 0];
  return {
    azimuth: p.azimuth + p.sweep * hold,
    elevation: p.elevation,
    distance: p.distance,
    lookHeight: p.lookHeight,
    lookX,
    lookY,
  };
}

/**
 * Where the camera should be for scroll position s (and `hold` inside a station).
 * Between two stations it slides from one pose to the next along a sphere around the point it looks at (so it
 * swings round instead of cutting through the middle), eased so it starts and stops gently.
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
      lookX: lerp(n.lookX, next.lookX, e),
      lookY: lerp(n.lookY, next.lookY, e),
    };
  }
  const distance = n.distance * portraitStepBack(aspect);
  const az = (n.azimuth * Math.PI) / 180;
  const el = (n.elevation * Math.PI) / 180;
  const [tx, , tz] = toWorld([n.lookX, n.lookY]);
  return {
    position: [
      tx + distance * Math.cos(el) * Math.sin(az),
      n.lookHeight + distance * Math.sin(el),
      tz + distance * Math.cos(el) * Math.cos(az),
    ],
    target: [tx, n.lookHeight, tz],
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
 * How much station k is "there" at scroll position s: 1 near the station (within 0.15), 0 from halfway to its
 * neighbours (0.55 away), easing smoothly in between. Stations use it to fade in and out, and station 2 uses it
 * to slide its matrix in from the identity.
 */
export function stationPresence(s: number, k: number): number {
  const t = Math.min(1, Math.max(0, (Math.abs(s - k) - 0.15) / 0.4));
  return 1 - t * t * (3 - 2 * t); // smoothstep, so it eases instead of starting and stopping sharply
}

/**
 * Like stationPresence, but for a run of stations: 1 at every station from `first` to `last` and all the way in
 * between, easing out beyond them. Stations 2 and 3 share one matrix, so the world stays bent from one to the other.
 */
export function presenceAcross(s: number, first: number, last: number): number {
  if (s >= first && s <= last) return 1;
  return stationPresence(s, s < first ? first : last);
}

/**
 * The 2×2 matrix A as a three.js transform of the floor, as 16 numbers row by row (for Matrix4.set).
 * The maths point (x, y) is drawn at (x, 0, −y), so A's entries move into the x and z places, with signs flipped
 * where y turns into −z. Heights (three.js y) are left alone.
 */
export function worldMatrix4([[a, c], [b, d]]: Mat2): number[] {
  // prettier-ignore
  return [
    a, 0, -b, 0,
    0, 1, 0, 0,
    -c, 0, d, 0,
    0, 0, 0, 1,
  ].map((n) => n + 0); // + 0 turns −0 into 0
}

/** The opposite of toWorld: the three.js floor point (x, 0, z) as the maths point (x, −z). */
export function fromWorld([x, , z]: Vec3): Vec2 {
  return [x + 0, -z + 0];
}

/**
 * Where a line from `origin` going along `direction` meets the floor (height 0), e.g. the line from the camera
 * through your finger. null if it never does: pointing level or up into the sky, or the floor is behind it.
 */
export function rayToFloor(origin: Vec3, direction: Vec3): Vec3 | null {
  if (direction[1] >= -1e-9) return null;
  const t = -origin[1] / direction[1];
  if (t < 0) return null;
  return [origin[0] + t * direction[0], 0, origin[2] + t * direction[2]];
}

/** How far a dragged arrow tip may go from the origin in x and in y. */
export const TIP_LIMIT = 4;
/** A tip this close (in x and in y) to a lattice dot clicks onto it. */
export const TIP_MAGNET = 0.2;

/**
 * Where a dragged arrow tip goes: kept inside ±TIP_LIMIT, in steps of 0.1, and onto the nearest lattice dot
 * (whole numbers) when it's within TIP_MAGNET of it, so whole-number vectors are easy to hit.
 * magnet = false (the arrow keys, which move by exactly 0.1): no clicking onto dots, or 1.1 would jump back to 1.
 */
export function snapTip(p: Vec2, magnet = true): Vec2 {
  const inside = clampVec(p, TIP_LIMIT);
  const dot = snapVec(inside, 1);
  if (magnet && Math.abs(dot[0] - inside[0]) <= TIP_MAGNET && Math.abs(dot[1] - inside[1]) <= TIP_MAGNET) return dot;
  return snapVec(inside, 0.1);
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
