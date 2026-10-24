import { describe, expect, it } from 'vitest';
import { book } from './book';
import { chapterIdeas, chapterSummaries, lessonCountText } from './home';

const lesson = (section: string, part = 1) => ({ data: { section, part } });

describe('the homepage chapter map', () => {
  it('has one card for each of chapters 1 to 7, and none for the archived chapters 8 to 10', () => {
    expect(chapterSummaries([]).map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('uses the chapter titles from the book map', () => {
    expect(chapterSummaries([])[2].title).toBe('Determinants');
  });

  it('counts lessons per chapter', () => {
    const counts = chapterSummaries([lesson('1.1'), lesson('1.3', 1), lesson('1.3', 2), lesson('3.1')]).map(
      (c) => c.lessonCount,
    );
    expect(counts).toEqual([3, 0, 1, 0, 0, 0, 0]);
  });

  it('never counts a lesson in an archived section', () => {
    // 6.5 (least squares) and 7.1 are archived; 7.4 is active.
    const [, , , , , ch6, ch7] = chapterSummaries([lesson('6.5'), lesson('7.1'), lesson('7.4')]);
    expect(ch6.lessonCount).toBe(0);
    expect(ch7.lessonCount).toBe(1);
  });

  it('drops a chapter once all its sections are archived', () => {
    const allArchived = book.map((c) =>
      c.number === 3 ? { ...c, sections: c.sections.map((s) => ({ ...s, status: 'archived' as const })) } : c,
    );
    expect(chapterSummaries([], allArchived).map((c) => c.number)).toEqual([1, 2, 4, 5, 6, 7]);
  });

  it('has an idea sentence for every card', () => {
    for (const c of chapterSummaries([])) expect(chapterIdeas[c.number]).toBeTruthy();
  });

  it('says "1 lesson" but "2 lessons"', () => {
    expect(lessonCountText(1)).toBe('1 lesson');
    expect(lessonCountText(2)).toBe('2 lessons');
  });
});
