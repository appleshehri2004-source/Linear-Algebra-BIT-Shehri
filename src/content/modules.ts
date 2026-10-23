import { getCollection, type CollectionEntry } from 'astro:content';

// The name of each module. Add a line here when you start a new module.
export const moduleNames: Record<number, string> = {
  1: 'Vectors',
  2: 'Linear transformations',
  3: 'The determinant',
  4: 'Systems of equations',
  5: 'Duality and the cross product',
};

/** A module's name, or "Untitled" if it isn't named above yet. */
export function moduleName(module: number): string {
  return moduleNames[module] ?? 'Untitled';
}

/** All lessons in reading order: by module, then by order inside the module. */
export async function getSortedLessons(): Promise<CollectionEntry<'lessons'>[]> {
  const lessons = await getCollection('lessons');
  return lessons.sort(
    (a, b) => a.data.module - b.data.module || a.data.order - b.data.order,
  );
}

/** The ids of the exercises a lesson uses, e.g. ["1.1-walk", "1.1-trip"], read from its <Exercise id="..." /> tags. */
export function exerciseIds(lesson: CollectionEntry<'lessons'>): string[] {
  return [...(lesson.body ?? '').matchAll(/<Exercise\s+id="([^"]+)"/g)].map((m) => m[1]);
}
