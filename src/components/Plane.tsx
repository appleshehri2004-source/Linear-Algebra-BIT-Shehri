// A square 2D coordinate plane: axes, tick labels, and a faint grid.
// It fills the width of its box (so it fits a phone) and redraws when the window resizes.
// Put DragVector (or any Mafs drawing) inside it as children.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Coordinates, Mafs } from 'mafs';
// Mafs's own styles, bundled from node_modules (no CDN). Our colours override them in Plane.css.
import 'mafs/core.css';
import './Plane.css';

interface Props {
  /** The plane shows -range to range on both axes. */
  range?: number;
  children?: ReactNode;
}

export default function Plane({ range = 5, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);

  // Measure the box's width and keep the plane square. Runs again whenever the box resizes.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize(Math.min(el.clientWidth, 480)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // While a finger is dragging an arrow tip, stop the page from scrolling.
  // (CSS already asks for this; this is a backup for browsers that ignore it on SVG.)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let dragging = false;
    const start = (e: TouchEvent) => {
      dragging = (e.target as Element).closest('.mafs-movable-point') !== null;
    };
    const move = (e: TouchEvent) => {
      if (dragging) e.preventDefault();
    };
    const end = () => {
      dragging = false;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, []);

  // On a big plane, label every second tick so the numbers don't crowd.
  const labelEvery = range > 5 ? 2 : 1;
  const label = (n: number) => (n % labelEvery === 0 ? String(n) : '');

  return (
    <div className="plane" ref={box}>
      <Mafs
        width={size}
        height={size}
        viewBox={{ x: [-range, range], y: [-range, range], padding: 0.3 }}
        preserveAspectRatio="contain"
        // The plane stays still: only arrow tips move. (Mafs lets you slide it around by default.)
        pan={false}
      >
        <Coordinates.Cartesian
          xAxis={{ lines: 1, labels: label }}
          yAxis={{ lines: 1, labels: label }}
        />
        {children}
      </Mafs>
    </div>
  );
}
