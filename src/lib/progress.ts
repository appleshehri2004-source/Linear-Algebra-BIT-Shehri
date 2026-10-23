// Remembers the reader's progress in the browser (localStorage): which lessons they marked
// complete, and which exercises they solved. Nothing is sent anywhere.
//
// Every storage call is wrapped in try/catch. Some browsers block storage (private mode,
// strict privacy settings, some in-app browsers). Then progress is kept in memory instead:
// the site still works, it just forgets everything when the page is reloaded.

/** How one exercise went. firstTry: solved at least once with no wrong tries. */
export interface ExerciseScore {
  solved: boolean;
  firstTry: boolean;
}

export interface Progress {
  /** Lesson ids (e.g. "1-1-vectors") the reader marked complete. */
  lessons: Record<string, true>;
  /** Exercise ids (e.g. "1.1-walk") the reader has solved. */
  exercises: Record<string, ExerciseScore>;
}

/** The smallest piece of localStorage we use, so tests can pass in a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The key everything is saved under. Change the "v1" if the saved shape ever changes. */
export const STORAGE_KEY = 'visual-linear-algebra-progress-v1';

export function emptyProgress(): Progress {
  return { lessons: {}, exercises: {} };
}

/**
 * Turn saved text back into progress. Anything broken or unexpected (old data, a typo made
 * by hand in the browser's dev tools) is skipped instead of crashing the page.
 */
export function parseProgress(raw: string | null): Progress {
  const progress = emptyProgress();
  if (!raw) return progress;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return progress;
  }
  if (!isObject(data)) return progress;

  if (isObject(data.lessons)) {
    for (const [id, done] of Object.entries(data.lessons)) {
      if (done === true) progress.lessons[id] = true;
    }
  }
  if (isObject(data.exercises)) {
    for (const [id, score] of Object.entries(data.exercises)) {
      if (isObject(score) && score.solved === true) {
        progress.exercises[id] = { solved: true, firstTry: score.firstTry === true };
      }
    }
  }
  return progress;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

// Used when the real storage is blocked, so progress still lasts until the page reloads.
const memory = new Map<string, string>();
const memoryStore: KeyValueStore = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => void memory.set(key, value),
};

/** The browser's localStorage, or the in-memory stand-in if it's missing or blocked. */
export function browserStore(): KeyValueStore {
  try {
    // Just touching window.localStorage can throw when storage is blocked.
    const store = window.localStorage;
    if (store) return store;
  } catch {
    // Fall through to memory.
  }
  return memoryStore;
}

export function loadProgress(store: KeyValueStore = browserStore()): Progress {
  try {
    return parseProgress(store.getItem(STORAGE_KEY));
  } catch {
    return parseProgress(memoryStore.getItem(STORAGE_KEY));
  }
}

function saveProgress(progress: Progress, store: KeyValueStore): void {
  const text = JSON.stringify(progress);
  try {
    store.setItem(STORAGE_KEY, text);
  } catch {
    // Blocked or full: keep it in memory so this page visit still remembers it.
    memoryStore.setItem(STORAGE_KEY, text);
  }
}

/** Mark a lesson complete (done = true) or not complete again (done = false). Returns the new progress. */
export function setLessonComplete(
  lessonId: string,
  done: boolean,
  store: KeyValueStore = browserStore(),
): Progress {
  const progress = loadProgress(store);
  if (done) progress.lessons[lessonId] = true;
  else delete progress.lessons[lessonId];
  saveProgress(progress, store);
  return progress;
}

/**
 * Record a solved exercise. firstTry: solved with no wrong tries this time.
 * A first-try solve is never lost, even if a later question took a few tries.
 */
export function recordSolved(
  exerciseId: string,
  firstTry: boolean,
  store: KeyValueStore = browserStore(),
): Progress {
  const progress = loadProgress(store);
  const before = progress.exercises[exerciseId];
  progress.exercises[exerciseId] = { solved: true, firstTry: firstTry || before?.firstTry === true };
  saveProgress(progress, store);
  return progress;
}

/** How many of these exercises have been solved, e.g. 2 of 3. */
export function solvedCount(progress: Progress, exerciseIds: string[]): number {
  return exerciseIds.filter((id) => progress.exercises[id]?.solved).length;
}
