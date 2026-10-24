// The list of all lessons on the home page, with the reader's saved progress:
// "4 of 15 lessons complete" at the top, then the book's chapters and sections,
// with a tick and an exercise count next to each lesson.
import { useEffect, useState } from 'react';
import { emptyProgress, loadProgress, solvedCount, type Progress } from '../lib/progress';
import './Progress.css';

export interface LessonLink {
  id: string;
  href: string;
  /** e.g. "1.3.2" */
  number: string;
  title: string;
  exerciseIds: string[];
  /** An advanced lesson the reader can skip: shown with an "Optional" badge. */
  optional?: boolean;
}

/** One section of the book, e.g. "1.3 Vector Equations", with its lessons. No lessons yet means "Coming soon". */
export interface SectionLinks {
  number: string;
  title: string;
  page?: number;
  lessons: LessonLink[];
}

/** One chapter of the book, with its active sections. */
export interface ChapterLinks {
  number: number;
  title: string;
  sections: SectionLinks[];
}

interface Props {
  chapters: ChapterLinks[];
}

export default function LessonList({ chapters }: Props) {
  // Starts empty so the built page and the browser agree, then reads what's saved.
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  useEffect(() => setProgress(loadProgress()), []);

  const allLessons = chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons));
  const completed = allLessons.filter((l) => progress.lessons[l.id]).length;

  return (
    <>
      <p className="progress-summary" aria-live="polite">
        <strong>
          {completed} of {allLessons.length}
        </strong>{' '}
        lessons complete
        <progress max={allLessons.length} value={completed} aria-hidden="true" />
      </p>

      {chapters.map((chapter) => (
        // The id lets the homepage's chapter cards jump straight here, e.g. href="#chapter-3".
        <section key={chapter.number} id={`chapter-${chapter.number}`}>
          <h2>
            Chapter {chapter.number}: {chapter.title}
          </h2>
          {chapter.sections.map((section) => (
            <div key={section.number} className="book-section">
              <h3>
                <span className="number">{section.number}</span> {section.title}
                {section.page !== undefined && <span className="page"> · p. {section.page}</span>}
              </h3>
              {section.lessons.length === 0 ? (
                <p className="coming-soon">Coming soon</p>
              ) : (
                <ul className="lessons">
                  {section.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} progress={progress} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

function LessonRow({ lesson, progress }: { lesson: LessonLink; progress: Progress }) {
  const done = progress.lessons[lesson.id] === true;
  const solved = solvedCount(progress, lesson.exerciseIds);
  return (
    <li>
      <a href={lesson.href}>
        <span className="number">{lesson.number}</span>
        <span className="title">{lesson.title}</span>
        <span className="badges">
          {lesson.optional && <span className="optional-badge">Optional</span>}
          {lesson.exerciseIds.length > 0 && (
            <span className="exercise-count" title={`${solved} of ${lesson.exerciseIds.length} exercises solved`}>
              {solved}/{lesson.exerciseIds.length}
            </span>
          )}
          <span className={done ? 'tick done' : 'tick'} aria-label={done ? 'complete' : 'not complete'}>
            {done ? '✓' : ''}
          </span>
        </span>
      </a>
    </li>
  );
}
