import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { sectionNumbers } from './content/book';

// Every .md or .mdx file in src/content/lessons is a lesson.
// The schema lists the fields each lesson must have at the top of its file.
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    // One sentence for search results and link previews (the page's <meta name="description">).
    description: z.string().max(160),
    // Which section of Lay's textbook the lesson belongs to, e.g. '1.3'. It must be listed in
    // src/content/book.ts, so a typo stops the build. If that section is archived, no page is built.
    section: z.enum(sectionNumbers),
    // Position inside the section: lesson 1.3.2 has section '1.3', part 2.
    part: z.number().int().positive(),
    // Where to learn more. Optional, so a lesson can leave one out.
    threeBlueOneBrown: z.string().url().optional(),
    mit: z.string().url().optional(),
    tongji: z.string().optional(), // a textbook section, e.g. "第四章 §1"
    // true for an advanced lesson the reader can skip. It gets an "Optional" badge.
    optional: z.boolean().optional(),
  }),
});

export const collections = { lessons };
