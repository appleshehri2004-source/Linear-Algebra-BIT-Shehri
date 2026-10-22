// A labelled slider for picking one number, e.g. how much to scale a vector by.
import { useId } from 'react';
import { roundTo } from '../lib/linalg';
import './ScalarSlider.css';

interface Props {
  value: number;
  onChange: (k: number) => void;
  /** Text shown above the slider, e.g. "k". */
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function ScalarSlider({ value, onChange, label, min = -3, max = 3, step = 0.1 }: Props) {
  const id = useId();

  return (
    <div className="slider">
      <label htmlFor={id}>
        {label} = <output htmlFor={id}>{roundTo(value, 2)}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-ends" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
