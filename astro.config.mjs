// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Where the site lives on GitHub Pages: https://appleshehri2004-source.github.io/linear-algebra-site/
  site: 'https://appleshehri2004-source.github.io',
  base: '/linear-algebra-site',
  integrations: [react(), mdx()]
});