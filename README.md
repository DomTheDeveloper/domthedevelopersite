# domthedeveloper.com

Personal portfolio for Dom the Developer — a single-page React app with project
case studies, a small arcade, and a set of interactive canvas experiments.

Live at **[domthedeveloper.com](https://domthedeveloper.com)**.

## Getting started

```bash
npm install
npm start          # dev server on http://localhost:3000
npm test           # test runner (watch mode)
npm run build      # production build into build/
npm run deploy     # build, then publish build/ to the gh-pages branch
```

## Routing

The site is served from GitHub Pages, so it uses `HashRouter` — every route
lives behind a `#`:

| URL | What it shows |
| --- | --- |
| `#/` | Home |
| `#/about`, `#/projects`, `#/arcade`, `#/techzone`, `#/contact` | Home, scrolled to that section |
| `#/project/:slug` | A project case study |
| anything else | 404 page |

Because the router owns the fragment, a bare `href="#contact"` is read as the
route `/contact` and lands on the 404 page. Always link to sections with
`<Link to="/contact">` (or `#/contact` in plain HTML) instead of an anchor.
Section ids live in [`src/sections.js`](src/sections.js) — add one there and the
nav, the routes, and the scroll-spy all pick it up.

## Layout

```
public/            static shell: index.html, manifest, robots.txt, sitemap.xml, CNAME
src/
  App.js           router, page shell, section routes
  sections.js      section ids + scroll helper (single source of truth)
  components/      page sections, navbar, footer, error boundary, 404
    games/         arcade games (lazy loaded)
    techzone/      interactive experiments (lazy loaded)
  projects/        project case-study content
```

Project case studies are plain data in
[`src/projects/projectsData.js`](src/projects/projectsData.js); adding an entry
there creates its card, its detail page, and its route. Each project carries
`overview`, `problem`, `solution`, `architecture`, `features`, `stack`,
`challenges`, `timeline`, and `metrics`. The optional blocks (`architecture`,
`challenges`, `timeline`, `metrics`) are skipped when absent, and section
numbers on the detail page are generated in document order — so dropping one
never leaves a gap in the sequence.

Interactive demos live in
[`src/components/ProjectDemo.js`](src/components/ProjectDemo.js), keyed by slug.
They pause when scrolled out of view and when the visitor prefers reduced
motion.

## Contact form

The form posts to [FormSubmit](https://formsubmit.co)'s AJAX endpoint, so
there's no backend to run. Submissions are emailed to the address hardcoded in
[`src/components/ContactForm.js`](src/components/ContactForm.js).

**FormSubmit requires a one-time activation.** The first submission to a new
address triggers a confirmation email; until someone clicks the link in it,
submissions fail and the form falls back to showing a `mailto:` link. To change
the destination, edit `ENDPOINT` and re-activate.

Spam handling is a `_honey` honeypot field, positioned off-screen rather than
`display: none` so bots still fill it in. Anything that trips it gets a fake
success and is dropped.

## Deployment

`npm run deploy` builds the app and pushes `build/` to the `gh-pages` branch,
which GitHub Pages serves at the custom domain configured in
[`public/CNAME`](public/CNAME). `homepage` is set to `"."` in `package.json` so
the bundle references its assets relatively and works from either the custom
domain or the project-pages path.

Built with [Create React App](https://github.com/facebook/create-react-app).
