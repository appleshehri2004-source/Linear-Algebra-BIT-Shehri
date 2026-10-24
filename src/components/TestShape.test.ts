// The y-axis test from docs/homepage-brief.md: draw TestShape the way a browser gets it, read back the transforms it
// wrote, and check that every point ends up where linalg.ts says, with y flipped for the screen.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { matVec, rotation, type Mat2, type Vec2 } from '../lib/linalg';
import TestShape, { TestShapeSymbols } from './TestShape';

/** The six numbers of an SVG transform list, read from text like "scale(1 -1)" or "matrix(1 0 0.5 1 0 0)". */
function readTransform(text: string): number[] {
  // Start from "do nothing", then apply each piece in order, left to right, as SVG does.
  let total = [1, 0, 0, 1, 0, 0];
  for (const [, name, args] of text.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number);
    const piece =
      name === 'matrix' ? n
      : name === 'scale' ? [n[0], 0, 0, n[1] ?? n[0], 0, 0]
      : name === 'translate' ? [1, 0, 0, 1, n[0], n[1] ?? 0]
      : null;
    if (!piece) throw new Error(`readTransform doesn't know ${name}()`);
    total = compose(total, piece);
  }
  return total;
}

/** First apply `inner`, then `outer`: the SVG transform of a group inside a group. */
function compose(outer: number[], inner: number[]): number[] {
  const [a, b, c, d, e, f] = outer;
  const [A, B, C, D, E, F] = inner;
  return [a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D, a * E + c * F + e, b * E + d * F + f];
}

const apply = ([a, b, c, d, e, f]: number[], [x, y]: Vec2): Vec2 => [a * x + c * y + e, b * x + d * y + f];

/** Every transform="…" in the markup, outermost first. */
const transformsIn = (html: string) => [...html.matchAll(/transform="([^"]+)"/g)].map((m) => m[1]);

/** Where the point p of the shape lands on screen: the outer y-flip, then the matrix group. */
function screenPoint(matrix: Mat2, p: Vec2): Vec2 {
  const html = renderToStaticMarkup(createElement(TestShape, { shape: 'neutral', matrix }));
  const [flip, move] = transformsIn(html);
  return apply(compose(readTransform(flip), readTransform(move)), p);
}

describe('TestShape on screen', () => {
  const points: Vec2[] = [[1, 0], [0, 1], [1, 1], [0.35, 0.62], [-2, 0.5]];
  const cases: [string, Mat2][] = [
    ['a shear', [[1, 0], [1, 1]]],
    ['a rotation by 30°', rotation(30)],
  ];

  for (const [name, m] of cases) {
    it(`puts every point where linalg.ts says, for ${name} (y flipped for the screen)`, () => {
      for (const p of points) {
        const [x, y] = screenPoint(m, p);
        const [mx, my] = matVec(m, p);
        expect(x).toBeCloseTo(mx, 12);
        expect(y).toBeCloseTo(-my, 12);
      }
    });
  }

  it('leaves the shape where it is for the identity matrix, apart from the y-flip', () => {
    expect(screenPoint([[1, 0], [0, 1]], [0.15, 0.95])).toEqual([0.15, -0.95]);
  });
});

describe('the BIT logo inside TestShape', () => {
  const html = renderToStaticMarkup(createElement(TestShape, { shape: 'bit-logo', matrix: [[1, 0], [0, 1]] }));

  it("stands upright: the logo file's top-left corner is the unit square's top-left corner (0, 1)", () => {
    // The third transform is the logo's own flip (the logo file counts y downwards); its nested <svg> is 1 × 1.
    const standUp = readTransform(transformsIn(html)[2]);
    expect(apply(standUp, [0, 0])).toEqual([0, 1]); // file's top-left
    expect(apply(standUp, [1, 1])).toEqual([1, 0]); // file's bottom-right
    expect(html).toContain('width="1" height="1" viewBox="0 0 266.67 266.67"');
  });

  it('carries the logo with its own clip name, so it cannot clash with another "a" on the page', () => {
    expect(html).toContain('clip-path="url(#bit-logo-clip)"');
    expect(html).not.toContain('id="a"');
  });
});

describe('TestShape with symbols', () => {
  it('points at the shape with <use> instead of drawing it again', () => {
    const html = renderToStaticMarkup(createElement(TestShape, { shape: 'bit-logo', matrix: [[1, 0], [0, 1]], useSymbol: true }));
    expect(html).toContain('<use href="#test-shape-bit-logo"');
    expect(html).not.toContain('<path');
  });

  it('defines each shape once', () => {
    const html = renderToStaticMarkup(createElement(TestShapeSymbols));
    expect(html.match(/id="test-shape-bit-logo"/g)).toHaveLength(1);
    expect(html.match(/id="test-shape-neutral"/g)).toHaveLength(1);
  });
});
