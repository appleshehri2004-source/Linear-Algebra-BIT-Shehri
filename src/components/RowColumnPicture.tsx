// Lesson 4.1: one system A·x = v, two pictures side by side (stacked on a phone).
// Row picture: each equation is a line; the solution is where the lines cross.
// Column picture: x₁ copies of column 1 (green) then x₂ copies of column 2 (red), tip to tail, reach v.
import { Line, Point, Text, Vector } from 'mafs';
import { add, augmentedRows, equationLine, equationText, formatNumber, scale, solve2, type Mat2, type Vec2 } from '../lib/linalg';
import Plane from './Plane';
import './Demo.css';
import './EliminationPlayer.css';
import './RowColumnPicture.css';

interface Props {
  /** The matrix A, stored as its columns. Must have det ≠ 0. */
  matrix: Mat2;
  /** The right-hand side v. */
  target: Vec2;
  /** Each plane shows -range to range. */
  range?: number;
}

const ROW_COLOURS = ['var(--row1)', 'var(--row2)'];
const show = (n: number) => formatNumber(n).replace('-', '−');

export default function RowColumnPicture({ matrix, target, range = 6 }: Props) {
  const rows = augmentedRows(matrix, target);
  const x = solve2(matrix, target);
  if (!x) return <p className="demo-message">This matrix has det = 0: there's no single solution to draw.</p>;
  const first = scale(x[0], matrix[0]);
  const both = add(first, scale(x[1], matrix[1]));

  return (
    <div className="two-pictures">
      <figure>
        <figcaption>Row picture: two lines</figcaption>
        <Plane range={range}>
          {rows.map((row, r) => {
            const line = equationLine(row);
            return line && <Line.ThroughPoints key={r} point1={line[0]} point2={line[1]} color={ROW_COLOURS[r]} />;
          })}
          <Point x={x[0]} y={x[1]} color="var(--vec)" />
          <Text x={x[0]} y={x[1]} attach="e" attachDistance={12} size={16} color="var(--vec)">
            {`(${show(x[0])}, ${show(x[1])})`}
          </Text>
        </Plane>
        <ul className="elim-equations">
          {rows.map((row, r) => (
            <li key={r} style={{ color: ROW_COLOURS[r] }}>
              {equationText(row)}
            </li>
          ))}
        </ul>
      </figure>

      <figure>
        <figcaption>Column picture: columns add up to v</figcaption>
        <Plane range={range}>
          <Vector tip={target} color="var(--vec)" weight={5} />
          <Vector tip={first} color="var(--ihat)" weight={3} />
          <Vector tail={first} tip={both} color="var(--jhat)" weight={3} />
          <Text x={target[0]} y={target[1]} attach="nw" attachDistance={10} size={18} color="var(--vec)">
            v
          </Text>
        </Plane>
        <p className="demo-message">
          {show(x[0])}·<span className="ihat">(column 1)</span> {x[1] < 0 ? '−' : '+'} {show(Math.abs(x[1]))}·
          <span className="jhat">(column 2)</span> = v
        </p>
      </figure>
    </div>
  );
}
