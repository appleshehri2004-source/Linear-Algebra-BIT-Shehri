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
  /** Show only this stretch of the x-axis and y-axis instead, e.g. x={[-1, 5]} for a picture in one corner. */
  x?: [number, number];
  y?: [number, number];
  /** Called with the point (in maths coordinates) when the plane is clicked or tapped. */
  onClick?: (p: [number, number]) => void;
  children?: ReactNode;
}

export default function Plane({ range = 5, x, y, onClick, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);
  // Mafs numbers its arrowheads and grids with a counter that keeps growing while the site is built,
  // so the built page and the browser would disagree about those numbers (a "hydration mismatch").
  // So the built page holds an empty square, and Mafs draws only once the page is in the browser.
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => setInBrowser(true), []);

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
      {!inBrowser && <div className="plane-placeholder" />}
      {inBrowser && (
        <Mafs
          width={size}
          height={size}
          viewBox={{ x: x ?? [-range, range], y: y ?? [-range, range], padding: 0.3 }}
          preserveAspectRatio="contain"
          // The plane stays still: only arrow tips move. (Mafs lets you slide it around by default.)
          pan={false}
          onClick={onClick && ((point) => onClick([point[0], point[1]]))}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: 1, labels: label }}
            yAxis={{ lines: 1, labels: label }}
          />
          {children}
        </Mafs>
      )}
    </div>
  );
}
