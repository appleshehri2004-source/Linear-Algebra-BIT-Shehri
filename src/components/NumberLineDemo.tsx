// A 1x2 matrix: 2D in, one number out. The x-axis plays the part of the number line.
// Drag v first (green î and red ĵ show where the matrix will send them), then press Play:
// the whole plane is squashed flat onto the number line, and v lands on a single number.
import { useState } from 'react';
import { Point, Text } from 'mafs';
import { applyColumns, roundTo, rowToLine, type Vec2 } from '../lib/linalg';
import TransformPlayer from './TransformPlayer';
import DragVector from './DragVector';
import MatrixView from './MatrixView';
import './Demo.css';

interface Props {
  /** The 1x2 matrix [a, b]: î lands on the number a, ĵ on the number b. */
  row: [number, number];
  /** The starting input vector. */
  vector: Vec2;
}

export default function NumberLineDemo({ row, vector }: Props) {
  const [v, setV] = useState<Vec2>(vector);
  const [t, setT] = useState(0);
  const [out] = applyColumns([[row[0]], [row[1]]], v);

  return (
    <div className="number-line-demo">
      <TransformPlayer matrix={rowToLine(row)} tracked={t > 0 ? v : undefined} t={t} onTChange={setT}>
        {/* Before playing, v can be dragged. Once the plane starts moving, v moves with it. */}
        {t === 0 && <DragVector value={v} onChange={setV} snap label="v" />}
        {t === 1 && (
          <>
            <Point x={out} y={0} color="var(--vec)" />
            <Text x={out} y={0} attach="s" attachDistance={20} color="var(--vec)" size={18}>
              {String(roundTo(out, 2))}
            </Text>
          </>
        )}
      </TransformPlayer>

      <div className="demo-row">
        <MatrixView columns={[[row[0]], [row[1]]]} />
        <span className="demo-op">·</span>
        <MatrixView columns={[[v[0], v[1]]]} color="var(--vec)" />
        <span className="demo-op">=</span>
        <span className="readout">
          {row[0]} × {roundTo(v[0], 2)} + ({row[1]}) × {roundTo(v[1], 2)} = {roundTo(out, 2)}
        </span>
      </div>
    </div>
  );
}
