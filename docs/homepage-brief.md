# Homepage brief — Visual Linear Algebra (BIT)

Put this file at `docs/homepage-brief.md`. Every homepage session starts by reading it.

## 1. Goal and audience

Build the site's front page (`src/pages/index.astro`). The lessons and subpages are finished; do not change them.

The page must, within 10 seconds, show a visitor what the site is: linear algebra you can see and touch. The first audience is BIT teachers and administration, so it must look premium, be mathematically exact, and work flawlessly on a phone and a projector.

The owner is a beginner learning to code. For every change:
- Explain each changed file in plain language at the end of the session.
- Prefer simple, readable code over clever code.
- Ask before adding any new dependency, and say why it's needed.

## 2. Fixed constraints

- **Stack (already in the repo):** Astro + React islands + Mafs (2D) + react-three-fiber (3D) + KaTeX, TypeScript, Vitest. Do not add new frameworks.
- **All math goes through `src/lib/linalg.ts`** (or wherever it lives — check). 2×2 matrices are stored as columns. Any new math function (for example SVD) is added there with Vitest tests first.
- **Hosting:** GitHub Pages under a subpath. Every asset URL must use `import.meta.env.BASE_URL`. Never hard-code `/`.
- **Self-host all assets.** No CDNs, no external fonts.
- **No copied textbook text.** The site is public. Chapter titles and section numbers from Lay are fine; prose is our own.
- **Active content only.** Archived sections (1.6, 1.10, 2.5, 2.6, 2.7, 4.8, 4.9, 5.5–5.8, 6.5–6.8, 7.1, 7.2, all of Ch 8+) never appear on the homepage. Read the archive flag from the existing lesson data; don't hard-code lists.
- **Animation libraries:** none by default. Use CSS for UI motion and Mafs for math. Propose Motion (`motion/react`) only if a specific effect truly needs spring physics, and ask first. Do not add GSAP.

## 3. Design tokens

Use the CSS variables from the global stylesheet (added in an earlier session). Never hard-code colors.

| Token | Value | Use |
|---|---|---|
| `--paper` | #FAF8F4 | Page background |
| `--sunken` | #F2EEE6 | Section bands, card backgrounds |
| `--border` | #E3DDD2 | Hairlines, grid lines |
| `--ink` | #15241D | Main text |
| `--ink-2` | #4B5850 | Secondary text |
| `--muted` | #646D65 | Captions, hints |
| `--brand` / `--brand-hover` | #0E5C3F / #0A4A32 | Headings accents, primary button |
| `--copper` | #A44A24 | Links, secondary accents |
| `--gold` | #B98A4E | Decoration only, never text |
| `--gold-tint` | #E9D6B4 | Determinant area fill (about 60% opacity) |
| `--i-hat` | #C4502A | î and anything tied to the first column |
| `--j-hat` | #2B5FB3 | ĵ and anything tied to the second column |
| `--output` | #0E5C3F | Output vectors (Av) |
| `--eigen` | #A3366F | Eigenvector lines, always dashed |

Rules:
- Each math color has one meaning on every page.
- Never rely on color alone: eigenvectors are dashed, vectors are labeled.
- Every vector and draggable handle gets a 3px `--paper` halo underneath, so it stays visible over the logo.
- Light theme only for now.
- Typography: propose two font pairings (one with a serif for headings, one all sans) in the plan, self-hosted, for the owner to choose. KaTeX keeps its own fonts.

## 4. The BIT logo

- File: `src/assets/bit-logo.svg` (cleaned copy; the official BIT file will replace it later with the same name). BIT has approved using and transforming it.
- Build one component, `<TestShape shape="bit-logo" | "neutral" matrix={...} />`. It applies the matrix with a single SVG `transform` on a group, never by redrawing paths. `"neutral"` is a simple asymmetric shape (like the letter F) so the site works without the logo.
- On pages with many copies, define the logo once as a `<symbol>` and reuse it with `<use>`.
- **Y-axis:** screens point y down; math points y up. Inside Mafs this is handled for you. In any plain-SVG animation, correct it once (a `scale(1,-1)` wrapper) and add a Vitest test proving the rendered matrix matches `linalg.ts` for a shear and a rotation.
- Footer line: "BIT logo used with permission of Beijing Institute of Technology."

## 5. Page sections (top to bottom)

### 5.1 Hero — "See linear algebra move"
- Left: headline, one sentence (follows Lay *Linear Algebra and Its Applications*, Ch 1–7, built on ideas from 3Blue1Brown and MIT 18.06), primary button "Start chapter 1", text link "Browse chapters".
- Right: Mafs canvas. Grid plus the BIT logo inside a `Transform`. Two draggable handles: î (copper) and ĵ (blue). The grid and logo deform live.
- Live readout beside it: the matrix [a b; c d] in KaTeX and det = ad − bc. The unit square's image is shaded with `--gold-tint`.
- States the readout must name: area scaled ×det; det < 0 "flipped — orientation reversed"; det ≈ 0 "collapsed onto a line — no inverse".
- Preset buttons: Reset, Stretch, Shear, Rotate, Flip, Collapse. Presets animate smoothly from the current matrix to the target (interpolate the matrix entries over about 400 ms). Reduced motion: jump instantly.
- Keyboard: check whether Mafs movable points support arrow keys. If not, make the preset buttons plus two small number inputs per column the keyboard path. Every control has a visible focus ring.
- Load: `client:load`. Render inside a fixed `aspect-ratio` box so nothing shifts while loading.

### 5.2 Chapter map (Lay order)
- One card per active chapter (1–7), generated from the lesson data: chapter number, title, active lesson count, link.
- Each card has a small logo animation showing that chapter's idea:
  - Ch 1 (linear transformations): logo sheared
  - Ch 2 (matrix algebra): two transformations applied in order, then in reverse order, ending in different places (AB ≠ BA)
  - Ch 3 (determinants): logo area scales, then flips (det < 0)
  - Ch 4 (vector spaces): same logo on a tilted grid (change of basis)
  - Ch 5 (eigenvalues): logo stretched, dashed eigenvector lines stay fixed
  - Ch 6 (orthogonality): logo projected flat onto a line
  - Ch 7 (SVD): rotate → stretch → rotate
- Card animations are CSS only (no React): keyframes on `transform: matrix(...)` of a `<use>` of the logo symbol. Matrix values come from `linalg.ts` at build time.
- Play once on hover, keyboard focus, or tap. Reduced motion: show the final frame as a still.

### 5.3 SVD showcase (full width)
- The strongest visual on the page. Logo goes through V^T (rotate), Σ (stretch), U (rotate) in three steps, with step buttons ("1 rotate", "2 stretch", "3 rotate") and "Play all".
- The three matrices are shown in KaTeX, computed by a tested `svd2x2` function in `linalg.ts`.
- Load: `client:visible` with about 200px root margin.

### 5.4 Four big ideas (sticky stepper)
- Left: four short text steps — vectors, span, linear transformations, eigenvectors. Right: one pinned canvas.
- When each step's text scrolls into view, the canvas plays that step's complete animation once (IntersectionObserver). Do not tie animation progress to scroll position.
- Use the logo for transformations and eigenvectors; use plain vectors for vectors and span (the logo doesn't help there).
- Load: `client:visible`.

### 5.5 How a lesson works
- Static row: Intuition → Interact → Formula → Practice → Do in your book. No JavaScript.

### 5.6 Optional extras
- Cards for 3D, cross product, duality. The 3D card shows a still image and a "Load 3D" button; react-three-fiber loads only after the tap. Never on page load.

### 5.7 Footer
- Credits: Lay, Lay & McDonald (course order), 3Blue1Brown, MIT 18.06. Logo permission line. GitHub link.

## 6. Motion and accessibility rules

- Animate only `transform` and `opacity`.
- Section reveals: CSS scroll-driven animations inside `@supports (animation-timeline: view())`; without support, content just shows.
- Respect `prefers-reduced-motion` everywhere: no movement, final states shown, presets jump instantly.
- Anything that moves for more than 5 seconds by itself gets a pause control.
- All text meets 4.5 : 1 contrast; graphics meet 3 : 1. Images and canvases get text alternatives.
- Works at phone width (375px) with no horizontal scroll, and on a projector at 1920px.

## 7. Performance targets (check with Lighthouse mobile)

- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- The hero headline text is the largest content; the hero canvas must not delay it.
- No react-three-fiber code in the initial page load. Report the JavaScript size of each island in the session summary.

## 8. Done means

After every session:
1. `npm test` passes.
2. `npm run build` is clean, with no warnings.
3. The page works in desktop Chrome and on iPhone Safari (owner checks).
4. A plain-language explanation of every changed file.
5. Committed and pushed; GitHub Actions green.

## 9. Sessions

0. Plan only (plan mode): read this brief, explore the repo, write `docs/homepage-plan.md`. No code.
1. Design tokens in the global stylesheet.
2. Static layout of all sections with real text, no interactivity.
3. `<TestShape>` with the logo and the y-axis test.
4. Hero interactive.
5. Chapter map and card animations.
6. SVD showcase (`svd2x2` + tests first).
7. Big ideas stepper.
8. Optional extras and footer.
9. Final pass: reduced motion, keyboard, contrast, Lighthouse mobile, fixes.
