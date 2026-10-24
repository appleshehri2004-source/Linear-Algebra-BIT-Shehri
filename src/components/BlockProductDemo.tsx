// Lesson 2.4.1: multiplying partitioned matrices. Choose where to cut A and B (the cut down A and the cut across B
// must be the same one, so the blocks fit). The four blocks of AB are worked out with the row–column rule on blocks,
// A₁₁B₁₁ + A₁₂B₂₁ and so on, and put together they give the ordinary AB, wherever the cuts are.
// Rows, not columns, like the other Chapter 2 helpers. All the maths comes from blockProduct in linalg.ts.
import { useState } from 'react';
import { blockMatrixTex, blockProduct } from '../lib/linalg';
import Tex from './Tex';
import './Demo.css';

interface Props {
  /** Two 3×3 matrices, as rows. */
  a: number[][];
  b: number[][];
}

/** One row of "cut after 1 / cut after 2" buttons. */
function CutButtons({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="demo-row" role="group" aria-label={label}>
      <span>{label}</span>
      {[1, 2].map((n) => (
        <button
          key={n}
          type="button"
          className={n === value ? 'demo-button' : 'demo-button secondary'}
          aria-pressed={n === value}
          onClick={() => onChange(n)}
        >
          after {n}
        </button>
      ))}
    </div>
  );
}

export default function BlockProductDemo({ a, b }: Props) {
  const [rowCut, setRowCut] = useState(1);
  const [innerCut, setInnerCut] = useState(2);
  const [colCut, setColCut] = useState(2);
  const { aBlocks, bBlocks, product } = blockProduct(a, b, rowCut, innerCut, colCut);
  const sub = (i: number, j: number) => `${i + 1}${j + 1}`;

  return (
    <div>
      <CutButtons label="Cut A's rows" value={rowCut} onChange={setRowCut} />
      <CutButtons label="Cut A's columns and B's rows" value={innerCut} onChange={setInnerCut} />
      <CutButtons label="Cut B's columns" value={colCut} onChange={setColCut} />

      <p style={{ textAlign: 'center', overflowX: 'auto' }}>
        <Tex display tex={`A = ${blockMatrixTex(aBlocks)} \\qquad B = ${blockMatrixTex(bBlocks)}`} />
      </p>

      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}>
        {[0, 1].map((i) =>
          [0, 1].map((j) => (
            <li key={sub(i, j)} style={{ overflowX: 'auto' }}>
              <Tex
                tex={`(AB)_{${sub(i, j)}} = A_{${sub(i, 0)}}B_{${sub(0, j)}} + A_{${sub(i, 1)}}B_{${sub(1, j)}} = ${blockMatrixTex([[product[i][j]]])}`}
              />
            </li>
          )),
        )}
      </ul>

      <p style={{ textAlign: 'center', overflowX: 'auto' }}>
        <Tex display tex={`AB = ${blockMatrixTex(product)}`} />
      </p>
      <p className="demo-status">
        Put together, the blocks are the same AB as the row–column rule gives, wherever you cut.
      </p>
    </div>
  );
}
