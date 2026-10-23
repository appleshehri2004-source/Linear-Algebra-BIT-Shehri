// Three small sliders, one per coordinate, for one 3D vector. Used by the 3D pictures (CrossView, ProjectionView).
import { roundTo, type Vec3 } from '../lib/linalg';
import './Demo.css';

interface Props {
  /** The vector's name, shown with its numbers above the sliders, e.g. "v". */
  name: string;
  value: Vec3;
  onChange: (v: Vec3) => void;
  /** A colour such as "var(--vec)". */
  colour: string;
  min?: number;
  max?: number;
  step?: number;
}

/** Two decimal places, with a real minus sign. */
const show = (n: number) => String(roundTo(n, 2)).replace('-', '−');

export default function VectorSliders({ name, value, onChange, colour, min = -2, max = 2, step = 1 }: Props) {
  return (
    <fieldset className="coord-sliders" style={{ color: colour }}>
      <legend>
        {name} = ({value.map(show).join(', ')})
      </legend>
      {(['x', 'y', 'z'] as const).map((axis, i) => (
        <label key={axis}>
          <span>{axis}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[i]}
            aria-label={`${name} ${axis}`}
            onChange={(e) => {
              const next = [...value] as Vec3;
              next[i] = Number(e.target.value);
              onChange(next);
            }}
          />
        </label>
      ))}
    </fieldset>
  );
}
