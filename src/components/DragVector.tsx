// An arrow you can drag by its tip (mouse, finger, or arrow keys after tabbing to it).
// It must sit inside a <Plane>. The parent keeps the vector in its state and passes it back in.
import { MovablePoint, Text, Vector } from 'mafs';
import { add, clampVec, snapVec, sub, type Vec2 } from '../lib/linalg';

interface Props {
  /** The vector the arrow shows. */
  value: Vec2;
  /** Called with the new vector while the tip is dragged. */
  onChange: (v: Vec2) => void;
  /** Where the arrow starts. Default: the origin. Used for tip-to-tail drawings. */
  tail?: Vec2;
  /** A colour such as "var(--vec)". */
  color?: string;
  /** true: the tip jumps to whole numbers. */
  snap?: boolean;
  /** A short name drawn next to the tip, e.g. "v". */
  label?: string;
  /** The tip can't be dragged past this distance from the origin (match the Plane's range). */
  limit?: number;
}

export default function DragVector({
  value,
  onChange,
  tail = [0, 0],
  color = 'var(--vec)',
  snap = false,
  label,
  limit = 5,
}: Props) {
  const tip = add(tail, value);

  function move(point: Vec2) {
    let p = clampVec(point, limit);
    if (snap) p = snapVec(p);
    // The point is where the tip is on the plane; the vector is the walk from tail to tip.
    onChange(sub(p, tail));
  }

  return (
    <>
      <Vector tail={tail} tip={tip} color={color} weight={3} />
      {label && (
        <Text x={tip[0]} y={tip[1]} attach="ne" attachDistance={12} color={color} size={20}>
          {label}
        </Text>
      )}
      <MovablePoint point={tip} onMove={move} color={color} />
    </>
  );
}
