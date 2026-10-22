## # Visual linear algebra website
- Stack: Astro + React islands + Mafs (2D) + react-three-fiber (3D) + KaTeX + TypeScript + Vitest.
- All math lives in src/lib/linalg.ts with tests. Components never compute math themselves.
- A 2x2 matrix is stored as its columns: [[ihatX, ihatY], [jhatX, jhatY]].
- Colours: i-hat green, j-hat red, other vectors yellow; faint fixed grid behind the moving grid.
- Every lesson: Question, Play, Numbers, Explain, Predict-then-reveal, Practice, Go deeper.
- No CDN links or Google Fonts: self-host everything (the site must work in China).
- I am a coding beginner. Before coding, show a short plan and wait for my OK.
  After coding, explain each changed file in plain words and suggest one thing for me to break on purpose.
- Work in small steps. Run `npm test` and `npm run build` before saying a task is done.
