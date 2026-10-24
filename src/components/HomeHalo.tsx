// The homepage's 3px paper-coloured outline (halo) around arrows and handles, so they stay visible over the logo.
// <HaloFilter /> is defined once on the homepage (index.astro, next to the logo's symbol); anything inside a group
// with filter={HALO} gets the outline. Used by HeroPlayground and SvdShowcase.
import { Text, Vector } from 'mafs';
import { length, type Vec2 } from '../lib/linalg';

/** Put this on a group: filter={HALO}. */
export const HALO = 'url(#home-halo)';

/**
 * The filter: grow the drawing's shape by 3px, fill that with --paper, and put the drawing on top.
 * (A thicker paper-coloured arrow underneath doesn't work: Mafs's arrowheads grow with the line, so its head
 * would be a big paper triangle hiding the logo.)
 */
export function HaloFilter() {
  return (
    <filter id="home-halo" x="-50%" y="-50%" width="200%" height="200%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="grown" />
      <feFlood style={{ floodColor: 'var(--paper)' }} result="paper" />
      <feComposite in="paper" in2="grown" operator="in" result="halo" />
      <feMerge>
        <feMergeNode in="halo" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** An arrow from the origin with a label at its tip, outlined by the halo. Hidden when squashed to (almost) nothing. */
export function HaloArrow({ tip, color, label }: { tip: Vec2; color: string; label: string }) {
  if (length(tip) <= 0.05) return null;
  return (
    <>
      <g filter={HALO}>
        <Vector tip={tip} color={color} weight={3} />
      </g>
      {/* 24px: large text, so î's colour is readable enough as a label (3 : 1). Mafs gives text its own outline. */}
      <Text x={tip[0]} y={tip[1]} attach="ne" attachDistance={14} color={color} size={24}>
        {label}
      </Text>
    </>
  );
}
