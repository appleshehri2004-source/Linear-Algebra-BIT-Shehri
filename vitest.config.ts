/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Reuse Astro's Vite settings so tests understand the same imports as the site.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
