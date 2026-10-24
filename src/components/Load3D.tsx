// The 3D card's "Load 3D" button. Until it is tapped, the card shows its still picture (passed in as children,
// drawn at build time by Still3D.astro) and no 3D code has been downloaded. The tap downloads the lessons' 3D
// view (Stage3D, and through it three.js, about 240 KB compressed) and shows it in the same place.
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Mat3 } from '../lib/linalg';
import './Load3D.css';

// lazy(): this import only runs, and the browser only fetches the file, when Stage3D is first drawn.
const Stage3D = lazy(() => import('./Stage3D'));

interface Props {
  /** The matrix the 3D view starts on, stored as its columns. */
  matrix: Mat3;
  /** Buttons for ready-made matrices, as in lesson 1.9.4. */
  presets: { name: string; matrix: Mat3 }[];
  /** The still picture shown until the tap. */
  children?: ReactNode;
}

export default function Load3D({ matrix, presets, children }: Props) {
  const [loaded, setLoaded] = useState(false);
  const live = useRef<HTMLDivElement>(null);

  // The button disappears when tapped, so move the keyboard focus to the 3D view instead of losing it.
  useEffect(() => {
    if (loaded) live.current?.focus();
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="load-3d">
        {children}
        <button type="button" className="load-3d-button" onClick={() => setLoaded(true)}>
          Load 3D
        </button>
        <p className="load-3d-note">Downloads the 3D view (about 240 KB). Drag it to turn it around.</p>
      </div>
    );
  }

  return (
    <div className="load-3d" ref={live} tabIndex={-1} aria-label="3D view: drag to turn it around">
      <Suspense fallback={<div className="scene3d-placeholder">Loading 3D…</div>}>
        <Stage3D matrix={matrix} presets={presets} showDet={false} />
      </Suspense>
    </div>
  );
}
