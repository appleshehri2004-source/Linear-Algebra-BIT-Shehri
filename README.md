# Visual Linear Algebra

Learn linear algebra by moving things: drag a vector, stretch a grid, watch an area flip.
40 interactive lessons in 9 modules, from vectors to the SVD and abstract vector spaces.

Live site: https://appleshehri2004-source.github.io/Linear-Algebra-BIT-Shehri/

Built with Astro, React, Mafs (2D), react-three-fiber (3D), KaTeX and TypeScript. Every
library and font is bundled with the site (no CDN or Google Fonts), so it works anywhere,
including mainland China.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22.23.4 or newer.

```sh
npm install      # once, to download the libraries
npm run dev      # start the site at http://localhost:4321/Linear-Algebra-BIT-Shehri/
```

The page reloads by itself when you save a file.

| Command           | What it does                                              |
| :---------------- | :-------------------------------------------------------- |
| `npm run dev`     | Run the site locally while you edit                       |
| `npm test`        | Check the maths in `src/lib/` with Vitest                 |
| `npm run build`   | Build the finished site into `dist/`                      |
| `npm run preview` | Serve the built `dist/` folder, to check it before deploy |

Run `npm test` and `npm run build` before every push.

## Where things are

```text
src/
├── content/lessons/   one .mdx file per lesson (text, formulas, exercises)
├── content/modules.ts module names and lesson order
├── components/        the interactive parts (React) and Formula.astro
├── lib/linalg.ts      all the maths, with tests next to it
├── layouts/           the frame around every page
├── pages/             home, About, 404 and the lesson route
└── styles/global.css  colours (i-hat green, j-hat red, vectors yellow) and page styles
public/                favicon, copied as-is
```

Every lesson has the same sections: Question, Play, Numbers, Explain, Predict, Practice, Go deeper.
Its front matter needs a `title`, a one-sentence `description`, a `module` and an `order`.

## Deploy

### GitHub Pages (the default)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it.
Watch it on the repository's **Actions** tab. With no settings, the build is made for
`https://appleshehri2004-source.github.io/Linear-Algebra-BIT-Shehri/`.

### Any other host

The build is a folder of plain files (`dist/`), so any static host works (Netlify, Cloudflare
Pages, Vercel, a school server, an Alibaba Cloud OSS bucket, ...). Tell the build where the site
will live with two environment variables:

| Variable    | Meaning                                   | Default                                   |
| :---------- | :---------------------------------------- | :---------------------------------------- |
| `SITE_URL`  | The host, without a path                  | `https://appleshehri2004-source.github.io` |
| `BASE_PATH` | The folder the site sits in, `/` for root | `/Linear-Algebra-BIT-Shehri`              |

At the root of your own domain:

```sh
SITE_URL=https://example.com BASE_PATH=/ npm run build
```

Then upload the contents of `dist/`. Set the host's "not found" page to `404.html` if it asks.

## Licence

- **Lesson content** (`src/content/`): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md), the same licence as MIT OpenCourseWare.
- **Code** (everything else): [MIT](LICENSE).

Credits for 3Blue1Brown, MIT 18.06 and the libraries are on the site's About page.
