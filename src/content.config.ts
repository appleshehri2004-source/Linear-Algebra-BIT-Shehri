import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .md or .mdx file in src/content/lessons is a lesson.
// The schema lists the fields each lesson must have at the top of its file.
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    // Which module the lesson is in (its name lives in src/content/modules.ts).
    module: z.number().int().positive(),
    // Position inside the module: lesson 1.2 has module 1, order 2.
    order: z.number().int().positive(),
    // Where to learn more. Optional, so a lesson can leave one out.
    threeBlueOneBrown: z.string().url().optional(),
    mit: z.string().url().optional(),
    tongji: z.string().optional(), // a textbook section, e.g. "第四章 §1"
  }),
});

export const collections = { lessons };
