import { describe, expect, it } from 'vitest';
import { STATIONS } from '../content/home';
import {
  cameraPose,
  fromWorld,
  latticePoints,
  movingFrameRate,
  portraitStepBack,
  rayToFloor,
  snapTip,
  stationAt,
  toWorld,
  type SectionBox,
} from './world';

// Five sections of 1600px each, starting 0px from the top, on an 1000px-tall screen.
const VIEW = 1000;
const sections: SectionBox[] = [0, 1, 2, 3, 4].map((k) => ({ top: k * 1600, height: 1600 }));
/** The scroll that puts the middle of the screen at this many pixels from the top. */
const centredAt = (y: number) => y - VIEW / 2;
const poses = STATIONS.map((s) => s.pose);

describe('stationAt', () => {
  it('starts at station 1', () => {
    const top = stationAt(0, sections, VIEW);
    expect(top.s).toBe(0);
    expect(top.out).toBe(0);
  });

  it('holds still on a whole number in the middle half of each section', () => {
    for (let k = 0; k < 5; k++) {
      const middle = stationAt(centredAt(k * 1600 + 800), sections, VIEW);
      expect(middle.s).toBe(k);
      expect(middle.hold).toBeCloseTo(0.5);
    }
  });

  it('is halfway between stations at a section boundary', () => {
    expect(stationAt(centredAt(1600), sections, VIEW).s).toBeCloseTo(0.5);
    expect(stationAt(centredAt(3 * 1600), sections, VIEW).s).toBeCloseTo(2.5);
  });

  it('never goes backwards as you scroll down', () => {
    let before = -1;
    for (let y = 0; y < 9000; y += 37) {
      const { s } = stationAt(y, sections, VIEW);
      expect(s).toBeGreaterThanOrEqual(before);
      before = s;
    }
  });

  it('fades the world out after the last section', () => {
    expect(stationAt(centredAt(4 * 1600 + 800), sections, VIEW).out).toBe(0);
    expect(stationAt(8000 + 600, sections, VIEW).out).toBe(1);
  });
});

describe('cameraPose', () => {
  const close = (a: number[], b: number[]) => a.forEach((n, i) => expect(n).toBeCloseTo(b[i], 6));

  it('looks at the point above the origin', () => {
    expect(cameraPose(0, 0, poses).target).toEqual([0, poses[0].lookHeight, 0]);
  });

  it("is at the station's distance from the point it looks at", () => {
    const { position, target } = cameraPose(1, 0, poses);
    expect(Math.hypot(...position.map((n, i) => n - target[i]))).toBeCloseTo(poses[1].distance);
  });

  it("doesn't jump when a station's still part ends and the trip to the next begins", () => {
    for (let k = 0; k < 4; k++) {
      close(cameraPose(k, 1, poses).position, cameraPose(k + 1e-9, 0, poses).position);
      close(cameraPose(k + 1, 0, poses).position, cameraPose(k + 1 - 1e-9, 0, poses).position);
    }
  });

  it('turns the last station by its sweep while you scroll through it', () => {
    const start = cameraPose(4, 0, poses).position;
    const end = cameraPose(4, 1, poses).position;
    const angle = (p: number[]) => (Math.atan2(p[0], p[2]) * 180) / Math.PI;
    expect(angle(end) - angle(start)).toBeCloseTo(poses[4].sweep);
  });

  it('steps back on a phone held upright, never on a wide screen', () => {
    expect(portraitStepBack(16 / 9)).toBe(1);
    expect(portraitStepBack(9 / 19.5)).toBeGreaterThan(1.4);
    expect(portraitStepBack(0.1)).toBe(1.6);
  });
});

describe('latticePoints', () => {
  it('has every whole-number point from −n to n, flat on the floor', () => {
    const points = latticePoints(20, [[1, 0], [0, 1]]);
    expect(points.length).toBe(41 * 41 * 3);
    expect([...points.slice(0, 3)]).toEqual(toWorld([-20, -20]));
    for (let i = 1; i < points.length; i += 3) expect(points[i]).toBe(0);
  });

  it('moves each point p to A·p', () => {
    // A shear: (x, y) → (x + y, y). Its columns are î → (1, 0) and ĵ → (1, 1).
    const points = latticePoints(1, [[1, 0], [1, 1]]);
    // Order: y = −1 row, then y = 0, then y = 1; x from −1 to 1. The last point is (1, 1) → (2, 1).
    expect([...points.slice(-3)]).toEqual(toWorld([2, 1]));
  });
});

describe('movingFrameRate', () => {
  it('waits until it has seen enough moving frames', () => {
    expect(movingFrameRate(Array(10).fill(1 / 60))).toBeNull();
  });

  it('averages the moving frames and ignores idle pauses', () => {
    const gaps = [...Array(50).fill(1 / 60), 3, 5, 1.2];
    expect(movingFrameRate(gaps)).toBeCloseTo(60);
  });

  it('sees a slow device', () => {
    expect(movingFrameRate(Array(50).fill(1 / 25))).toBeCloseTo(25);
  });
});

describe('fromWorld', () => {
  it('undoes toWorld', () => {
    expect(fromWorld(toWorld([2, -3]))).toEqual([2, -3]);
  });
});

describe('rayToFloor', () => {
  it('finds where a line pointing down meets the floor', () => {
    // From 2 up, going down and forward at 45°: it lands 2 ahead.
    expect(rayToFloor([0, 2, 0], [0, -1, -1])).toEqual([0, 0, -2]);
  });

  it('is null for a line that never comes down to the floor', () => {
    expect(rayToFloor([0, 2, 0], [0, 0, -1])).toBeNull(); // level
    expect(rayToFloor([0, 2, 0], [0, 1, -1])).toBeNull(); // into the sky
  });
});

describe('snapTip', () => {
  it('moves in steps of 0.1', () => {
    expect(snapTip([1.43, -0.77])).toEqual([1.4, -0.8]);
  });

  it('clicks onto a lattice dot when it is close', () => {
    expect(snapTip([1.85, 3.12])).toEqual([2, 3]);
  });

  it('stays inside ±4', () => {
    expect(snapTip([9, -12])).toEqual([4, -4]);
  });

  it("doesn't click onto a dot without the magnet (arrow keys)", () => {
    expect(snapTip([1.1, 2], false)).toEqual([1.1, 2]);
  });
});
