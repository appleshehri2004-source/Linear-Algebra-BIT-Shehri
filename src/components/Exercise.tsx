// A practice question with random numbers: type an answer, press Check, get told right or wrong.
// After 2 wrong tries it shows the correct answer. "New question" picks new numbers.
// Use it in a lesson as <Exercise id="1.2-add" client:visible />. The questions live in src/exercises/.
import { useEffect, useId, useState, type FormEvent } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { exercises } from '../exercises';
import { answerTex, checkAnswer, parseNumber, type Question } from '../exercises/exercise';
import './Exercise.css';

interface Props {
  /** Which question generator to use, e.g. "1.2-add" (see src/exercises/module1.ts). */
  id: string;
}

type Feedback = 'right' | 'wrong' | 'not-a-number' | null;

/** Turns "Work out $x + 1$." into HTML: the bits between dollar signs become KaTeX maths. */
function renderText(text: string): string {
  return text
    .split('$')
    .map((part, i) => (i % 2 === 1 ? katex.renderToString(part, { throwOnError: false }) : escapeHtml(part)))
    .join('');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function Exercise({ id }: Props) {
  const inputId = useId();
  const generate = exercises[id];
  // The question is made after the page loads (in useEffect), not while the site is built.
  // Otherwise the built page and the browser would pick different random numbers and disagree.
  const [question, setQuestion] = useState<Question | null>(null);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongTries, setWrongTries] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function newQuestion() {
    if (!generate) return;
    const q = generate(Math.random);
    setQuestion(q);
    setTyped(typeof q.answer === 'number' ? [''] : q.answer.map(() => ''));
    setWrongTries(0);
    setFeedback(null);
  }

  useEffect(newQuestion, [id]);

  if (!generate) return <p className="exercise">Unknown exercise "{id}".</p>;
  if (!question) return <div className="exercise exercise-loading">Loading a question…</div>;

  const isVector = typeof question.answer !== 'number';
  const labels = question.labels ?? ['x', 'y', 'z'];
  const solved = feedback === 'right';
  const showAnswer = wrongTries >= 2 && !solved;

  function check(e: FormEvent) {
    e.preventDefault();
    if (!question || solved) return;
    const numbers = typed.map(parseNumber);
    if (numbers.some((n) => n === null)) {
      // A typo doesn't count as a wrong try.
      setFeedback('not-a-number');
      return;
    }
    if (checkAnswer(question, numbers as number[])) {
      setFeedback('right');
    } else {
      setFeedback('wrong');
      setWrongTries((n) => n + 1);
    }
  }

  function type(i: number, value: string) {
    setTyped((old) => old.map((t, j) => (j === i ? value : t)));
    if (feedback !== 'right') setFeedback(null);
  }

  return (
    <form className="exercise" onSubmit={check}>
      <p className="exercise-label">Exercise</p>
      <p className="exercise-text" dangerouslySetInnerHTML={{ __html: renderText(question.text) }} />
      {question.note && <p className="exercise-note">{question.note}</p>}

      <div className={isVector ? 'exercise-boxes exercise-vector' : 'exercise-boxes'}>
        {typed.map((t, i) => (
          <label key={i} className="exercise-box">
            {isVector && <span>{labels[i]} =</span>}
            <input
              id={i === 0 ? inputId : undefined}
              type="text"
              // A normal keyboard: the iPhone number pad has no minus sign.
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={t}
              disabled={solved}
              onChange={(e) => type(i, e.target.value)}
              aria-label={isVector ? labels[i] : 'Your answer'}
            />
          </label>
        ))}
      </div>

      <div className="exercise-buttons">
        <button type="submit" disabled={solved}>
          Check
        </button>
        <button type="button" className="secondary" onClick={newQuestion}>
          New question
        </button>
      </div>

      <p className="exercise-feedback" aria-live="polite">
        {feedback === 'right' && <span className="right">Right!</span>}
        {feedback === 'wrong' && !showAnswer && <span className="wrong">Not quite. Try again.</span>}
        {feedback === 'not-a-number' && <span className="wrong">Please type a number in every box.</span>}
        {showAnswer && (
          <span className="wrong">
            Not quite. The answer is{' '}
            <span dangerouslySetInnerHTML={{ __html: katex.renderToString(answerTex(question)) }} />.
          </span>
        )}
      </p>
    </form>
  );
}
