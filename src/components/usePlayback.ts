// The Play / Pause / Rewind / slider logic shared by TransformPlayer (2D) and Stage3D (3D).
// It keeps a time t from 0 ("nothing changed") to 1 ("fully transformed") and animates it.
// Draw the buttons and slider with <PlayControls playback={...} />.
import { useEffect, useRef, useState } from 'react';
import { easeInOut, lerp } from '../lib/linalg';

/** How long a full play (t from 0 to 1) takes by default, in milliseconds. */
export const DURATION = 1500;

export interface PlaybackOptions {
  /** Optional: the parent controls t (0 to 1). Leave out and the hook keeps t itself. */
  t?: number;
  /** Called every time t changes (each animation frame, or when the slider moves). */
  onTChange?: (t: number) => void;
  /** Change this number to play the animation again from the start (e.g. after typing a new matrix). */
  playKey?: number;
  /** How long a full play takes, in milliseconds. */
  duration?: number;
}

export interface Playback {
  t: number;
  playing: 'forward' | 'backward' | null;
  /** Animate to t = 1 (Play) or t = 0 (Rewind). */
  animateTo: (target: 0 | 1, from?: number) => void;
  stop: () => void;
  /** Jump straight to a t (the slider). Stops any animation. */
  scrub: (t: number) => void;
}

export function usePlayback({ t: controlledT, onTChange, playKey, duration = DURATION }: PlaybackOptions = {}): Playback {
  const [ownT, setOwnT] = useState(0);
  const t = controlledT ?? ownT;
  const [playing, setPlaying] = useState<'forward' | 'backward' | null>(null);
  const frame = useRef(0);

  // The animation loop runs outside React's normal flow, so it reads the latest callback from here.
  const onTChangeRef = useRef(onTChange);
  onTChangeRef.current = onTChange;
  const lastT = useRef(t);
  // Every t we have sent to the parent that it may not have passed back yet.
  const sent = useRef<number[]>([]);
  const controlled = controlledT !== undefined;
  function setT(n: number) {
    lastT.current = n;
    if (controlled) sent.current.push(n);
    setOwnT(n);
    onTChangeRef.current?.(n);
  }

  // If the parent changed t itself (e.g. an arrow is being dragged), stop animating so we don't fight it.
  // Frames can come faster than React redraws, so the t passed back may be one we sent a frame or two ago:
  // that isn't a change from the parent. Only a t we never sent is.
  useEffect(() => {
    if (controlledT === undefined) return;
    const i = sent.current.indexOf(controlledT);
    if (i === -1) {
      sent.current = [];
      lastT.current = controlledT;
      stop();
    } else {
      sent.current = sent.current.slice(i + 1);
    }
  }, [controlledT]);

  // Stop the animation when the component goes away.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function stop() {
    cancelAnimationFrame(frame.current);
    setPlaying(null);
  }

  /** Animate t from `from` to `target` (1 for Play, 0 for Rewind), easing in and out. */
  function animateTo(target: 0 | 1, from = lastT.current) {
    stop();
    // Play from the end starts again from the beginning.
    if (target === 1 && from === 1) from = 0;
    if (from === target) return;
    // A shorter distance takes a shorter time, so the speed feels the same.
    const time = duration * Math.abs(target - from);
    const start = performance.now();
    setPlaying(target === 1 ? 'forward' : 'backward');
    const step = (now: number) => {
      const s = Math.min(1, (now - start) / time);
      setT(lerp(from, target, easeInOut(s)));
      if (s < 1) frame.current = requestAnimationFrame(step);
      else setPlaying(null);
    };
    frame.current = requestAnimationFrame(step);
  }

  // When playKey changes (not when the page first loads), play from the start.
  const firstPlayKey = useRef(playKey);
  useEffect(() => {
    if (playKey !== firstPlayKey.current) animateTo(1, 0);
  }, [playKey]);

  function scrub(n: number) {
    stop();
    setT(n);
  }

  return { t, playing, animateTo, stop, scrub };
}
