# robinbinu.github.io

Michael Robin K's site. Plain HTML and one stylesheet, built by a small Node script and deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Layout

| Path | What it is |
| --- | --- |
| `src/content.mjs` | Name, links, home sections and every project page (copy, brand colour, figure) |
| `src/figures.mjs` | The drawn project figures (crew, routing, panes, terminal, chart, panel, specimen) |
| `src/vault.mjs` | Obsidian Markdown → HTML |
| `src/build.mjs` | Writes the site to `dist/` |
| `src/dev.mjs` | Dev server: rebuilds on save and reloads the browser |
| `assets/site.css` | All styles and animation |
| `vault/` | The Obsidian vault: `blog/`, `notes/`, `attachments/`, `templates/` |

## Develop

```bash
npm install
```

```bash
npm run dev
```

Opens on http://localhost:4173. Saving anything in `src/`, `assets/` or `vault/` rebuilds and reloads the page. Drafts are shown in dev and left out of production builds.

## Write

Open the `vault/` folder as a vault in Obsidian. New notes go to `blog/` and pasted images to `attachments/`.

Each post starts with frontmatter (the `templates/post.md` template has it):

```yaml
---
title: My post
date: 2026-10-16
description: One line for the list and for link previews.
tags: [go, tools]
draft: true
---
```

- `blog/` posts appear on `/blog/`, the home page (latest three) and the RSS feed at `/blog/feed.xml`.
- `notes/` appear as cards on `/notes/`.
- `draft: true` keeps a page out of the published site. Remove it to publish.
- Supported: Markdown and GFM tables and task lists, `[[wikilinks]]` (with `|label` and `#heading`), `![[image.png|caption]]` embeds, `==highlights==`, `> [!note]` callouts, and code blocks.

To publish from Obsidian, install the community **Obsidian Git** plugin and point it at this repo. A commit and push triggers the deploy.

## Deploy

`.github/workflows/deploy.yml` runs `npm ci && npm run build` and publishes `dist/` to Pages. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
