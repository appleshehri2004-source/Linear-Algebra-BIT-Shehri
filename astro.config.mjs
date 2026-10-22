// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Where the site lives on GitHub Pages: https://appleshehri2004-source.github.io/Linear-Algebra-BIT-Shehri/
  site: 'https://appleshehri2004-source.github.io',
  base: '/Linear-Algebra-BIT-Shehri',
  integrations: [react(), mdx()]
});