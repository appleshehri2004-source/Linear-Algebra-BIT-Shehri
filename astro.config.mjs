// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import { getSection } from './src/content/book.ts';
import { oldLessonIds } from './src/content/old-lesson-ids.ts';

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
  // Old lesson links (from before the lessons followed Lay's book) forward to the lesson's new page,
  // e.g. /lessons/1-1-vectors/ -> /lessons/1-3-1-vectors/. Astro adds the base path to the old link
  // but not to the target, so we add it. Lessons in archived sections have no page, so no redirect:
  // their old links show the 404 page.
  redirects: Object.fromEntries(
    Object.entries(oldLessonIds)
      .filter(([, newId]) => getSection(newId.split('-').slice(0, 2).join('.')).status === 'active')
      .map(([oldId, newId]) => [`/lessons/${oldId}`, `${base.replace(/\/$/, '')}/lessons/${newId}/`]),
  ),
});
