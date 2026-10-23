// det(AB) = det(A) det(B), shown with areas. Pick B (done first) and A (done second) from preset buttons.
// Press Play: the unit square's area goes 1 → det(B) after step 1 → det(A)·det(B) after step 2.
import { useState } from 'react';
import { det2, matMul, orientation, roundTo, sequenceAt } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixView from './MatrixView';
import { PatchShape, areaSentence } from './AreaPatch';
import type { Preset } from './MatrixPlayground';
import './Demo.css';
import './AreaPatch.css';

interface Props {
  /** The ready-made matrices to pick A and B from. */
  presets: Preset[];
  /** Which preset starts as A, and which as B (positions in the list). */
  startA?: number;
  startB?: number;
  range?: number;
}

/** A row of buttons for picking one preset. */
function Picker({ label, presets, chosen, onPick }: { label: string; presets: Preset[]; chosen: number; onPick: (i: number) => void }) {
  return (
    <div className="demo-row" role="group" aria-label={label}>
      <strong>{label}</strong>
      {presets.map((p, i) => (
        <button
          key={p.name}
          type="button"
          className={i === chosen ? 'demo-button' : 'demo-button secondary'}
          aria-pressed={i === chosen}
          onClick={() => onPick(i)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

/** Write a number for a sentence, with brackets round a negative one: 3 × (−2). */
const n = (x: number) => (x < 0 ? `(${roundTo(x, 2)})` : String(roundTo(x, 2)));

export default function DetProductDemo({ presets, startA = 0, startB = 1, range = 5 }: Props) {
  const [ia, setIa] = useState(startA);
  const [ib, setIb] = useState(startB);
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  const A = presets[ia].matrix;
  const B = presets[ib].matrix;
  // B acts first, so it goes on the right: AB.
  const steps = [B, A];
  const now = sequenceAt(steps, t);
  const area = det2(now);

  function pick(set: (i: number) => void, i: number) {
    set(i);
    setPlayKey((k) => k + 1);
  }

  return (
    <div className="det-product">
      <Picker label="First, B:" presets={presets} chosen={ib} onPick={(i) => pick(setIb, i)} />
      <Picker label="Then, A:" presets={presets} chosen={ia} onPick={(i) => pick(setIa, i)} />

      <p className="demo-message">
        {t === 0 ? 'Press Play.' : t < 0.5 ? `Step 1: ${presets[ib].name} (B)` : `Step 2: ${presets[ia].name} (A)`}
      </p>

      <TransformPlayer steps={steps} range={range} t={t} onTChange={setT} playKey={playKey}>
        <PatchShape m={now} range={range} />
      </TransformPlayer>

      <p className={`demo-status area-status ${orientation(area)}`} aria-live="polite">
        {areaSentence(area)}
      </p>

      <div className="demo-row">
        <MatrixView columns={A} label="A" />
        <MatrixView columns={B} label="B" />
        <MatrixView columns={matMul(A, B)} label="AB" />
      </div>
      <p className="area-formula">
        det(B) = {roundTo(det2(B), 2)}, det(A) = {roundTo(det2(A), 2)}
        <br />
        det(AB) = <strong>{roundTo(det2(matMul(A, B)), 2)}</strong> = {n(det2(A))} × {n(det2(B))}
      </p>
    </div>
  );
}
