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
