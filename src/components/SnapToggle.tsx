// A checkbox: "Snap to whole numbers". The demos pass its value on to DragVector's `snap`.
import './Demo.css';

interface Props {
  checked: boolean;
  onChange: (snap: boolean) => void;
}

export default function SnapToggle({ checked, onChange }: Props) {
  return (
    <label className="snap-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Snap to whole numbers
    </label>
  );
}
