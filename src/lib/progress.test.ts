import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { oldLessonIds } from '../content/old-lesson-ids';
import {
  STORAGE_KEY,
  loadProgress,
  parseProgress,
  recordSolved,
  setLessonComplete,
  solvedCount,
  type KeyValueStore,
} from './progress';

/** A pretend localStorage that keeps things in a Map. */
function fakeStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** A pretend localStorage that is blocked: every call throws, like Safari in some privacy modes. */
const blockedStore: KeyValueStore = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('parseProgress', () => {
  it('gives empty progress for nothing saved', () => {
    expect(parseProgress(null)).toEqual({ lessons: {}, exercises: {} });
  });

  it('gives empty progress for broken text instead of crashing', () => {
    expect(parseProgress('{not json')).toEqual({ lessons: {}, exercises: {} });
    expect(parseProgress('42')).toEqual({ lessons: {}, exercises: {} });
    expect(parseProgress('[1,2]')).toEqual({ lessons: {}, exercises: {} });
  });

  it('keeps good entries and skips bad ones', () => {
    const raw = JSON.stringify({
      lessons: { '1-3-1-vectors': true, '1-3-2-adding-scaling': 'yes' },
      exercises: { '1.1-walk': { solved: true, firstTry: true }, '1.1-trip': { solved: 'no' } },
    });
    expect(parseProgress(raw)).toEqual({
      lessons: { '1-3-1-vectors': true },
      exercises: { '1.1-walk': { solved: true, firstTry: true } },
    });
  });

  it('moves lessons saved under their old id (before the book order) to their new id', () => {
    const raw = JSON.stringify({ lessons: { '1-1-vectors': true, '4-3-inverse': true, '1-9-2-gallery': true } });
    expect(parseProgress(raw).lessons).toEqual({ '1-3-1-vectors': true, '2-2-1-inverse': true, '1-9-2-gallery': true });
  });
});

describe('oldLessonIds', () => {
  it('points every old id at a lesson file that exists', () => {
    const files = new Set(readdirSync(new URL('../content/lessons', import.meta.url)).map((f) => f.replace(/\.mdx?$/, '')));
    for (const newId of Object.values(oldLessonIds)) expect(files.has(newId), newId).toBe(true);
    expect(Object.keys(oldLessonIds)).toHaveLength(40);
  });
});

describe('saving progress', () => {
  it('marks a lesson complete and un-marks it again', () => {
    const store = fakeStore();
    setLessonComplete('1-3-1-vectors', true, store);
    expect(loadProgress(store).lessons).toEqual({ '1-3-1-vectors': true });
    setLessonComplete('1-3-1-vectors', false, store);
    expect(loadProgress(store).lessons).toEqual({});
  });

  it('saves under one key as JSON', () => {
    const store = fakeStore();
    setLessonComplete('1-3-1-vectors', true, store);
    expect(JSON.parse(store.data.get(STORAGE_KEY)!).lessons).toEqual({ '1-3-1-vectors': true });
  });

  it('never loses a first-try solve', () => {
    const store = fakeStore();
    recordSolved('1.1-walk', true, store);
    recordSolved('1.1-walk', false, store);
    expect(loadProgress(store).exercises['1.1-walk']).toEqual({ solved: true, firstTry: true });
  });

  it('upgrades to first try later', () => {
    const store = fakeStore();
    recordSolved('1.1-walk', false, store);
    expect(loadProgress(store).exercises['1.1-walk'].firstTry).toBe(false);
    recordSolved('1.1-walk', true, store);
    expect(loadProgress(store).exercises['1.1-walk'].firstTry).toBe(true);
  });

  it('still works when storage is blocked (kept in memory instead)', () => {
    expect(() => setLessonComplete('1-8-1-linear-transformations', true, blockedStore)).not.toThrow();
    expect(loadProgress(blockedStore).lessons['1-8-1-linear-transformations']).toBe(true);
  });
});

describe('solvedCount', () => {
  it('counts only the listed exercises that are solved', () => {
    const progress = parseProgress(
      JSON.stringify({ exercises: { a: { solved: true }, b: { solved: true }, z: { solved: true } } }),
    );
    expect(solvedCount(progress, ['a', 'b', 'c'])).toBe(2);
  });
});
