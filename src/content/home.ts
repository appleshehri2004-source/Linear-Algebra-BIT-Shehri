// The homepage's chapter map: one card per chapter that has active sections, in the book's order.
// Everything comes from the book map (src/content/book.ts), so archiving a section changes the cards by itself.
import { book, type BookChapter, type LessonPlace } from './book';
import {
  eig2,
  identity,
  matMul,
  matrixAt,
  projectionMatrix,
  roundTo,
  rotation,
  samplePath,
  sequenceAt,
  svdStepsAt,
  svgMatrix,
  type Mat2,
  type Vec2,
} from '../lib/linalg';

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
