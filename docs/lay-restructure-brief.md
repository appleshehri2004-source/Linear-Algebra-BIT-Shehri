# Brief: restructure the site to follow Lay's textbook

Read this whole file before doing anything. It is the single source of truth for this job.
Every session works on ONE phase only (see "Phases" at the bottom).

## Goal

My university (BIT) uses **Linear Algebra and Its Applications, 5th edition** by David C. Lay,
Steven R. Lay and Judi J. McDonald (Pearson). The site must follow that book:

- **Order:** chapters and sections in exactly the book's order (table below).
- **Problems (Practice):** match the problem types of each book section.
- **Visuals and explanations:** keep what we have (3Blue1Brown + MIT 18.06). Do NOT copy
  explanations from the book. The book decides *what* and *in which order*; 3B1B/MIT decide *how it is shown*.

## Copyright rules (important, the site is public)

- The book PDF lives in `book/` (gitignored). Never commit it. Check `git status` before every commit.
- Never copy book text, worked examples, figures or exercises word for word into the repo.
- Practice problems = same *type and skill* as the book's exercises, with **our own numbers**,
  generated and checked by `src/lib/linalg.ts` like the current exercises.
- Allowed: book section numbers, titles, page numbers, and exercise *numbers*
  (e.g. "Do in your book: §1.2 Exercises 1–14, 17").

## Nothing is deleted: "archived" instead

Sections I don't need are **archived**, never deleted:
- hidden from the public site (no page built, not on home page, not in prev/next links),
- the lesson files, components and exercise generators stay in the repo unchanged,
- restoring one = change one word (e.g. `status: 'archived'` -> `status: 'active'`),
- before the restructure, tag the current version: `git tag before-lay-restructure`.

Keep a full map of the book in one data file (e.g. `src/content/book.ts`) listing every
section of chapters 1–8+ with number, title, book page and status (active / archived).

## The book, chapters 1–7 (book page numbers)

Status: A = active, X = archived.

### Chapter 1 Linear Equations in Linear Algebra
| § | Title | Page | Status |
|---|---|---|---|
| 1.1 | Systems of Linear Equations | 2 | A |
| 1.2 | Row Reduction and Echelon Forms | 12 | A |
| 1.3 | Vector Equations | 24 | A |
| 1.4 | The Matrix Equation Ax = b | 35 | A |
| 1.5 | Solution Sets of Linear Systems | 43 | A |
| 1.6 | Applications of Linear Systems | 50 | X |
| 1.7 | Linear Independence | 56 | A |
| 1.8 | Introduction to Linear Transformations | 63 | A |
| 1.9 | The Matrix of a Linear Transformation | 71 | A |
| 1.10 | Linear Models in Business, Science, and Engineering | 81 | X |

### Chapter 2 Matrix Algebra
| § | Title | Page | Status |
|---|---|---|---|
| 2.1 | Matrix Operations | 94 | A |
| 2.2 | The Inverse of a Matrix | 104 | A |
| 2.3 | Characterizations of Invertible Matrices | 113 | A |
| 2.4 | Partitioned Matrices | 119 | A |
| 2.5 | Matrix Factorizations | 125 | X |
| 2.6 | The Leontief Input–Output Model | 134 | X |
| 2.7 | Applications to Computer Graphics | 140 | X |
| 2.8 | Subspaces of R^n | 148 | A |
| 2.9 | Dimension and Rank | 155 | A |

### Chapter 3 Determinants
| § | Title | Page | Status |
|---|---|---|---|
| 3.1 | Introduction to Determinants | 166 | A |
| 3.2 | Properties of Determinants | 171 | A |
| 3.3 | Cramer's Rule, Volume, and Linear Transformations | 179 | A |

### Chapter 4 Vector Spaces
| § | Title | Page | Status |
|---|---|---|---|
| 4.1 | Vector Spaces and Subspaces | 192 | A |
| 4.2 | Null Spaces, Column Spaces, and Linear Transformations | 200 | A |
| 4.3 | Linearly Independent Sets; Bases | 210 | A |
| 4.4 | Coordinate Systems | 218 | A |
| 4.5 | The Dimension of a Vector Space | 227 | A |
| 4.6 | Rank | 232 | A |
| 4.7 | Change of Basis | 241 | A |
| 4.8 | Applications to Difference Equations | 246 | X |
| 4.9 | Applications to Markov Chains | 255 | X |

### Chapter 5 Eigenvalues and Eigenvectors
| § | Title | Page | Status |
|---|---|---|---|
| 5.1 | Eigenvectors and Eigenvalues | 268 | A |
| 5.2 | The Characteristic Equation | 276 | A |
| 5.3 | Diagonalization | 283 | A |
| 5.4 | Eigenvectors and Linear Transformations | 290 | A |
| 5.5 | Complex Eigenvalues | 297 | X |
| 5.6 | Discrete Dynamical Systems | 303 | X |
| 5.7 | Applications to Differential Equations | 313 | X |
| 5.8 | Iterative Estimates for Eigenvalues | 321 | X |

### Chapter 6 Orthogonality and Least Squares
| § | Title | Page | Status |
|---|---|---|---|
| 6.1 | Inner Product, Length, and Orthogonality | 332 | A |
| 6.2 | Orthogonal Sets | 340 | A |
| 6.3 | Orthogonal Projections | 349 | A |
| 6.4 | The Gram–Schmidt Process | 356 | A |
| 6.5 | Least-Squares Problems | 362 | X |
| 6.6 | Applications to Linear Models | 370 | X |
| 6.7 | Inner Product Spaces | 378 | X |
| 6.8 | Applications of Inner Product Spaces | 385 | X |

### Chapter 7 Symmetric Matrices and Quadratic Forms
| § | Title | Page | Status |
|---|---|---|---|
| 7.1 | Diagonalization of Symmetric Matrices | 397 | X |
| 7.2 | Quadratic Forms | 403 | X |
| 7.3 | Constrained Optimization | 410 | A |
| 7.4 | The Singular Value Decomposition | 416 | A |
| 7.5 | Applications to Image Processing and Statistics | 426 | A |

Note: 7.3 and 7.4 build on 7.1 and 7.2, which are archived. Give 7.3 a short
"What you need from 7.1–7.2" recap box (symmetric matrices have orthogonal eigenvectors;
what a quadratic form x^T A x is) instead of un-archiving them.

### Chapter 8 and later: all archived
8 The Geometry of Vector Spaces (8.1 Affine Combinations 438, 8.2 Affine Independence 446,
8.3 Convex Combinations 456, 8.4 Hyperplanes 463, 8.5 Polytopes 471, 8.6 Curves and Surfaces 483),
9 Optimization (online), 10 and any later online chapters. Record them in the book map as archived; build nothing.

## Draft mapping of the current 40 lessons (CHECK this, don't trust it blindly)

Read each lesson file and the matching book section before confirming.

- 1.1 Systems -> NEW (plus parts of 4-2-elimination?)
- 1.2 Row reduction -> 4-2-elimination
- 1.3 Vector equations -> 1-1-vectors, 1-2-adding-scaling, 1-3-span
- 1.4 Ax = b -> 4-1-system-transformation, part of 2-2-matrix-times-vector (Ax as combination of columns)
- 1.5 Solution sets -> 4-6-complete-solution
- 1.7 Linear independence -> 1-4-independence-basis
- 1.8 Intro to linear transformations -> 2-1-linear-transformations, 2-6-non-square
- 1.9 Matrix of a linear transformation -> 2-2-matrix-times-vector, 2-3-gallery
- 2.1 Matrix operations -> 2-4-composition (matrix multiplication)
- 2.2 Inverse -> 4-3-inverse
- 2.3 Invertible matrix theorem -> NEW
- 2.4 Partitioned matrices -> NEW
- 2.8 Subspaces of R^n -> 4-5-rank-subspaces (column space, null space, basis)
- 2.9 Dimension and rank -> 4-5-rank-subspaces (rank part)
- 3.1 Intro to determinants -> 3-3-computing (cofactor expansion)
- 3.2 Properties -> 3-2-orientation, 3-4-det-product
- 3.3 Cramer, volume -> 3-1-area-scaling, 4-8-cramer
  (Lay puts "determinant = area/volume" in 3.3. Keep the book's order, but a short 3B1B
  "why" picture at the start of 3.1 is fine as motivation.)
- 4.1 Vector spaces and subspaces -> 9-1-functions-are-vectors-too, 9-3-the-eight-axioms
- 4.2 Null/column spaces, linear transformations -> 4-7-four-subspaces (part), 9-2-the-derivative-is-a-matrix
- 4.3 Bases -> NEW (may reuse BasisGridView / SubspaceView)
- 4.4 Coordinate systems -> 7-1-jennifers-grid
- 4.5 Dimension -> NEW
- 4.6 Rank -> 4-7-four-subspaces (row space, rank theorem)
- 4.7 Change of basis -> 7-2-another-point-of-view
- 5.1 Eigenvectors -> 8-1-vectors-that-stay-on-their-line
- 5.2 Characteristic equation -> 8-2-det-a-minus-lambda-i (+ 8-3-mean-product-trick as Optional)
- 5.3 Diagonalization -> 8-4-diagonalization-and-powers
- 5.4 Eigenvectors and linear transformations -> NEW (matrix of T in a basis, similarity)
- 6.1 Inner product, length, orthogonality -> 1-5-dot-product, 6-1-orthogonal-vectors
- 6.2 Orthogonal sets -> NEW (or part of 6-1)
- 6.3 Orthogonal projections -> 6-2-projections
- 6.4 Gram–Schmidt -> 6-4-gram-schmidt
- 7.3 Constrained optimization -> NEW (reuse QuadraticFormView)
- 7.4 SVD -> 8-6-svd-circle-to-ellipse
- 7.5 Image processing and statistics -> NEW (PCA picture)

ARCHIVED existing lessons (their section is archived):
- 6-3-least-squares -> §6.5 (archived)
- 8-5-symmetric-matrices-and-quadratic-forms -> §7.1/7.2 (archived)

OPTIONAL extras (not in Lay; keep, badge "Optional", place in the closest chapter):
- 2-5-3d -> end of §1.9
- 5-2-cross-product, 5-3-cross-product-formula -> end of Chapter 3 (cross product via determinants)
- 5-1-duality -> end of §6.1 (dot product)
- 8-3-mean-product-trick -> end of §5.2

## How the new structure should work (proposal; improve it in the plan)

- Module = book chapter (1–7), module name = book chapter title.
- Each lesson gets a `section` field (e.g. "1.3") and a status (`active` / `archived`);
  one book section can have several lessons (parts). Lesson title shows the § number.
- Slugs and numbers follow the book (e.g. `1-3-vector-equations-1`). Saved progress uses
  lesson ids, so renaming resets progress; that's fine (or migrate it if it's simple).
- Every lesson keeps the 7 parts: Question, Play, Numbers, Explain, Predict, Practice, Go deeper.
- Practice gets two things:
  1. On-site problems: book-style generators (our numbers, checked by linalg.ts).
     If the book's problem types need new answer kinds (a matrix, yes/no, "consistent or not",
     a choice from a list), extend `Question` in `src/exercises/exercise.ts` with tests.
  2. "Do in your book": a small component listing exercise numbers for that § (numbers only).
- Go deeper keeps 3B1B and MIT links and adds "Lay §x.y, p. N".
- Every section of chapters 1–7 marked A must have at least one lesson in the end.

## Phases (one per Claude Code session)

0. Me: copy the book PDF to `book/lay-5e.pdf` (gitignored). Commit everything first.
1. **Plan only (Plan mode, no file edits):** read this brief, every lesson, `modules.ts`,
   the exercise files, and in the PDF the exercise list of each active section. Write the
   result in `docs/lay-map.md`: for every active section -> lessons (existing / new),
   what changes in each existing lesson, the exercise *types* in the book (described in
   your own words) and which generators we need, and the "Do in your book" exercise numbers.
   Also list archived and optional lessons. Wait for my OK.
2. **Restructure, no new content:** `git tag before-lay-restructure`, the book map,
   archived status + filtering, renumber/move existing lessons, home page grouped by book chapter,
   prev/next links in book order. Tests + build pass. Commit.
3. **One chapter per session (Ch 1, 2, 3, 4, 5, 6, 7):** new lessons for that chapter,
   rewrite Practice into book-style problems, add "Do in your book" lists, fix
   lesson text so it follows the book's order (each lesson only uses ideas from earlier sections).
   Tests + build pass. Commit.
4. **Check:** compare every active section in the PDF against the site (order, topics,
   problem types, no copied text). Run /code-review. Fix, commit, push.

Follow CLAUDE.md as always: plan first and wait for OK, small steps, explain each changed
file in plain words, `npm test` and `npm run build` before saying a task is done.
