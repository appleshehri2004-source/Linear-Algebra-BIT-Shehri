# Homepage final check (session 9)

Checked 2026-10-24 against `docs/homepage-brief.md` sections 6–8, on the local build and the live site
(https://appleshehri2004-source.github.io/Linear-Algebra-BIT-Shehri/).

## Results at a glance

| Check | Target | Result |
|---|---|---|
| LCP (Lighthouse, phone) | ≤ 2.5 s | **1.7 s live**, 1.8 s local |
| INP (Lighthouse's lab stand-in: Total Blocking Time) | ≤ 200 ms | **60 ms live**, 0 ms local |
| CLS | ≤ 0.1 | **0.018 live**, 0.049 local |
| Lighthouse scores (live) | — | Performance 93, Accessibility 100, Best practices 100, SEO 100 |
| three.js on page load | none | **none**: 0 requests; it loads only after "Load 3D" is tapped |
| Text contrast | 4.5 : 1 (3 : 1 for large text) | **602 of 602 pieces of text pass** (after fix 1 below) |
| Graphics contrast | 3 : 1 | î 4.4, ĵ 5.8, eigen 6.0, output 7.5, ink 15, 3D cube 4.4 |
| Reduced motion | no movement, final states | **pass** (see below) |
| Keyboard | every control reachable, visible focus ring | **pass**, 79 stops (after fix 2) |
| Phone, 375px | no sideways scroll | **pass** |
| Projector, 1920px | sensible use of width | **pass**: 1216px centred column, 64px headline, 4 chapter cards per row |

The first local Lighthouse run gave LCP 4.7 s (performance 75). A re-run of the same pages gave 1.8 s and the live
site 1.7 s, so the first run was a cold start (the first run of the preview server and of Lighthouse), not the page.

Lighthouse "phone" means a simulated mid-range phone on a slow 4G connection (150 ms round trip, 1.6 Mbps, CPU 4×
slower). Real INP needs real visitors tapping; TBT is the lab measure Lighthouse gives instead.

## JavaScript per island (compressed)

| Island | Loads | Total | Beyond what the hero already loaded |
|---|---|---|---|
| Hero (`HeroPlayground`) | at once (`client:load`) | 201 KB: Mafs 83, KaTeX 76, logo + hero ~31, helpers | — |
| SVD showcase | ~200px before it scrolls in | 203 KB | 4 KB |
| Four big ideas | when it scrolls in | 128 KB (no KaTeX) | 4 KB |
| All lessons list | when it scrolls in | 5 KB | 2 KB |
| 3D card button (`Load3D`) | when it scrolls in | 5 KB | 2 KB |
| three.js (`Scene3D`) | only after "Load 3D" | 242 KB | — |
| React itself | once, shared by all | 68 KB | — |

The page's other weight is fonts (about 256 KB). Inter's Greek and extended-Latin files (about 100 KB) download
because the page uses Σ, λ and ĵ. They don't block the first paint. A possible later saving, not needed for the targets.

## Reduced motion

| Part | With reduced motion | How it was checked |
|---|---|---|
| Hero presets | jump: Shear was exact 40 ms after the click | setting faked inside the page |
| SVD showcase | step 1 and Play all jump to their end within 40 ms | setting faked inside the page |
| Four big ideas | the idea's last frame at once | setting faked inside the page |
| Chapter cards | stay on the final frame | CSS rule only inside `prefers-reduced-motion: no-preference` |
| Section reveal, smooth scrolling | off | same, inside `no-preference` |
| Card lift, button fade, Mafs handle ring | off | `prefers-reduced-motion: reduce` rule (Mafs ring added in fix 3) |

Not tested on a real device by me (the test browser can't switch the setting on): the owner checks this on an iPhone.

## Fixes made in this session

1. **Lesson colours went pale in dark mode on the homepage.** The 3D card's î, ĵ, k̂ (and anything else borrowing
   lesson colours, like the progress ticks) switched to the lessons' dark-theme colours when the phone was in dark
   mode, on the always-light homepage: 1.9–2.6 : 1. `html.home` in `global.css` now pins those colours to their
   light values. After: no failures in dark mode.
2. **Focus ring squared off round buttons.** The focus rule set `border-radius: 4px`, so "Start chapter 1" became a
   square box while focused. Removed; the outline now follows each control's own shape.
3. **Mafs handles grew their ring with a 0.2 s transition** even with reduced motion. Now off.
4. **SVD ellipse outline was `--gold` (2.9 : 1)** although it carries meaning (the circle's image). Now `--output`
   (7.5 : 1), which is also what it means: the output of A.

## Still for the owner to check (brief section 8, point 3)

- iPhone Safari: dragging the hero handles, scrolling past the planes, Reduce Motion on and off, Load 3D.
- Desktop Chrome on a projector, if one is available.
