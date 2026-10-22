import { getCollection, type CollectionEntry } from 'astro:content';

// The name of each module. Add a line here when you start a new module.
export const moduleNames: Record<number, string> = {
  1: 'Vectors',
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
