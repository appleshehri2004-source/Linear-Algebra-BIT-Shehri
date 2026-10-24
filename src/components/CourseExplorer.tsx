// The homepage's Course panel: every lesson, organised by chapter, with the reader's saved progress.
// It replaces the old 6½-screen list (archived in components/archive/LessonList.tsx).
// - Top: one slim progress bar for the whole course ("7 of 45 lessons").
// - Left (on a phone: a row of chips on top): the chapters as tabs, each with a ring that fills as lessons are done.
// - Right: the chosen chapter's lessons, grouped by book section. Each row: a check, number, title, an "Optional"
//   pill, and one dot per exercise (filled when solved).
// The chapter cards above link to #chapter-N: that opens chapter N here and scrolls to it.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { chapterProgress, type ChapterLinks, type LessonLink } from '../content/home';
import { emptyProgress, loadProgress, solvedCount, type Progress } from '../lib/progress';
import './CourseExplorer.css';

/** Chapter number from a link like "#chapter-3", or null. */
const chapterFromHash = (hash: string) => {
  const match = /^#chapter-(\d+)$/.exec(hash);
  return match ? Number(match[1]) : null;
};

/** A small ring that fills clockwise from the top: done out of total. */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 9;
  const length = 2 * Math.PI * r;
  const filled = total === 0 ? 0 : done / total;
  return (
    <svg className={filled === 1 ? 'course-ring complete' : 'course-ring'} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="course-ring-track" cx="12" cy="12" r={r} />
      <circle
        className="course-ring-fill"
        cx="12"
        cy="12"
        r={r}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - filled)}
      />
    </svg>
  );
}

/** A check circle: an empty circle, or a filled one with a tick when the lesson is complete. */
function Check({ done }: { done: boolean }) {
  return (
    <svg className={done ? 'course-check done' : 'course-check'} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" />
      {done && <path d="M6 10.4l2.6 2.6L14.2 7.4" />}
    </svg>
  );
}

function LessonRow({ lesson, progress }: { lesson: LessonLink; progress: Progress }) {
  const done = progress.lessons[lesson.id] === true;
  const solved = solvedCount(progress, lesson.exerciseIds);
  const total = lesson.exerciseIds.length;
  return (
    <li>
      <a className={done ? 'course-row done' : 'course-row'} href={lesson.href}>
        <Check done={done} />
        {/* Number and title side by side on a computer; on a phone the number sits small above the title. */}
        <span className="course-row-text">
          <span className="course-row-number">{lesson.number}</span>
          <span className="course-row-title">
            {lesson.title}
            {done && <span className="visually-hidden"> (complete)</span>}
          </span>
        </span>
        {lesson.optional && <span className="course-pill">Optional</span>}
        {total > 0 && (
          // One dot per exercise, the solved ones filled. Many exercises: a short count instead.
          <span className="course-dots" title={`${solved} of ${total} exercises solved`}>
            <span className="visually-hidden">
              {solved} of {total} exercises solved
            </span>
            {total <= 6 ? (
              Array.from({ length: total }, (_, i) => (
                <span key={i} className={i < solved ? 'course-dot solved' : 'course-dot'} aria-hidden="true" />
              ))
            ) : (
              <span aria-hidden="true">
                {solved}/{total}
              </span>
            )}
          </span>
        )}
      </a>
    </li>
  );
}

export default function CourseExplorer({ chapters }: { chapters: ChapterLinks[] }) {
  // Starts empty so the built page and the browser agree, then reads what's saved.
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [open, setOpen] = useState(chapters[0].number);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setProgress(loadProgress());
    // Open the chapter named in the address (#chapter-3), and follow the chapter cards' links to it.
    const fromHash = chapterFromHash(location.hash);
    if (fromHash && chapters.some((c) => c.number === fromHash)) setOpen(fromHash);
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.('a[href^="#chapter-"]');
      const n = link && chapterFromHash(link.getAttribute('href') ?? '');
      if (n && chapters.some((c) => c.number === n)) setOpen(n);
    };
    // Capture: we see the click before anything else handles the link.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [chapters]);

  // On a phone the chips scroll sideways: bring the chosen chapter's chip into view (without moving the page).
  useEffect(() => {
    const chip = tabs.current[chapters.findIndex((c) => c.number === open)];
    const row = chip?.parentElement;
    if (chip && row && row.scrollWidth > row.clientWidth) {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      row.scrollTo({ left: chip.offsetLeft - 12, behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [open, chapters]);

  const perChapter = chapterProgress(chapters, progress);
  const done = perChapter.reduce((sum, c) => sum + c.done, 0);
  const total = perChapter.reduce((sum, c) => sum + c.total, 0);
  const chapter = chapters.find((c) => c.number === open) ?? chapters[0];
  const withLessons = chapter.sections.filter((s) => s.lessons.length > 0);
  const comingSoon = chapter.sections.filter((s) => s.lessons.length === 0);

  /** The standard tabs keys: arrows move between chapters, Home and End jump to the first and last. */
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, k: number) {
    const last = chapters.length - 1;
    const next = { ArrowDown: k + 1, ArrowRight: k + 1, ArrowUp: k - 1, ArrowLeft: k - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = (next + chapters.length) % chapters.length;
    setOpen(chapters[target].number);
    tabs.current[target]?.focus();
  }

  return (
    <div className="course">
      {/* The chapter cards' links (#chapter-N) land here. */}
      {chapters.map((c) => (
        <span key={c.number} id={`chapter-${c.number}`} className="course-anchor" />
      ))}

      <p className="course-progress" aria-live="polite">
        <span className="course-progress-label">Your progress</span>
        <span className="course-bar" aria-hidden="true">
          <span className="course-bar-fill" style={{ width: `${total ? (100 * done) / total : 0}%` }} />
        </span>
        <span className="course-progress-count">
          <strong>{done}</strong> of {total} lessons complete
        </span>
      </p>

      <div className="course-body">
        <div className="course-tabs" role="tablist" aria-label="Chapters">
          {chapters.map((c, k) => {
            const p = perChapter[k];
            const selected = c.number === open;
            return (
              <button
                key={c.number}
                ref={(el) => {
                  tabs.current[k] = el;
                }}
                type="button"
                role="tab"
                id={`course-tab-${c.number}`}
                aria-selected={selected}
                aria-controls="course-panel"
                tabIndex={selected ? 0 : -1}
                className="course-tab"
                onClick={() => setOpen(c.number)}
                onKeyDown={(e) => onTabKey(e, k)}
              >
                <Ring done={p.done} total={p.total} />
                <span className="course-tab-text">
                  <span className="course-tab-kicker">Chapter {c.number}</span>
                  <span className="course-tab-title">{c.title}</span>
                </span>
                <span className="course-tab-count" aria-label={`${p.done} of ${p.total} lessons complete`}>
                  {p.done}/{p.total}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="course-panel"
          id="course-panel"
          role="tabpanel"
          aria-labelledby={`course-tab-${chapter.number}`}
          // A long chapter scrolls inside the panel on a computer; Lenis must leave that scrolling alone.
          data-lenis-prevent
        >
          <h3 className="course-panel-title">
            Chapter {chapter.number}: {chapter.title}
          </h3>
          {withLessons.map((section) => (
            <div key={section.number} className="course-section">
              <p className="course-section-label">
                <span className="course-section-number">{section.number}</span> {section.title}
                {section.page !== undefined && <span className="course-section-page">p. {section.page}</span>}
              </p>
              <ul className="course-rows">
                {section.lessons.map((lesson) => (
                  <LessonRow key={lesson.id} lesson={lesson} progress={progress} />
                ))}
              </ul>
            </div>
          ))}
          {comingSoon.length > 0 && (
            <p className="course-soon">Coming soon: {comingSoon.map((s) => `${s.number} ${s.title}`).join(' · ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
