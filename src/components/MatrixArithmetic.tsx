// Lesson 2.1.2: matrix arithmetic. Type two 2x2 matrices A and B, pick an operation (A + B, 2A, AB, BA, A², Aᵀ…),
// and see the answer as numbers and as a transformation of the plane, with a yellow vector riding along.
// All the maths comes from matrixOperation in linalg.ts.
import { useState } from 'react';
import { formatNumber, matrixOperation, matVec, type Mat2, type MatrixOperation, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixEditor from './MatrixEditor';
import MatrixView from './MatrixView';
import './Demo.css';

interface Props {
  /** The starting matrices, stored as columns. */
  a: Mat2;
  b: Mat2;
  /** The operations to offer as buttons. The first is shown first. */
  operations?: MatrixOperation[];
  /** A yellow vector that rides along. */
  tracked?: Vec2;
  range?: number;
}

/** One sentence per operation: what it does to the numbers, or to the plane. */
const what: Record<MatrixOperation, string> = {
  'A + B': 'Add the matching numbers. Each vector goes to Av + Bv.',
  'A − B': 'Subtract the matching numbers. Each vector goes to Av − Bv.',
  '2A': 'Double every number. Each vector goes twice as far as A sends it.',
  AB: 'Do B first, then A. Each column of AB is A times a column of B.',
  BA: 'Do A first, then B. Usually not the same as AB.',
  'A²': 'Do A twice: A² = AA.',
  Aᵀ: 'The rows of A become the columns of Aᵀ. The numbers flip across the diagonal.',
};

export default function MatrixArithmetic({
  a: startA,
  b: startB,
  operations = ['A + B', '2A', 'AB', 'BA', 'A²', 'Aᵀ'],
  tracked = [1, 1],
  range = 5,
}: Props) {
  const [a, setA] = useState<Mat2>(startA);
  const [b, setB] = useState<Mat2>(startB);
  const [op, setOp] = useState<MatrixOperation>(operations[0]);
  const [playKey, setPlayKey] = useState(0);
  const result = matrixOperation(op, a, b);
  const usesB = op !== '2A' && op !== 'A²' && op !== 'Aᵀ';

  function choose(o: MatrixOperation) {
    setOp(o);
    setPlayKey((k) => k + 1);
  }

  return (
    <div>
      <div className="demo-row" role="group" aria-label="Operation">
        {operations.map((o) => (
          <button
            key={o}
            type="button"
            className={o === op ? 'demo-button' : 'demo-button secondary'}
            aria-pressed={o === op}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="demo-row">
        <MatrixEditor
          value={a}
          label="A"
          onChange={(m) => {
            setA(m);
            setPlayKey((k) => k + 1);
          }}
        />
        <span style={{ opacity: usesB ? 1 : 0.4 }}>
          <MatrixEditor
            value={b}
            label="B"
            onChange={(m) => {
              setB(m);
              setPlayKey((k) => k + 1);
            }}
          />
        </span>
        <MatrixView columns={result} label={op} fractions />
      </div>

      <p className="demo-status">{what[op]}</p>

      <TransformPlayer matrix={result} tracked={tracked} range={range} playKey={playKey} />

      <p className="demo-status">
        {op} sends v = ({tracked.join(', ')}) to ({matVec(result, tracked).map((n) => formatNumber(n).replace('-', '−')).join(', ')}).
      </p>
    </div>
  );
}
