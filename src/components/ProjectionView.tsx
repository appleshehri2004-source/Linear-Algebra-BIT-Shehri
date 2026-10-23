// Lesson 6.2: projections.
// 'line' mode (2D): drag v and the line's direction a. The gold arrow is v's shadow Pv on the line, the pink
// dashed arrow is the error e = v − Pv, and a small square shows that e meets the line at a right angle.
// "Project again" moves a copy of v to its shadow, then projects the shadow again: it doesn't move (P·P = P).
// 'plane' mode (3D): sliders set v and the two arrows u, w that span the violet plane.
// All the maths comes from linalg.ts (projectionPicture, projectionPicture3, projectionMatrix).
import { useState } from 'react';
import { Line, Polygon, Text, Vector } from 'mafs';
import {
  dot,
  dot3,
  identity3,
  lerpVec,
  matMul,
  projectionMatrix,
  projectionPicture,
  projectionPicture3,
  roundTo,
  type Vec2,
  type Vec3,
} from '../lib/linalg';
import Plane from './Plane';
import DragVector from './DragVector';
import CoordReadout from './CoordReadout';
import MatrixView from './MatrixView';
import SnapToggle from './SnapToggle';
import LazyScene3D from './LazyScene3D';
import type { SceneArrow } from './Scene3D';
import VectorSliders from './VectorSliders';
import { usePlayback } from './usePlayback';
import './Demo.css';

interface Props {
  /** 'line': project onto a line in 2D. 'plane': project onto a plane in 3D. */
  mode: 'line' | 'plane';
  /** Where v starts: 2 numbers for a line, 3 for a plane. */
  v: number[];
  /** Line mode: the line's direction a. */
  a?: number[];
  /** Plane mode: the two arrows that span the plane. */
  u?: number[];
  w?: number[];
}

/** Two decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');
const vec = (v: number[]) => `(${v.map(show).join(', ')})`;

export default function ProjectionView(props: Props) {
  return props.mode === 'line' ? (
    <OntoLine v={props.v as Vec2} a={(props.a ?? [2, 1]) as Vec2} />
  ) : (
    <OntoPlane v={props.v as Vec3} u={(props.u ?? [1, 0, 0]) as Vec3} w={(props.w ?? [0, 1, 0]) as Vec3} />
  );
}

function OntoLine({ v: startV, a: startA }: { v: Vec2; a: Vec2 }) {
  const [v, setV] = useState<Vec2>(startV);
  const [a, setA] = useState<Vec2>(startA);
  const [snap, setSnap] = useState(true);
  // How many times "Project again" has been pressed since the last drag: 0, 1 or 2.
  const [times, setTimes] = useState(0);
  const playback = usePlayback({ duration: 900 });

  const pic = projectionPicture(v, a);
  const P = projectionMatrix(a);

  /** Dragging starts the "project again" story over. */
  function edit(set: (x: Vec2) => void) {
    return (x: Vec2) => {
      playback.stop();
      setTimes(0);
      set(x);
    };
  }

  if (!pic || !P) {
    return (
      <div>
        <Plane>
          <DragVector value={v} onChange={edit(setV)} snap={snap} label="v" />
          <DragVector value={a} onChange={edit(setA)} snap={snap} label="a" color="var(--space)" />
        </Plane>
        <p className="demo-message">a has no length, so there is no line to project onto. Drag a away from 0.</p>
      </div>
    );
  }

  // The copy that gets projected: from v to Pv the first time, from Pv to P(Pv) = Pv the second time.
  const copy = times === 0 ? null : lerpVec(times === 1 ? v : pic.projection, pic.projection, playback.t);
  function projectAgain() {
    setTimes(Math.min(2, times + 1));
    playback.animateTo(1, 0);
  }

  const errorDot = dot(pic.error, a);
  const PP = matMul(P, P);

  return (
    <div>
      <Plane>
        {/* The whole line through a, in violet. */}
        <Line.ThroughPoints point1={[0, 0]} point2={a} color="var(--space)" opacity={0.5} />
        {pic.mark && <Polygon points={pic.mark} color="var(--text)" fillOpacity={0} weight={1.5} />}
        <Vector tip={pic.projection} color="var(--sum)" weight={5} />
        {/* The error, from the shadow up to v. */}
        <Line.Segment point1={pic.projection} point2={v} color="var(--null)" style="dashed" weight={3} />
        <Text x={(v[0] + pic.projection[0]) / 2} y={(v[1] + pic.projection[1]) / 2} attach="e" attachDistance={10} color="var(--null)" size={18}>
          e
        </Text>
        <DragVector value={a} onChange={edit(setA)} snap={snap} label="a" color="var(--space)" />
        <DragVector value={v} onChange={edit(setV)} snap={snap} label="v" />
        {copy && <Vector tip={copy} color="var(--vec2)" weight={3} />}
      </Plane>

      <p className="demo-status" aria-live="polite" style={{ color: 'var(--null)' }}>
        e · a = {show(errorDot)}
        {pic.mark ? ': the error is at right angles to the line ✓' : ''}
      </p>
      {!pic.mark && <p className="demo-message">v is already on the line: its shadow is v itself, and the error is 0.</p>}

      <div className="demo-row">
        <CoordReadout vector={v} label="v" />
        <CoordReadout vector={pic.projection} label="Pv" color="var(--sum)" />
        <CoordReadout vector={pic.error} label="e" color="var(--null)" />
      </div>
      <div className="demo-row">
        <MatrixView columns={P} label="P" fractions />
        <MatrixView columns={PP} label="P·P" fractions />
      </div>

      <div className="demo-row">
        <button type="button" className="demo-button" onClick={projectAgain} disabled={times === 2 && playback.playing !== null}>
          {times === 0 ? 'Project v' : 'Project again'}
        </button>
        {times > 0 && (
          <button type="button" className="demo-button secondary" onClick={() => { playback.stop(); setTimes(0); }}>
            Reset
          </button>
        )}
      </div>
      <p className="demo-message" aria-live="polite" style={{ color: 'var(--vec2)' }}>
        {times === 1 && 'The orange copy of v drops onto the line: that is Pv.'}
        {times === 2 && 'Projected again, it does not move: it is already on the line. P·(Pv) = Pv, so P·P = P.'}
      </p>
      <SnapToggle checked={snap} onChange={setSnap} />
    </div>
  );
}

function OntoPlane({ v: startV, u: startU, w: startW }: { v: Vec3; u: Vec3; w: Vec3 }) {
  const [v, setV] = useState<Vec3>(startV);
  const [u, setU] = useState<Vec3>(startU);
  const [w, setW] = useState<Vec3>(startW);

  const pic = projectionPicture3(v, u, w);
  const arrows: SceneArrow[] = [{ tip: v, colour: 'vec', label: 'v' }];
  if (pic) {
    arrows.push({ tip: pic.projection, colour: 'sum', label: 'Pv' });
    arrows.push({ tip: v, tail: pic.projection, colour: 'null', label: 'e' });
  }
  const mark = pic?.mark;

  return (
    <div className="stage3d">
      <LazyScene3D
        matrix={identity3()}
        showBasis={false}
        showCube={false}
        zoomOut={1.4}
        arrows={arrows}
        columnSpace={pic ? [u, w] : undefined}
        edges={mark ? { pairs: mark.map((c, i) => [c, mark[(i + 1) % 4]] as [Vec3, Vec3]), colour: 'muted' } : undefined}
      />
      <p className="demo-message">Drag to turn the view. Pinch or scroll to zoom.</p>

      <div className="demo-row">
        <VectorSliders name="v" value={v} onChange={setV} colour="var(--vec)" min={-3} max={3} step={0.5} />
        <VectorSliders name="u" value={u} onChange={setU} colour="var(--space)" />
        <VectorSliders name="w" value={w} onChange={setW} colour="var(--space)" />
      </div>

      {pic ? (
        <ul className="demo-checklist" aria-live="polite">
          <li style={{ color: 'var(--sum)' }}>Shadow on the plane: Pv = {vec(pic.projection)}</li>
          <li style={{ color: 'var(--null)' }}>Error: e = v − Pv = {vec(pic.error)}</li>
          <li>
            e · u = {show(dot3(pic.error, u))} and e · w = {show(dot3(pic.error, w))}:{' '}
            {pic.mark ? 'at right angles to the whole plane ✓' : 'v is already on the plane, so the error is 0'}
          </li>
        </ul>
      ) : (
        <p className="demo-message">u and w lie on one line, so they don't span a plane. Move one of them.</p>
      )}
    </div>
  );
}
