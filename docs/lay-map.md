# Lay map (Phase 1 result)

Status: **checked against the book.** Sources read:
- every lesson in `src/content/lessons`, `src/content/modules.ts`, and every generator in `src/exercises`,
- the table of contents of Lay 5e, plus the exercise set of every active section. Some section text was checked too.

The PDF is at `book/Linear Algebra and its Applications 5th Edition.pdf`, not `book/lay-5e.pdf`. Both are gitignored, because all of `book/` is ignored.
All section titles and page numbers in the brief match the book.

How to read this file:
- **keep** = lesson stays, with small edits. **rewrite** = the lesson stays, but its text or order changes a lot.
  **split** = parts of the lesson go to different sections. **NEW** = write it from scratch.
- "Out of order" = the lesson uses an idea that Lay only teaches later.
- "Book exercises" describe the problem *types* in my own words, with the book's exercise numbers. Nothing is copied.
- "Do in your book" uses odd numbers wherever possible, because their answers are at the back of the book (p. A17 on).
  **Core** = covers every main type. **More** = harder or proof-style. Exercises marked [M] need a matrix program and are never listed.
- Every section's exercise set also has a pair of True/False questions (listed below as "T/F").

---

## Chapter 1 Linear Equations in Linear Algebra

### 1.1 Systems of Linear Equations (p. 2)
- Lessons: **4-1-system-transformation (split: row picture only)** + **4-2-elimination (split: the three row operations)**.
- Changes: 4-1 opens with `A`, `Ax = v`, the column picture and `det A ≠ 0`. None of those exist yet in 1.1.
  Keep the row picture (two lines meet / are parallel / are the same line) and the "solve a 2×2 system" game. Move the column picture to 1.3/1.4.
  4-2's "three moves, and why the answer never changes" belongs here. Its pivot and echelon part goes to 1.2.
- Book exercises:
  - 1–4: solve a 2-unknown system by elimination (3–4 phrase it as where two lines meet).
  - 5–6: say the next two row operations.
  - 7–10: finish a partly reduced augmented matrix and describe the solutions.
  - 11–14: solve a 3-unknown system.
  - 15–16: consistent or not, without solving fully.
  - 17–18: do three lines, or three planes, have a common point?
  - 19–22: find the values of h that make a system consistent.
  - 23–24: T/F.
  - 25: condition on g, h, k for consistency.
  - 26–28: build a system, or reason about consistency for every right side.
  - 29–32: name the row operation that turns one matrix into another, and its reverse.
  - 33–34: heat-plate application.
- Generators: reuse `4.1-solve`, `4.2-multiplier`, `4.2-new-row`. NEW: "consistent? (yes/no)", "h for consistency",
  "which row operation turns A into B".
- Do in your book: Core 1, 3, 7, 9, 11, 13, 15, 17, 19, 21, 23, 29, 31. More 25, 27, 33.

### 1.2 Row Reduction and Echelon Forms (p. 12)
- Lessons: **4-2-elimination (rewrite)** + the free-variable part of **4-6-complete-solution**.
- Changes: 4-2 only does systems with exactly one solution, reduced all the way to `I`. Lay 1.2 covers echelon and reduced echelon form,
  pivot positions and pivot columns, basic and free variables, the general solution, and the existence and uniqueness theorem.
  4-2's Go deeper ("0 = 3 means none, 0 = 0 means many") becomes main content.
- Book exercises:
  - 1–2: echelon, reduced echelon, or neither.
  - 3–4: reduce to RREF and list the pivot columns.
  - 5–6: possible echelon shapes of a small matrix.
  - 7–14: general solution from an augmented matrix.
  - 15–16: consistent? unique? (from the echelon pattern).
  - 17–18: h for consistency.
  - 19–20: choose h and k for no / one / many solutions.
  - 21–22: T/F.
  - 23–31: reasoning about pivots and under- or over-determined systems.
  - 33: fit a parabola through 3 points (interpolation).
- Generators: reuse `4.2-solve3`. NEW: "echelon / reduced / neither" (choice), "pivot columns", "general solution"
  (particular vector + free direction), "h and k for none / one / many".
- Do in your book: Core 1, 3, 7, 9, 11, 13, 15, 17, 19, 21. More 23, 25, 27, 29, 31, 33.

### 1.3 Vector Equations (p. 24)
- Lessons: **1-1-vectors**, **1-2-adding-scaling**, **1-3-span** (keep) + the column picture from **4-1** + the
  "reach the target" part of **1-4-independence-basis**.
- Changes: Lay works in Rⁿ from the start, so add R³ examples. Add the key fact: a vector equation has the same solutions as the augmented
  matrix `[a₁ … aₙ | b]`, so "is b in the span?" is answered by row reduction. The exercise `1.4-solve` belongs here.
- Book exercises:
  - 1–2: compute u + v and u − 2v.
  - 3–4: draw them.
  - 5–6: vector equation → system.
  - 7–8: read combinations off a grid picture.
  - 9–10: system → vector equation.
  - 11–14: is b a combination of given vectors, or of the columns of A?
  - 15–16: list vectors in a span.
  - 17–18: h so that b is in the plane spanned by two vectors.
  - 19–20: describe a span geometrically.
  - 21: show a span is all of R².
  - 23–24: T/F.
  - 25–26: W = span of the columns; is b in W?
  - 27–31: applications (mixing, centre of mass).
  - 33–34: prove the vector algebra rules.
- Generators: reuse `1.1-*`, `1.2-*`, `1.3-combo`, `1.3-line`, `1.4-solve`. NEW: "is b in Span{a₁, a₂}? (yes/no, R³)",
  "h so that b is in the span".
- Do in your book: Core 1, 5, 9, 11, 13, 15, 17, 19, 21, 23, 25. More 27, 29, 31, 33.

### 1.4 The Matrix Equation Ax = b (p. 35)
- Lessons: **NEW**, built from the "Ax = combination of columns" half of **2-2-matrix-times-vector** and the
  "`Ax = v` is a system" part of **4-1** (with `SolveGame`).
- Changes: Lay defines `Ax` as a combination of columns *before* it has transformations, so 2-2's î/ĵ "where they land" story waits until 1.9.
  The book also has the row–vector rule (now in 2-2's Go deeper) and Theorem 4: the columns span Rᵐ exactly when there is a pivot in every row.
- Book exercises:
  - 1–4: compute Ax by columns and by the row–vector rule, or say it is undefined.
  - 5–8: matrix equation ↔ vector equation.
  - 9–10: system → vector equation → matrix equation.
  - 11–12: solve Ax = b.
  - 13–14: is u in the span of the columns?
  - 15–16: show Ax = b fails for some b, and describe the b that work.
  - 17–22: pivot in every row? Do the columns span R⁴ / R³?
  - 23–24: T/F.
  - 25–26: use a given relation between columns to find weights with no row reduction.
  - 27–36: notation, construction and reasoning.
- Generators: reuse `2.2-matvec`, `4.1-columns`, `4.1-stretch`. NEW: "do the columns span Rᵐ? (yes/no)",
  "condition on b₁, b₂, b₃ for a solution".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23. More 25, 27, 29, 31, 33, 35.

### 1.5 Solution Sets of Linear Systems (p. 43)
- Lessons: **4-6-complete-solution (rewrite)**.
- Changes: out of order. It uses `det A = 0` (Ch 3), "null space" and "column space" (2.8), and "rank 1" (2.9). Lay's words are
  homogeneous, trivial / nontrivial solution, parametric vector form, and "solutions of Ax = b = p + solutions of Ax = 0".
  The picture is the same; only the words change. Add a 3D case (a plane of solutions).
- Book exercises:
  - 1–4: nontrivial solution?
  - 5–12: parametric vector form of the solutions of Ax = 0.
  - 13–14: turn a solution description into vector form.
  - 15–18: parametric form for Ax = b, compared with Ax = 0 (a translate).
  - 19–22: parametric equation of a line (direction given / through two points).
  - 23–24: T/F.
  - 25–28: reasoning.
  - 29–32: nontrivial solution? solvable for every b? (from the pivot count).
  - 33–37: nontrivial solution by inspection, or build A.
- Generators: reuse `4.6-particular`, `4.6-another`, `4.6-solvable`. NEW: "parametric vector form" (vector answers for p and v),
  "nontrivial solution? (yes/no)", "line through p and q".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23. More 25, 27, 29, 31, 33, 35, 37, 39.

### 1.7 Linear Independence (p. 56)
- Lessons: **1-4-independence-basis (rewrite)**.
- Changes: out of order twice. (1) It tests independence with the **determinant** (Ch 3). Lay uses "Ax = 0 has only the
  trivial solution" plus quick facts: multiples, too many vectors, the zero vector. (2) It defines **basis**, which Lay leaves until 2.8 / 4.3.
  Add 3 vectors in R³.
- Book exercises:
  - 1–8: are these vectors, or the columns of A, independent?
  - 9–10: h so that v₃ is in the span / the set is dependent.
  - 11–14: h that makes them dependent.
  - 15–20: decide by inspection.
  - 21–22: T/F.
  - 23–26: possible echelon shapes.
  - 27–30: count pivots.
  - 31–32: nontrivial solution from a column relation, with no row reduction.
  - 33–38: true always, or give a counterexample.
- Generators: reuse `1.4-dependent`. NEW: "independent? (yes/no, 3 vectors in R³)", "h for dependence",
  "nontrivial solution from a column relation".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21. More 23, 25, 27, 31, 33, 35, 37, 39.

### 1.8 Introduction to Linear Transformations (p. 63)
- Lessons: **2-1-linear-transformations** (keep), **2-6-non-square** (keep, small edits).
- Changes: 2-6 calls the 1×2 matrix "the dot product in disguise" and names the "column space". Both come later (6.1, 2.8),
  so reword or move them to Go deeper. Add Lay's words: domain, codomain, image, range.
  2-1's "Moved origin" example is the book's affine-map exercise (30), a good match.
- Book exercises:
  - 1–2: images T(u), T(v).
  - 3–6: find x with T(x) = b. Unique?
  - 7–8: sizes of the domain and codomain.
  - 9–10: every x with T(x) = 0.
  - 11–12: is b in the range?
  - 13–16: sketch and describe a 2D transformation.
  - 17–20: use linearity, or build the matrix from T(e₁), T(e₂).
  - 21–22: T/F.
  - 23–31: proofs (lines go to lines, affine maps aren't linear).
  - 32–36: show a formula is, or isn't, linear.
- Generators: reuse `2.1-*`, `2.6-*`. NEW: "find x with T(x) = b", "is b in the range? (yes/no)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21. More 23, 25, 29, 31, 33, 35.

### 1.9 The Matrix of a Linear Transformation (p. 71)
- Lessons: **2-2-matrix-times-vector** (the î/ĵ columns story = Lay's "standard matrix"), **2-3-gallery** (keep).
  Optional: **2-5-3d** at the end.
- Changes: one-to-one and onto are missing. Add a NEW part, or extend 2-3, whose "Project can't be undone" is the start.
  The book also composes two moves ("rotate, then reflect"), so 2-4's idea gets a preview here.
- Book exercises:
  - 1–10: standard matrix from T(eⱼ), or from a rotation, shear or reflection, or two of them in a row.
  - 11–12: show that two reflections make a rotation.
  - 13–14: use a picture.
  - 15–20: matrix from a formula.
  - 21–22: solve T(x) = b.
  - 23–24: T/F.
  - 25–28: one-to-one? onto?
  - 29–32: pivot conditions.
  - 33–36: proofs.
- Generators: reuse `2.2-arrows`, `2.2-find-column`, `2.3-*`. NEW: "standard matrix of T" (matrix answer),
  "one-to-one? onto?" (yes/no).
- Do in your book: Core 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25, 27. More 29, 31, 33, 35.

## Chapter 2 Matrix Algebra

### 2.1 Matrix Operations (p. 94)
- Lessons: **2-4-composition** (keep, add).
- Changes: add sums, scalar multiples, the identity, powers, the **transpose** ((AB)ᵀ = BᵀAᵀ), and the row–column rule
  (now only in Go deeper). uᵀv and uvᵀ appear in the exercises (27–28).
- Book exercises:
  - 1–4: sums and products, or "undefined".
  - 5–6: AB by columns and by the row–column rule.
  - 7–8: sizes.
  - 9: k that makes AB = BA.
  - 10–12: AB = AC without B = C; diagonal matrices; AB = 0.
  - 15–16: T/F.
  - 17–22: what the columns of AB look like.
  - 23–26: one-sided inverses.
  - 27–28: uᵀv and uvᵀ.
  - 29–34: proofs.
- Generators: reuse `2.4-*`. NEW: "size of AB or undefined", "entry (i, j) of AB", "transpose of a product".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 15, 17, 19, 27. More 21, 23, 25, 29, 33.

### 2.2 The Inverse of a Matrix (p. 104)
- Lessons: **4-3-inverse (rewrite)**.
- Changes: the 2×2 formula is fine here. The book itself calls ad − bc the determinant in this section. But "divide by det because areas scale"
  is 3.3, so it becomes a forward note. Add elementary matrices (now in 4-2's Go deeper) and the `[A | I] → [I | A⁻¹]` algorithm
  (now one sentence). That algorithm is a main exercise type.
- Book exercises:
  - 1–4: 2×2 inverse.
  - 5–6: solve with it.
  - 7: many right-hand sides.
  - 9–10: T/F.
  - 11–20: algebra with inverses (cancel, solve for a matrix).
  - 21–26: reasoning, and why the formula works.
  - 27–28: elementary matrices.
  - 29–32: inverse by row reducing [A I], or show none exists.
  - 33–34: guess a pattern.
  - 35: one column of A⁻¹ only.
  - 37–38: one-sided inverses.
  - 39: beam application.
- Generators: reuse `4.3-*`. NEW: "inverse by row reduction (3×3)" (matrix answer), "one column of A⁻¹", "elementary matrix for this row operation".
- Do in your book: Core 1, 3, 5, 7, 9, 13, 15, 17, 29, 31, 35. More 11, 19, 21, 23, 25, 27, 33, 37.

### 2.3 Characterizations of Invertible Matrices (p. 113)
- Lessons: **NEW**. It can reuse `InverseDemo` (the Squash preset) and `SubspaceView`.
- Book exercises:
  - 1–8: invertible? (as few calculations as possible).
  - 11–12: T/F on "if … then" statements.
  - 13–32: short reasoning questions built on the theorem (triangular matrices, equal columns, AB invertible).
  - 33–34: show T is invertible and find a formula for T⁻¹.
  - 35–40: invertible transformations.
- Generators: NEW "invertible? (yes/no)", "formula for T⁻¹ (2×2)".
- Do in your book: Core 1, 3, 5, 7, 11, 13, 15, 17, 19, 21, 23. More 25, 27, 29, 31, 33, 35, 37.

### 2.4 Partitioned Matrices (p. 119)
- Lessons: **NEW**. No existing lesson covers it.
- Book exercises:
  - 1–4: block products.
  - 5–9: solve for unknown blocks X, Y, Z.
  - 10: block inverse.
  - 11–12: T/F.
  - 13–16: invertibility of block matrices, Schur complement.
  - 17–20: applications.
  - 21–25: block tricks and proofs.
- Generators: NEW "unknown block", "block product".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13. More 15, 17, 21, 23, 25.

### 2.8 Subspaces of Rⁿ (p. 148)
- Lessons: **4-5-rank-subspaces (split: column space, null space)** + the basis part of **1-4**.
- Changes: 4-5 never defines "subspace". Right now the site defines it only in 9-3, the last lesson. Add "basis of a subspace" and finding a
  basis for Col A (the pivot columns of A) and for Nul A. Remove or reword the det and inverse back-references.
- Book exercises:
  - 1–4: give a reason a pictured set is not a subspace.
  - 5–6: is w in the span?
  - 7–10: is p in Col A? Is u in Nul A?
  - 11–12: Nul A ⊂ Rᵖ and Col A ⊂ R^q; find p and q.
  - 13–14: a nonzero vector in each.
  - 15–20: is this set a basis of R² / R³?
  - 21–22: T/F.
  - 23–26: bases for Col A and Nul A from a given echelon form.
  - 27–30: constructions.
  - 31–36: reasoning about square matrices.
- Generators: reuse `4.5-null`. NEW: "is u in Nul A? (yes/no)", "is b in Col A? (yes/no)", "basis of Nul A" (vector, normalized so it has one answer),
  "basis of R³? (yes/no)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25. More 27, 29, 31, 33, 35.

### 2.9 Dimension and Rank (p. 155)
- Lessons: **4-5-rank-subspaces (split: rank, rank + dim Nul = n)** + a preview of **7-1**'s picture.
- Changes: 2.9 starts with **coordinates relative to a basis** (Exercises 1–8). That is 7-1's idea, inside a subspace. Use a short
  version of `BasisGridView` here. The full lesson stays in 4.4.
- Book exercises:
  - 1–2: x from [x]_B.
  - 3–6: [x]_B.
  - 7–8: estimate coordinates from a picture.
  - 9–12: bases and dimensions of Col A and Nul A.
  - 13–14: basis and dimension of a span.
  - 15–16: rank questions.
  - 17–18: T/F.
  - 19–24: rank theorem numbers and constructions.
  - 25–28: proofs.
- Generators: reuse `4.5-rank`, `4.5-rank3`, `7.1-to-hers` (as [x]_B). NEW: "dim Nul A from the size and rank".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21. More 23, 25, 27.

## Chapter 3 Determinants

### 3.1 Introduction to Determinants (p. 166)
- Lessons: **3-3-computing (rewrite)**, with **3-1-area-scaling**'s picture as the short "why" opener.
- Changes: Lay 3.1 is cofactor expansion along **any** row or column (n×n), and triangular ⇒ multiply the diagonal. 3-3 only expands along the top row.
  The book's own exercises already touch two later ideas: the effect of a row operation on det (19–24) and area = det (41–42).
  So the brief's "3B1B area picture as motivation" fits the book well.
- Book exercises:
  - 1–8: cofactor expansion across row 1 (1–4 also down column 2).
  - 9–14: expand along the best row or column (bigger matrices with zeros).
  - 15–18: the 3×3 diagonal trick.
  - 19–24: how a row operation changes det.
  - 25–30: det of elementary matrices.
  - 33–36: check det(EA) = det E · det A.
  - 37–38: det(kA).
  - 39–40: T/F.
  - 41–42: parallelogram area compared with det.
- Generators: reuse `3.3-det2`, `3.3-det3`, `3.3-det3-triangle`, `3.1-*`. NEW: "4×4 with many zeros", "det after a row operation", "det(kA)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 19, 21, 23, 25, 27, 29, 31, 37, 39. More 33, 35, 41.

### 3.2 Properties of Determinants (p. 171)
- Lessons: **3-4-det-product** (keep) + **NEW** part on row operations.
- Changes: the core of 3.2 is missing from the site: computing det by row reduction (replacement: no change, swap: sign flips, scaling a row:
  det is scaled too), det Aᵀ = det A, invertible ⇔ det ≠ 0. **3-2-orientation** fits 3.3 better (see there).
- Book exercises:
  - 1–4: name the property used.
  - 5–10: det by row reduction.
  - 11–14: row reduction plus cofactors.
  - 15–20: det of changed matrices, given that the original det is 7.
  - 21–23: invertible? (by det).
  - 24–26: independent? (by det).
  - 27–28: T/F.
  - 29: det of a power.
  - 30–36: proofs (det A⁻¹, det(rA), det(PAP⁻¹), UᵀU = I).
  - 37–38: check det AB.
  - 39–40: det of AB, B⁵, 2A, AᵀBA, … from det A and det B.
  - 41–44: det is not additive.
- Generators: reuse `3.4-*`. NEW: "det by row reduction", "det after these row operations (given det = 7)", "det(kA), det(Aᵀ), det(A⁻¹), det(Bᵏ)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 25, 27, 29, 31, 39. More 33, 35, 37, 41, 43.

### 3.3 Cramer's Rule, Volume, and Linear Transformations (p. 179)
- Lessons: **3-1-area-scaling**, **3-2-orientation** (moved here from the draft's 3.2), **4-8-cramer** (all keep).
- Changes: the book states area = |det A| and has nothing on orientation, so 3-2 is "keep as Optional". Add the
  adjugate formula for A⁻¹ (now only in 4-8's Go deeper). It has a whole block of exercises.
- Book exercises:
  - 1–6: Cramer's rule (2×2 and 3×3).
  - 7–10: values of a parameter s for a unique solution, and that solution.
  - 11–16: adjugate and inverse.
  - 17–18: reasoning.
  - 19–22: area of a parallelogram from its corners.
  - 23–24: volume of a parallelepiped.
  - 27–28: area of T(S).
  - 29–30: triangle area.
  - 31–32: volume of an ellipsoid / tetrahedron image.
- Generators: reuse `3.1-*`, `3.2-*`, `4.8-*`. NEW: "parallelogram area from corners", "entry of adj A", "s for a unique solution".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 19, 21, 23, 27. More 17, 25, 29, 31.

## Chapter 4 Vector Spaces

### 4.1 Vector Spaces and Subspaces (p. 192)
- Lessons: **9-1-functions-are-vectors-too**, **9-3-the-eight-axioms** (keep).
- Changes: use Lay's names Pₙ and "Span{…} is a subspace". 9-3 presents "subspace" as new, but 2.8 now introduces it, so reword.
  The book has many "write the set as a span" problems and also matrix spaces (M₂ₓ₂), which 9-3's Go deeper already mentions.
- Book exercises:
  - 1–4: a pictured set in R² is not a subspace.
  - 5–8: subspace of Pₙ? (e.g. p(0) = 0).
  - 9–12: write a set as Span{…} to show it is a subspace.
  - 13–14: is w in the span?
  - 15–18: find a spanning set, or show it is not a vector space.
  - 19–22: function and matrix spaces.
  - 23–24: T/F.
  - 25–30: fill in the axiom numbers in proofs.
  - 31–34: span, intersection, sum of subspaces.
- Generators: reuse `9.1-*`, `9.3-*`. NEW: "subspace? (yes/no)" for sets of polynomials, vectors and matrices.
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 21, 23. More 19, 25, 27, 31, 33.

### 4.2 Null Spaces, Column Spaces, and Linear Transformations (p. 200)
- Lessons: **NEW (short)**.
- Changes: the draft's two sources don't fit. **4-7** is row space (4.6) and orthogonality (6.1). **9-2** builds a matrix relative to a basis (5.4).
  The book does use maps on P₂ (Exercises 31–32) for kernel and range, so 9-2's "constants go to 0" is a good *example* here.
- Book exercises:
  - 1–2: is w in Nul A?
  - 3–6: spanning vectors for Nul A.
  - 7–14: show a set is a vector space with a theorem (write it as a Nul or a Col), or find a counterexample.
  - 15–16: find A whose Col A is a given set.
  - 17–20: k so that Nul A / Col A lives in Rᵏ.
  - 21–24: vectors in Nul A and Col A; is w in Col A? in Nul A?
  - 25–26: T/F.
  - 27–28: use the theory, not row reduction.
  - 29–36: kernel and range of maps on P₂, M₂ₓ₂ and functions.
- Generators: NEW "spanning set for Nul A", "Nul A lives in Rᵏ: k = ?", "kernel of T on P₂".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25. More 27, 29, 31, 33.

### 4.3 Linearly Independent Sets; Bases (p. 210)
- Lessons: **NEW**. It can take the basis part of **1-4** (TargetGame) and `BasisGridView`.
- Book exercises:
  - 1–8: basis of R³? If not, independent? spanning?
  - 9–10: basis for Nul A.
  - 11–12: basis of a plane / line.
  - 13–14: bases for Nul A and Col A.
  - 15–16: basis for a span.
  - 19–20: basis from a given dependence relation.
  - 21–22: T/F.
  - 23–25: reasoning.
  - 26–28: function spaces.
  - 29–32: proofs.
  - 33–34: polynomial independence and bases.
- Generators: NEW "basis of R³? (yes/no)", "drop a dependent vector" (which one to remove).
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 19, 21. More 23, 25, 27, 29, 31, 33.

### 4.4 Coordinate Systems (p. 218)
- Lessons: **7-1-jennifers-grid** (keep).
- Changes: use Lay's names [x]_B and P_B (the change-of-coordinates matrix to the standard basis). The book has a large block on
  **coordinates of polynomials** and testing their independence through coordinates (13–14, 27–32). 9-2 and 9-3's Go deeper (isomorphism) feed this.
- Book exercises:
  - 1–4: x from [x]_B.
  - 5–8: [x]_B.
  - 9–10: write P_B.
  - 11–12: [x]_B with an inverse.
  - 13–14: coordinates of a polynomial in a basis of P₂.
  - 15–16: T/F.
  - 17–26: reasoning and proofs (the coordinate map is one-to-one and onto).
  - 27–30: independence of polynomials through coordinates.
  - 31–32: span or basis of P₂.
- Generators: reuse `7.1-*`. NEW: "coordinates of a polynomial", "polynomials independent? (yes/no)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 27, 29, 31. More 17, 19, 21, 23, 25.

### 4.5 The Dimension of a Vector Space (p. 227)
- Lessons: **NEW**. Some ideas already sit in the Go deeper parts of 9-1 and 9-3.
- Book exercises:
  - 1–8: basis and dimension of a subspace given by a formula or by equations.
  - 9–12: dimension of a described subspace or a span.
  - 13–18: dim Nul A and dim Col A.
  - 19–20: T/F.
  - 21–24: special polynomial bases, and coordinates in them.
  - 25–28: reasoning, infinite dimensions.
  - 29–30: harder T/F.
  - 31–32: proofs.
- Generators: NEW "dimension of the subspace", "dim Nul A, dim Col A".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23. More 25, 27, 29, 31.

### 4.6 Rank (p. 232)
- Lessons: **4-7-four-subspaces (rewrite)**.
- Changes: keep row space and the rank theorem. Exercise 27 lists Row A, Col A, Nul A, Row Aᵀ, Col Aᵀ, Nul Aᵀ and asks where each lives,
  so Nul Aᵀ (the "left null space") does belong here, under that name. The **right-angle** part needs the dot product, so it moves to 6.1
  (Lay's Theorem 3 there: (Row A)⊥ = Nul A, (Col A)⊥ = Nul Aᵀ). Rank-1 matrices as uvᵀ (31–33) fit too.
- Book exercises:
  - 1–4: rank, dim Nul A, and bases for Col, Row and Nul from an echelon form.
  - 5–16: dimension counting with the rank theorem.
  - 17–18: T/F.
  - 19–25: systems questions answered with rank.
  - 26–30: full rank, the six subspaces.
  - 31–34: rank 1 = uvᵀ.
- Generators: reuse `4.7-row-space`, `4.7-dimensions`. NEW: "dim Row A / dim Nul A from the size and rank", "v with A = uvᵀ".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17. More 19, 21, 23, 25, 27, 29, 31.

### 4.7 Change of Basis (p. 241)
- Lessons: **NEW**, built on 7-1's `BasisGridView` with two non-standard bases.
- Changes: **the draft is wrong here.** 7-2 is about one *transformation* in another basis (P⁻¹MP). That is **5.4**.
  4.7 is about one *vector* in two bases: P_{C←B}.
- Book exercises:
  - 1–2: P_{C←B} from b₁, b₂ written in C, then [x]_C.
  - 3–4: which equation does P satisfy?
  - 5–6: the same with 3 vectors.
  - 7–10: P_{C←B} and P_{B←C} for two bases of R².
  - 11–12: T/F.
  - 13–14: in P₂.
  - 15–16: complete a proof.
- Generators: NEW "P_{C←B}" (matrix answer), "[x]_C from [x]_B".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13. More 15.

## Chapter 5 Eigenvalues and Eigenvectors

### 5.1 Eigenvectors and Eigenvalues (p. 268)
- Lessons: **8-1-vectors-that-stay-on-their-line** (keep).
- Changes: add the eigenspace (= Nul(A − λI)) and "is λ an eigenvalue? Row reduce A − λI". The book also asks about reflections and
  rotations without computing (31–32), which matches the probe demo exactly.
- Book exercises:
  - 1–2: is λ an eigenvalue?
  - 3–6: is v an eigenvector, and for which λ?
  - 7–8: is λ an eigenvalue? Find an eigenvector.
  - 9–16: basis for each eigenspace.
  - 17–18: eigenvalues of triangular matrices.
  - 19–20: an eigenvalue with no calculation.
  - 21–22: T/F.
  - 23–30: proofs (A⁻¹, Aᵀ, equal row sums).
  - 31–32: reflection, rotation.
  - 35–36: draw T(u), T(v), T(w) from eigen-information.
- Generators: reuse `8.1-*`. NEW: "is λ an eigenvalue? (yes/no)", "is v an eigenvector? (yes/no + λ)", "basis of the eigenspace" (normalized).
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21. More 23, 25, 27, 29, 31, 35.

### 5.2 The Characteristic Equation (p. 276)
- Lessons: **8-2-det-a-minus-lambda-i** (keep) + **8-3-mean-product-trick** as Optional (its `optional` field is not set yet).
- Changes: add 3×3 characteristic polynomials (cofactor expansion), multiplicity, and the **definition of similar matrices** (used in 23–24, needed by 5.4).
  Exercises 25 and 27 lean on Markov chains (4.9, archived), so leave them out.
- Book exercises:
  - 1–8: characteristic polynomial and eigenvalues (2×2).
  - 9–14: characteristic polynomial (3×3).
  - 15–17: eigenvalues with multiplicity.
  - 18: h so that an eigenspace is 2-dimensional.
  - 19–20: det = product of eigenvalues; A and Aᵀ.
  - 21–22: T/F.
  - 23–24: similarity.
- Generators: reuse `8.2-*`, `8.3-*`. NEW: "characteristic polynomial of a 3×3" (coefficients), "multiplicity".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 21. More 19, 23.

### 5.3 Diagonalization (p. 283)
- Lessons: **8-4-diagonalization-and-powers** (keep).
- Changes: its link back to 7-2 now points forward, because 7-2 moves to 5.4. Reword it. Add "n distinct eigenvalues ⇒ diagonalizable", 3×3 examples,
  and reasoning from eigenspace dimensions.
- Book exercises:
  - 1–4: Aᵏ from A = PDP⁻¹.
  - 5–6: read eigenvalues and eigenspaces off a factorization.
  - 7–20: diagonalize if possible (2×2 up to 4×4).
  - 21–22: T/F.
  - 23–26: diagonalizable from the eigenspace dimensions?
  - 27–32: proofs and constructions.
- Generators: reuse `8.4-*`. NEW: "diagonalizable? (yes/no)", "entry of Aᵏ from PDP⁻¹".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25. More 27, 29, 31.

### 5.4 Eigenvectors and Linear Transformations (p. 290)
- Lessons: **7-2-another-point-of-view** (moved here from the draft's 4.7) + the matrix part of **9-2-the-derivative-is-a-matrix**.
- Changes: the book's text uses differentiation on polynomials as an example and has a "Similarity of Matrix Representations" part.
  That is exactly 9-2 and 7-2. Use Lay's notation [T]_B.
- Book exercises:
  - 1–4: matrix of T relative to two bases.
  - 5–7: maps on polynomials (e.g. multiply by (t + 5)).
  - 8: T(3b₁ − 4b₂) from [T]_B.
  - 9–10: evaluation maps Pₙ → Rᵐ.
  - 11–12: [T]_B for x ↦ Ax.
  - 13–16: find a basis B with [T]_B diagonal.
  - 17–18: reasoning.
  - 19–26: similarity proofs (trace, rank, A²).
  - 27–29: the identity map gives the change-of-coordinates matrices.
- Generators: reuse `7.2-*`, `9.2-*`. NEW: "[T]_B for a map on P₂" (matrix answer), "basis making [T]_B diagonal".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17. More 19, 21, 23, 25, 27.

## Chapter 6 Orthogonality and Least Squares

### 6.1 Inner Product, Length, and Orthogonality (p. 332)
- Lessons: **1-5-dot-product**, **6-1-orthogonal-vectors** (keep) + the right-angle part of **4-7** + Optional **5-1-duality**, **5-2**, **5-3**.
- Changes: moving 1-5 here breaks lessons that use the dot product earlier: 2-2 (Go deeper), 2-6, 3-3 (Go deeper), 4-7, 5-2.
  1-5's projection formula moves to 6.2. Add distance and unit vectors (both are exercise types).
- Book exercises:
  - 1–8: compute u·u, v·u, ‖w‖ and similar quantities.
  - 9–12: unit vector in a direction.
  - 13–14: distance between two vectors.
  - 15–18: orthogonal pairs?
  - 19–20: T/F.
  - 21–31: proofs (W⊥ is a subspace, the Pythagorean theorem, the parallelogram law).
- Generators: reuse `1.5-dot`, `1.5-length`, `6.1-*`, `4.7-left-null`. NEW: "distance", "unit vector".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19. More 21, 23, 25, 27, 29, 31.

### 6.2 Orthogonal Sets (p. 340)
- Lessons: **NEW**, but much of it exists elsewhere:
  - projection onto a line: 1-5's shadow and the line half of **6-2-projections**,
  - orthogonal matrices (UᵀU = I, lengths stay the same): the second half of **6-4-gram-schmidt** (`OrthogonalCompare`).
  - New: weights in an orthogonal basis, cⱼ = (y·uⱼ)/(uⱼ·uⱼ); orthonormal sets.
- Book exercises:
  - 1–6: orthogonal set?
  - 7–10: show a set is an orthogonal basis, then find x's weights.
  - 11–12: projection onto a line.
  - 13–14: split y into a part along u and a part orthogonal to u.
  - 15–16: distance to a line.
  - 17–22: orthonormal? Normalize.
  - 23–24: T/F.
  - 25–34: proofs about orthogonal matrices and reflections.
- Generators: reuse `1.5-project`, `6.2-onto-line`, `6.4-shear-length`. NEW: "weights in an orthogonal basis", "distance to a line", "orthogonal set? (yes/no)".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23. More 25, 27, 29, 31, 33.

### 6.3 Orthogonal Projections (p. 349)
- Lessons: **6-2-projections (rewrite)**.
- Changes: out of order. 6-2 projects onto a plane with the **normal equations** AᵀAx̂ = Aᵀv, which belong to 6.5 (archived).
  Lay 6.3 uses an **orthogonal basis**: add up the projections onto each basis vector. Add the orthogonal decomposition, the closest point,
  the distance to W, and proj = UUᵀy (Exercises 17–18). P² = P moves to Go deeper.
- Book exercises:
  - 1–2: split x between two orthogonal subspaces.
  - 3–6: projection onto Span{u₁, u₂}.
  - 7–10: y = (part in W) + (part orthogonal to W).
  - 11–12: closest point.
  - 13–14: best approximation.
  - 15–16: distance to a subspace.
  - 17–18: UᵀU, UUᵀ, and projection with UUᵀ.
  - 19–20: build a vector orthogonal to W.
  - 21–22: T/F.
  - 23–24: proofs.
- Generators: reuse `6.2-onto-plane` (its bases are orthogonal), `6.2-matrix`. NEW: "distance from y to W", "the part of y orthogonal to W".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17, 21. More 19, 23.

### 6.4 The Gram–Schmidt Process (p. 356)
- Lessons: **6-4-gram-schmidt (rewrite)**.
- Changes: the orthogonal-matrix half moves to 6.2. **QR is a main exercise type** (13–16) but is only in Go deeper now. Add a 3-vector example.
- Book exercises:
  - 1–6: Gram–Schmidt → orthogonal basis.
  - 7–8: orthonormal basis.
  - 9–12: orthogonal basis of Col A.
  - 13–14: find R from A and Q.
  - 15–16: QR factorization.
  - 17–18: T/F.
  - 19–23: proofs.
- Generators: reuse `6.4-gram-schmidt`, `6.4-missing`. NEW: "entry of R in A = QR", "third Gram–Schmidt vector".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17. More 19, 21, 23.

## Chapter 7 Symmetric Matrices and Quadratic Forms

### 7.3 Constrained Optimization (p. 410)
- Lessons: **NEW** (reuses `QuadraticFormView`) with the "What you need from 7.1–7.2" box.
- Change to the brief: **the recap needs more** than "symmetric matrices have orthogonal eigenvectors" and "what xᵀAx is".
  The section's own proof uses orthogonal diagonalization A = PDPᵀ and the change of variable x = Py. Exercises 1–2 are exactly that change of variable.
  So the box must also cover A = PDPᵀ and "x = Py removes the cross terms". Archived 8-5 covers all of it, but the box must stand on its own.
- Book exercises:
  - 1–2: find the change of variable x = Py (needs 7.1–7.2).
  - 3–6: max of Q on ‖x‖ = 1, where it happens, and the max with x ⟂ u as well.
  - 7–8: the maximizing unit vector, given the eigenvalues.
  - 9–10: max value only (2×2).
  - 11: xᵀAx for a unit eigenvector.
  - 12–13: proofs.
- Generators: NEW "max of xᵀAx on the unit circle" (= the largest eigenvalue), "unit vector where it happens", "second max".
- Do in your book: Core 3, 5, 7, 9, 11. More 1, 13.

### 7.4 The Singular Value Decomposition (p. 416)
- Lessons: **8-6-svd-circle-to-ellipse** (keep).
- Changes: its Numbers section says "the symmetric matrix from the last lesson" (8-5, archived). Point it to 7.3's box instead.
  Add the non-square case (13, 16), and bases for Col A and Nul A read off the SVD (15–16).
- Book exercises:
  - 1–4: singular values.
  - 5–12: full SVD.
  - 13: SVD of a wide matrix (work with Aᵀ).
  - 14: the unit x that maximizes ‖Ax‖.
  - 15–16: rank and bases from a given SVD.
  - 17–25: proofs (|det A| = product of σ's).
- Generators: reuse `8.6-*`. NEW: "max of ‖Ax‖", "rank from the σ's".
- Do in your book: Core 1, 3, 5, 7, 9, 11, 13, 15, 17. More 19, 21, 23, 25.

### 7.5 Applications to Image Processing and Statistics (p. 426)
- Lessons: **NEW** (PCA picture). 8-6's Go deeper already mentions PCA.
- Book exercises:
  - 1–2: mean-deviation form and sample covariance.
  - 3–4: principal components.
  - 7–8: the new variable with the largest variance, and the % of variance it explains.
  - 9: the same, given the eigenvalues.
  - 11–13: proofs.
- Generators: NEW "covariance matrix entry", "% of variance explained".
- Do in your book: Core 1, 3, 7, 9. More 11, 13.

---

## Archived lessons (section archived, file stays)
- `6-3-least-squares` → §6.5.
- `8-5-symmetric-matrices-and-quadratic-forms` → §7.1 / §7.2.
- Links to them that must be removed or reworded: 4-7 Go deeper (least squares), 6-1 Go deeper ("best fit line (6.3)"),
  6-2 Explain ("Lesson 6.3"), 6-4 Go deeper (least squares), 8-6 Numbers ("last lesson").

## Optional lessons (not in Lay, "Optional" badge)
- `2-5-3d` → end of §1.9.
- `8-3-mean-product-trick` → end of §5.2.
- `5-1-duality`, `5-2-cross-product`, `5-3-cross-product-formula` → all three at the **end of §6.1**, not split between Ch 3 and 6.1.
  The reason: 5-3 is built on 5-1, and 5-1 and 5-2 both use the dot product (now 6.1).
- `3-2-orientation` → inside §3.3, marked Optional (the book doesn't cover orientation).

## References to fix in Phase 3 (found in Phase 2)
After the lessons moved into book order, these "Lesson x.y.z" references in lesson text point to a *later* lesson,
or to an archived one. Phase 2 only renumbered them. Phase 3 should reword each one when it rewrites that chapter.
- ~~1.1.1 → 3.3.1 and → 2.2.1~~, ~~1.5.1 → 2.8.1~~, ~~1.8.2 → 6.1.1 and → 1.9.2~~, ~~1.9.1 → 6.1.1~~: fixed in Phase 3, Chapter 1.
- 4.1.1 → 4.1.2 (the eight rules; the next lesson in the same section, which is fine).
- 5.1.1 → 5.3.1 (powers, Go deeper).
- 5.3.1 → 5.4.2, twice (P⁻¹MP, similar matrices).
- 6.1.3 → 6.1.5, and 6.1.4 → 6.1.5, twice (optional cross-product lessons pointing to the next one; fine).
- 6.3.1 → 6.5.1 (least squares, **archived**: "you will see them again in Lesson 6.5.1").

## Changes to the answer format (`src/exercises/exercise.ts`)
Right now an answer can only be a number or a vector, checked entry by entry. The book's problem types also need:
- **yes / no** (consistent? in the span? independent? invertible? eigenvector? diagonalizable? subspace?). This is the most common new kind.
- **a whole matrix** (standard matrix, A⁻¹, P_{C←B}, [T]_B).
- **a choice from a list** (echelon / reduced / neither; which property or row operation was used). True/False questions fit here too.
- **answers that aren't unique**: a basis, an eigenvector, a parametric form or a Gram–Schmidt result has many right answers.
  The checker must test the *property* (same span, Av = λv, …) in `linalg.ts`, or the question must ask for one normalized answer.
  The current generators use that second trick, e.g. "the line through (1, y): what is y?".
