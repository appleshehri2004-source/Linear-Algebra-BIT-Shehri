// The homepage's chapter map: one card per chapter that has active sections, in the book's order.
// Everything comes from the book map (src/content/book.ts), so archiving a section changes the cards by itself.
import { book, type BookChapter, type LessonPlace } from './book';
import {
  add,
  eig2,
  identity,
  lerpVec,
  matVec,
  matMul,
  matrixAt,
  projectionMatrix,
  roundTo,
  rotation,
  samplePath,
  scale,
  sequenceAt,
  svdStepsAt,
  svgMatrix,
  type Mat2,
  type Mat3,
  type Vec2,
} from '../lib/linalg';
import type { StationPose } from '../lib/world';

/** What one chapter card shows. */
export interface ChapterSummary {
  number: number;
  title: string;
  /** How many lessons the chapter has in active sections. */
  lessonCount: number;
}

/**
 * One summary per chapter with at least one active section. Lessons in archived sections don't count.
 * `chapters` is the whole book unless a test passes a smaller one.
 */
export function chapterSummaries(lessons: { data: LessonPlace }[], chapters: BookChapter[] = book): ChapterSummary[] {
  return chapters
    .filter((chapter) => chapter.sections.some((s) => s.status === 'active'))
    .map((chapter) => {
      const active = chapter.sections.filter((s) => s.status === 'active').map((s) => s.number);
      return {
        number: chapter.number,
        title: chapter.title,
        lessonCount: lessons.filter((l) => active.includes(l.data.section)).length,
      };
    });
}

/** "1 lesson", "14 lessons". */
export function lessonCountText(n: number): string {
  return n === 1 ? '1 lesson' : `${n} lessons`;
}

/** The one idea each chapter's little animation will show (session 5), as a sentence under the title. */
export const chapterIdeas: Record<number, string> = {
  1: 'A matrix moves the whole plane: here, a shear.',
  2: 'Do two moves in one order, then the other: you land in different places.',
  3: 'The determinant is the area scale. Below zero, the shape flips over.',
  4: 'The same shape, measured on a tilted grid.',
  5: 'Stretch the plane: the eigenvector lines stay put.',
  6: 'Project the shape flat onto a line.',
  7: 'Any matrix is a rotation, a stretch, then a rotation.',
};

// ---- The chapter cards' little animations ----
// Each card's picture is one or two panels. A panel shows part of the plane (x and y ranges, maths coordinates) with
// layers that a matrix moves: the BIT logo, or a grid. Every frame is worked out here, from linalg.ts, when the site
// is built; ChapterCardPicture.astro draws the panels and turns the frames into CSS @keyframes.

/** Something in a panel that a matrix moves, with its frames (one frame: it stays still). */
export interface CardLayer {
  kind: 'logo' | 'grid';
  frames: Mat2[];
}

/** A straight line through the origin along `direction`: dashed for an eigenvector, solid for a target line. */
export interface CardLine {
  direction: Vec2;
  kind: 'eigen' | 'target';
}

export interface CardPanel {
  x: [number, number];
  y: [number, number];
  layers: CardLayer[];
  lines: CardLine[];
  /** A few words under the panel, when a card has two. */
  caption?: string;
}

export interface CardStory {
  chapter: number;
  /** How long the animation plays, in seconds. Under 5 s, so it needs no pause button. */
  seconds: number;
  panels: CardPanel[];
}

/** 21 frames: the browser only ever blends two nearly equal matrices. */
const FRAMES = 21;
const still: Mat2[] = [identity()];
const moving = (path: (t: number) => Mat2) => samplePath(path, FRAMES);
/** A panel 4 : 3 wide like the card's picture box, centred on `centre`, `width` wide. */
const box = ([cx, cy]: Vec2, width: number): Pick<CardPanel, 'x' | 'y'> => ({
  x: [cx - width / 2, cx + width / 2],
  y: [cy - (width * 3) / 8, cy + (width * 3) / 8],
});

// The matrices, all stored as columns.
const SHEAR_RIGHT: Mat2 = [[1, 0], [1, 1]]; // ĵ leans right: (0, 1) → (1, 1)
const SHEAR_UP: Mat2 = [[1, 1], [0, 1]]; // î leans up: (1, 0) → (1, 1)
const GROW: Mat2 = [[1.5, 0], [0, 1.5]];
const MIRROR: Mat2 = [[-1, 0], [0, 1]];
const TILTED_BASIS: Mat2 = [[1, 0.3], [-0.4, 1]];
const SYMMETRIC: Mat2 = [[1.5, 0.5], [0.5, 1.5]]; // eigenvectors (1, 1) with λ = 2 and (−1, 1) with λ = 1
const LINE: Vec2 = [1, 0.5];
const PROJECT = projectionMatrix(LINE)!;
/** For the SVD card: turn −50°, stretch by 1.4 and 0.6, turn 35°. det > 0, so the steps are rotate, stretch, rotate. */
export const SVD_CARD_MATRIX: Mat2 = matMul(rotation(35), matMul([[1.4, 0], [0, 0.6]], rotation(-50)));

const eigenLines = (a: Mat2): CardLine[] => {
  const eigen = eig2(a);
  return eigen.kind === 'lines' ? eigen.pairs.map((p) => ({ direction: p.direction, kind: 'eigen' as const })) : [];
};

/** The seven stories, chapter 1 to 7. */
export const cardStories: CardStory[] = [
  // Ch 1, linear transformations: a shear.
  { chapter: 1, seconds: 1.6, panels: [{ ...box([0.9, 0.5], 3.2), layers: [{ kind: 'logo', frames: moving((t) => matrixAt(SHEAR_RIGHT, t)) }], lines: [] }] },
  // Ch 2, matrix algebra: the same two shears in the two orders end in different places (AB ≠ BA).
  {
    chapter: 2,
    seconds: 2.6,
    panels: [
      { x: [-0.4, 3.1], y: [-0.4, 3.1], layers: [{ kind: 'logo', frames: moving((t) => sequenceAt([SHEAR_RIGHT, SHEAR_UP], t)) }], lines: [], caption: '→ then ↑' },
      { x: [-0.4, 3.1], y: [-0.4, 3.1], layers: [{ kind: 'logo', frames: moving((t) => sequenceAt([SHEAR_UP, SHEAR_RIGHT], t)) }], lines: [], caption: '↑ then →' },
    ],
  },
  // Ch 3, determinants: the area grows (det = 2.25), then the logo flips over (det = −2.25).
  { chapter: 3, seconds: 2.6, panels: [{ ...box([0, 0.85], 3.8), layers: [{ kind: 'logo', frames: moving((t) => sequenceAt([GROW, MIRROR], t)) }], lines: [] }] },
  // Ch 4, vector spaces: the logo stays put while the grid tilts to a new basis.
  {
    chapter: 4,
    seconds: 1.6,
    panels: [{ ...box([0.3, 0.45], 3.6), layers: [{ kind: 'grid', frames: moving((t) => matrixAt(TILTED_BASIS, t)) }, { kind: 'logo', frames: still }], lines: [] }],
  },
  // Ch 5, eigenvalues: the logo stretches, and the two eigenvector lines stay where they are.
  { chapter: 5, seconds: 1.6, panels: [{ ...box([0.7, 0.9], 3.8), layers: [{ kind: 'logo', frames: moving((t) => matrixAt(SYMMETRIC, t)) }], lines: eigenLines(SYMMETRIC) }] },
  // Ch 6, orthogonality: the logo is projected flat onto a line.
  { chapter: 6, seconds: 1.6, panels: [{ ...box([0.9, 0.55], 3.2), layers: [{ kind: 'logo', frames: moving((t) => matrixAt(PROJECT, t)) }], lines: [{ direction: LINE, kind: 'target' }] }] },
  // Ch 7, the SVD: rotate, stretch, rotate.
  { chapter: 7, seconds: 3.2, panels: [{ ...box([0.8, 0.15], 3.6), layers: [{ kind: 'logo', frames: moving((t) => svdStepsAt(SVD_CARD_MATRIX, t)) }], lines: [] }] },
];

/** A number for CSS: at most 4 decimal places, never "-0". */
const cssNumber = (n: number) => String(roundTo(n, 4) + 0);

/** CSS's matrix() for m: the same six numbers as SVG's (svgMatrix), with commas. */
export function cssMatrix(m: Mat2): string {
  return `matrix(${svgMatrix(m).map(cssNumber).join(',')})`;
}

/** An @keyframes rule that steps through the frames evenly, from 0% to 100%. */
export function keyframesCss(name: string, frames: Mat2[]): string {
  const stops = frames.map((m, i) => `${cssNumber((100 * i) / (frames.length - 1))}%{transform:${cssMatrix(m)}}`);
  return `@keyframes ${name}{${stops.join('')}}`;
}

/** The class name of one layer, e.g. "card-3-p0-l0". */
export const layerClass = (chapter: number, panel: number, layer: number) => `card-${chapter}-p${panel}-l${layer}`;

/**
 * All the CSS for one card. Each moving layer rests on its last frame. It plays from the first frame when the
 * card is hovered, reached with Tab, or (on touch screens) scrolled into view (the "in-view" class), unless the
 * visitor asked for less motion: then it just stays on the last frame.
 */
export function cardCss(story: CardStory): string {
  const rules: string[] = [];
  story.panels.forEach((panel, p) =>
    panel.layers.forEach((layer, l) => {
      if (layer.frames.length < 2) return;
      const name = layerClass(story.chapter, p, l);
      const last = layer.frames[layer.frames.length - 1];
      rules.push(
        `.home .${name}{transform:${cssMatrix(last)};transform-box:view-box;transform-origin:0 0}`,
        `@media (prefers-reduced-motion:no-preference){.home .card:is(:hover,:focus-visible,.in-view) .${name}{animation:${name} ${story.seconds}s linear both}}`,
        keyframesCss(name, layer.frames),
      );
    }),
  );
  return rules.join('\n');
}

// ---- The SVD showcase ----

/**
 * The SVD showcase's matrix: î lands on (1.2, 0.4) and ĵ on (0.6, 1). det = 0.96 > 0, so its three steps are a
 * real rotate (about −42°), stretch (about ×1.61 and ×0.60) and rotate (about 37°). The tests check all of that.
 */
export const SVD_SHOWCASE_MATRIX: Mat2 = [[1.2, 0.4], [0.6, 1]];

// ---- The four big ideas ----
// Four short texts and, for each, an animation the pinned picture plays when the text scrolls into view
// (BigIdeas.tsx). Each scene below says what to draw at time t, from 0 to 1, using only linalg.ts.

export interface BigIdea {
  name: string;
  text: string;
}

export const bigIdeas: BigIdea[] = [
  {
    name: 'Vectors',
    text: 'A vector is an arrow from the origin, and also a list of numbers: how far right, how far up. Adding vectors is walking one arrow, then the other.',
  },
  {
    name: 'Span',
    text: 'Stretch two arrows by any amounts and add them. Usually you can reach every point of the plane. When the arrows line up, you are stuck on one line.',
  },
  {
    name: 'Linear transformations',
    text: 'A matrix moves the whole plane at once. Grid lines stay straight, evenly spaced and parallel, and the origin stays put. Watch where î and ĵ land, and you know where everything lands.',
  },
  {
    name: 'Eigenvectors',
    text: 'Most arrows get knocked off their line when the plane moves. A few only get longer or shorter. Those are the eigenvectors, and how much they stretch is the eigenvalue.',
  },
];

/** How far (0 to 1) time t is through the part of the animation from `start` to `end`. */
const part = (t: number, start: number, end: number) => Math.min(1, Math.max(0, (t - start) / (end - start)));

// Idea 1, vectors: v grows from the origin, w is walked from v's tip, then v + w appears.
export const IDEA_V: Vec2 = [2, 1];
export const IDEA_W: Vec2 = [-0.5, 1.2];

export interface VectorsScene {
  /** v's tip. */
  v: Vec2;
  /** w's tip, drawn from v's tip; null before w starts. */
  wTip: Vec2 | null;
  /** v + w's tip, drawn from the origin; null before it starts. */
  sum: Vec2 | null;
}

export function vectorsScene(t: number): VectorsScene {
  const origin: Vec2 = [0, 0];
  const v = lerpVec(origin, IDEA_V, part(t, 0, 0.35));
  const wPart = part(t, 0.4, 0.7);
  const sumPart = part(t, 0.75, 1);
  return {
    v,
    wTip: t < 0.4 ? null : add(IDEA_V, lerpVec(origin, IDEA_W, wPart)),
    sum: t < 0.75 ? null : lerpVec(origin, add(IDEA_V, IDEA_W), sumPart),
  };
}

// Idea 2, span: the points a·u + b·w (whole numbers a, b from −3 to 3) appear, nearest first. Then w swings onto
// u's line (it ends as −0.8·u), and every point slides onto that one line.
export const SPAN_U: Vec2 = [1, 0.5];
export const SPAN_W: Vec2 = [-0.5, 1];
export const SPAN_W_END: Vec2 = scale(-0.8, SPAN_U);
const SPAN_RANGE = 3;

export interface SpanScene {
  u: Vec2;
  w: Vec2;
  /** The points a·u + b·w that have appeared so far. */
  dots: Vec2[];
  /** true once w has started to swing: then the line through u is drawn. */
  collapsing: boolean;
}

export function spanScene(t: number): SpanScene {
  const w = lerpVec(SPAN_W, SPAN_W_END, part(t, 0.5, 0.95));
  // How far out the points have appeared: |a| + |b| up to `reach`.
  const reach = part(t, 0, 0.45) * 2 * SPAN_RANGE;
  const dots: Vec2[] = [];
  for (let a = -SPAN_RANGE; a <= SPAN_RANGE; a++) {
    for (let b = -SPAN_RANGE; b <= SPAN_RANGE; b++) {
      if (Math.abs(a) + Math.abs(b) <= reach) dots.push(matVec([SPAN_U, w], [a, b]));
    }
  }
  return { u: SPAN_U, w, dots, collapsing: t > 0.5 };
}

// Idea 3, linear transformations: the logo, the grid, î and ĵ move under one matrix.
export const IDEA_TRANSFORM: Mat2 = [[1.5, 0], [0.7, 1]];
export const transformationAt = (t: number): Mat2 => matrixAt(IDEA_TRANSFORM, t);

// Idea 4, eigenvectors: a symmetric matrix with eigenvalue 2 along (1, 1) and 0.5 along (−1, 1).
// Arrows on those two lines only get longer or shorter; an ordinary arrow is knocked off its line.
export const IDEA_EIGEN: Mat2 = [[1.25, 0.75], [0.75, 1.25]];
export const IDEA_ORDINARY: Vec2 = [1.2, 0.2];

export interface EigenScene {
  matrix: Mat2;
  /** The eigenvector lines' directions (they never move). */
  lines: Vec2[];
  /** The arrows on the eigenvector lines, where they are now. */
  eigenArrows: Vec2[];
  /** The ordinary arrow, where it is now. */
  ordinary: Vec2;
}

export function eigenScene(t: number): EigenScene {
  const matrix = matrixAt(IDEA_EIGEN, t);
  const eigen = eig2(IDEA_EIGEN);
  const lines = eigen.kind === 'lines' ? eigen.pairs.map((p) => p.direction) : [];
  return {
    matrix,
    lines,
    eigenArrows: lines.map((d) => matVec(matrix, scale(1.2, d))),
    ordinary: matVec(matrix, IDEA_ORDINARY),
  };
}

// ---- The 3D card in "Optional extras" ----

/**
 * The 3D card's matrix: a shear that leans k̂ over to (1, 0, 1). The still picture (Still3D.astro) is drawn from it,
 * and the live 3D view (Load3D, after a tap) starts on it. The buttons are the same as in lesson 1.9.4.
 */
export const CARD_3D_MATRIX: Mat3 = [[1, 0, 0], [0, 1, 0], [1, 0, 1]];
export const CARD_3D_PRESETS: { name: string; matrix: Mat3 }[] = [
  { name: 'Shear', matrix: CARD_3D_MATRIX },
  { name: 'Turn about y', matrix: [[0, 0, -1], [0, 1, 0], [1, 0, 0]] },
  { name: 'Scale', matrix: [[2, 0, 0], [0, 1, 0], [0, 0, 0.5]] },
];

// ---------- The world's 5 stations (docs/homepage-brief.md §5) ----------
// All five look at the origin, where the logo will live; only the angle changes, each chosen for what the station shows.
// Poses are explained in src/lib/world.ts (StationPose). Phase 2 has the camera only: the stations are still empty.

export interface Station {
  /** The section's id on the page (for the rail links), e.g. "station-vectors". */
  id: string;
  /** Its short name, shown under the station and on the rail. */
  name: string;
  pose: StationPose;
}

/** Station 1's two arrows when the page opens: v and w, and so v + w = (1, 3). */
export const VECTORS_START: { v: Vec2; w: Vec2 } = { v: [2, 1], w: [-1, 2] };

export const STATIONS: Station[] = [
  // A three-quarter view from above, close: you see depth, and dragging "away from you" still feels natural.
  { id: 'station-vectors', name: 'Vectors', pose: { azimuth: -24, elevation: 30, distance: 8.5, lookHeight: 0.3, sweep: 0 } },
  // Almost straight down: dragging î and ĵ feels like the 2D lessons.
  { id: 'station-matrix', name: 'Matrices', pose: { azimuth: 0, elevation: 76, distance: 11, lookHeight: 0, sweep: 0 } },
  // Straight down and closer, turned a little: the area fills the screen.
  { id: 'station-determinant', name: 'Determinant', pose: { azimuth: 14, elevation: 84, distance: 8, lookHeight: 0, sweep: 0 } },
  // Far back and low: the eigen-lines run off to the horizon.
  { id: 'station-eigen', name: 'Eigenvectors', pose: { azimuth: -40, elevation: 24, distance: 15, lookHeight: 0, sweep: 0 } },
  // Very low, lifted, and circling as you scroll: the logo rises off the plane.
  { id: 'station-3d', name: 'Into 3D', pose: { azimuth: 40, elevation: 14, distance: 9, lookHeight: 1, sweep: 100 } },
];
