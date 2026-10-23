import { describe, expect, it } from 'vitest';
import { activeInBookOrder, allSections, book, chapterOf, getSection, lessonNumber, sectionNumbers } from './book';

describe('the book map', () => {
  it('lists chapters 1 to 10 in order', () => {
    expect(book.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('numbers every section after its chapter, counting up from 1', () => {
    for (const chapter of book) {
      chapter.sections.forEach((s, i) => expect(s.number).toBe(`${chapter.number}.${i + 1}`));
    }
  });

  it('has no section number twice', () => {
    expect(new Set(sectionNumbers).size).toBe(sectionNumbers.length);
  });

  it('has page numbers that only go up', () => {
    const pages = allSections.flatMap((s) => (s.page === undefined ? [] : [s.page]));
    expect(pages).toEqual([...pages].sort((a, b) => a - b));
  });

  it('starts each chapter before its first section', () => {
    for (const chapter of book) {
      const first = chapter.sections[0].page;
      if (chapter.page !== undefined && first !== undefined) expect(chapter.page).toBeLessThanOrEqual(first);
    }
  });

  it('archives the sections the course skips', () => {
    expect(getSection('1.6').status).toBe('archived');
    expect(getSection('6.5').status).toBe('archived');
    expect(getSection('7.1').status).toBe('archived');
    expect(book.filter((c) => c.number >= 8).every((c) => c.sections.every((s) => s.status === 'archived'))).toBe(true);
  });

  it('has 35 active sections, all in chapters 1 to 7', () => {
    const active = allSections.filter((s) => s.status === 'active');
    expect(active).toHaveLength(35);
    expect(active.every((s) => chapterOf(s.number).number <= 7)).toBe(true);
  });

  it('throws for a section that is not in the book', () => {
    expect(() => getSection('1.11')).toThrow();
    expect(() => chapterOf('11.1')).toThrow();
  });
});

describe('activeInBookOrder', () => {
  const lesson = (section: string, part: number) => ({ id: `${section}-${part}`, data: { section, part } });

  it('sorts by book section, then by part, even for 1.10 after 1.9', () => {
    const sorted = activeInBookOrder([lesson('2.1', 1), lesson('1.9', 2), lesson('1.3', 2), lesson('1.9', 1), lesson('1.3', 1)]);
    expect(sorted.map((l) => l.id)).toEqual(['1.3-1', '1.3-2', '1.9-1', '1.9-2', '2.1-1']);
  });

  it('leaves out lessons in archived sections', () => {
    const sorted = activeInBookOrder([lesson('6.5', 1), lesson('6.4', 1), lesson('7.1', 1), lesson('7.4', 1)]);
    expect(sorted.map((l) => l.id)).toEqual(['6.4-1', '7.4-1']);
  });
});

describe('lessonNumber', () => {
  it('joins the section and the part', () => {
    expect(lessonNumber({ section: '1.3', part: 2 })).toBe('1.3.2');
  });
});
