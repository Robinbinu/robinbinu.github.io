// Dev server: builds with drafts, rebuilds on any change in src/, assets/ or vault/,
// serves dist/ like GitHub Pages does, and reloads open tabs after each rebuild.
// Usage: npm run dev  (PORT env var overrides 4173)
import { spawnSync } from "node:child_process";
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const dist = join(root, "dist");
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};
const reloadScript = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;
const clients = new Set();

function build() {
  const r = spawnSync(process.execPath, [join(root, "src/build.mjs"), "--drafts"], { cwd: root, encoding: "utf8" });
  process.stdout.write(r.stdout);
  if (r.status !== 0) {
    process.stderr.write(r.stderr);
    return false;
  }
  return true;
}

build();

let timer;
for (const dir of ["src", "assets", "vault"]) {
  watch(join(root, dir), { recursive: true }, (_, file) => {
    if (file && /(^|[\\/])\.obsidian[\\/]/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`changed: ${dir}/${file ?? ""}`);
      if (build()) for (const res of clients) res.write("data: reload\n\n");
    }, 120);
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/__reload") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  let path = normalize(decodeURIComponent(url.pathname));
  if (path.endsWith("/")) path += "index.html";
  let status = 200;
  let body;
  try {
    body = await readFile(join(dist, path));
  } catch {
    status = 404;
    path = "/404.html";
    body = await readFile(join(dist, path));
  }
  const type = types[extname(path)] ?? "application/octet-stream";
  if (type.startsWith("text/html")) body = String(body).replace("</body>", `${reloadScript}</body>`);
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" }).end(body);
}).listen(port, () => console.log(`dev server on http://localhost:${port}`));
