// Project figures: small, data-driven charts drawn in HTML/SVG, in the visual language of the
// nsfw-onnx benchmark chart. Every value comes from the project's README; nothing is invented.

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const legend = (items) => `<p class="legend">${items.map(([cls, label]) => `<span><i class="${cls}"></i>${label}</span>`).join("")}</p>`;

// Myrmidon's pixel-eyes mascot on its dark dotted tile, as in the app icon. The right eye winks.
function mascot() {
  const open = [".###.", "#####", "#####", "#####", ".###."];
  const shut = [".....", "..#..", ".#.#.", "#...#", "....."];
  const cells = (rows, ox, oy) =>
    rows
      .flatMap((row, y) => [...row].map((c, x) => (c === "#" ? `<rect x="${(ox + x) * 10}" y="${(oy + y) * 10}" width="8" height="8" rx="1.5"/>` : "")))
      .join("");
  // A 17×17 dot grid on a rounded square; the corner radius matches the app icon (22.4% of the side).
  // Dots whose centre falls outside the rounded corners (inset by half a dot) are left out.
  const inside = (cx, cy) => {
    const [lo, hi, r] = [35, 133, 36];
    return Math.hypot(cx - Math.min(Math.max(cx, lo), hi), cy - Math.min(Math.max(cy, lo), hi)) <= r;
  };
  let dots = "";
  for (let y = 0; y < 17; y++)
    for (let x = 0; x < 17; x++) if (inside(x * 10 + 4, y * 10 + 4)) dots += `<rect x="${x * 10}" y="${y * 10}" width="8" height="8" rx="1.5"/>`;
  // The dot grid is clipped to the tile so it never shows past the rounded corners.
  const tile = `x="-5" y="-5" width="178" height="178" rx="40"`;
  return `<svg class="mascot" viewBox="-5 -5 178 178" aria-hidden="true">
<defs><clipPath id="mascot-tile"><rect ${tile}/></clipPath></defs>
<rect class="mascot-tile" ${tile}/>
<g class="mascot-dots" clip-path="url(#mascot-tile)">${dots}</g>
<g class="mascot-eye">${cells(open, 2, 6)}</g>
<g class="mascot-eye wink-open">${cells(open, 10, 6)}</g>
<g class="mascot-eye wink-shut">${cells(shut, 10, 6)}</g>
</svg>`;
}

// Nine jobs wired into one hub: each row's hatched cells are the tools that job used to need.
function tally({ rows }) {
  const total = rows.reduce((n, [, tools]) => n + tools.length, 0);
  const ys = rows.map((_, i) => (((i + 0.5) / rows.length) * 100).toFixed(2));
  // Paths start at each row and end at the hub, so the flowing dashes travel inward.
  const wires = `<svg class="bus" viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden="true">${ys
    .map((y) => `<path d="M64 ${y} C28 ${y} 36 50 0 50"/>`)
    .join("")}</svg>`;
  const body = rows
    .map(
      ([job, tools], i) =>
        `<li style="--i:${i}"><span class="cells">${tools.map(() => `<i class="c theirs"></i>`).join("")}</span><span class="job">${esc(
          job,
        )}</span><span class="tools">${tools.map(esc).join(" · ")}</span></li>`,
    )
    .join("");
  return `<div class="chart tally">
<div class="core">${mascot()}<p class="core-name">Myrmidon</p><p class="core-sum"><span>${total} tools</span><span class="hl">→ 1 chat</span></p></div>
${wires}
<ul class="jobs" data-label="${rows.length} jobs it takes over">${body}</ul>
</div>`;
}

function route() {
  const chips = (items) => items.map((t, i) => `<li style="--i:${i}"><span>${esc(t)}</span></li>`).join("");
  const wire = (dir) =>
    `<svg class="bus bus-${dir}" viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden="true">${[12.5, 37.5, 62.5, 87.5]
      .map((y) => (dir === "in" ? `<path d="M0 ${y} C36 ${y} 28 50 64 50"/>` : `<path d="M0 50 C36 50 28 ${y} 64 ${y}"/>`))
      .join("")}</svg>`;
  const glyph = `<svg class="glyph" viewBox="160 160 704 704" aria-hidden="true"><rect x="217" y="217" width="590" height="590" rx="170" fill="none" stroke="currentColor" stroke-width="52"/><circle cx="388" cy="388" r="65"/><circle cx="636" cy="388" r="46"/><circle cx="388" cy="636" r="46"/><circle cx="636" cy="636" r="65"/><path d="M388 420 C 400 520, 600 470, 636 610" fill="none" stroke="currentColor" stroke-width="52"/></svg>`;
  return `<div class="route">
<ul class="ends ends-in" data-label="Your subscriptions">${chips(["ChatGPT", "Claude", "Grok", "OpenRouter"])}</ul>
${wire("in")}
<div class="hub">${glyph}<span>127.0.0.1:8787</span><em>one key · pby-…</em></div>
${wire("out")}
<ul class="ends ends-out" data-label="Your tools">${chips(["Claude Code", "Codex", "OpenAI SDK", "Anthropic SDK"])}</ul>
</div>`;
}

// Disk use per host as horizontal bars; a host that is down gets a hatched track.
function hosts({ rows }) {
  const body = rows
    .map(([name, disk, load], i) =>
      disk == null
        ? `<div class="hrow down" style="--i:${i}"><span class="hname">${esc(name)}</span><span class="track"><span class="fill theirs" style="--w:100%"></span></span><span class="val">down</span><span class="load">—</span></div>`
        : `<div class="hrow" style="--i:${i}"><span class="hname">${esc(name)}</span><span class="track"><span class="fill ours" style="--w:${disk}%"></span></span><span class="val">${disk}%</span><span class="load">${load}</span></div>`,
    )
    .join("");
  return `<div class="chart hosts"><div class="hrow head"><span class="metric-label">Host</span><span class="metric-label">Disk</span><span></span><span class="metric-label load">Load</span></div>${body}</div>`;
}

// Many small files leave the server as one archive and arrive as many again.
function bundle() {
  const field = (n) => `<span class="field">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`;
  const arrow = `<svg class="flow" viewBox="0 0 80 10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 5 H74"/><path d="M70 1 L76 5 L70 9"/></svg>`;
  return `<div class="chart bundle">
<div class="stagecol"><p class="metric-label">On the server</p>${field(48)}<p class="note">Thousands of small files</p></div>
${arrow}
<div class="stagecol"><p class="metric-label">On the wire</p><span class="block"><i class="c ours"></i></span><p class="note">One tar stream</p></div>
${arrow}
<div class="stagecol"><p class="metric-label">On your Mac</p>${field(48)}<p class="note">Extracted in place</p></div>
</div>`;
}

// The overlay's pin group before and after the fix, from the README's comparison table.
function pins({ columns, rows }) {
  const head = `<div class="prow head"><span></span>${columns.map((c) => `<span class="metric-label">${esc(c)}</span>`).join("")}</div>`;
  const body = rows
    .map(
      ([label, cls, cells], i) =>
        `<div class="prow" style="--i:${i}"><span class="metric-label">${esc(label)}</span>${cells
          .map((v) => `<span class="pin"><i class="c ${cls}"></i>${esc(v)}</span>`)
          .join("")}</div>`,
    )
    .join("");
  return `<div class="chart pins">${head}${body}${legend([
    ["theirs", "goodtft overlay (dead touch on Pi 5)"],
    ["ours", "Patched overlay"],
  ])}</div>`;
}

// The reply byte, bit by bit. A set start bit (MSB) turns the clone's echo into a command.
function bits({ rows, note }) {
  const body = rows
    .map(([label, hex, bin, clone], i) => {
      const cells = [...bin]
        .map((b, j) => `<i class="bit${b === "1" ? " on" : ""}${j === 0 ? " msb" : ""}${j === 0 && clone ? " hot" : ""}">${b}</i>`)
        .join("");
      return `<div class="brow" style="--i:${i}"><span class="metric-label">${esc(label)}</span><span class="byte">${cells}</span><span class="val">${esc(hex)}</span></div>`;
    })
    .join("");
  return `<div class="chart bits"><div class="brow head"><span></span><span class="byte"><em>start bit</em></span><span></span></div>${body}<p class="note">${esc(note)}</p></div>`;
}

function bars({ metrics, legend: names }) {
  const rows = metrics
    .map((b) => {
      const pct = (v) => ((v / Math.max(b.ours, b.theirs)) * 100).toFixed(1);
      return `<div class="metric"><p class="metric-label">${esc(b.label)}</p>
<div class="bar"><span class="fill ours" style="--w:${pct(b.ours)}%"></span><span class="val">${b.ours} ${b.unit}</span></div>
<div class="bar"><span class="fill theirs" style="--w:${pct(b.theirs)}%"></span><span class="val">${b.theirs} ${b.unit}</span></div></div>`;
    })
    .join("");
  return `<div class="chart metrics">${rows}${legend([
    ["ours", esc(names[0])],
    ["theirs", esc(names[1])],
  ])}</div>`;
}

function specimen({ swatches }) {
  return `<div class="specimen">
<div class="spec-type"><p class="spec-big">Aa</p><p class="spec-name">IBM Plex Mono</p><p class="spec-weights"><span>400</span><span class="w5">500</span></p></div>
<ul class="spec-swatches">${swatches.map(([name, hex], i) => `<li style="--c:${hex};--i:${i}"><i></i><span>${esc(name)}</span><em>${esc(hex)}</em></li>`).join("")}</ul>
</div>`;
}

const kinds = { tally, route, hosts, bundle, bars, pins, bits, specimen };

export function renderFigure(f) {
  const draw = kinds[f.kind];
  if (!draw) throw new Error(`Unknown figure kind: ${f.kind}`);
  return draw(f);
}
