// The map of the textbook the site follows: Lay, Lay and McDonald,
// "Linear Algebra and Its Applications", 5th edition (Pearson).
// Every chapter and section is listed in the book's order, with its page in the book.
//
// status decides what the site shows:
//   'active'   = the section is part of the course: its lessons get pages and are on the home page.
//   'archived' = not needed: its lessons stay in the repo but no page is built for them.
// To bring a section back, change 'archived' to 'active'. Nothing else needs to change.

export type Status = 'active' | 'archived';

export interface BookSection {
  /** e.g. "1.3" */
  number: string;
  title: string;
  /** The page the section starts on. Missing for the chapters that are online only. */
  page?: number;
  status: Status;
}

export interface BookChapter {
  number: number;
  title: string;
  page?: number;
  sections: BookSection[];
}

const A: Status = 'active';
const X: Status = 'archived';

export const book: BookChapter[] = [
  {
    number: 1,
    title: 'Linear Equations in Linear Algebra',
    page: 1,
    sections: [
      { number: '1.1', title: 'Systems of Linear Equations', page: 2, status: A },
      { number: '1.2', title: 'Row Reduction and Echelon Forms', page: 12, status: A },
      { number: '1.3', title: 'Vector Equations', page: 24, status: A },
      { number: '1.4', title: 'The Matrix Equation Ax = b', page: 35, status: A },
      { number: '1.5', title: 'Solution Sets of Linear Systems', page: 43, status: A },
      { number: '1.6', title: 'Applications of Linear Systems', page: 50, status: X },
      { number: '1.7', title: 'Linear Independence', page: 56, status: A },
      { number: '1.8', title: 'Introduction to Linear Transformations', page: 63, status: A },
      { number: '1.9', title: 'The Matrix of a Linear Transformation', page: 71, status: A },
      { number: '1.10', title: 'Linear Models in Business, Science, and Engineering', page: 81, status: X },
    ],
  },
  {
    number: 2,
    title: 'Matrix Algebra',
    page: 93,
    sections: [
      { number: '2.1', title: 'Matrix Operations', page: 94, status: A },
      { number: '2.2', title: 'The Inverse of a Matrix', page: 104, status: A },
      { number: '2.3', title: 'Characterizations of Invertible Matrices', page: 113, status: A },
      { number: '2.4', title: 'Partitioned Matrices', page: 119, status: A },
      { number: '2.5', title: 'Matrix Factorizations', page: 125, status: X },
      { number: '2.6', title: 'The Leontief Input–Output Model', page: 134, status: X },
      { number: '2.7', title: 'Applications to Computer Graphics', page: 140, status: X },
      { number: '2.8', title: 'Subspaces of Rⁿ', page: 148, status: A },
      { number: '2.9', title: 'Dimension and Rank', page: 155, status: A },
    ],
  },
  {
    number: 3,
    title: 'Determinants',
    page: 165,
    sections: [
      { number: '3.1', title: 'Introduction to Determinants', page: 166, status: A },
      { number: '3.2', title: 'Properties of Determinants', page: 171, status: A },
      { number: '3.3', title: 'Cramer’s Rule, Volume, and Linear Transformations', page: 179, status: A },
    ],
  },
  {
    number: 4,
    title: 'Vector Spaces',
    page: 191,
    sections: [
      { number: '4.1', title: 'Vector Spaces and Subspaces', page: 192, status: A },
      { number: '4.2', title: 'Null Spaces, Column Spaces, and Linear Transformations', page: 200, status: A },
      { number: '4.3', title: 'Linearly Independent Sets; Bases', page: 210, status: A },
      { number: '4.4', title: 'Coordinate Systems', page: 218, status: A },
      { number: '4.5', title: 'The Dimension of a Vector Space', page: 227, status: A },
      { number: '4.6', title: 'Rank', page: 232, status: A },
      { number: '4.7', title: 'Change of Basis', page: 241, status: A },
      { number: '4.8', title: 'Applications to Difference Equations', page: 246, status: X },
      { number: '4.9', title: 'Applications to Markov Chains', page: 255, status: X },
    ],
  },
  {
    number: 5,
    title: 'Eigenvalues and Eigenvectors',
    page: 267,
    sections: [
      { number: '5.1', title: 'Eigenvectors and Eigenvalues', page: 268, status: A },
      { number: '5.2', title: 'The Characteristic Equation', page: 276, status: A },
      { number: '5.3', title: 'Diagonalization', page: 283, status: A },
      { number: '5.4', title: 'Eigenvectors and Linear Transformations', page: 290, status: A },
      { number: '5.5', title: 'Complex Eigenvalues', page: 297, status: X },
      { number: '5.6', title: 'Discrete Dynamical Systems', page: 303, status: X },
      { number: '5.7', title: 'Applications to Differential Equations', page: 313, status: X },
      { number: '5.8', title: 'Iterative Estimates for Eigenvalues', page: 321, status: X },
    ],
  },
  {
    number: 6,
    title: 'Orthogonality and Least Squares',
    page: 331,
    sections: [
      { number: '6.1', title: 'Inner Product, Length, and Orthogonality', page: 332, status: A },
      { number: '6.2', title: 'Orthogonal Sets', page: 340, status: A },
      { number: '6.3', title: 'Orthogonal Projections', page: 349, status: A },
      { number: '6.4', title: 'The Gram–Schmidt Process', page: 356, status: A },
      { number: '6.5', title: 'Least-Squares Problems', page: 362, status: X },
      { number: '6.6', title: 'Applications to Linear Models', page: 370, status: X },
      { number: '6.7', title: 'Inner Product Spaces', page: 378, status: X },
      { number: '6.8', title: 'Applications of Inner Product Spaces', page: 385, status: X },
    ],
  },
  {
    number: 7,
    title: 'Symmetric Matrices and Quadratic Forms',
    page: 395,
    sections: [
      { number: '7.1', title: 'Diagonalization of Symmetric Matrices', page: 397, status: X },
      { number: '7.2', title: 'Quadratic Forms', page: 403, status: X },
      { number: '7.3', title: 'Constrained Optimization', page: 410, status: A },
      { number: '7.4', title: 'The Singular Value Decomposition', page: 416, status: A },
      { number: '7.5', title: 'Applications to Image Processing and Statistics', page: 426, status: A },
    ],
  },
  {
    number: 8,
    title: 'The Geometry of Vector Spaces',
    page: 437,
    sections: [
      { number: '8.1', title: 'Affine Combinations', page: 438, status: X },
      { number: '8.2', title: 'Affine Independence', page: 446, status: X },
      { number: '8.3', title: 'Convex Combinations', page: 456, status: X },
      { number: '8.4', title: 'Hyperplanes', page: 463, status: X },
      { number: '8.5', title: 'Polytopes', page: 471, status: X },
      { number: '8.6', title: 'Curves and Surfaces', page: 483, status: X },
    ],
  },
  {
    number: 9,
    title: 'Optimization (online)',
    sections: [
      { number: '9.1', title: 'Matrix Games', status: X },
      { number: '9.2', title: 'Linear Programming—Geometric Method', status: X },
      { number: '9.3', title: 'Linear Programming—Simplex Method', status: X },
      { number: '9.4', title: 'Duality', status: X },
    ],
  },
  {
    number: 10,
    title: 'Finite-State Markov Chains (online)',
    sections: [
      { number: '10.1', title: 'Introduction and Examples', status: X },
      { number: '10.2', title: 'The Steady-State Vector and Google’s PageRank', status: X },
      { number: '10.3', title: 'Communication Classes', status: X },
      { number: '10.4', title: 'Classification of States and Periodicity', status: X },
      { number: '10.5', title: 'The Fundamental Matrix', status: X },
      { number: '10.6', title: 'Markov Chains and Baseball Statistics', status: X },
    ],
  },
];

/** Every section of the book, in the book's order. */
export const allSections: BookSection[] = book.flatMap((chapter) => chapter.sections);

/** Every section number, e.g. ["1.1", "1.2", …]. The lesson schema only accepts these. */
export const sectionNumbers = allSections.map((s) => s.number) as [string, ...string[]];

/** The section with this number. Throws for a number that isn't in the book, so typos show up at once. */
export function getSection(number: string): BookSection {
  const section = allSections.find((s) => s.number === number);
  if (!section) throw new Error(`Section ${number} is not in the book map (src/content/book.ts).`);
  return section;
}

/** The chapter a section belongs to: "4.6" is in chapter 4. */
export function chapterOf(sectionNumber: string): BookChapter {
  const chapter = book.find((c) => c.sections.some((s) => s.number === sectionNumber));
  if (!chapter) throw new Error(`Section ${sectionNumber} is not in the book map (src/content/book.ts).`);
  return chapter;
}

/** The parts of a lesson that decide where it goes: its book section and its part number inside it. */
export interface LessonPlace {
  section: string;
  part: number;
}

/**
 * The lessons the site shows, in book order: by section, then by part.
 * Lessons whose section is archived are left out, so they get no page and no link.
 */
export function activeInBookOrder<T extends { data: LessonPlace }>(lessons: T[]): T[] {
  const position = (l: T) => allSections.indexOf(getSection(l.data.section));
  return lessons
    .filter((l) => getSection(l.data.section).status === 'active')
    .sort((a, b) => position(a) - position(b) || a.data.part - b.data.part);
}

/** The lesson's number as shown on the site: part 2 of section 1.3 is "1.3.2". */
export function lessonNumber(place: LessonPlace): string {
  return `${place.section}.${place.part}`;
}
