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
