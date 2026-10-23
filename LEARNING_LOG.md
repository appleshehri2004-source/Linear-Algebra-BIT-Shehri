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

## Day 4 (2026-10-22): Module 1 finished

### New files

**`src/exercises/exercise.ts`**
This describes what a practice question is: some text (with maths between `$` signs), the correct answer (one number or a vector), and an optional rounding hint.
It also has small helpers: pick a random whole number, read what the learner typed (it accepts `−2` and `2,5` too), and check an answer.
An answer counts as right if every number is within 0.01 of the correct one.

**`src/exercises/module1.ts`**
These are the question "generators" for Module 1: little functions that pick random numbers and ask `linalg.ts` for the answer.
There are 11 of them, two or three per lesson, with names like `"1.5-dot"`.
They live here, not in the lesson files, because Astro can only pass plain data (like a name) from an `.mdx` page to a React island, not a function.

**`src/exercises/index.ts`**
One list of every question generator on the site, looked up by name. Module 2's questions will be added here.

**`src/exercises/exercises.test.ts`**
For every generator, this makes 200 random questions and checks that the right answer is accepted, the right answer rounded to 2 decimals is accepted, and a wrong answer (off by 1) is rejected.
So a new exercise is tested automatically as soon as it's added to the list.

**`src/components/Exercise.tsx`** (and `Exercise.css`)
This is the question box: question, answer box(es), Check and New question.
After two wrong tries it shows the correct answer. A typo like "abc" doesn't count as a try.
The question is picked after the page loads, not while the site is built; otherwise the built page and the browser would choose different random numbers.
The answer box uses the normal keyboard, because the iPhone number pad has no minus sign.

**`src/components/SpanTracer.tsx`** (Lesson 1.3)
Sliders a and b build a·v + b·w, and the tip leaves a trail.
"Sweep" runs through lots of a and b values like mowing a lawn (up one row, down the next), so the trail paints in the span.
A label says whether the span is the whole plane, a line, or a single point. "Fix a" locks a, so only b moves and the trail is a straight line.

**`src/components/TargetGame.tsx`** (Lesson 1.4)
Drag v and w, and a label says independent (green) or dependent (red).
The game: move a and b until a·v + b·w hits the target dot, which turns green.
"Show answer" uses `solveCombination`, and if v and w are dependent it explains why there may be no answer.

**`src/components/DotDemo.tsx`** (Lesson 1.5)
Drag v and w to see the lengths, the angle, the dot product worked out live, and the "shadow" (projection) of w on v's line.
The dot product turns green when positive, grey when zero, and red when negative.

**`src/content/lessons/1-3-span.mdx`, `1-4-independence-basis.mdx`, `1-5-dot-product.mdx`**
The three new lessons, each with all seven sections and its exercises in Practice.

### Changed files

- **`src/lib/linalg.ts`** and **`linalg.test.ts`**: new functions `dot`, `length`, `angleBetween`, `projectOnto`, `isIndependent`, `solveCombination` and `isClose`, with tests (now 47 tests in total).
- **`src/components/ScalarSlider.tsx`**: can now be greyed out (`disabled`), used by "Fix a".
- **`src/components/Demo.css`**: shared styles for demo buttons, status labels and messages.
- **`src/styles/global.css`**: three new colours, `--positive`, `--zero` and `--negative`.
- **Lessons 1.1 and 1.2**: random-number exercises added to Practice.

### Things I learned

- **A bug that the browser caught but the tests didn't.** The first Sweep left no trail. The code said "add the points from i to next", but React runs that instruction a moment *later*, after `i` had already moved on, so it always added nothing. The fix: copy the points into a variable first, then hand them to React.
- **`-0` is real.** JavaScript has a "negative zero", and `[2, -0]` is not equal to `[2, 0]` in a test. Adding `+ 0` turns it into a normal 0.
- **The determinant spots dependence.** If v and w lie on one line, the parallelogram they make is flat, so its area (the determinant) is 0. `isIndependent` and `solveCombination` both use this.
- **Long formulas on a phone.** A formula wider than 375px has to scroll sideways, so long ones are split into two lines.

## Day 5 (2026-10-22): Module 2 begins, transformations

Today's big idea: a matrix moves the whole plane, and its two columns are just where î and ĵ land.

### New files

**`src/components/TransformPlayer.tsx`** (and `TransformPlayer.css`)
The heart of the site. A faint grid stays still and a brighter grid moves from "nothing changed" (t = 0) to "fully transformed" (t = 1). î (green) and ĵ (red) ride along, and so can a yellow vector or a yellow line.
Play, Pause, Rewind (plays backwards) and a slider for t. One play takes 1.5 seconds and starts and stops gently (`easeInOut`).
The whole moving grid is drawn as one SVG shape, so the browser only redraws one thing per frame. In testing it never missed a frame.
It also accepts a rule that isn't a matrix (like "bend every line"), for the counter-examples in lesson 2.1.

**`src/components/MatrixEditor.tsx`** (and `MatrixEditor.css`)
Four number boxes inside square brackets: column 1 green, column 2 red. Each box remembers half-typed text like "-" or "2." and only passes it on once it's a real number.

**`src/components/MatrixPlayground.tsx`**
A TransformPlayer and a MatrixEditor sharing one matrix. Typing a number plays the animation. Dragging an arrow tip changes the numbers and jumps to the end, so the arrow stays under your finger.
Dragging v works out "how many î plus how many ĵ" reach that point (`solveCombination` again).
Options: a live line "x·(column 1) + y·(column 2) = answer" (lesson 2.2) and buttons for ready-made matrices (lesson 2.3).

**`src/components/LinearityDemo.tsx`** (Lesson 2.1)
Four buttons: one linear example and three that aren't (curved lines, moved origin, and "Sneaky"). A checklist under the plane says which rules each one keeps.

**`src/exercises/module2.ts`**
Eight new kinds of practice question for lessons 2.1 to 2.3.

**`src/content/lessons/2-1-linear-transformations.mdx`, `2-2-matrix-times-vector.mdx`, `2-3-gallery.mdx`**
The first three lessons of Module 2.

### Changed files

- **`src/lib/linalg.ts`** and **`linalg.test.ts`**: `identity`, `matMul`, `lerp`, `lerpVec`, `lerpMatrix`, `rotation`, `rotationAngle`, `easeInOut`, `matrixAt`, `mapAt`, `gridLines`, `segmentPoints`, and the three counter-example rules, all with tests.
- **`src/components/Plane.tsx`** (and `Plane.css`): Mafs now draws only in the browser (see "Things I learned").
- **`src/exercises/exercise.ts`**: new `matTex`, which writes a matrix in KaTeX.
- **`src/styles/global.css`**: new colour `--grid-moving` for the moving grid.
- **`src/content/modules.ts`**: Module 2 is called "Linear transformations".

### Things I learned

- **`matMul(A, B)` means "B first, then A".** Like reading `f(g(x))` from the inside out. Swapping them gives a different answer, and a test checks that.
- **Sliding a rotation shrinks it.** Going straight from I to a 90° rotation passes through a matrix whose arrows are only about 71% as long. So for pure rotations `matrixAt` turns the angle instead.
- **Watching grid lines isn't enough.** "Sneaky" slides points along each horizontal line in a wave. Every grid line lands on itself, so the grid looks untouched, yet the diagonal goes wavy. Linear means *every* straight line stays straight.
- **Astro can't send a function to a React island.** Numbers and lists can travel from a lesson file to a component, but a rule like `bendLines` can't. So lesson 2.1's examples live inside a React component.
- **Hydration mismatch.** Mafs numbers its arrowheads with a counter that keeps growing while the site is built. The browser starts counting from 0, so the two disagree. The fix: draw Mafs only once the page is in the browser.
- **Tests check the code agrees with itself, not that the maths is right.** If an exercise's answer is worked out wrongly, the "accepts the right answer" test still passes. Each question still needs a careful read.

## Day 6 (2026-10-23): Module 2 finished

Today's big idea: multiplying matrices means doing one move and then the other, and the same "columns are where the basis arrows land" rule works in 3D and for matrices that aren't square.

### New files

**`src/components/usePlayback.ts`** and **`PlayControls.tsx`**
The Play / Pause / Rewind / slider code, moved out of TransformPlayer so the 3D stage can use exactly the same controls.

**`src/components/CompositionDemo.tsx`** (Lesson 2.4)
Plays two matrices one after the other (rotate, then shear). "Swap" plays them in the other order. Under the plane, both products sit side by side, with the numbers that differ boxed in yellow.

**`src/components/PredictReveal.tsx`** (Lesson 2.4)
Tap where you think v will land, press Reveal, watch the move, then a dashed line shows how far off you were.

**`src/components/MatrixView.tsx`**
A read-only matrix of any size in square brackets (2x2, 3x3, 3x2, 1x2, or one column for a vector).

**`src/components/Scene3D.tsx`** (and `Scene3D.css`), **`LazyScene3D.tsx`**, **`Stage3D.tsx`** (Lesson 2.5)
The 3D picture, made with three.js through react-three-fiber and drei (all installed from npm, no CDN). It has î green, ĵ red, k̂ blue, a see-through unit cube, faint axes and floor, and a one-finger drag to orbit. It only redraws when something changes, which saves the phone battery. LazyScene3D downloads the 3D code (about 250 kB zipped) only on pages that use it, once it's on screen. Stage3D adds the Play controls, a 3x3 MatrixEditor and preset buttons.

**`src/components/NonSquareDemo.tsx`** and **`NumberLineDemo.tsx`** (Lesson 2.6)
A 3x2 matrix: drag v on a flat plane, and press Play to watch the floor lift into a tilted sheet in 3D. A 1x2 matrix: the plane squashes onto the x-axis used as a number line, and (4, 3) lands on -2.

**`src/content/lessons/2-4-composition.mdx`, `2-5-3d.mdx`, `2-6-non-square.mdx`**
The last three lessons of Module 2, with 3 exercises each.

### Changed files

- **`src/lib/linalg.ts`** and **`linalg.test.ts`**: new `Vec3` and `Mat3` types, plus `matVec3`, `matMul3`, `det3`, `rotY90`, `cross3`, `rotationAbout`, `rotationAxisAngle`, `matrixAt3`, `sequenceAt`, `distance`, `applyColumns`, `rowToLine` and `liftColumns`, all with tests (118 tests now).
- **`TransformPlayer.tsx`**: new `steps` (several matrices in a row), `controls` (hide the buttons) and `onPlaneClick`.
- **`Plane.tsx`**: passes clicks and taps on to the parent.
- **`MatrixEditor.tsx`**: works for 3x3 as well as 2x2.
- **`exercise.ts`** and **`Exercise.tsx`**: answers can have 3 numbers, and `matTex` writes a matrix of any size.
- **`global.css`**: new colour `--khat` (blue).

### Things I learned

- **Order matters, brackets don't.** Rotate then shear sends v = (2, 1) to (1, 2), but shear then rotate sends it to (-1, 3). Yet (AB)C = A(BC) is automatic: both mean "C, then B, then A".
- **Sliding a 3D rotation would shrink it too**, just like in 2D. So `matrixAt3` finds the turning axis and angle and turns by part of the angle.
- **An animation can stop itself.** When the parent controls t, the player watched for "the parent changed t" to stop playing. Frames can come faster than React redraws, so sometimes it saw its own older value and thought it was the parent. That froze PredictReveal at t = 0. The fix: remember every t we sent, and only stop for a t we never sent.
- **three.js likes "up" to be y; maths likes it to be z.** Telling the camera `up = (0, 0, 1)` means none of the maths has to change.
- **A finger on a 3D picture can scroll the page instead of turning it.** CSS `touch-action: none` asks the browser not to scroll, and a `touchmove` listener backs it up for iPhone Safari, like the 2D planes already had.
- **Checked on the iPhone Simulator** (iPhone 17e): orbit and Play work. The Simulator uses the Mac's graphics chip, so whether it's smooth needs a real iPhone.

## Day 7 (2026-10-23): Module 3, the determinant

Lessons 3.1 to 3.4: area scaling, orientation, computing determinants, and det(AB) = det(A) det(B).

### New files

**`src/components/AreaPatch.tsx`** (and `AreaPatch.css`)
The unit square turns into a parallelogram as the transformation plays, with its signed area written inside it, live. When the area goes negative the patch turns purple, gets stripes, the plane says "orientation flipped" in its top-left corner, and the sentence under the plane gets a purple box. Options: a blob that scales by the same factor, draggable î and ĵ (they snap to half squares), a matrix editor, the "ad − bc" sum, and preset buttons. `PatchShape` is just the drawing, so other demos can reuse it.

**`src/components/AdBcPicture.tsx`** (Lesson 3.3)
The picture behind ad − bc, in steps: draw a box around the parallelogram, cut away four triangles, then two rectangles. What's left is ad − bc.

**`src/components/DetProductDemo.tsx`** (Lesson 3.4)
Pick B and A from buttons, press Play, and the square's area goes 1 → det(B) → det(A)·det(B).

**`src/exercises/module3.ts`**
10 practice questions, including working out 2×2 and 3×3 determinants by hand.

**`src/content/lessons/3-1-area-scaling.mdx`, `3-2-orientation.mdx`, `3-3-computing.mdx`, `3-4-det-product.mdx`**

### Changed files

- **`linalg.ts`** and **`linalg.test.ts`**: new `polygonArea` (the shoelace formula), `transformShape`, `UNIT_SQUARE`, `BLOB`, `orientation`, `centroid`, `stripeLines` and `adBcPieces`, all with tests. New test: det(AB) = det(A)·det(B) for 3 random pairs (140 tests now). `det2` now gives 0 instead of -0.
- **`PredictReveal.tsx`**: new `guessArea` mode: type a number for the new area instead of tapping a point.
- **`DragVector.tsx`**: new `step`, so a tip can snap to half squares.
- **`Plane.tsx`**: new `x` and `y`, to show just one corner of the plane (used by the ad − bc picture).
- **`global.css`**: new colours `--area-kept` (blue) and `--area-flipped` (purple). I avoided red and green so the patch can't be confused with î and ĵ.

### Things I learned

- **One number scales every area.** A matrix keeps grid lines straight and evenly spaced, so every tiny square changes by the same factor as the unit square. The blob went 0.71 → 4.25, × 6, just like the square.
- **A negative determinant means the plane is flipped over**, and you can't flip without passing through 0: dragging î across ĵ, the area goes 4 → 0 → −2.
- **Even a Mirror animation passes through 0.** Sliding from "do nothing" to a mirror squashes the square flat halfway (area 0.72 on the way down, then negative).
- **det(AB) = det(A)·det(B) needs no algebra.** B multiplies every area by det(B), then A multiplies every area by det(A).
- **-0 is a real number in JavaScript.** 0·(−3) − 0·0 gives -0, and the test for det(AB) caught it. Adding 0 turns -0 into 0.
- **SVG stripe patterns went blurry.** The pattern tile was 0.3 squares wide, and the browser turned it into pixels *before* zooming it up, so it showed as grey mush. Drawing the stripes as real lines cut to the parallelogram's shape (a clip path) fixed it.
- **Mafs's own stylesheet turned my stripe colour grey.** A colour set on the element itself (`style={{ stroke: … }}`) wins.
- **Checked in iPhone Safari on the Simulator** (iPhone 17e): dragging î across ĵ with a finger flips the patch to purple stripes, and the sentence says "orientation flipped".

## Day 8 (2026-10-23): Module 4 part 1, systems of equations

Lessons 4.1 to 4.3: a system is a transformation, Gaussian elimination step by step, and the inverse as rewinding.

### New files

**`src/components/EliminationPlayer.tsx`** (and `EliminationPlayer.css`)
The augmented matrix [A | b] with Previous, Next and Play. The row that just changed is highlighted and the step ("R2 → R2 − 3·R1") is written above it. Each row is also written as an equation, in its own colour. For 2 equations a plane shows them as two lines: each step turns one line around the yellow dot, with a faint dashed copy of where it was. Buttons for ready-made systems and a "Random system".

**`src/components/SolveGame.tsx`** (Lesson 4.1)
Drag x until the gold arrow A·x lands on the target v. "Show answer" uses `solve2`.

**`src/components/RowColumnPicture.tsx`** (and `RowColumnPicture.css`, Lesson 4.1)
The same system twice: lines crossing (row picture) next to columns adding up to v (column picture). Side by side on a computer, one above the other on a phone.

**`src/components/InverseDemo.tsx`** (Lesson 4.3)
"Play A", then "Rewind with A⁻¹", and the grid goes home; A⁻¹A = I is shown at the end. With "Squash" (det 0) the plane lands on the x-axis, two orange dots land on the same spot, and Rewind stays off.

**`src/exercises/module4.ts`**
9 practice questions. Some answers are fractions (3/2), which can now be typed.

**`src/content/lessons/4-1-system-transformation.mdx`, `4-2-elimination.mdx`, `4-3-inverse.mdx`**

### Changed files

- **`linalg.ts`** and **`linalg.test.ts`**: new `rrefSteps` (elimination, every step written down), `inverse2`, `solve2`, `formatNumber` (1/3 instead of 0.33), `equationLine`, `equationText`, `lerpRows`, `randomSystem` and `augmentedRows`, all with tests (189 tests now). The augmented matrix is stored as **rows**, not columns, because elimination works on rows.
- **`exercise.ts`**: `parseNumber` reads fractions like "-9/2", so answer boxes and matrix boxes accept them.
- **`MatrixView.tsx`**: new `fractions` option.
- **`usePlayback.ts`**: can animate to any t, not just 0 or 1. "Play A" stops at t = 0.5, before A⁻¹ starts.
- **`global.css`**: colours `--row1`, `--row2`, `--row3` (blue, purple, teal) for equations. Not green or red, which mean î and ĵ.
- **`modules.ts`**: Module 4 is "Systems of equations".

### Things I learned

- **Row operations never move the answer.** If a point solves two equations, it solves any mix of them. A test checks every step of both examples still has the same solution; that is why the lines always cross at the same dot.
- **Even halfway between two steps, the line goes through the dot.** Sliding a line from one equation to another mixes the two equations, so the animation can never miss the crossing.
- **Computers don't get 1 − 3·(1/3) = 0.** They get about 0.0000000000000001. Elimination sets the cleared number to exactly 0, or "0" would show as a tiny number and the next pivot test could be fooled.
- **Turning decimals back into fractions needs care.** Trying bottoms 1 to 100 turns 0.3333… into 1/3, but it also turned 1.41 into 141/100. Short decimals with big bottoms now stay decimals.
- **The inverse is just "undo".** Undoing a shear pushes ĵ back; undoing a turn turns back. Dividing by det in the formula is undoing the area change, and det = 0 means dividing by 0: you can't unsquish a line.
- **A hidden browser tab doesn't run React's after-render code.** Every exercise (even in Lesson 3.1) said "Loading a question…" while the preview was hidden, and worked as soon as it was on screen. Not a bug in the site.
- **Long formulas don't fit a phone.** A chain of four matrices was 686 px wide; one matrix per step fits.
- **Checked on the iPhone Simulator** (iPhone 17e, Safari): Next takes one step at a time, 9/2 shows as a clean fraction, and the lines end as x = −4 (upright) and y = 9/2 (flat), crossing at the yellow dot.

## Day 9 (2026-10-23): Module 4 part 2, rank and the four subspaces

Lessons 4.5 to 4.8: rank, column space and null space; the complete solution; the four fundamental subspaces; Cramer's rule as areas. (There is no lesson 4.4 yet: the list goes from 4.3 to 4.5.)

### New files

**`src/components/SubspaceView.tsx`** (Lesson 4.5)
The input plane and the output plane side by side. The null space is pink in the input, with pink arrows on it; the column space is violet in the output. On Play the pink arrows ride along with the grid and all land on the origin. Buttons for rank 2, 1 and 0.

**`src/components/CompleteSolutionView.tsx`** (Lesson 4.6)
Drag b in the output. Near the violet column space line it snaps on, and the input shows every solution as a gold line, parallel to the pink null space. A t slider walks one solution along it, and A·x stays on b. Off the line: "No solution".

**`src/components/FourSubspacesView.tsx`** (Lesson 4.7)
Row space ⟂ null space in the input, column space ⟂ left null space in the output, with right-angle marks. Drag column 1, slide k (column 2 = k · column 1): the matrix stays rank 1 and both angles stay 90°.

**`src/components/CramerView.tsx`** (Lesson 4.8)
The parallelogram made by î and x (area y) next to the one made by column 1 and v (area det(A)·y). "Find x" does the same with x and ĵ. Drag x and the three lines of working update.

**`src/content/lessons/4-5-…` to `4-8-…`** and **12 new questions** in `module4.ts`.

### Changed files

- **`linalg.ts`** and **`linalg.test.ts`**: `rrefSteps` now keeps going when a column has no pivot, works for any size, and returns the pivot columns and the finished matrix. New: `transpose`, `rank`, the four `…Basis` functions, `completeSolution`, `cramer2`, `cramer3`, `cramerPicture`, `snapToLine`, `pointOnSolution`, and helpers for drawing planes in 3D (232 tests now).
- **`Stage3D.tsx`** and **`Scene3D.tsx`**: `showSubspaces` draws the column space (violet) and null space (pink) in 3D; `zoomOut` for long columns.
- **`TransformPlayer.tsx`**: an arrow squashed to nothing is hidden (it used to leave a stray arrowhead at the origin).
- **`global.css`**: colours `--space` (violet: column and row space) and `--null` (pink: null spaces).
- **`Demo.css`**: the side-by-side layout moved here from `RowColumnPicture.css` (deleted) so every demo can use it.

### Things I learned

- **Rank is just "how many pivots".** Elimination already finds it: a column with no pivot means its unknown is free, and each free unknown is one direction of the null space.
- **rank + null space size = number of columns.** Every dimension the output loses turns up in the null space. A test checks it on 200 random matrices.
- **The null space is at right angles to the rows by definition.** A·x = 0 says each row dotted with x is 0. So the 90° in Lesson 4.7 can never break, whatever the matrix: a test checks 200 random rank-1 matrices.
- **Every solution = one solution + the null space.** If two x's both give b, their difference gives 0. That's why the gold line is always parallel to the pink one.
- **Cramer's rule is about areas.** î and x make a parallelogram of area y; the matrix multiplies it by det(A); so y = (that new area) ÷ det(A).
- **In 3D, putting the null space inside the "moving" group squashes it for free.** three.js applies the matrix to it, so the pink line shrinks to a point with no extra code.
- **I applied a matrix twice by mistake.** TransformPlayer already moves its yellow vector by A, and I gave it v = A·x, so it drew A·A·x. Giving it x fixed it.
- **Dragging onto an exact line is nearly impossible by hand.** b only snapped within 0.25 of a square and I missed twice with a mouse, so it's 0.4 now, and it lands on tidy points like (2, 4) so the answers are clean.
- **The site lives under /Linear-Algebra-BIT-Shehri/.** Serving `dist` on its own gave 404s for every script; it has to be served under that folder name. Another chat's dev server was also running, so I previewed the built site on my own port.
- **A demo with client:visible only starts once it's on screen.** My first angle readings in 4.7 came from the page before the demo had started, so I redid them on the live demo.

## Day 10 (2026-10-23): Module 5, duality and the cross product

Lessons 5.1 to 5.3: duality (number lines are vectors); the cross product in 2D and 3D; and, marked optional, why the cross product formula works.

### New files

**`src/components/DualityView.tsx`** (Lesson 5.1)
A tilted orange number line along û, with whole numbers marked. Drag v: a dashed line drops it onto the line, and the number where it lands sits next to u · v. They always match. The orange dot at −3 turns the line. The k slider makes u = k·û and multiplies both numbers by k. î and ĵ drop onto the line too, landing at u's x and y, and the 1×2 matrix [u_x u_y] is shown next to u.

**`src/components/CrossView.tsx`** (Lessons 5.2 and 5.3)
2D mode: drag v and w. The parallelogram shows its signed area, blue when positive and purple and negative when v is left of w. 3D mode: x, y, z sliders for v and w, the parallelogram, and a teal arrow for v × w. "Swap v and w" slides the arrow through 0 to the other side. With `box`, a violet (x, y, z) builds a slanted box, and "base × height" sits next to "(x, y, z) · (v × w)".

**`src/content/lessons/5-1-…` to `5-3-…`** and **8 new questions** in `module5.ts`.

### Changed files

- **`linalg.ts`** and **`linalg.test.ts`**: new `projectToLine`, `dualityNumbers`, `numberLineTicks`, `cross2`, `add3`, `scale3`, `parallelogram3`, `parallelepipedEdges` and `boxVolume`. `cross3` and `dot3` now give 0 instead of −0. 251 tests now.
- **`Scene3D.tsx`**: new optional extras: `arrows` (any arrows, e.g. v, w and v × w), `patch` (a see-through flat shape), `edges` (lines, e.g. a box) and `showBasis` (turn off î, ĵ, k̂). Stage3D works as before.
- **`content.config.ts`**, **`LessonList.tsx`**, **`LessonLayout.astro`**, **`index.astro`**: a lesson can say `optional: true`. It then gets an "Optional" badge in the list and "Optional (advanced)" at the top.
- **`global.css`**: a new colour, `--cross` (teal), for v × w. **`Demo.css`**: the small x/y/z slider boxes.

### Things I learned

- **Duality: a 1×2 matrix is a vector lying on its side.** Dropping vectors onto a tilted number line is a linear transformation, so it's a 1×2 matrix. By symmetry, î lands at u's x and ĵ at u's y, so the matrix is [u_x u_y], and using it is the dot product.
- **I made the test honest.** If `projectToLine` just called `dot`, the test "it always equals the dot product" would prove nothing. So it turns the picture until the line lies along the x-axis and reads v's x, and the test checks 200 random lines against the dot product.
- **The 2D cross product is a determinant.** v × w = det[v w]. Its sign says which side v is on: (−3, 1) × (2, 1) = −5 because v is to the left of w.
- **In 3D the cross product is an arrow**: as long as the parallelogram's area, at right angles to it, pointing the way the right-hand rule says. Swapping v and w flips it.
- **Why the formula works (5.3).** "Volume of the box made by (x, y, z), v and w" is linear in (x, y, z), so by duality it is a dot product with some vector, and expanding the determinant shows that vector is exactly the cross product formula. Base × height says the same vector must be at right angles to v and w, with length = area.
- **−0 is not 0 to the tests.** A dot product came out as −0 and `toBe(0)` failed. Adding `+ 0` turns −0 into 0, the same trick the file already uses.
- **A handle at the busy origin is hard to grab.** î, ĵ and û all sit within 1 square of the origin, so the dot that turns the line now sits at −3 on the line instead of on û's tip.
- **Two dev servers don't fit in one folder.** Another chat's `astro dev` was running, so I checked the built site from my own folder and port instead.
