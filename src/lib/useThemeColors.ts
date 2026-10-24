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
 * A colour as red, green, blue (0 to 255) and how solid it is (0 to 1). It understands every way the browser
 * may hand back a theme colour: "#rgb", "#rgba", "#rrggbb", "#rrggbbaa", "rgb(…)" and "rgba(…)".
 * (The built site writes "rgba(140, 160, 200, 0.12)" from theme.css as "#8ca0c81f", so both must work.)
 */
function parse(colour: string): { rgb: [number, number, number]; alpha: number } {
  const c = colour.trim();
  if (c.startsWith('#')) {
    // Short forms (#rgb, #rgba) double each digit: #abc is #aabbcc.
    const digits = c.length <= 5 ? [...c.slice(1)].map((d) => d + d).join('') : c.slice(1);
    const byte = (i: number) => parseInt(digits.slice(i, i + 2), 16);
    return { rgb: [byte(0), byte(2), byte(4)], alpha: digits.length === 8 ? byte(6) / 255 : 1 };
  }
  const numbers = (c.match(/[\d.]+/g) ?? []).map(Number);
  return { rgb: [numbers[0], numbers[1], numbers[2]], alpha: numbers[3] ?? 1 };
}

/**
 * three.js ignores the see-through part of a colour like "rgba(140, 160, 200, 0.12)".
 * This splits it into the solid colour and how see-through it is, so a material can use both.
 * A solid colour comes back with opacity 1.
 */
export function splitAlpha(colour: string): { color: string; opacity: number } {
  const { rgb, alpha } = parse(colour);
  return { color: `rgb(${rgb.join(', ')})`, opacity: alpha };
}

/** A colour as three numbers from 0 to 255 (any see-through part is left out). */
function channels(colour: string): [number, number, number] {
  return parse(colour).rgb;
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
