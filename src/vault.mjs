// Reads the Obsidian vault and turns Markdown notes into renderable entries.
// Supports frontmatter, [[wikilinks]], ![[embeds]], > [!callouts], ==highlights==,
// GFM tables and task lists, and images referenced by Obsidian or Markdown syntax.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { Marked, Renderer } from "marked";
import { esc } from "./figures.mjs";

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".")) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// Minimal YAML subset: `key: value`, `key: [a, b]`, and `key:` followed by `- item` lines.
function frontmatter(src, file) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: cannot read frontmatter line "${line}"`);
    const [, key, raw] = kv;
    listKey = null;
    if (raw === "") {
      data[key] = [];
      listKey = key;
    } else if (/^\[.*\]$/.test(raw)) {
      data[key] = raw.slice(1, -1).split(",").map((s) => unquote(s.trim())).filter(Boolean);
    } else if (raw === "true" || raw === "false") {
      data[key] = raw === "true";
    } else {
      data[key] = unquote(raw);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

const unquote = (s) => s.replace(/^(['"])(.*)\1$/, "$2");

const plain = (md) =>
  md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[\[[^\]]*\]\]|!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^>\s*\[![^\]]+\].*$/gm, "")
    .replace(/[#>*_`=~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function excerpt(body) {
  const para = body
    .split(/\n\s*\n/)
    .map(plain)
    .find((p) => p.length > 40);
  if (!para) return "";
  return para.length > 160 ? `${para.slice(0, 157).replace(/\s+\S*$/, "")}…` : para;
}

/**
 * Loads every collection under the vault. Returns entries keyed by collection, plus the media
 * files that pages reference (absolute source path -> published path).
 */
export function loadVault(vaultDir, collections, { drafts = false } = {}) {
  const files = walk(vaultDir);
  const byName = new Map();
  for (const f of files) {
    const key = basename(f).toLowerCase();
    if (!byName.has(key)) byName.set(key, f);
  }

  const entries = {};
  const index = new Map(); // lowercased note name or title -> url
  for (const col of collections) {
    entries[col] = files
      .filter((f) => extname(f) === ".md" && relative(join(vaultDir, col), f).split(/[\\/]/)[0] !== "..")
      .map((file) => {
        const { data, body } = frontmatter(readFileSync(file, "utf8"), file);
        const name = basename(file, ".md");
        const slug = data.slug ? slugify(data.slug) : slugify(name);
        const date = data.date ? String(data.date).slice(0, 10) : statSync(file).mtime.toISOString().slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${file}: date must be YYYY-MM-DD, got "${data.date}"`);
        const words = plain(body).split(" ").filter(Boolean).length;
        return {
          file,
          collection: col,
          slug,
          url: `/${col}/${slug}/`,
          title: data.title || name,
          date,
          description: data.description || excerpt(body),
          tags: [].concat(data.tags || []).map(String),
          draft: data.draft === true,
          minutes: Math.max(1, Math.round(words / 220)),
          body,
        };
      })
      .filter((e) => drafts || !e.draft)
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
    for (const e of entries[col]) {
      index.set(basename(e.file, ".md").toLowerCase(), e.url);
      index.set(e.title.toLowerCase(), e.url);
    }
  }

  const media = new Map();
  const publishMedia = (ref, fromFile) => {
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (/^(https?:)?\/\//.test(clean) || clean.startsWith("/")) return ref;
    const local = resolve(dirname(fromFile), clean);
    const src = existsSync(local) ? local : byName.get(basename(clean).toLowerCase());
    if (!src) throw new Error(`${fromFile}: cannot find "${ref}" in the vault`);
    const out = `/media/${slugify(basename(src, extname(src)))}${extname(src).toLowerCase()}`;
    media.set(src, out);
    return out;
  };

  for (const col of collections) {
    for (const e of entries[col]) e.html = render(e, index, publishMedia);
  }
  return { entries, media };
}

function render(entry, index, publishMedia) {
  const marked = new Marked({ gfm: true });
  const headingIds = new Map();

  const figureHtml = (src, alt, caption, width) =>
    `<figure class="md-fig"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"${width ? ` width="${width}"` : ""}>${
      caption ? `<figcaption>${esc(caption)}</figcaption>` : ""
    }</figure>`;

  marked.use({
    extensions: [
      {
        name: "embed",
        level: "inline",
        start: (src) => src.indexOf("![["),
        tokenizer(src) {
          const m = src.match(/^!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/);
          if (m) return { type: "embed", raw: m[0], target: m[1].trim(), opt: (m[2] || "").trim() };
        },
        renderer({ target, opt }) {
          if (IMAGE.test(target)) {
            const width = /^\d+$/.test(opt) ? opt : "";
            return figureHtml(publishMedia(target, entry.file), width ? "" : opt, width ? "" : opt, width);
          }
          const url = index.get(target.toLowerCase());
          return url ? `<a class="wikilink" href="${url}">${esc(target)}</a>` : `<span class="wikilink missing">${esc(target)}</span>`;
        },
      },
      {
        name: "wikilink",
        level: "inline",
        start: (src) => src.indexOf("[["),
        tokenizer(src) {
          const m = src.match(/^\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]*))?\]\]/);
          if (m) return { type: "wikilink", raw: m[0], target: m[1].trim(), anchor: m[2] || "", label: (m[3] || m[1]).trim() };
        },
        renderer({ target, anchor, label }) {
          const url = index.get(target.toLowerCase());
          if (!url) return `<span class="wikilink missing">${esc(label)}</span>`;
          return `<a class="wikilink" href="${url}${anchor ? `#${slugify(anchor)}` : ""}">${esc(label)}</a>`;
        },
      },
      {
        name: "mark",
        level: "inline",
        start: (src) => src.indexOf("=="),
        tokenizer(src) {
          const m = src.match(/^==(?=\S)([\s\S]*?\S)==/);
          if (m) return { type: "mark", raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
        },
        renderer(token) {
          return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
        },
      },
    ],
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const base = slugify(text.replace(/<[^>]+>/g, "")) || "section";
        const n = headingIds.get(base) || 0;
        headingIds.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${text}</h${depth}>\n`;
      },
      image({ href, title, text }) {
        return figureHtml(publishMedia(href, entry.file), text, title || "");
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:/.test(href);
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${external ? ' target="_blank" rel="noreferrer"' : ""}>${text}</a>`;
      },
      code({ text, lang, escaped }) {
        const language = (lang || "").split(/\s/)[0];
        return `<div class="md-code">${language ? `<span class="md-lang">${esc(language)}</span>` : ""}<pre><code>${
          escaped ? text : esc(text)
        }</code></pre></div>\n`;
      },
      blockquote({ tokens }) {
        const inner = this.parser.parse(tokens);
        const m = inner.match(/^<p>\[!([\w-]+)\][+-]?[ \t]*([^\n<]*)(\n|<\/p>\n?)/);
        if (!m) return `<blockquote>${inner}</blockquote>\n`;
        const type = m[1].toLowerCase();
        const title = m[2].trim() || type[0].toUpperCase() + type.slice(1);
        const rest = (m[3] === "\n" ? "<p>" : "") + inner.slice(m[0].length);
        return `<aside class="callout callout-${esc(type)}"><p class="callout-title">${esc(title)}</p>${rest}</aside>\n`;
      },
      table(token) {
        return `<div class="md-table">${Renderer.prototype.table.call(this, token)}</div>`;
      },
    },
  });

  return marked.parse(entry.body);
}
