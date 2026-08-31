# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Stanley Hua's personal academic homepage — a Hugo static site on a heavily rewritten fork of the `avicenna`
theme. Almost all routine edits are **front matter in `content/`**, not code.

## Commands

```bash
hugo server -D          # local preview at http://localhost:1313 (-D includes drafts)
hugo --minify           # production build into public/
```

Hugo **extended** is required — the stylesheet and JS go through `resources.Get | minify | fingerprint`,
and the profile photo goes through the image pipeline. No tests, no linter, no package manager.

## Deployment

`.github/workflows/hugo.yml` builds and deploys to GitHub Pages on every push to `master`, pinned to Hugo
extended **0.128.0**, running `hugo --minify --baseURL <pages url>`. `public/` is gitignored; CI rebuilds it.

## Homepage architecture

`layouts/index.html` renders a full-viewport `<canvas id="field">`, then one bordered `.card` containing:

1. `partials/core/identity.html` — the header, rendered directly from `content/about/_index.md`.
2. A loop over the **headless page bundle** at `content/home/`.

That loop is the part worth understanding. Each `content/home/*.md` is an empty stub whose only job is to
declare a `content_type` plus a section title and `weight`. The loop takes every stub with
`section_settings.show_section: true`, in weight order, and renders `partials/<content_type>/<content_type>.html`.

**Each partial decides for itself where its data comes from**, which is why the mapping isn't uniform:

| stub | partial | reads from |
|---|---|---|
| `about.md` | `partials/about/about.html` | body + `currently`/`interests` of `content/about/_index.md` |
| `news.md` | `partials/news/news.html` | `news_items` in `content/news/_index.md` |
| `publications.md` | `partials/publications/publications.html` | page resources of `content/publications/` |
| `education.md` | `partials/education/education.html` | `academia` on `content/about/_index.md` |

Adding a section means adding both a stub in `content/home/` and a matching
`partials/<type>/<type>.html`. Turning one off is `section_settings.show_section: false`.

## Editing content

**Add a publication** — new `.md` in `content/publications/`, front matter only (the body is ignored):

```yaml
title: "..."
authors: ["Stanley Hua", "..."]     # entries matching config's params.author render bold
date: "2026-10-01"                  # sorts the list, and supplies the year in the left rail
venues:
  - name: "COLM 2026"
    type: conference                # journal | conference | workshop -> chip colour
links: { paper: "...", code: "..." }
```

`type` drives the chip colour, on a scale of archival weight: journal takes the accent blue, conference
teal, workshop grey. Link keys render in a deliberate order set in the partial (paper first), not the
alphabetical order Hugo yields when ranging a map.

**Add news** — append to `news_items` in `content/news/_index.md`. Every item needs a real `date` (it
drives both sort order and the rendered date). `text` supports markdown and emoji; `where` is the **place
only** — the date is rendered separately from `date`, so it must not be repeated in `where`.

**Edit the bio** — the markdown body of `content/about/_index.md`. `currently` is a separate one-line field
for what he's working on now; the Currently block hides itself when both it and `interests` are empty.

## Theme and the ambient field

**Light is the default and the site never follows the OS** — there is deliberately no `prefers-color-scheme`
block in the CSS. Dark is opt-in only, via the toggle in the identity icon row, stored in `localStorage` and
applied by an inline script in `head.html` before first paint.

`assets/js/field.js` draws the background: scrolling PQRST traces whose amplitude and colour respond to the
pointer. It is **homepage-only** (guarded by `.IsHome` in `partials/core/script.html`), disables itself below
800px, honours `prefers-reduced-motion` with a single still frame, pauses on `visibilitychange`, and re-reads
its palette via a `MutationObserver` on `data-theme`. The card is opaque, so text never sits over motion.

## Conventions worth keeping

- **No CSS framework.** Bootstrap, jQuery, academicons and feather were all removed; Google Fonts is the only
  external dependency left. Everything is hand-written CSS driven by custom properties in `:root`.
- **Never declare a colour only inside `[data-theme="dark"]`** — define the token in `:root` and override it
  there, or the light theme loses it.
- **Images belong in `assets/`, not `static/`**, so they go through the image pipeline. The profile photo is a
  10 MB source PNG that ships as a ~5 KB WebP because of this. `static/` is for files served as-is (PDFs, the
  demo video, favicon).
- Social icons are inline SVG via `partials/core/icon.html`; add a branch there rather than pulling in an
  icon font.
