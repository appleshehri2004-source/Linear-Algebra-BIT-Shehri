# Learning log

Plain-words notes on what each file does, written as the site grows.

## Day 2 (2026-10-22)

### New files

**`src/styles/global.css`**
The look of the whole site lives here: the colours, the font, and the text column.
The colours are saved as named "tokens" like `--ihat` (green), `--jhat` (red), and `--vec` (yellow), so every drawing and page uses the same shades.
A second set of colours switches on automatically when your phone or computer is in dark mode.

**`src/layouts/BaseLayout.astro`**
This is the outer shell every page sits inside: the invisible `<head>` part of the page, the font, and the global styles.
Because the home page and lesson pages both use it, a change to the shell only has to be made once.
The Inter font is imported from `node_modules` here, so it is bundled with the site and never fetched from Google.

**`src/components/Formula.astro`**
Write `<Formula tex="..." />` in a lesson and it shows a properly typeset maths formula.
KaTeX turns the TeX into HTML while the site is being built, so visitors' browsers don't run any maths code.
Add `display` to put the formula centred on its own line; a typo in the TeX stops the build so you notice it.

**`src/content/modules.ts`**
This file holds the name of each module (for example, module 1 is "Vectors") and one helper that puts all lessons in reading order.
The home page and the lesson pages both ask this helper for the order, so they always agree on what comes "next".
When you start a new module, add one line with its name here.

**`src/content/lessons/1-1-vectors.mdx`** (renamed from `01-vectors.mdx`)
This is Lesson 1.1: the seven lesson sections, still mostly placeholders, plus one real formula.
The lines between the `---` marks at the top (title, module, order, and the 3Blue1Brown, MIT, and Tongji references) are the lesson's "front matter", which the site reads to build the home page and links.
The file name becomes the web address: `/lessons/1-1-vectors/`.

### Changed files

- **`src/lib/linalg.ts`** and **`linalg.test.ts`**: added `add`, `scale`, and `det2` next to `matVec`, each with tests that check exact answers.
- **`src/content.config.ts`**: the list of fields every lesson must have. It now has `module` plus three optional source fields, and `description` is gone.
- **`src/pages/index.astro`**: the home page now groups lessons under module headings automatically.
- **`src/pages/lessons/[...slug].astro`**: each lesson page now also receives the lessons just before and after it.
- **`src/layouts/LessonLayout.astro`**: shows "Module 1 · Lesson 1.1", the source links, and the previous/next links.

## Day 3 (2026-10-22)

The first interactive pieces. They are React components drawn with Mafs. A lesson loads them with `client:visible`, so their JavaScript only downloads when you scroll to them.

### New files

**`src/components/Plane.tsx`** (and `Plane.css`)
This draws the square coordinate plane: the axes, the numbers on them, and the faint grid.
It measures how wide its box is and stays square, so it fills an iPhone screen and redraws when the window changes size.
It also stops the page from scrolling while your finger drags an arrow tip, but still lets you scroll if you touch an empty part of the plane.

**`src/components/DragVector.tsx`**
This is an arrow from the origin (or from any starting point) with a dot on its tip that you can drag with a mouse, a finger, or the arrow keys.
It doesn't keep the vector itself: it tells its parent "the tip moved here", and the parent stores the new vector.
With `snap` on, it asks `linalg.ts` to round the tip to whole numbers, and it never lets the tip leave the plane.

**`src/components/CoordReadout.tsx`** (and `CoordReadout.css`)
This shows a vector as a column of two numbers in square brackets, in the same colour as its arrow.
The brackets are just CSS borders, so this needs no KaTeX and can redraw quickly while you drag.
The numbers are rounded to one decimal place so they don't flicker.

**`src/components/ScalarSlider.tsx`** (and `ScalarSlider.css`)
This is a slider with a label and its current value, e.g. "k = 2".
You choose its range and step (the default is −3 to 3 in steps of 0.1), and it's tall enough to grab with a thumb.

**`src/components/SnapToggle.tsx`** and **`Demo.css`**
This is the "Snap to whole numbers" checkbox, plus the shared layout that puts the readouts in a row under each plane.

**`src/components/VectorDemo.tsx`, `AddDemo.tsx`, `ScaleDemo.tsx`**
Each of these puts the parts above together for one lesson and holds the live vectors in React "state", so the arrow and its numbers always agree.
`AddDemo` draws w starting from v's tip and the thick sum from the origin, with the sum worked out by `add` from `linalg.ts`.
`ScaleDemo` multiplies u by the slider's number using `scale`. The components themselves never do the arithmetic.

**`src/content/lessons/1-2-adding-scaling.mdx`**
This is Lesson 1.2, with all seven sections: tip-to-tail adding, scaling with the slider, the numbers, a predict-then-reveal about order, and practice questions with hidden answers.

### Changed files

- **`src/lib/linalg.ts`** and **`linalg.test.ts`**: added `sub`, `roundTo`, `snapVec`, and `clampVec`, each with tests, plus tests for the 2 and −1.8 slider examples.
- **`src/content/lessons/1-1-vectors.mdx`**: now called "What is a vector", with the draggable vector, the arrow-vs-numbers explanation, a prediction, and practice.
- **`src/styles/global.css`**: two new colours, `--vec2` (orange, for w) and `--sum` (deep gold, for sums and scaled vectors).

### Things I learned

- Mafs lets you slide the whole plane around by default. We switched that off (`pan={false}`) so only arrow tips move.
- On a phone, `touch-action: none` tells the browser "don't scroll when this is touched". Mafs put it on the whole plane, which would trap your thumb, so we kept it only on the arrow tips.
