// The site's colours for three.js. three.js can't use CSS variables, so this reads their values
// from theme.css, and reads them again whenever the sun/moon button switches the theme.
import { useEffect, useState } from 'react';

/** Reads the colours the 3D pictures use (each is a CSS variable, e.g. vec2 is --vec2). */
export function readThemeColors() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => css.getPropertyValue(name).trim();
  return {
    ihat: get('--vec-i'),
    jhat: get('--vec-j'),
    khat: get('--khat'),
    vec: get('--vec-x'),
    vec2: get('--vec2'),
    sum: get('--sum'),
    cross: get('--cross'),
    areaKept: get('--area-kept'),
    faint: get('--grid'),
    moving: get('--grid-moving'),
    muted: get('--text-muted'),
    space: get('--space'),
    null: get('--null'),
    eigen: get('--eigen'),
    // The homepage world (src/components/world/).
    text: get('--text'),
    bgDeep: get('--bg-deep'),
    gridMajor: get('--grid-major'),
    glowTop: get('--glow-top'),
  };
}

export type ThemeColors = ReturnType<typeof readThemeColors>;

/** readThemeColors, read again on every 'themechange' event (sent by ThemeToggle.astro). */
export function useThemeColors(): ThemeColors {
  const [colours, setColours] = useState(readThemeColors);
  useEffect(() => {
    const update = () => setColours(readThemeColors());
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);
  return colours;
}

/** How strongly the 3D world glows: the --glow number (0.6 in dark, 0 in light), re-read when the theme changes. */
export function useThemeGlow(): number {
  const read = () => Number(getComputedStyle(document.documentElement).getPropertyValue('--glow')) || 0;
  const [glow, setGlow] = useState(read);
  useEffect(() => {
    const update = () => setGlow(read());
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);
  return glow;
}

/**
 * three.js ignores the see-through part of a colour like "rgba(140, 160, 200, 0.12)".
 * This splits it into the colour and how see-through it is, so a material can use both.
 * A solid colour ("#4d6aa8") comes back unchanged with opacity 1.
 */
export function splitAlpha(colour: string): { color: string; opacity: number } {
  const match = colour.match(/^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/);
  if (!match) return { color: colour, opacity: 1 };
  const [, r, g, b, a] = match;
  return { color: `rgb(${r}, ${g}, ${b})`, opacity: Number(a) };
}

/** A "#rrggbb" or "rgb(…)" colour as three numbers from 0 to 255. */
function channels(colour: string): [number, number, number] {
  if (colour.startsWith('#')) {
    const hex = colour.length === 4 ? colour.replace(/\w/g, (c) => c + c) : colour;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  }
  return (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number) as [number, number, number];
}

/**
 * The solid colour you see when a see-through colour sits on a background, e.g. the faint grid
 * "rgba(140, 160, 200, 0.12)" on the dark fog. Some three.js parts (like drei's Grid) can only take solid colours.
 * `boost` multiplies how strong the see-through colour is (1 = as written in theme.css).
 */
export function blendOver(colour: string, background: string, boost = 1): string {
  const { color, opacity } = splitAlpha(colour);
  const a = Math.min(1, opacity * boost);
  const top = channels(color);
  const bottom = channels(background);
  const mixed = top.map((c, i) => Math.round(a * c + (1 - a) * bottom[i]));
  return `rgb(${mixed.join(', ')})`;
}

/**
 * White at this strength (0 to 1), for painting the *shape* of a glow or dot into a texture. It isn't a colour
 * choice: the three.js material tints the white with a theme colour, so the texture only says "how much, where".
 */
export function mask(strength: number): string {
  return `rgba(255, 255, 255, ${strength})`;
}
