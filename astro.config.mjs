// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// Where the site lives. With no settings it builds for GitHub Pages:
//   https://appleshehri2004-source.github.io/Linear-Algebra-BIT-Shehri/
// To host it somewhere else, set these when you build, e.g. at the root of another host:
//   SITE_URL=https://example.com BASE_PATH=/ npm run build
const site = process.env.SITE_URL || 'https://appleshehri2004-source.github.io';
const base = process.env.BASE_PATH || '/Linear-Algebra-BIT-Shehri';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  // sitemap() writes sitemap-index.xml listing every page, so search engines can find them.
  integrations: [react(), mdx(), sitemap()],
});
