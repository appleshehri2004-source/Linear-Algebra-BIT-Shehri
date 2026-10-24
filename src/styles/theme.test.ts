// Checks the colour rules from docs/homepage-brief.md §2.1: all colours live in theme.css,
// and the light theme sets every colour the dark theme sets.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { blendOver, splitAlpha } from '../lib/useThemeColors';

const theme = readFileSync('src/styles/theme.css', 'utf8');

/** The variable names set inside the { … } block that starts with `selector`. */
function namesIn(selector: string): string[] {
  const start = theme.indexOf(selector);
  const block = theme.slice(theme.indexOf('{', start), theme.indexOf('}', start));
  return [...block.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]).sort();
}

/** Every file under a folder, as paths. */
function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

describe('theme.css', () => {
  it('sets the same colours in light as in dark', () => {
    const dark = namesIn(":root,\n[data-theme='dark']");
    const light = namesIn("[data-theme='light']");
    expect(dark.length).toBeGreaterThan(20);
    expect(light).toEqual(dark);
  });

  it('is the only place in src/ where colours are typed', () => {
    // A hex colour like #1a9e4b or #fff, or rgb(…)/rgba(…)/hsl(…).
    const colour = /(?<![\w&/-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|\b(?:rgba?|hsla?)\(/i;
    const allowed = [
      'src/styles/theme.css',
      'src/assets/bit-logo.svg', // the logo keeps its own colours
      'src/lib/useThemeColors.ts', // reads "rgba(…)" values; it doesn't choose any colour
    ];
    const offenders = filesIn('src')
      .filter((path) => /\.(css|astro|tsx?|mdx)$/.test(path) && !path.endsWith('.test.ts') && !allowed.includes(path))
      .filter((path) => colour.test(readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('splitAlpha', () => {
  it('splits a see-through colour into colour and opacity', () => {
    expect(splitAlpha('rgba(140, 160, 200, 0.12)')).toEqual({ color: 'rgb(140, 160, 200)', opacity: 0.12 });
  });

  it('gives a solid colour opacity 1', () => {
    expect(splitAlpha('#4d6aa8')).toEqual({ color: 'rgb(77, 106, 168)', opacity: 1 });
  });

  // The built site rewrites theme.css's rgba(…) colours as 8-digit hex (seen on the live site, Phase 2).
  it('reads the 8-digit hex the built site uses', () => {
    const { color, opacity } = splitAlpha('#8ca0c81f');
    expect(color).toBe('rgb(140, 160, 200)');
    expect(opacity).toBeCloseTo(0.12, 2);
  });

  it('reads the short forms and the minified rgba', () => {
    expect(splitAlpha('#fff')).toEqual({ color: 'rgb(255, 255, 255)', opacity: 1 });
    expect(splitAlpha('#ffffff0a').opacity).toBeCloseTo(0.04, 2);
    expect(splitAlpha('rgba(140,160,200,.12)')).toEqual({ color: 'rgb(140, 160, 200)', opacity: 0.12 });
  });
});

describe('blendOver', () => {
  it('mixes a see-through colour into the background', () => {
    // Half white on black is middle grey.
    expect(blendOver('rgba(255, 255, 255, 0.5)', '#000000')).toBe('rgb(128, 128, 128)');
  });

  it('gives the same answer for the source and the built form of a colour', () => {
    expect(blendOver('#6e8cff24', '#05070d')).toBe(blendOver('rgba(110, 140, 255, 0.14)', '#05070d'));
  });

  it('leaves a solid colour as it is, and boost never goes past solid', () => {
    expect(blendOver('#ff0000', '#000')).toBe('rgb(255, 0, 0)');
    expect(blendOver('rgba(0, 0, 255, 0.5)', '#ffffff', 4)).toBe('rgb(0, 0, 255)');
  });
});
