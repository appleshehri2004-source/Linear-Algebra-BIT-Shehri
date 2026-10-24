// The homepage's chapter map: one card per chapter that has active sections, in the book's order.
// Everything comes from the book map (src/content/book.ts), so archiving a section changes the cards by itself.
import { book, type BookChapter, type LessonPlace } from './book';

/** What one chapter card shows. */
export interface ChapterSummary {
  number: number;
  title: string;
  /** How many lessons the chapter has in active sections. */
  lessonCount: number;
}

/**
 * One summary per chapter with at least one active section. Lessons in archived sections don't count.
 * `chapters` is the whole book unless a test passes a smaller one.
 */
export function chapterSummaries(lessons: { data: LessonPlace }[], chapters: BookChapter[] = book): ChapterSummary[] {
  return chapters
    .filter((chapter) => chapter.sections.some((s) => s.status === 'active'))
    .map((chapter) => {
      const active = chapter.sections.filter((s) => s.status === 'active').map((s) => s.number);
      return {
        number: chapter.number,
        title: chapter.title,
        lessonCount: lessons.filter((l) => active.includes(l.data.section)).length,
      };
    });
}

/** "1 lesson", "14 lessons". */
export function lessonCountText(n: number): string {
  return n === 1 ? '1 lesson' : `${n} lessons`;
}

/** The one idea each chapter's little animation will show (session 5), as a sentence under the title. */
export const chapterIdeas: Record<number, string> = {
  1: 'A matrix moves the whole plane: here, a shear.',
  2: 'Do two moves in one order, then the other: you land in different places.',
  3: 'The determinant is the area scale. Below zero, the shape flips over.',
  4: 'The same shape, measured on a tilted grid.',
  5: 'Stretch the plane: the eigenvector lines stay put.',
  6: 'Project the shape flat onto a line.',
  7: 'Any matrix is a rotation, a stretch, then a rotation.',
};
