// Two transformations played one after the other, with a button to swap the order.
// Under the plane: both product matrices side by side. The one being played has a border,
// and the numbers that differ between them are boxed in yellow.
import { useState } from 'react';
import { isClose, matMul, type Mat2, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import MatrixView from './MatrixView';
import './Demo.css';
import './CompositionDemo.css';

/** One of the two transformations. */
export interface Step {
  /** A word for the buttons and captions, e.g. "rotate". */
  name: string;
  /** A one-letter name for the matrix, e.g. "R". */
  letter: string;
  matrix: Mat2;
}

interface Props {
  a: Step;
  b: Step;
  /** A yellow vector that rides along, so you can see where one point ends up. */
  tracked?: Vec2;
  range?: number;
}

const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function CompositionDemo({ a, b, tracked, range = 5 }: Props) {
  const [aFirst, setAFirst] = useState(true);
  const [t, setT] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  const [first, second] = aFirst ? [a, b] : [b, a];

  // "a first, then b" is the product B·A (the first one goes on the right).
  const orders = [
    { first: a, second: b, product: matMul(b.matrix, a.matrix) },
    { first: b, second: a, product: matMul(a.matrix, b.matrix) },
  ];
  // Box the numbers that are different in the two products.
  const differs = orders[0].product.map((col, c) => col.map((n, r) => !isClose(n, orders[1].product[c][r], 1e-9)));

  function swap() {
    setAFirst((x) => !x);
    setPlayKey((k) => k + 1);
  }

  return (
    <div className="composition-demo">
      <div className="demo-row">
        <button type="button" className="demo-button" onClick={swap}>
          Swap: {second.name} first
        </button>
      </div>

      <p className="demo-status">
        {t === 0
          ? `${capital(first.name)} first, then ${second.name}. Press Play.`
          : t < 0.5
            ? `Step 1: ${first.name}`
            : t < 1
              ? `Step 2: ${second.name}`
              : `Done: ${first.name}, then ${second.name}`}
      </p>

      <TransformPlayer steps={[first.matrix, second.matrix]} tracked={tracked} range={range} t={t} onTChange={setT} playKey={playKey} />

      <div className="composition-products">
        {orders.map((o, i) => {
          const playing = (i === 0) === aFirst;
          return (
            <figure key={i} className={playing ? 'composition-product playing' : 'composition-product'}>
              <figcaption>
                {capital(o.first.name)}, then {o.second.name}
              </figcaption>
              {/* The second step is written on the left: it acts on what the first one made. */}
              <MatrixView columns={o.product} label={`${o.second.letter}${o.first.letter}`} highlight={differs} />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
