// The picture behind det = ad − bc, in steps. The parallelogram made by î = (a, c) and ĵ = (b, d)
// sits in an (a + b) by (c + d) box. Step by step, the corner triangles and rectangles are cut away
// from the box, and what's left is the parallelogram's area: ad − bc.
// The four numbers must all be positive (the shapes are worked out by adBcPieces in linalg.ts).
import { useState } from 'react';
import { Polygon, Text, Vector } from 'mafs';
import { adBcPieces, centroid, det2, roundTo, transformShape, UNIT_SQUARE, type AreaPiece, type Mat2 } from '../lib/linalg';
import Plane from './Plane';
import './Demo.css';
import './AreaPatch.css';

interface Props {
  /** The matrix, stored as its columns: [[a, c], [b, d]]. All four numbers positive. */
  matrix: Mat2;
}

/** A grey piece that gets cut away, with its area written in the middle. */
function Cut({ piece }: { piece: AreaPiece }) {
  const [x, y] = centroid(piece.points);
  return (
    <>
      <Polygon points={piece.points} color="var(--muted)" fillOpacity={0.35} weight={1} />
      <Text x={x} y={y} size={14} color="var(--text)">
        {String(roundTo(piece.area, 2))}
      </Text>
    </>
  );
}

export default function AdBcPicture({ matrix }: Props) {
  const [step, setStep] = useState(0);
  const { box, triangles, rectangles } = adBcPieces(matrix);
  const [[a, c], [b, d]] = matrix;
  const [w, h] = box.points[2];
  const parallelogram = transformShape(matrix, UNIT_SQUARE);
  const [px, py] = centroid(parallelogram);

  const captions = [
    `The parallelogram made by î = (${a}, ${c}) and ĵ = (${b}, ${d}). What is its area?`,
    `Draw a box around it: (a + b)(c + d) = ${a + b} × ${c + d} = ${roundTo(box.area, 2)}.`,
    `Cut away 4 triangles: two of area ac/2 = ${roundTo((a * c) / 2, 2)} and two of area bd/2 = ${roundTo((b * d) / 2, 2)}.`,
    `Cut away 2 rectangles of area bc = ${roundTo(b * c, 2)}. What's left: ad − bc = ${a}·${d} − ${b}·${c} = ${roundTo(det2(matrix), 2)}.`,
  ];

  return (
    <div className="adbc-picture">
      <Plane x={[0, Math.max(w, h)]} y={[0, Math.max(w, h)]}>
        {step >= 1 && <Polygon points={box.points} color="var(--text)" fillOpacity={0} weight={2} strokeStyle="dashed" />}
        {step >= 2 && triangles.map((p, i) => <Cut key={`t${i}`} piece={p} />)}
        {step >= 3 && rectangles.map((p, i) => <Cut key={`r${i}`} piece={p} />)}
        <Polygon points={parallelogram} color="var(--area-kept)" fillOpacity={0.3} weight={2} />
        <Text x={px} y={py} size={18} color="var(--area-kept)">
          {step === 3 ? String(roundTo(det2(matrix), 2)) : '?'}
        </Text>
        <Vector tip={matrix[0]} color="var(--ihat)" weight={3} />
        <Vector tip={matrix[1]} color="var(--jhat)" weight={3} />
      </Plane>

      <p className="demo-status" aria-live="polite">
        {captions[step]}
      </p>
      <div className="demo-row">
        <button type="button" className="demo-button secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </button>
        <button type="button" className="demo-button" disabled={step === 3} onClick={() => setStep((s) => s + 1)}>
          Next step
        </button>
      </div>
    </div>
  );
}
