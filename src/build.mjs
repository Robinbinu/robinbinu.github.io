// Static site generator. Usage: node src/build.mjs [--drafts]
// Writes the whole site to dist/, which GitHub Actions publishes to Pages.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, sections, projects } from "./content.mjs";
import { esc, renderFigure } from "./figures.mjs";
import { loadVault } from "./vault.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const drafts = process.argv.includes("--drafts");
const fullName = site.name;
const pad2 = (n) => String(n).padStart(2, "0");
const buildStamp = new Date().toISOString().slice(0, 10).replaceAll("-", ".");

const { entries, media } = loadVault(join(root, "vault"), ["blog", "notes"], { drafts });
const posts = entries.blog;
const notes = entries.notes;

// Deterministic pseudo-random so every build renders identical art.
function rand(n) {
  const t = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return t - Math.floor(t);
}

function staircase() {
  const cols = 28, rows = 14, size = 16, gap = 2, step = size + gap;
  let rects = "";
  for (let i = 0; i < cols * rows; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const height = Math.max(1, Math.round((((c - (c % 2)) + 2) / cols) ** 1.4 * rows));
    const fromBottom = rows - r;
    const x = c * step, y = r * step;
    // Diffusion intro: every square starts as noise and denoises in hard steps. --n is when a
    // square starts resolving (a left-to-right front plus jitter), so the graph emerges across.
    const filled = fromBottom <= height;
    const blink = filled && rand(i + 99) > 0.92;
    const alt = rand(i + 503) > 0.5 ? " alt" : "";
    const style = [
      `--n:${Math.round((c / cols) * 520 + rand(i + 211) * 260)}ms`,
      `--k:${(0.25 + rand(i + 401) * 0.75).toFixed(2)}`,
      blink ? `--b:${(rand(i + 7) * 3).toFixed(2)}s` : "",
    ]
      .filter(Boolean)
      .join(";");
    if (filled) {
      const opacity = Math.max(0.18, 1 - (height - fromBottom) * 0.075 - rand(i) * 0.3).toFixed(3);
      rects += `<rect class="px${alt}${blink ? " blink" : ""}" style="${style}" x="${x}" y="${y}" width="${size}" height="${size}" fill="var(--accent)" fill-opacity="${opacity}"/>`;
    } else {
      rects += `<rect class="cell${alt}" style="${style}" x="${x + 0.5}" y="${y + 0.5}" width="${size - 1}" height="${size - 1}" fill="none" stroke="var(--line)"/>`;
    }
  }
  return `<svg class="art" viewBox="0 0 ${cols * step - gap} ${rows * step - gap}" role="img" aria-label="Staircase of orange pixels">${rects}</svg>`;
}

function bars() {
  const n = 96;
  let lines = "";
  let readouts = "";
  for (let i = 0; i < n; i++) {
    const h = Math.min(1, 0.2 + 0.55 * ((Math.sin(i / 6) + 1) / 2) * (0.5 + 0.5 * rand(i)) + 0.25 * rand(i + 31));
    const accent = rand(i + 63) > 0.94;
    lines += `<line class="${accent ? "hot" : "cold"}" style="--i:${i}" x1="${i * 10 + 5}" x2="${i * 10 + 5}" y1="40" y2="${(40 - h * 40).toFixed(
      2,
    )}" stroke="var(--${accent ? "accent" : "muted"})" stroke-opacity="${accent ? 1 : 0.45}" vector-effect="non-scaling-stroke"/>`;
    // Accent bars get a fixed telemetry readout that counts with the bar's sway (75–100% of its height).
    if (accent) {
      readouts += `<span class="readout" style="--i:${i};--x:${(((i * 10 + 5) / (n * 10)) * 100).toFixed(2)}%;--hi:${Math.min(
        99,
        Math.round(h * 100),
      )};--lo:${Math.round(h * 75)}"></span>`;
    }
  }
  return `<div class="meter" aria-hidden="true"><svg class="bars" viewBox="0 0 ${n * 10} 40" preserveAspectRatio="none">${lines}</svg>${readouts}</div>`;
}

const arrowUpRight = `<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;
const arrowLeft = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;

const ext = (href) => (/^https?:/.test(href) ? ` target="_blank" rel="noreferrer"` : "");
const fmtDate = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function layout({ title, description, path, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${site.url}${path}">
<meta name="theme-color" content="#08090a">
<link rel="canonical" href="${site.url}${path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(fullName)}" href="/blog/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<header class="rule-b"><div class="wrap topbar"><a class="brand" href="/"><span class="sq"></span>${esc(fullName)}</a><nav class="topnav"><a href="/blog/">Blog</a><a href="/notes/">Notes</a></nav></div></header>
<main>
${body}
</main>
<footer class="rule-t"><div class="wrap">
${bars()}
<div class="foot"><span>© ${new Date().getFullYear()} ${esc(fullName)}<span class="stamp">Build ${buildStamp}</span></span><nav><a href="${site.github}"${ext(site.github)}>GitHub</a><a href="${site.linkedin}"${ext(site.linkedin)}>LinkedIn</a><a href="mailto:${site.email}">Email</a><a href="/blog/feed.xml">RSS</a></nav></div>
</div></footer>
</body>
</html>
`;
}

function resolveItem(item) {
  if (typeof item !== "string") return item;
  const p = projects[item];
  if (!p) throw new Error(`Unknown project slug in sections: ${item}`);
  return { name: p.name, blurb: p.blurb, href: `/${item}/` };
}

const row = (it, num) =>
  `<li><a class="row" href="${esc(it.href)}"${ext(it.href)}><span class="num">${esc(num)}</span><span class="name">${esc(
    it.name,
  )}</span><span class="desc">${esc(it.blurb)}</span>${arrowUpRight}</a></li>`;

// Section label with a zero-padded item count on the right, like a panel designation.
const labelRow = (label, { more, count } = {}) =>
  `<p class="label rule-b"><span>${esc(label)}</span><span class="label-meta">${
    more ? `<a class="more" href="${more.href}">${esc(more.text)}</a>` : ""
  }${count != null ? `<span class="count">${pad2(count)}</span>` : ""}</span></p>`;

function listSection(label, items, more) {
  return `<section class="rule-b"><div class="wrap">${labelRow(label, { more, count: items.length })}<ul class="rows">${items
    .map((it, i) => row(it, it.num ?? pad2(i + 1)))
    .join("")}</ul></div></section>`;
}

// Key/value cells, read like a vehicle data plate.
const specGrid = (pairs) =>
  `<dl class="spec">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;

const postItem = (e) => ({ name: e.title, blurb: e.description, href: e.url, num: e.date.slice(0, 7).replace("-", "·") });

function home() {
  const hero = `<section class="rule-b"><div class="wrap hero grid-bg">
<div><p class="eyebrow"><span class="dot"></span>${esc(site.domain)}</p><h1 class="display">${esc(fullName)}</h1><p class="lede">${esc(site.tagline)}</p></div>
<div class="instrument">${staircase()}</div>
</div></section>`;
  const body = sections
    .map((s) => {
      if (s.label === "Writing") {
        return posts.length ? listSection("Writing", posts.slice(0, 3).map(postItem), { href: "/blog/", text: "All posts" }) : "";
      }
      return listSection(s.label, s.items.map(resolveItem));
    })
    .join("\n");
  return layout({ title: fullName, description: `${fullName}. ${site.tagline}`, path: "/", body: hero + body });
}

function pageHead({ eyebrow, title, intro, back = { href: "/", text: "Back" } }) {
  return `<section class="rule-b"><div class="wrap page-head">
<a class="back" href="${back.href}">${arrowLeft}${esc(back.text)}</a>
<div class="page-title"><p class="eyebrow"><span class="dot"></span>${eyebrow}</p><h1 class="headline">${esc(title)}</h1>${
    intro ? `<p class="intro">${intro}</p>` : ""
  }</div>
</div></section>`;
}

// Numbered cards in a ruled grid, after opyuii's nano feature list.
function cards(items) {
  return `<ul class="cards">${items
    .map(
      (c, i) =>
        `<li style="--i:${i}">${c.href ? `<a href="${c.href}">` : "<div>"}<p class="card-head"><span>${esc(c.title)}</span><kbd>${esc(c.key ?? pad2(i + 1))}</kbd></p><p class="card-body">${esc(
          c.body,
        )}</p>${c.foot ? `<p class="card-foot">${esc(c.foot)}</p>` : ""}${c.href ? "</a>" : "</div>"}</li>`,
    )
    .join("")}</ul>`;
}

function detail(slug) {
  const p = projects[slug];
  const buttons = p.links
    .map((l) => `<a class="btn${l.primary ? " btn-primary" : ""}" href="${l.href}"${ext(l.href)}>${esc(l.label)}${arrowUpRight}</a>`)
    .join("");
  const actions = `<section class="rule-b"><div class="wrap"><div class="pad btns">${buttons}</div>${p.spec.length ? specGrid(p.spec) : ""}</div></section>`;
  const figure = p.figure
    ? `<section class="rule-b"><div class="wrap stage grid-bg"><figure class="frame">${renderFigure(p.figure)}</figure></div><div class="wrap"><p class="caption rule-t"><span>Fig. 01</span>${esc(
        p.figure.caption,
      )}</p></div></section>`
    : "";
  const highlights = p.highlights.length
    ? `<section class="rule-b"><div class="wrap">${cards(p.highlights.map(([title, body]) => ({ title, body })))}</div></section>`
    : "";
  const install = p.install
    ? `<section class="rule-b"><div class="wrap">${labelRow("Install")}<pre class="code"><code>${esc(p.install)}</code></pre></div></section>`
    : "";
  return layout({
    title: `${p.name} · ${fullName}`,
    description: p.blurb,
    path: `/${slug}/`,
    body: pageHead({ eyebrow: esc(p.name), title: p.title, intro: esc(p.intro) }) + actions + figure + highlights + install,
  });
}

const empty = (text) => `<section class="rule-b"><div class="wrap pad"><p class="empty">${esc(text)}</p></div></section>`;

function blogIndex() {
  const list = posts.length
    ? `<section class="rule-b"><div class="wrap"><ul class="rows">${posts.map((e) => row(postItem(e), e.date.slice(0, 7).replace("-", "·"))).join("")}</ul></div></section>`
    : empty("Nothing published yet.");
  return layout({
    title: `Blog · ${fullName}`,
    description: `Writing by ${fullName}.`,
    path: "/blog/",
    body: pageHead({ eyebrow: "Blog", title: "Writing.", intro: "Longer pieces on what I build and why." }) + list,
  });
}

function notesIndex() {
  const grid = notes.length
    ? `<section class="rule-b"><div class="wrap">${cards(
        notes.map((n) => ({ title: n.title, body: n.description, key: n.tags[0] ?? "note", foot: fmtDate(n.date), href: n.url })),
      )}</div></section>`
    : empty("No notes yet.");
  return layout({
    title: `Notes · ${fullName}`,
    description: `Short notes by ${fullName}.`,
    path: "/notes/",
    body: pageHead({ eyebrow: "Notes", title: "Notes.", intro: "Short, unpolished, kept anyway." }) + grid,
  });
}

function entryPage(e, list) {
  const i = list.indexOf(e);
  const newer = list[i - 1], older = list[i + 1];
  const label = e.collection === "blog" ? "Blog" : "Notes";
  const spec = [
    ["Published", fmtDate(e.date)],
    ["Read", `${e.minutes} min`],
    ...(e.tags.length ? [["Tags", e.tags.map((t) => `#${t}`).join("  ")]] : []),
  ];
  const nav = [older && { ...postItem(older), num: "Older" }, newer && { ...postItem(newer), num: "Newer" }].filter(Boolean);
  return layout({
    title: `${e.title} · ${fullName}`,
    description: e.description,
    path: e.url,
    body:
      pageHead({
        eyebrow: `${label}${e.draft ? " · draft" : ""}`,
        title: e.title,
        intro: e.description ? esc(e.description) : "",
        back: { href: `/${e.collection}/`, text: label },
      }) +
      `<section class="rule-b"><div class="wrap">${specGrid(spec)}</div></section>` +
      `<section class="rule-b"><div class="wrap"><article class="prose">${e.html}</article></div></section>` +
      (nav.length ? `<section class="rule-b"><div class="wrap"><ul class="rows">${nav.map((n) => row(n, n.num)).join("")}</ul></div></section>` : ""),
  });
}

function feed() {
  const items = posts
    .slice(0, 20)
    .map(
      (e) =>
        `<item><title>${esc(e.title)}</title><link>${site.url}${e.url}</link><guid>${site.url}${e.url}</guid><pubDate>${new Date(
          `${e.date}T00:00:00Z`,
        ).toUTCString()}</pubDate><description>${esc(e.description)}</description></item>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>${esc(fullName)}</title><link>${site.url}/blog/</link><description>Writing by ${esc(
    fullName,
  )}.</description>${items}</channel></rss>\n`;
}

function notFound() {
  return layout({
    title: `404 · ${fullName}`,
    description: "Nothing here.",
    path: "/404.html",
    body: pageHead({ eyebrow: "404", title: "Nothing here.", intro: `<a class="link" href="/">Back to start</a>` }),
  });
}

function write(rel, content) {
  const file = join(dist, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

rmSync(dist, { recursive: true, force: true });
cpSync(join(root, "assets"), join(dist, "assets"), { recursive: true });
cpSync(join(root, "favicon.svg"), join(dist, "favicon.svg"));
for (const [src, out] of media) cpSync(src, join(dist, out));

write("index.html", home());
write("404.html", notFound());
for (const slug of Object.keys(projects)) write(`${slug}/index.html`, detail(slug));
write("blog/index.html", blogIndex());
write("blog/feed.xml", feed());
write("notes/index.html", notesIndex());
for (const e of posts) write(`blog/${e.slug}/index.html`, entryPage(e, posts));
for (const e of notes) write(`notes/${e.slug}/index.html`, entryPage(e, notes));

console.log(
  `built dist/: ${Object.keys(projects).length} projects, ${posts.length} posts, ${notes.length} notes, ${media.size} media${drafts ? " (drafts included)" : ""}`,
);
