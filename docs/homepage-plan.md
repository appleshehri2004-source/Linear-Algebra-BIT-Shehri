# Homepage plan

> **2026-10-24: replaced.** The owner wrote a new `docs/homepage-brief.md` (dark/light theme for the whole site, a 3D scroll homepage, 8 phases). This file records the first homepage (sessions 0–9) and is kept for its history. D1 and D3 below no longer apply; D2, D4, D5 and D6 still hold until a later phase changes them.

Written in session 0 (plan only, no code), 2026-10-24, after reading `docs/homepage-brief.md` and the repo.
Decisions the owner must make are collected in **section 6**. Nothing in sessions 1–9 starts until they are answered.

## 1. What is in the repo today

| Brief says | What the repo has |
|---|---|
| `src/lib/linalg.ts` | Yes, there. 2,026 lines, 480 passing tests in `linalg.test.ts` and others. 2×2 matrices are `Mat2 = [col1, col2]`. |
| `svd2x2` with tests | **Already exists** as `svd2`, `svdSteps`, `svdStepsAt` (lines ~1735–1795), with tests. `svdSteps` already moves the flip of a det < 0 matrix into Σ so both turns are real rotations. |
| Archive flag in lesson data | It lives in `src/content/book.ts`: each section has `status: 'active' \| 'archived'`. A lesson only has a `section` field; `activeInBookOrder()` / `getSortedLessons()` (in `src/content/modules.ts`) drop archived ones. The brief's archive list matches `book.ts` exactly. |
| Global stylesheet with the design tokens "added in an earlier session" | `src/styles/global.css` exists, but **none of the brief's tokens are in it**. It has the lesson palette (`--ihat` green, `--jhat` red, `--eigen` cyan, `--border`, `--muted`, …) and an automatic **dark theme**. |
| Layout | `src/layouts/BaseLayout.astro` wraps every page in `.page` (max 42rem wide). Fonts: Inter Variable from npm. |
| Homepage | `src/pages/index.astro`: title, one paragraph, and `LessonList` (every chapter/section/lesson with saved progress ticks). |
| `src/assets/bit-logo.svg` | **Missing.** There is no `src/assets/` folder. |
| Mafs keyboard | Mafs `MovablePoint` **does** take keyboard focus (Tab) and moves with arrow keys (Shift = bigger steps). It has no accessible name, so screen readers just hear "group". |
| Reusable parts | `Plane.tsx` (Mafs plane that waits for the browser, avoids hydration mismatch), `Tex.tsx` (KaTeX, CSS bundled locally), `LazyScene3D.tsx` (three.js only downloads when needed), `usePlayback.ts`, `PlayControls.tsx`, `MatrixView.tsx`, `about.astro` (credits). |
| Active lessons per chapter | Ch 1: 14 · Ch 2: 8 · Ch 3: 5 · Ch 4: 4 · Ch 5: 6 · Ch 6: 7 · Ch 7: **1** (only 7.4; 7.3 and 7.5 are active but have no lesson yet). |
| `npm run build` clean, no warnings | Today's build **already prints a warning** (a chunk over Vite's size limit, almost certainly three.js). |

## 2. Files per session

"New" = created, "change" = edited. Lessons (`src/content/lessons/*`) and lesson components are not touched in any session.

**Session 1 — design tokens**
- change `src/styles/global.css`: add the brief's tokens (see decision D1 for how they're scoped).
- change `package.json` / `package-lock.json`: one new font package if pairing A is chosen (decision D2).
- change `src/layouts/BaseLayout.astro`: import the heading font; add an optional `wide` prop (default off, so every other page stays exactly as it is) so the homepage can have full-width bands.

**Session 2 — static layout**
- change `src/pages/index.astro`: all seven sections with real text, no islands yet. Chapter cards generated from `book.ts` + `getSortedLessons()`.
- new `src/styles/home.css` (or a `<style>` block in index.astro): section layout, cards, phone and projector widths, scroll-reveal inside `@supports (animation-timeline: view())`.
- new `src/content/home.ts` + `home.test.ts`: small pure helper `chapterSummaries()` (active chapters, titles, lesson counts, first-lesson link). Tested so a future archive change can't break the cards.

**Session 3 — `<TestShape>` and the y-axis test**
- new `src/assets/bit-logo.svg` (owner supplies; see D4) — until then the `neutral` F shape is used.
- new `src/components/TestShape.tsx`: one `<g transform="matrix(...)">`, `<symbol>` + `<use>` for many copies, 3px `--paper` halo, `vector-effect="non-scaling-stroke"` so outlines don't get fat when stretched.
- change `src/lib/linalg.ts` + `linalg.test.ts`: `svgMatrix(m)` (Mat2 → the six numbers of an SVG/CSS `matrix()` with the y-flip), plus the brief's test for a shear and a rotation. Test runs in plain Node using `react-dom/server`, so no new test library.

**Session 4 — hero**
- new `src/components/HeroPlayground.tsx` (+ `.css`): Mafs plane, two movable handles, logo in the transform, gold unit-square image, KaTeX readout, det messages, presets, number inputs.
- change `src/lib/linalg.ts` + tests: `detState(m)` → `'scaled' | 'flipped' | 'collapsed'` and the preset matrices; reuse `lerpMatrix`, `easeInOut`, `det2`.
- change `src/pages/index.astro`: mount with `client:load` inside a fixed `aspect-ratio` box.

**Session 5 — chapter map animations**
- change `src/lib/linalg.ts` + tests: `keyframeMatrices(path, steps)` that samples a matrix path densely (see risk R3) and the seven chapter "stories" (shear; AB vs BA; scale then flip; tilted basis; eigen-stretch; projection; SVD).
- new `src/components/ChapterCard.astro`: builds the `@keyframes` at build time. No React.
- change `src/pages/index.astro`.

**Session 6 — SVD showcase**
- No new SVD maths: reuse `svd2` / `svdSteps` / `svdStepsAt`. Add tests only for anything the showcase needs that isn't covered (e.g. the chosen showcase matrix).
- new `src/components/SvdShowcase.tsx` (+ `.css`), reusing `usePlayback` and `Tex`.
- change `src/pages/index.astro` (`client:visible`, ~200px root margin — see R8).

**Session 7 — big ideas stepper**
- new `src/components/BigIdeas.tsx` (+ `.css`): IntersectionObserver per step, each step plays its whole animation once.
- possibly change `src/lib/linalg.ts` + tests for the step paths (span sweep, eigen stretch).
- change `src/pages/index.astro`.

**Session 8 — extras and footer**
- new `src/components/Load3D.tsx`: shows the still, mounts `LazyScene3D` only after the button.
- new `src/assets/home-3d-still.svg` (a drawn picture, lighter and sharper than a screenshot).
- change `src/pages/index.astro`: extras cards (3D → 1.9.4, cross product → 6.1.4, duality → 6.1.3) and footer.

**Session 9 — final pass**
- Fixes anywhere in the homepage files; Lighthouse mobile report saved as `docs/homepage-lighthouse.md`.

## 3. Conflicts between the brief and the repo

1. **Colours (biggest one).** `CLAUDE.md` and every lesson say î green, ĵ red, eigen cyan (solid). The brief says î `#C4502A`, ĵ `#2B5FB3`, eigen magenta (dashed) and "each math colour has one meaning on every page". Lesson prose even says "the green arrow" (11 colour words in 7 lessons). Both can't be true. → **D1**.
2. **Token names clash.** `--border`, `--muted` and `--eigen` already exist with other values. Redefining them globally would change every lesson page. The brief's hyphenated `--i-hat` vs the existing `--ihat` would leave two names for "î colour".
3. **Dark theme.** The site switches to dark mode automatically; the brief says light only. A light homepage that opens into a dark lesson will look jarring. → **D3**.
4. **"How a lesson works".** The brief says Intuition → Interact → Formula → Practice → Do in your book. Real lessons are Question → Play → Numbers → Explain → Predict → Practice → Go deeper, plus the Do-in-your-book box. The homepage should describe what visitors will actually see. I'll use the real steps unless you say otherwise.
5. **`svd2x2`.** Already exists as `svd2` + `svdSteps`, tested. Writing a second one would mean two answers for the same maths. I'll reuse it.
6. **Losing the lesson list.** Today the homepage *is* the lesson index, and every lesson's "← All lessons" link points to it. The brief replaces it with 7 chapter cards, so there'd be no way to reach lesson 2.4.1 or see progress ticks. → **D5**.
7. **Where chapter cards and "Browse chapters" link to.** There are no chapter pages, and the brief forbids changing subpages.
8. **Narrow `.page` wrapper.** BaseLayout caps everything at 42rem, so "full-width" sections are impossible without touching BaseLayout (I'll add an opt-in prop, default unchanged).
9. **"Build has no warnings"** fails today, before any homepage work (three.js chunk). Either accept that one known warning or raise Vite's limit for it in session 1.
10. **Logo file** doesn't exist yet.
11. **Ch 7 card.** Chapter 7 has one active lesson; its card will say "1 lesson". Fine, but it looks thin next to Ch 1's 14.
12. **Unpushed work.** 5f44902 (Chapter 2) isn't pushed yet, and the Lay restructure (Phase 3, Ch 3–7) is still running. Lesson counts on cards are computed, so that's safe, but the two projects shouldn't edit `linalg.ts` in parallel sessions.

## 4. Font pairings (both self-hosted from npm via Fontsource, no Google Fonts)

KaTeX keeps its own fonts in both. Numbers in the readout use Inter's tabular figures so they don't jitter while dragging.

**A. Serif headings — Source Serif 4 + Inter** (my pick for a teacher/administration audience)
- Headings: `@fontsource-variable/source-serif-4` (new dependency, latin subset only, ≈60–90 KB woff2 for the weights we use).
- Body/UI: Inter Variable (already installed).
- Feel: textbook, academic, "premium print". Pairs well with KaTeX's Computer Modern look, and with the warm `--paper` background.

**B. All sans — Inter Tight + Inter**
- Headings: `@fontsource-variable/inter-tight` (new dependency, ≈ same size).
- Body/UI: Inter Variable (already installed).
- Feel: modern, product-like, very clean on a projector. Lowest risk: one type family, so nothing ever clashes.

Either way: `font-display: swap`, preload only the heading weight the hero uses, no Chinese web font (Chinese text falls back to the system font, which is what Chinese readers expect).

## 5. What I think is wrong or risky in the brief

- **R1 — Contrast (checked against the brief's own values).** `--i-hat` on `--paper` is **4.37:1**, under the 4.5 needed for text. So î can colour arrows but not text labels (like a coloured column in the readout) — text must use a darker shade or `--ink`. `--gold` is 2.9:1: fine as decoration only, as the brief says. Everything else passes (muted 5.05, copper 5.52, j-hat 5.84, eigen 5.97, brand 7.55).
- **R2 — Colours that mean two things.** `--copper` (links) and `--i-hat` are almost the same colour (contrast between them 1.26:1), and the brief literally calls the î handle "copper". `--output` is the same hex as `--brand` (headings, primary button). That breaks the brief's own "one colour, one meaning" rule. Suggest making î clearly redder or links a different hue, and giving `--output` its own shade.
- **R3 — CSS `matrix()` animations are not exact in between.** Browsers don't slide matrix entries in a straight line; they split the matrix into rotate/scale/skew and blend those. Mid-animation frames won't match `linalg.ts`, and a flip (det > 0 → det < 0) can come out as a sudden 180° spin. Fix: generate many keyframes (e.g. every 4%) from `lerpMatrix` at build time, so the browser only blends between near-identical matrices. Start and end frames are always exact.
- **R4 — "Tap to play" on a card that is a link.** On a phone, the tap opens the chapter before the animation is seen. Suggest: on touch screens, play once when the card scrolls into view (≈10 lines of plain JS, no React), and keep hover/focus for desktop.
- **R5 — Mafs `Transform` doesn't move plain SVG.** Mafs only transforms its own components. `<TestShape>` inside Mafs must read Mafs's transform context and put that combined matrix on its one `<g>`. Still "one transform, no redrawn paths", just worth knowing.
- **R6 — "Rotate", "Flip" presets by sliding entries.** Linear blending from the identity to a 90° rotation shrinks the logo halfway (det drops to 0.5). Flip passes through det = 0 (logo collapses for a moment). Flip collapsing is actually a nice lesson; Rotate shrinking looks like a bug to a maths teacher. Suggest Rotate animates the angle instead.
- **R7 — SVD with det < 0.** "rotate → stretch → rotate" is only true if the flip goes inside the stretch. `svdSteps` already does this; the step labels should then say "2 stretch (and flip)" for such matrices, or the showcase should use a det > 0 matrix.
- **R8 — `client:visible` with a 200px margin** needs Astro's `client:visible={{ rootMargin: '200px' }}` form; fine in Astro 7, just noting it's not the default.
- **R9 — Hero on `client:load`.** React + Mafs + KaTeX is roughly 150–200 KB of JS on first load. The headline is plain HTML so LCP should be fine, but INP on a slow phone is the thing to watch. Session 4 will report the size.
- **R10 — Sticky stepper at 375px.** "Text left, canvas right" doesn't fit a phone. On phones the canvas should pin to the top and the text scroll under it. Also decide: does scrolling back up replay a step? (I'd say yes.)
- **R11 — Screen readers.** Mafs handles have no names; I'll add labels ("î handle, at (1, 0)") and an `aria-live` readout. The brief's number inputs then become a nice extra, not the only keyboard path.
- **R12 — Logo permission.** The brief says BIT approved transforming the logo. Keep that approval in writing somewhere the owner can find (not in the public repo if it's private correspondence).
- **R13 — The brief says "Lay & McDonald (course order)"** in the footer credits; the book is by Lay, Lay and McDonald. I'll write all three names.

## 6. Decisions for the owner

- **D1 — Colours. REPLACED 2026-10-24 by the new brief (Phase 1): green î / red ĵ on every page, all colours in `src/styles/theme.css`.** Was: option (a). Session 1 adds the brief's tokens to `global.css` inside a `.home { … }` block (the homepage's `<body>` or wrapper gets `class="home"`), so `--border`, `--muted`, `--eigen` keep their old values on lesson pages. Lessons and `CLAUDE.md` keep green/red. R1 and R2 still apply inside the homepage palette. Options were: (a) *My recommendation:* new tokens live under a `.home` class so only the homepage uses them now; lessons keep green/red; a later, separate project moves the whole site over (one stylesheet + ~11 colour words in lessons + `CLAUDE.md`). (b) Homepage uses the lessons' green/red so the site is consistent today. (c) Switch the whole site in session 1 (touches lessons, which the brief forbids).
- **D2 — Font pairing. DECIDED 2026-10-24: pairing A**, Source Serif 4 headings + Inter body. Session 1 adds the npm package `@fontsource-variable/source-serif-4` (the one new dependency, approved by this choice), imports it only on the homepage, and applies it to headings inside `.home`. Lesson pages keep Inter everywhere.
- **D3 — Dark mode. REPLACED 2026-10-24 by the new brief (Phase 1): dark by default on every page, sun/moon toggle, the phone's setting is ignored.** Was: light on the homepage only. Lessons keep automatic dark mode. In session 1, the `.home` block sets `color-scheme: light` and its own background and text colours. The `.home` tokens don't change inside `@media (prefers-color-scheme: dark)`, so a phone in dark mode still sees the light homepage, including Mafs and the browser's own scrollbars and form controls. The dark/light switch when moving from the homepage into a lesson is accepted.
- **D4 — Logo. DONE 2026-10-24.** The owner supplied `bit-logo.svg`, copied to `src/assets/bit-logo.svg` in session 3. It's 66 paths, a square viewBox (266.67), 37 KB, with no scripts, images or links. The only change: its clip path `a` was renamed to `bit-logo-clip`. Watch out for two things. The logo's dark green (#025a30) and brown (#984023) are close to `--output` and `--i-hat`, so vector halos are essential (session 4). And it's round, so a pure rotation shows only through the text and emblem (SVD steps, session 6). The official file replaces it under the same name, and the clip rename must be redone then.
- **D5 — Lesson list. DECIDED 2026-10-24: keep it, and the cards jump to it.** The existing `LessonList` stays on the homepage as an "All lessons" section under the chapter map, with progress ticks. Each chapter card links to that chapter's place in the list (`#chapter-N`), not to a lesson page. "Browse chapters" in the hero jumps to the chapter map. Session 2 adds an `id="chapter-N"` to each chapter heading in `LessonList.tsx`. That's a one-attribute change to a shared component, so lesson pages are unaffected.
- **D6 — Build warning. DECIDED 2026-10-24: raise the limit.** The three.js chunk (`Scene3D…js`) is about 942 kB; the next biggest file is 284 kB. Session 1 sets Vite's `chunkSizeWarningLimit` to 1000 kB in `astro.config.mjs`, just above three.js, so a much bigger file would still warn.
