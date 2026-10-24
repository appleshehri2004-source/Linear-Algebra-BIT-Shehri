# Homepage + Site Theme Brief

For Claude Code. Put this file at `docs/homepage-brief.md` in the repo.
Owner: Shehri. Decided 2026-10-24.

## 0. How to work with me (read first)

- One phase per session. Start each phase in **plan mode**, show me the plan, wait for my approval.
- After each phase, explain **every changed file in plain words**: what it does, and why it's needed. I must understand everything that was built.
- Run the health checks (section 8) before saying a phase is done.
- Don't touch lesson content, exercises or `linalg.ts` math. This brief is only about look, theme and the homepage.
- All numbers shown on screen come from `linalg.ts` (columns convention, as before).

## 1. Decisions (final)

| Topic | Decision |
|---|---|
| Themes | Dark **and** light. **Dark is the default.** Toggle on every page, choice remembered. |
| Consistency | One theme (colours, background, panels) across the **whole site**. Homepage = most intense (live 3D). Other pages = same look, calm. |
| Homepage style | One floating 3D world behind the page. Scroll moves the camera through 5 stations. |
| Hero text | No headline. Only a **tiny site name** in a corner and the live number readout. |
| Station 5 | **3D finale**, with a 2D fallback on weak devices. |
| Scroll | Native scroll + Lenis (desktop wheel smoothing only; touch stays native). No drei ScrollControls. |
| Rendering | One fixed R3F `<Canvas>`, one world, camera follows a path. Not one canvas per section. |
| Animation | Damped values in `useFrame` (maath `easing.damp`). GSAP only if pinning becomes too hard (it is free, but avoid extra libraries). |
| Loading | Homepage world loads with `client:only="react"` behind a static poster image. |

## 2. Theme system (Phase 1)

### 2.1 One colour file
Create `src/styles/theme.css`. **No hard-coded colours anywhere else** (pages, components, Mafs, three.js). Starting values below. Adjust if contrast checks fail, and tell me what changed.

```css
:root, [data-theme="dark"] {
  --bg:          #0b0f1a;   /* page background */
  --bg-deep:     #05070d;   /* far distance / fog */
  --surface:     rgba(255,255,255,0.04); /* panels */
  --surface-border: rgba(255,255,255,0.08);
  --text:        #e8ecf5;
  --text-muted:  #9aa4b8;
  --grid:        rgba(140,160,200,0.12);
  --grid-major:  rgba(140,160,200,0.25);
  --vec-i:       #5ad17a;   /* î, always green */
  --vec-j:       #ff6b6b;   /* ĵ, always red */
  --vec-x:       #ffd166;   /* x / result vector */
  --vec-eigen:   #b388ff;   /* eigenvector lines */
  --brand:       /* sample from the BIT logo file */;
  --glow:        0.6;       /* 3D glow strength */
}
[data-theme="light"] {
  --bg:          #f6f3ec;   /* paper */
  --bg-deep:     #e9e4d8;
  --surface:     rgba(255,255,255,0.7);
  --surface-border: rgba(20,24,42,0.10);
  --text:        #14182a;
  --text-muted:  #555c70;
  --grid:        rgba(20,24,42,0.08);
  --grid-major:  rgba(20,24,42,0.18);
  --vec-i:       #1f9d4c;
  --vec-j:       #d63a3a;
  --vec-x:       #b8860b;
  --vec-eigen:   #6a3fd1;
  --glow:        0.0;
}
```

Rule: each vector keeps the **same hue** in both themes. Only lightness changes.

### 2.2 Default dark, no flash
- `<html data-theme="dark">` is in the HTML from the server.
- In the shared layout `<head>`, an `<script is:inline>` runs before paint: if `localStorage.theme === "light"`, set `data-theme="light"`. Wrap in try/catch (storage can fail on iOS private mode).
- Do **not** follow the system light/dark setting. Dark is the default unless the user picks light.

### 2.3 Toggle
- Sun/moon button in the header of every page, with `aria-label`.
- Click: switch `data-theme`, save to localStorage, dispatch a `themechange` event.

### 2.4 Mafs (all 2D lessons)
In `theme.css`, map Mafs variables to the tokens: `--mafs-bg: transparent`, `--mafs-fg: var(--text)`, `--mafs-line-color: var(--grid-major)`, `--mafs-origin-color: var(--text-muted)`, `--mafs-green: var(--vec-i)`, `--mafs-red: var(--vec-j)`, `--mafs-yellow: var(--vec-x)`, `--mafs-violet: var(--vec-eigen)`. Then check that lessons use those palette names for î/ĵ/x. Replace any hard-coded colours in lessons with the palette names.

### 2.5 three.js (homepage + 3D lessons)
Create `src/lib/useThemeColors.ts`: reads the tokens with `getComputedStyle(document.documentElement)` and re-reads on the `themechange` event (or a MutationObserver on `data-theme`). Every 3D material takes its colours from this hook.

### 2.6 KaTeX
KaTeX must inherit `color: var(--text)`. Check that matrices are readable in both themes.

## 3. Site-wide background (Phase 1)

Every page except the homepage gets the same background, drawn **in CSS only** (no WebGL):
- base `--bg`, soft radial glow from top centre (dark only),
- faint fixed grid (`--grid` minor lines, `--grid-major` every 5th line) using `background-image` gradients,
- a faint dotted lattice layer.

Lesson content sits on panels: `--surface` background, `--surface-border`, rounded corners, light `backdrop-filter: blur()`. Text must stay readable over the grid.

## 4. Homepage world (Phase 2)

- One `<Canvas>` fixed behind the page, full screen. Its event source is a wrapper that contains both the canvas and the HTML, so the handles get pointer events.
- **World:** drei `<Grid infiniteGrid fadeDistance=…>` tilted in perspective, fog in `--bg-deep`, and a field of lattice dots (instanced points) that are the integer points of the plane.
- **The lattice is live:** when a station's matrix changes, the dots move with it (dot position = A·p). The background IS the vector space.
- **Scroll:** page has 5 tall sections (one per station) plus a normal content section. Scroll progress 0→1 for each section is stored in one small store. The camera eases toward that station's position with `easing.damp`. Never jump.
- **Poster:** a static image of station 1 shows instantly. The canvas fades in over it when ready.
- **Tiny site name** top-left, small, `--text-muted`. Theme toggle top-right.

## 5. The 5 stations (Phases 3–7, one per session)

Each station: one interactive object, **almost no text**, a live readout at the bottom (KaTeX), numbers from `linalg.ts`.

1. **Vectors.** Two arrows (v, w) and their sum float in space. Drag the arrowheads. Readout: `v = [..], w = [..], v + w = [..]`.
2. **BIT logo + matrix.** Logo on the unit square. Drag the tips of î and ĵ. Logo, grid and background lattice all transform. Readout: `[A][x] = [b]` with live numbers.
3. **Determinant.** Same logo. Area shading shows the scale. It flips (mirror) when det < 0. Readout: `det A = ad − bc = …`.
4. **Eigenvectors.** Logo stretches. Two eigen-lines glow in `--vec-eigen` and stay put. Readout: `λ₁ = …, λ₂ = …`. If eigenvalues are complex, show "no real eigenvectors: it rotates".
5. **3D finale.** The logo lifts off the plane into 3D, the camera swings around it, a 3×3 matrix acts on a cube with the logo on one face. Ends on the **"Start chapter 1"** button and the 7 chapter cards.
   - Fallback: if `PerformanceMonitor` falls back, or WebGL2 is missing, show a 2D version of station 5.

## 6. Homepage after the stations (Phase 8)

Keep only: the 7 chapter cards, one row "How a lesson works" (8 small icons, one word each), slim footer (credits, Lay/3B1B/MIT, BIT logo permission, GitHub link).
**Move off the homepage:** the 45-lesson list → new `/lessons` page (keep progress counts). "Four big ideas" and the SVD demo are replaced by the stations. Archive old components (don't delete), as with the book sections.

## 7. Smoothness, iPhone and accessibility

- **Drag vs scroll:** only handles capture touch (`touch-action: none` on handles, hit area ≥ 44 px). Swiping anywhere else scrolls the page.
- Lenis: `smoothWheel` on, `syncTouch` **off** (native iOS scrolling).
- `dpr={[1, 2]}`; drei `<PerformanceMonitor>` lowers dpr and turns off glow on weak devices.
- Pause rendering when the tab is hidden or the world is scrolled out of view.
- No post-processing on phones unless it holds 60 fps.
- `prefers-reduced-motion`: Lenis off, camera cuts between stations instead of flying, no idle floating.
- No WebGL: the poster images plus the normal page still work.
- Self-host all assets (fonts, logo, poster). No external CDNs (China access).

## 8. Health checks (every phase)

1. `npm test` passes. `npm run build` is clean.
2. Every changed page checked in **dark and light**, on desktop browser **and iPhone**.
3. Body text contrast ≥ 4.5:1 in both themes.
4. Homepage scroll feels smooth on iPhone, with no stutter while dragging handles.
5. Reload in light mode: no dark flash, and the reverse.
6. I can explain each changed file (you explain it to me first).
7. Pushed, GitHub Actions green, live site checked.
Undo if needed: `/rewind` or `git restore .`

## 9. Phases (one per session)

| # | Phase | Done when |
|---|---|---|
| 1 | Theme system + toggle + no-flash + Mafs/KaTeX/3D colours + CSS background + panels on all pages | Every existing page looks right in both themes |
| 2 | Homepage world shell: canvas, grid, lattice, fog, scroll store, camera path, poster, tiny name | Scrolling flies the camera through 5 empty stations smoothly |
| 3 | Station 1: Vectors | Drag + live readout work on iPhone |
| 4 | Station 2: BIT logo + matrix, live lattice | Background bends with the matrix |
| 5 | Station 3: Determinant + flip | det readout matches linalg.ts |
| 6 | Station 4: Eigenvectors | Eigen-lines stay put, complex case handled |
| 7 | Station 5: 3D finale + 2D fallback | Fallback triggers on a throttled device |
| 8 | Declutter: `/lessons` page, chapter cards, footer, reduced motion, final performance pass | Homepage = stations → chapters → footer |

## 10. Prompt to start each session

> Read `docs/homepage-brief.md` and `CLAUDE.md`. We are doing **Phase N** only. Enter plan mode, show me the plan and the files you will change, then wait for my OK. After building, run the health checks in section 8 and explain every changed file in plain words.
