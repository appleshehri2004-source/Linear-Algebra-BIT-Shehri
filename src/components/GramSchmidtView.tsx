// Lesson 6.4: Gram–Schmidt, one step at a time.
// Drag v₁ (yellow) and v₂ (orange), then press "Next step":
//   1. keep v₁, and show v₂'s shadow on v₁ (the part to take away),
//   2. slide v₂ down to v₂ − shadow, which is at right angles to v₁,
//   3. shrink or stretch both to length 1 (onto the faint unit circle).
// All the maths comes from linalg.ts (gramSchmidtAt, gramSchmidtSteps, rightAngleMark).
import { useState } from 'react';
import { Circle, Line, Polygon, Vector } from 'mafs';
import {
  currentStep,
  dot,
  gramSchmidtAt,
  gramSchmidtSteps,
  length,
  rightAngleMark,
  roundTo,
  type Vec2,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import SnapToggle from './SnapToggle';
import { usePlayback } from './usePlayback';
import './Demo.css';

interface Props {
  v1: Vec2;
  v2: Vec2;
}

/** Two decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

const CAPTIONS = [
  'Start: two arrows v₁ and v₂ that are not at right angles.',
  'Step 1: keep v₁ as it is. The gold arrow is v₂’s shadow on v₁: the part of v₂ to take away.',
  'Step 2: v₂ minus its shadow. What is left is at right angles to v₁ ✓',
  'Step 3: scale both to length 1. Now they are q₁ and q₂: 1 long and at right angles.',
];

export default function GramSchmidtView({ v1: start1, v2: start2 }: Props) {
  const [v1, setV1] = useState<Vec2>(start1);
  const [v2, setV2] = useState<Vec2>(start2);
  const [snap, setSnap] = useState(true);
  const playback = usePlayback({ duration: 2700 });
  const { t, playing } = playback;

  /** Dragging an arrow starts again from the beginning. */
  function edit(set: (x: Vec2) => void) {
    return (x: Vec2) => {
      playback.scrub(0);
      set(x);
    };
  }

  const now = gramSchmidtAt(v1, v2, t);
  const steps = gramSchmidtSteps(v1, v2);
  if (!now || !steps) {
    return (
      <div>
        <Plane range={4}>
          <DragVector value={v1} onChange={edit(setV1)} snap={snap} label="v₁" limit={4} />
          <DragVector value={v2} onChange={edit(setV2)} snap={snap} label="v₂" color="var(--vec2)" limit={4} />
        </Plane>
        <p className="demo-message">v₁ and v₂ lie on one line (or one is 0), so there's no plane to make a basis for. Drag one away.</p>
      </div>
    );
  }

  // How many steps are finished: 0 to 3. (t = 1/3 is the end of step 1, and so on.)
  const done = t === 1 ? 3 : currentStep(3, t + 1e-9);
  const atStart = t === 0;
  const showShadow = t > 0 && t <= 2 / 3 + 1e-9;
  const mark = t >= 2 / 3 - 1e-9 ? rightAngleMark<Vec2>([0, 0], now.a1, now.a2, 0.25) : null;

  function next() {
    playback.animateTo(Math.min(3, done + 1) / 3);
  }

  return (
    <div>
      <Plane range={4}>
        {t >= 2 / 3 && <Circle center={[0, 0]} radius={1} color="var(--muted)" fillOpacity={0} strokeStyle="dashed" />}
        {showShadow && (
          <>
            <Line.ThroughPoints point1={[0, 0]} point2={v1} color="var(--muted)" opacity={0.4} />
            <Line.Segment point1={v2} point2={steps.projection} color="var(--muted)" style="dashed" />
            <Vector tip={steps.projection} color="var(--sum)" weight={5} />
          </>
        )}
        {mark && <Polygon points={mark} color="var(--text)" fillOpacity={0} weight={1.5} />}
        {atStart ? (
          <>
            <DragVector value={v1} onChange={edit(setV1)} snap={snap} label="v₁" limit={4} />
            <DragVector value={v2} onChange={edit(setV2)} snap={snap} label="v₂" color="var(--vec2)" limit={4} />
          </>
        ) : (
          <>
            <Vector tip={now.a1} color="var(--vec)" weight={3} />
            <Vector tip={now.a2} color="var(--vec2)" weight={3} />
          </>
        )}
      </Plane>

      <p className="demo-status" aria-live="polite">
        {playing ? CAPTIONS[now.step + 1] : CAPTIONS[done]}
      </p>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={next} disabled={done === 3 || playing !== null}>
          Next step
        </button>
        <button type="button" className="demo-button secondary" onClick={() => playback.animateTo(0)} disabled={atStart}>
          Start over
        </button>
      </div>

      <div className="demo-row">
        <CoordReadout vector={now.a1} label={done === 3 ? 'q₁' : 'v₁'} />
        <CoordReadout vector={now.a2} label={done === 3 ? 'q₂' : done === 2 ? 'w₂' : 'v₂'} color="var(--vec2)" />
      </div>
      <div className="demo-row">
        <span>length₁ = {show(length(now.a1))}</span>
        <span>length₂ = {show(length(now.a2))}</span>
        <span>dot product = {show(dot(now.a1, now.a2))}</span>
      </div>
      {atStart && <p className="demo-message">Drag v₁ and v₂ before you start. After Start over you can drag them again.</p>}
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}
