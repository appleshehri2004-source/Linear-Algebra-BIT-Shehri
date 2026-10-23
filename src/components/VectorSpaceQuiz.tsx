// Lesson 9.3: is this set a vector space? Tap "Yes" or "No" on each card, then read why.
// The sets and their reasons live here (not in the lesson file), like the examples in lesson 2.1.
import { useState } from 'react';
import Tex from './Tex';
import './Demo.css';
import './VectorSpaceQuiz.css';

interface Item {
  /** The set, in plain words with any maths between $...$. */
  set: string;
  answer: boolean;
  /** Why, shown after answering. For a "no", which rule breaks and a concrete example. */
  why: string;
}

const ITEMS: Item[] = [
  {
    set: 'All arrows in the plane, $\\mathbb{R}^2$',
    answer: true,
    why: 'Adding two arrows or stretching one always gives another arrow in the plane. All eight rules are the ones from Module 1.',
  },
  {
    set: 'Polynomials of degree at most 3: $c_0 + c_1x + c_2x^2 + c_3x^3$',
    answer: true,
    why: 'Adding two of them or multiplying by a number never makes an $x^4$. The zero polynomial (all $c$s 0) is in the set. It works just like $\\mathbb{R}^4$.',
  },
  {
    set: 'Polynomials of degree exactly 2',
    answer: false,
    why: 'Not closed under addition: $(x^2 + 1) + (-x^2 + x) = x + 1$, which has degree 1. Also, 0 has no degree 2, so there is no zero vector.',
  },
  {
    set: 'Arrows in the first quadrant only: $x \\ge 0$ and $y \\ge 0$',
    answer: false,
    why: 'Not closed under scaling: $-1 \\cdot (2, 3) = (-2, -3)$ leaves the quadrant. So $(2, 3)$ has no $-\\vec{v}$ in the set.',
  },
  {
    set: 'All functions $f(x)$ defined for every real $x$',
    answer: true,
    why: 'Add or scale height by height (Lesson 9.1), and you get another such function. The zero vector is the flat function $f(x) = 0$.',
  },
  {
    set: 'Points on the line $y = 2x + 1$',
    answer: false,
    why: 'The zero vector $(0, 0)$ is not on it (at $x = 0$, $y = 1$). A line through the origin, like $y = 2x$, would be a vector space.',
  },
];

/** Plain text with maths between $...$, drawn piece by piece. */
function Mixed({ text }: { text: string }) {
  return (
    <>
      {text.split('$').map((part, i) => (i % 2 === 1 ? <Tex key={i} tex={part} /> : <span key={i}>{part}</span>))}
    </>
  );
}

export default function VectorSpaceQuiz() {
  // What was tapped on each card: true (yes), false (no), or undefined (not yet).
  const [picked, setPicked] = useState<(boolean | undefined)[]>([]);
  const right = ITEMS.filter((item, i) => picked[i] === item.answer).length;
  const done = picked.filter((p) => p !== undefined).length;

  const pick = (i: number, value: boolean) => {
    const next = [...picked];
    next[i] = value;
    setPicked(next);
  };

  return (
    <div className="vs-quiz">
      <ol>
        {ITEMS.map((item, i) => {
          const choice = picked[i];
          const answered = choice !== undefined;
          return (
            <li key={i} className="vs-card">
              <p className="vs-set">
                <Mixed text={item.set} />
              </p>
              <div className="vs-buttons" role="group" aria-label="Is it a vector space?">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    className={`demo-button${choice === value ? '' : ' secondary'}`}
                    aria-pressed={choice === value}
                    onClick={() => pick(i, value)}
                  >
                    {value ? 'Vector space' : 'Not one'}
                  </button>
                ))}
              </div>
              {answered && (
                <p className="vs-why" aria-live="polite">
                  <strong className={choice === item.answer ? 'vs-right' : 'vs-wrong'}>
                    {choice === item.answer ? 'Right. ' : 'Not quite. '}
                  </strong>
                  {item.answer ? 'It is a vector space. ' : 'It is not a vector space. '}
                  <Mixed text={item.why} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <p className="demo-status" aria-live="polite">
        {done === ITEMS.length ? `${right} out of ${ITEMS.length} right.` : `${done} of ${ITEMS.length} answered.`}
      </p>
    </div>
  );
}
