// The "Mark this lesson complete" button at the end of every lesson (see LessonLayout.astro).
// Clicking it again un-marks the lesson. The tick is saved in the browser by src/lib/progress.ts.
import { useEffect, useState } from 'react';
import { loadProgress, setLessonComplete } from '../lib/progress';
import './Progress.css';

interface Props {
  /** The lesson's id, e.g. "1-1-vectors". */
  lessonId: string;
}

export default function LessonComplete({ lessonId }: Props) {
  // Starts as "not done" so the built page and the browser agree, then reads the saved value.
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(loadProgress().lessons[lessonId] === true);
  }, [lessonId]);

  function toggle() {
    setLessonComplete(lessonId, !done);
    setDone(!done);
  }

  return (
    <div className="lesson-complete">
      <button type="button" className={done ? 'done' : ''} aria-pressed={done} onClick={toggle}>
        {done ? '✓ Lesson complete' : 'Mark this lesson complete'}
      </button>
      {done && <span className="lesson-complete-hint">Click again to undo.</span>}
    </div>
  );
}
