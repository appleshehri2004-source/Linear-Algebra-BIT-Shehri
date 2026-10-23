// Scene3D, but the heavy 3D code (three.js) is a separate file that only downloads once this is on screen
// (use the lesson component with client:visible). three.js needs a real browser, so the built page
// holds an empty square until the page has loaded.
import { lazy, Suspense, useEffect, useState, type ComponentProps } from 'react';
import './Scene3D.css';

const Scene3D = lazy(() => import('./Scene3D'));

export default function LazyScene3D(props: ComponentProps<typeof Scene3D>) {
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => setInBrowser(true), []);

  const placeholder = <div className="scene3d-placeholder">Loading 3D…</div>;
  if (!inBrowser) return placeholder;
  return (
    <Suspense fallback={placeholder}>
      <Scene3D {...props} />
    </Suspense>
  );
}
