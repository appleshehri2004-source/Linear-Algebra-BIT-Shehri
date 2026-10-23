// A bit of maths drawn by KaTeX inside a React island, e.g. <Tex tex="3x^2 + 10x + 4" />.
// (Lesson files use Formula.astro instead; this is for maths that changes while you play.)
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  tex: string;
  /** true: on its own line, centred and bigger. */
  display?: boolean;
}

export default function Tex({ tex, display = false }: Props) {
  return (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false, displayMode: display }) }} />
  );
}
