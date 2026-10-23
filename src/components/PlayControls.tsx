// The Play / Rewind buttons and the t slider under an animation. The logic lives in usePlayback.
import { useId } from 'react';
import { roundTo } from '../lib/linalg';
import type { Playback } from './usePlayback';
import './Demo.css';
import './TransformPlayer.css';

interface Props {
  playback: Playback;
}

export default function PlayControls({ playback }: Props) {
  const sliderId = useId();
  const { t, playing, animateTo, stop, scrub } = playback;

  return (
    <>
      <div className="demo-row">
        <button
          type="button"
          className="demo-button"
          onClick={() => (playing === 'forward' ? stop() : animateTo(1))}
        >
          {playing === 'forward' ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="demo-button secondary"
          onClick={() => (playing === 'backward' ? stop() : animateTo(0))}
        >
          {playing === 'backward' ? 'Pause' : 'Rewind'}
        </button>
      </div>

      <div className="transform-scrub">
        <label htmlFor={sliderId}>
          t = <output htmlFor={sliderId}>{roundTo(t, 2).toFixed(2)}</output>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => scrub(Number(e.target.value))}
        />
        <div className="slider-ends" aria-hidden="true">
          <span>before</span>
          <span>after</span>
        </div>
      </div>
    </>
  );
}
