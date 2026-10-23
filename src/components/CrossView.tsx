// Lessons 5.2 and 5.3: the cross product.
// 2D mode: drag v and w. The parallelogram they make is shaded, with its signed area v × w
// (blue when positive, purple and negative when v is to the left of w).
// 3D mode: sliders set v and w. The teal arrow v × w is at right angles to both, and as long as the
// parallelogram's area. "Swap v and w" flips the arrow, sliding it smoothly through 0 to the other side.
// With `box` (Lesson 5.3) a third vector p = (x, y, z) makes a slanted box on that parallelogram:
// its volume, base area × height, is p · (v × w).
// All the maths comes from linalg.ts; the 3D picture is Scene3D (the drawing part of Stage3D).
import { useState } from 'react';
import { Polygon, Text } from 'mafs';
import {
  boxVolume,
  centroid,
  cross2,
  cross3,
  dot3,
  identity3,
  length3,
  lerpVec3,
  parallelepipedEdges,
  parallelogram,
  parallelogram3,
  roundTo,
  type Vec2,
  type Vec3,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import SnapToggle from './SnapToggle';
import LazyScene3D from './LazyScene3D';
import type { SceneArrow } from './Scene3D';
import { usePlayback } from './usePlayback';
import './Demo.css';

interface Props {
  /** '2d': drag v and w on a plane. '3d': sliders for v and w, and the arrow v × w. */
  mode: '2d' | '3d';
  /** Where v starts: 2 numbers in 2D, 3 in 3D. */
  v: number[];
  /** Where w starts. */
  w: number[];
  /** 3D only (Lesson 5.3): add p = (x, y, z) and the slanted box made by p, v and w. */
  box?: number[];
}

/** Two decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');
/** A negative number in brackets, so "2 × (−3)" reads clearly. */
const bracket = (n: number) => (n < 0 ? `(${show(n)})` : show(n));
const vec = (v: number[]) => `(${v.map(show).join(', ')})`;

export default function CrossView(props: Props) {
  return props.mode === '2d' ? <Cross2D v={props.v as Vec2} w={props.w as Vec2} /> : <Cross3D {...props} />;
}

function Cross2D({ v: startV, w: startW }: { v: Vec2; w: Vec2 }) {
  const [v, setV] = useState<Vec2>(startV);
  const [w, setW] = useState<Vec2>(startW);
  const [snap, setSnap] = useState(true);

  const area = cross2(v, w);
  const corners = parallelogram(v, w);
  const [cx, cy] = centroid(corners);
  const colour = area < 0 ? 'var(--area-flipped)' : area > 0 ? 'var(--area-kept)' : 'var(--zero)';
  const words =
    area > 0
      ? 'Positive: v is to the right of w (turn v anticlockwise to reach w).'
      : area < 0
        ? 'Negative: v is to the left of w (turn v clockwise to reach w).'
        : 'Zero: v and w lie on one line, so there is no area.';

  return (
    <div>
      <Plane>
        <Polygon points={corners} color={colour} fillOpacity={0.3} weight={2} />
        <Text x={cx} y={cy} color={colour} size={18}>
          {show(area)}
        </Text>
        <DragVector value={v} onChange={setV} snap={snap} label="v" />
        <DragVector value={w} onChange={setW} snap={snap} label="w" color="var(--vec2)" />
      </Plane>
      <p className="demo-status" aria-live="polite" style={{ color: colour }}>
        v × w = {bracket(v[0])} × {bracket(w[1])} − {bracket(v[1])} × {bracket(w[0])} = {show(area)}
      </p>
      <p className="demo-message" style={{ color: colour }}>
        {words}
      </p>
      <div className="demo-row">
        <button type="button" className="demo-button secondary" onClick={() => { setV(w); setW(v); }}>
          Swap v and w
        </button>
      </div>
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}

/** Three small sliders, one per coordinate, for one vector. */
function VectorSliders({ name, value, onChange, colour }: { name: string; value: Vec3; onChange: (v: Vec3) => void; colour: string }) {
  return (
    <fieldset className="coord-sliders" style={{ color: colour }}>
      <legend>
        {name} = {vec(value)}
      </legend>
      {(['x', 'y', 'z'] as const).map((axis, i) => (
        <label key={axis}>
          <span>{axis}</span>
          <input
            type="range"
            min={-2}
            max={2}
            step={1}
            value={value[i]}
            aria-label={`${name} ${axis}`}
            onChange={(e) => {
              const next = [...value] as Vec3;
              next[i] = Number(e.target.value);
              onChange(next);
            }}
          />
        </label>
      ))}
    </fieldset>
  );
}

function Cross3D({ v: startV, w: startW, box: startP }: Props) {
  const [v, setV] = useState<Vec3>(startV as Vec3);
  const [w, setW] = useState<Vec3>(startW as Vec3);
  const [p, setP] = useState<Vec3 | undefined>(startP as Vec3 | undefined);
  // When v and w are swapped, the arrow slides from where it was (`from`) to its new place as t goes 0 → 1.
  const [from, setFrom] = useState<Vec3>([0, 0, 0]);
  const playback = usePlayback({ duration: 900 });

  const cross = cross3(v, w);
  const shown = playback.playing ? lerpVec3(from, cross, playback.t) : cross;
  const area = length3(cross);

  function swap() {
    setFrom(cross);
    setV(w);
    setW(v);
    playback.animateTo(1, 0);
  }
  /** Moving a slider stops any flip that's still playing, so the arrow is always the real v × w. */
  function edit(set: (x: Vec3) => void) {
    return (x: Vec3) => {
      playback.stop();
      set(x);
    };
  }

  const arrows: SceneArrow[] = [
    { tip: v, colour: 'vec', label: 'v' },
    { tip: w, colour: 'vec2', label: 'w' },
    { tip: shown, colour: 'cross', label: 'v × w' },
  ];
  const volume = p && boxVolume(p, v, w);
  if (p) arrows.push({ tip: p, colour: 'space', label: '(x, y, z)' });

  return (
    <div className="stage3d">
      <LazyScene3D
        matrix={identity3()}
        showBasis={false}
        showCube={false}
        zoomOut={1.6}
        arrows={arrows}
        patch={{ corners: parallelogram3(v, w), colour: 'areaKept' }}
        edges={p && { pairs: parallelepipedEdges(p, v, w), colour: 'space' }}
      />
      <p className="demo-message">Drag to turn the view. Pinch or scroll to zoom.</p>

      <div className="demo-row">
        <VectorSliders name="v" value={v} onChange={edit(setV)} colour="var(--vec)" />
        <VectorSliders name="w" value={w} onChange={edit(setW)} colour="var(--vec2)" />
        {p && <VectorSliders name="(x, y, z)" value={p} onChange={edit(setP)} colour="var(--space)" />}
      </div>
      <div className="demo-row">
        <button type="button" className="demo-button" onClick={swap}>
          Swap v and w
        </button>
      </div>

      <ul className="demo-checklist" aria-live="polite">
        <li style={{ color: 'var(--cross)' }}>v × w = {vec(cross)}</li>
        <li>
          Length {show(area)} = the parallelogram's area{area === 0 ? ' (v and w are on one line: no area, no arrow)' : ''}
        </li>
        <li>
          (v × w) · v = {show(dot3(cross, v))} and (v × w) · w = {show(dot3(cross, w))}: at right angles to both ✓
        </li>
        {volume && (
          <>
            <li>
              Base area {show(volume.base)} × height {show(volume.height)} = volume {show(volume.volume)}
            </li>
            <li style={{ color: 'var(--space)' }}>
              (x, y, z) · (v × w) = {bracket(p![0])}·{bracket(cross[0])} + {bracket(p![1])}·{bracket(cross[1])} +{' '}
              {bracket(p![2])}·{bracket(cross[2])} = {show(volume.volume)}
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
