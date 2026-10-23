// The list of all lessons on the home page, with the reader's saved progress:
// "4 of 15 lessons complete" at the top, then a tick and an exercise count next to each lesson.
import { useEffect, useState } from 'react';
import { emptyProgress, loadProgress, solvedCount, type Progress } from '../lib/progress';
import './Progress.css';

export interface LessonLink {
  id: string;
  href: string;
  /** e.g. "1.2" */
  number: string;
  title: string;
  exerciseIds: string[];
  /** An advanced lesson the reader can skip: shown with an "Optional" badge. */
  optional?: boolean;
}

export interface ModuleLinks {
  module: number;
  name: string;
  lessons: LessonLink[];
}

interface Props {
  modules: ModuleLinks[];
}

export default function LessonList({ modules }: Props) {
  // Starts empty so the built page and the browser agree, then reads what's saved.
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  useEffect(() => setProgress(loadProgress()), []);

  const allLessons = modules.flatMap((m) => m.lessons);
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

      {modules.map(({ module, name, lessons }) => (
        <section key={module}>
          <h2>
            Module {module}: {name}
          </h2>
          <ul className="lessons">
            {lessons.map((lesson) => {
              const done = progress.lessons[lesson.id] === true;
              const solved = solvedCount(progress, lesson.exerciseIds);
              return (
                <li key={lesson.id}>
                  <a href={lesson.href}>
                    <span className="number">{lesson.number}</span>
                    <span className="title">{lesson.title}</span>
                    <span className="badges">
                      {lesson.optional && <span className="optional-badge">Optional</span>}
                      {lesson.exerciseIds.length > 0 && (
                        <span
                          className="exercise-count"
                          title={`${solved} of ${lesson.exerciseIds.length} exercises solved`}
                        >
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
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
