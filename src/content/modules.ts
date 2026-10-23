import { getCollection, type CollectionEntry } from 'astro:content';
import { activeInBookOrder } from './book';

/**
 * The lessons the site shows, in reading order: the order of the sections in Lay's textbook,
 * then by part inside a section. Lessons in archived sections are left out (see src/content/book.ts).
 */
export async function getSortedLessons(): Promise<CollectionEntry<'lessons'>[]> {
  return activeInBookOrder(await getCollection('lessons'));
}

/** The ids of the exercises a lesson uses, e.g. ["1.1-walk", "1.1-trip"], read from its <Exercise id="..." /> tags. */
export function exerciseIds(lesson: CollectionEntry<'lessons'>): string[] {
  return [...(lesson.body ?? '').matchAll(/<Exercise\s+id="([^"]+)"/g)].map((m) => m[1]);
}
