import { describe, expect, it } from 'vitest';
import { book } from './book';
import { det2, det3, eig2, obliqueProject, isClose, matMul, matVec, rotationAngle, svdSteps, transformShape, UNIT_SQUARE, type Mat2, type Vec2 } from '../lib/linalg';
import {
  bigIdeas,
  CARD_3D_MATRIX,
  CARD_3D_PRESETS,
  cardCss,
  cardStories,
  chapterIdeas,
  chapterSummaries,
  cssMatrix,
  eigenScene,
  IDEA_EIGEN,
  IDEA_ORDINARY,
  IDEA_TRANSFORM,
  IDEA_V,
  IDEA_W,
  keyframesCss,
  lessonCountText,
  spanScene,
  SVD_CARD_MATRIX,
  SVD_SHOWCASE_MATRIX,
  transformationAt,
  vectorsScene,
} from './home';

const lesson = (section: string, part = 1) => ({ data: { section, part } });

describe('the homepage chapter map', () => {
  it('has one card for each of chapters 1 to 7, and none for the archived chapters 8 to 10', () => {
    expect(chapterSummaries([]).map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('uses the chapter titles from the book map', () => {
    expect(chapterSummaries([])[2].title).toBe('Determinants');
  });

  it('counts lessons per chapter', () => {
    const counts = chapterSummaries([lesson('1.1'), lesson('1.3', 1), lesson('1.3', 2), lesson('3.1')]).map(
      (c) => c.lessonCount,
    );
    expect(counts).toEqual([3, 0, 1, 0, 0, 0, 0]);
  });

  it('never counts a lesson in an archived section', () => {
    // 6.5 (least squares) and 7.1 are archived; 7.4 is active.
    const [, , , , , ch6, ch7] = chapterSummaries([lesson('6.5'), lesson('7.1'), lesson('7.4')]);
    expect(ch6.lessonCount).toBe(0);
    expect(ch7.lessonCount).toBe(1);
  });

  it('drops a chapter once all its sections are archived', () => {
    const allArchived = book.map((c) =>
      c.number === 3 ? { ...c, sections: c.sections.map((s) => ({ ...s, status: 'archived' as const })) } : c,
    );
    expect(chapterSummaries([], allArchived).map((c) => c.number)).toEqual([1, 2, 4, 5, 6, 7]);
  });

  it('has an idea sentence for every card', () => {
    for (const c of chapterSummaries([])) expect(chapterIdeas[c.number]).toBeTruthy();
  });

  it('says "1 lesson" but "2 lessons"', () => {
    expect(lessonCountText(1)).toBe('1 lesson');
    expect(lessonCountText(2)).toBe('2 lessons');
  });
});

describe('the chapter card stories', () => {
  const story = (chapter: number) => cardStories.find((s) => s.chapter === chapter)!;
  const last = (frames: Mat2[]) => frames[frames.length - 1];
  const close = (a: Mat2, b: Mat2) => a.flat().every((n, i) => isClose(n, b.flat()[i], 1e-9));

  it('has one story per chapter card, 1 to 7, each under 5 seconds (no pause button needed)', () => {
    expect(cardStories.map((s) => s.chapter)).toEqual(chapterSummaries([]).map((c) => c.number));
    for (const s of cardStories) expect(s.seconds).toBeLessThan(5);
  });

  it('starts every moving layer at the unmoved picture', () => {
    for (const s of cardStories) for (const p of s.panels) for (const l of p.layers) expect(close(l.frames[0], [[1, 0], [0, 1]])).toBe(true);
  });

  it('keeps the logo inside its panel at every frame, so nothing is cut off', () => {
    for (const s of cardStories) {
      for (const p of s.panels) {
        for (const l of p.layers.filter((l) => l.kind === 'logo')) {
          for (const m of l.frames) {
            for (const [x, y] of transformShape(m, UNIT_SQUARE)) {
              expect(x).toBeGreaterThanOrEqual(p.x[0]);
              expect(x).toBeLessThanOrEqual(p.x[1]);
              expect(y).toBeGreaterThanOrEqual(p.y[0]);
              expect(y).toBeLessThanOrEqual(p.y[1]);
            }
          }
        }
      }
    }
  });

  it('chapter 1 ends on a shear', () => {
    expect(last(story(1).panels[0].layers[0].frames)).toEqual([[1, 0], [1, 1]]);
  });

  it('chapter 2 ends in two different places: AB ≠ BA', () => {
    const [ab, ba] = story(2).panels.map((p) => last(p.layers[0].frames));
    expect(close(ab, ba)).toBe(false);
    expect(close(ab, [[1, 1], [1, 2]])).toBe(true);
    expect(close(ba, [[2, 1], [1, 1]])).toBe(true);
  });

  it('chapter 3 grows the area, then ends flipped (det < 0)', () => {
    const frames = story(3).panels[0].layers[0].frames;
    expect(Math.max(...frames.map(det2))).toBeCloseTo(2.25, 9);
    expect(det2(last(frames))).toBeCloseTo(-2.25, 9);
  });

  it('chapter 4 keeps the logo still and moves only the grid', () => {
    const [grid, logo] = story(4).panels[0].layers;
    expect(grid.kind).toBe('grid');
    expect(grid.frames.length).toBeGreaterThan(1);
    expect(logo.frames).toEqual([[[1, 0], [0, 1]]]);
  });

  it("chapter 5's dashed lines really are eigenvector lines of its matrix", () => {
    const panel = story(5).panels[0];
    const a = last(panel.layers[0].frames);
    expect(panel.lines).toHaveLength(2);
    for (const { direction, kind } of panel.lines) {
      expect(kind).toBe('eigen');
      const [x, y] = matVec(a, direction);
      expect(x * direction[1] - y * direction[0]).toBeCloseTo(0, 9); // A·v is on v's line
    }
    expect(eig2(a).kind).toBe('lines');
  });

  it('chapter 6 ends on a projection (P² = P) onto its line', () => {
    const panel = story(6).panels[0];
    const p = last(panel.layers[0].frames);
    expect(close(matMul(p, p), p)).toBe(true);
    const [x, y] = matVec(p, [0.3, 0.9] as Vec2);
    const [dx, dy] = panel.lines[0].direction;
    expect(x * dy - y * dx).toBeCloseTo(0, 9); // lands on the line
  });

  it('chapter 7 is rotate, stretch, rotate, and ends exactly on its matrix', () => {
    const frames = story(7).panels[0].layers[0].frames;
    expect(close(last(frames), SVD_CARD_MATRIX)).toBe(true);
    expect(det2(SVD_CARD_MATRIX)).toBeGreaterThan(0);
    const { Vt, S, R } = svdSteps(SVD_CARD_MATRIX);
    expect(det2(Vt)).toBeCloseTo(1, 9);
    expect(det2(R)).toBeCloseTo(1, 9);
    expect(S[0][0]).toBeCloseTo(1.4, 9);
    expect(S[1][1]).toBeCloseTo(0.6, 9);
  });
});

describe('the card CSS', () => {
  it('writes matrix() with the columns in SVG order, at most 4 decimals, and no "-0"', () => {
    expect(cssMatrix([[1, 0], [0.5, 1]])).toBe('matrix(1,0,0.5,1,0,0)');
    expect(cssMatrix([[1 / 3, -0], [-0.00001, 2]])).toBe('matrix(0.3333,0,0,2,0,0)');
  });

  it('spreads the keyframes evenly from 0% to 100%', () => {
    const css = keyframesCss('x', [[[1, 0], [0, 1]], [[2, 0], [0, 1]], [[3, 0], [0, 1]]]);
    expect(css).toBe('@keyframes x{0%{transform:matrix(1,0,0,1,0,0)}50%{transform:matrix(2,0,0,1,0,0)}100%{transform:matrix(3,0,0,1,0,0)}}');
  });

  it('rests on the last frame, plays only without reduced motion, and skips layers that never move', () => {
    const css = cardCss(cardStories[3]); // chapter 4: a moving grid and a still logo
    expect(css).toContain('.home .card-4-p0-l0{transform:matrix(1,0.3,-0.4,1,0,0)');
    expect(css).toContain('@media (prefers-reduced-motion:no-preference)');
    expect(css).toContain('.card:is(:hover,:focus-visible,.in-view) .card-4-p0-l0{animation:card-4-p0-l0 1.6s linear both}');
    expect(css).not.toContain('card-4-p0-l1');
  });
});

describe('the SVD showcase matrix', () => {
  const a = SVD_SHOWCASE_MATRIX;
  const { Vt, S, R } = svdSteps(a);

  it('has det > 0, so the three steps really are rotate, stretch, rotate (no flip hidden in the stretch)', () => {
    expect(det2(a)).toBeGreaterThan(0);
    expect(S[1][1]).toBeGreaterThan(0);
  });

  it('turns at least 20° in both rotations, so the turns are easy to see', () => {
    expect(Math.abs(rotationAngle(Vt)!)).toBeGreaterThanOrEqual(20);
    expect(Math.abs(rotationAngle(R)!)).toBeGreaterThanOrEqual(20);
  });

  it('stretches by two clearly different amounts, so the circle becomes a clear ellipse', () => {
    expect(S[0][0] / S[1][1]).toBeGreaterThan(2);
  });

  it('gives A back: U Σ Vᵀ = A', () => {
    const back = matMul(R, matMul(S, Vt));
    back.flat().forEach((n, i) => expect(n).toBeCloseTo(a.flat()[i], 12));
  });
});

describe('the four big ideas', () => {
  /** The cross product of two plane vectors: 0 exactly when they lie on one line through the origin. */
  const cross = ([a, b]: Vec2, [c, d]: Vec2) => a * d - b * c;

  it('has four ideas in order: vectors, span, linear transformations, eigenvectors', () => {
    expect(bigIdeas.map((i) => i.name)).toEqual(['Vectors', 'Span', 'Linear transformations', 'Eigenvectors']);
  });

  it('vectors: starts with nothing, ends with v, w walked from v, and v + w', () => {
    expect(vectorsScene(0)).toEqual({ v: [0, 0], wTip: null, sum: null });
    const end = vectorsScene(1);
    expect(end.v).toEqual(IDEA_V);
    expect(end.wTip).toEqual([IDEA_V[0] + IDEA_W[0], IDEA_V[1] + IDEA_W[1]]);
    expect(end.sum).toEqual(end.wTip); // walking v then w lands where v + w points
  });

  it('span: the points spread out first, covering the plane (u and w are not on one line)', () => {
    const mid = spanScene(0.5);
    expect(mid.dots).toHaveLength(49);
    expect(Math.abs(cross(mid.u, mid.w))).toBeGreaterThan(0.5);
  });

  it('span: at the end w lies on u\'s line, and every point is on that one line', () => {
    const end = spanScene(1);
    expect(cross(end.u, end.w)).toBeCloseTo(0, 12);
    for (const p of end.dots) expect(cross(end.u, p)).toBeCloseTo(0, 9);
  });

  it('linear transformations: starts unmoved and ends exactly on its matrix', () => {
    expect(transformationAt(0)).toEqual([[1, 0], [0, 1]]);
    expect(transformationAt(1)).toEqual(IDEA_TRANSFORM);
  });

  it('eigenvectors: the arrows on the dashed lines stay on them, stretched by 2 and by 0.5', () => {
    const end = eigenScene(1);
    expect(end.matrix).toEqual(IDEA_EIGEN);
    expect(end.lines).toHaveLength(2);
    end.lines.forEach((d, i) => expect(cross(d, end.eigenArrows[i])).toBeCloseTo(0, 9));
    const stretch = end.lines.map((d) => eig2(IDEA_EIGEN).kind === 'lines' && matVec(IDEA_EIGEN, d)[0] / d[0]);
    expect(stretch.sort()).toEqual([0.5, 2]);
  });

  it('eigenvectors: the ordinary arrow is knocked off its line', () => {
    expect(Math.abs(cross(IDEA_ORDINARY, eigenScene(1).ordinary))).toBeGreaterThan(0.5);
  });
});

describe('the 3D card', () => {
  it('starts on a shear that leans k̂ over to (1, 0, 1), which keeps volume (det = 1)', () => {
    expect(CARD_3D_MATRIX[2]).toEqual([1, 0, 1]);
    expect(det3(CARD_3D_MATRIX)).toBe(1);
    expect(CARD_3D_PRESETS[0].matrix).toBe(CARD_3D_MATRIX);
  });

  it("draws its still picture without flattening: the pictures of the box's three edges point clearly different ways", () => {
    const [i, j, k] = CARD_3D_MATRIX.map(obliqueProject);
    const sinAngle = (a: Vec2, b: Vec2) => Math.abs(a[0] * b[1] - a[1] * b[0]) / (Math.hypot(...a) * Math.hypot(...b));
    for (const [a, b] of [[i, j], [j, k], [k, i]]) expect(sinAngle(a, b)).toBeGreaterThan(0.4); // more than about 24° apart
  });
});
