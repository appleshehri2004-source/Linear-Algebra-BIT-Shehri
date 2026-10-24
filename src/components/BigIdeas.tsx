// The homepage's "Four big ideas": four short texts beside one pinned picture.
// When a text reaches a line across the screen, the picture plays that idea's whole animation once (about 2 s);
// scrolling back to it plays it again. Scrolling only picks the idea: it never drives the animation.
// Visitors who asked for less motion see the idea's last frame straight away.
// What each idea draws comes from content/home.ts (vectorsScene, spanScene, transformationAt, eigenScene).
import { useEffect, useRef, useState } from 'react';
import { Line, Point, Text, Vector } from 'mafs';
import { gridLines, length, lerpVec, matVec, type Mat2, type Vec2 } from '../lib/linalg';
import { bigIdeas, eigenScene, spanScene, transformationAt, vectorsScene } from '../content/home';
import { HaloArrow } from './HomeHalo';
import Plane from './Plane';
import TestShape from './TestShape';
import { MathPath, toPath } from './TransformPlayer';
import { usePlayback } from './usePlayback';
import './BigIdeas.css';

/** How long one idea's animation plays, in milliseconds. */
const IDEA_TIME = 2200;
const RANGE = 3;
// The grid that moves (ideas 3 and 4): lines from -2·RANGE to 2·RANGE, so a stretched grid still fills the plane.
const EXTENT = RANGE * 2;
const GRID = gridLines(EXTENT);
const AXES = GRID.slice(2 * EXTENT, 2 * EXTENT + 2);
/** Where idea 4's ordinary arrow starts: its faint starting line stays drawn, so you can see it leave. */
const ORDINARY_START = eigenScene(0).ordinary;
/** The width at which the texts and the picture sit side by side (56rem, as in BigIdeas.css). */
const WIDE = '(min-width: 56rem)';

/**
 * An arrow with a label, from `tail` (default: the origin). Skipped when it has (almost) no length.
 * The label goes at the tip, or half way along when another arrow ends at the same tip (w and v + w).
 */
function Arrow({ tip, tail = [0, 0], color, label, labelHalfway = false }: { tip: Vec2; tail?: Vec2; color: string; label: string; labelHalfway?: boolean }) {
  if (length([tip[0] - tail[0], tip[1] - tail[1]]) < 0.05) return null;
  const [x, y] = labelHalfway ? lerpVec(tail, tip, 0.5) : tip;
  return (
    <>
      <Vector tail={tail} tip={tip} color={color} weight={3} />
      <Text x={x} y={y} attach={labelHalfway ? 'e' : 'ne'} attachDistance={12} color={color} size={22}>
        {label}
      </Text>
    </>
  );
}

/** The plane moved by m: the grid, the BIT logo (the symbol defined once on the homepage), î and ĵ. */
function MovedPlane({ m, showBasis = true }: { m: Mat2; showBasis?: boolean }) {
  return (
    <>
      <MathPath d={toPath(GRID.map((line) => line.map((p) => matVec(m, p))))} className="ideas-moving-grid" />
      <MathPath d={toPath(AXES.map((line) => line.map((p) => matVec(m, p))))} className="ideas-moving-axes" />
      <g style={{ transform: 'var(--mafs-view-transform)' }}>
        <TestShape shape="bit-logo" matrix={m} flipY={false} useSymbol />
      </g>
      {showBasis && <HaloArrow tip={m[0]} color="var(--i-hat)" label="î" />}
      {showBasis && <HaloArrow tip={m[1]} color="var(--j-hat)" label="ĵ" />}
    </>
  );
}

/** What the picture shows for one idea at time t. */
function Scene({ idea, t }: { idea: number; t: number }) {
  if (idea === 0) {
    const { v, wTip, sum } = vectorsScene(t);
    return (
      <>
        <Arrow tip={v} color="var(--ink)" label="v" />
        {wTip && <Arrow tail={v} tip={wTip} color="var(--ink)" label="w" labelHalfway />}
        {sum && <Arrow tip={sum} color="var(--output)" label="v + w" />}
      </>
    );
  }
  if (idea === 1) {
    const { u, w, dots, collapsing } = spanScene(t);
    return (
      <>
        {collapsing && <Line.ThroughPoints point1={[0, 0]} point2={u} color="var(--output)" weight={1.5} opacity={0.6} />}
        {dots.map(([x, y], i) => (
          <Point key={i} x={x} y={y} color="var(--output)" />
        ))}
        <Arrow tip={u} color="var(--ink)" label="u" />
        <Arrow tip={w} color="var(--ink)" label="w" />
      </>
    );
  }
  if (idea === 2) return <MovedPlane m={transformationAt(t)} />;
  const { matrix, lines, eigenArrows, ordinary } = eigenScene(t);
  return (
    <>
      <MovedPlane m={matrix} showBasis={false} />
      {/* The ordinary arrow's starting line, faint, so you can see it leave. */}
      <Line.ThroughPoints point1={[0, 0]} point2={ORDINARY_START} color="var(--ink-2)" weight={1} opacity={0.4} />
      {lines.map((d, i) => (
        <Line.ThroughPoints key={i} point1={[0, 0]} point2={d} color="var(--eigen)" style="dashed" weight={2} />
      ))}
      {eigenArrows.map((tip, i) => (
        <HaloArrow key={i} tip={tip} color="var(--eigen)" label={i === 0 ? '×2' : '×0.5'} />
      ))}
      <HaloArrow tip={ordinary} color="var(--ink)" label="x" />
    </>
  );
}

export default function BigIdeas() {
  const [active, setActive] = useState(0);
  const playback = usePlayback({ duration: IDEA_TIME });
  const items = useRef<(HTMLLIElement | null)[]>([]);

  /** Make idea i the one shown, and play it from the start (or jump to its end, with reduced motion). */
  function show(i: number) {
    setActive(i);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) playback.scrub(1);
    else playback.animateTo(1, 0);
  }
  // The watcher below is made once, so it calls the latest `show` through this ref.
  const showRef = useRef(show);
  showRef.current = show;

  // Until a text reaches the band, show idea 1's finished picture rather than an empty plane.
  useEffect(() => playback.scrub(1), []);

  useEffect(() => {
    // The line a text must reach to become "on": a band with no height, so exactly one text holds it at a time.
    // Side by side it's the middle of the screen; on a phone the picture is pinned at the top, so it's lower down.
    const band = window.matchMedia(WIDE).matches ? '-50% 0px -50% 0px' : '-69% 0px -31% 0px';
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) showRef.current(Number((entry.target as HTMLElement).dataset.idea));
        }
      },
      { rootMargin: band },
    );
    items.current.forEach((item) => item && watcher.observe(item));
    return () => watcher.disconnect();
  }, []);

  return (
    <div className="ideas-grid">
      <ol className="ideas">
        {bigIdeas.map((idea, i) => (
          <li
            key={idea.name}
            ref={(el) => {
              items.current[i] = el;
            }}
            data-idea={i}
            className={i === active ? 'active' : undefined}
            aria-current={i === active ? 'step' : undefined}
          >
            <h3>
              <span className="idea-number">{i + 1}</span> {idea.name}
            </h3>
            <p>{idea.text}</p>
          </li>
        ))}
      </ol>
      {/* The picture illustrates the text next to it, which says everything it shows. */}
      <div className="ideas-picture" aria-hidden="true">
        <Plane range={RANGE}>
          <Scene idea={active} t={playback.t} />
        </Plane>
        <p className="ideas-picture-caption">
          {active + 1}. {bigIdeas[active].name}
        </p>
      </div>
    </div>
  );
}
