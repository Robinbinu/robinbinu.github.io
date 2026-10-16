// All site copy lives here. Edit, then run `npm run build`.
// Each project has a drawn figure; figure kinds live in src/figures.mjs.
// Blog posts and notes are Markdown files in vault/ (see README).

export const site = {
  name: "Michael Robin K",
  domain: "robinbinu.github.io",
  url: "https://robinbinu.github.io",
  tagline: "I build stuff.",
  github: "https://github.com/Robinbinu",
  linkedin: "https://www.linkedin.com/in/michaelrobink",
  email: "michaelrobink@gmail.com",
};

// Home page sections. A string is a project slug; an object is a link.
// The special label "Writing" is filled with the latest blog posts at build time.
export const sections = [
  { label: "Work", items: ["myrmidon", "patchbay", "sshup", "serverbrdg", "nsfw-onnx"] },
  { label: "Hardware", items: ["pi5-mhs35", "xpt2046-fix"] },
  { label: "Writing" },
  {
    label: "Elsewhere",
    items: [
      { name: "GitHub", blurb: "@Robinbinu", href: site.github },
      { name: "LinkedIn", blurb: "in/michaelrobink", href: site.linkedin },
      { name: "Email", blurb: site.email, href: `mailto:${site.email}` },
      "stack",
    ],
  },
];

export const projects = {
  myrmidon: {
    name: "Myrmidon",
    blurb: "One chat. A whole crew of AI agents.",
    title: "You ask. A crew does it.",
    intro:
      "An open-source agent harness for the Mac. It answers, codes, drives a browser and your apps, and calls in specialists that check each other's work. Every step logged and sandboxed.",
    links: [{ label: "GitHub", href: "https://github.com/Robinbinu/myrmidon", primary: true }],
    spec: [["Platform", "macOS"], ["Stack", "TypeScript · Bun"], ["License", "Apache 2.0"], ["Status", "Beta"]],
    figure: {
      kind: "tally",
      rows: [
        ["Coding agent", ["Claude Code", "Codex CLI", "Cline", "Aider"]],
        ["Parallel agents", ["Conductor", "Codex app"]],
        ["Browser agent", ["Manus", "Operator", "Browser Use"]],
        ["Computer use", ["Claude computer use", "OpenAI CUA"]],
        ["Crews", ["CrewAI", "AutoGen", "LangGraph", "Devin"]],
        ["Messaging", ["OpenClaw", "Hermes Agent"]],
        ["Voice and calls", ["ChatGPT Voice", "Vapi"]],
        ["Every model", ["OpenRouter", "LiteLLM"]],
        ["Memory and skills", ["ChatGPT Memory", "Claude Code plugins"]],
      ],
      caption: "What it stands in for, from the README's comparison table.",
    },
    highlights: [
      ["Crews", "A lead and workers, or a leaderless swarm, with a reviewer."],
      ["Hands", "Code with git worktrees, a real Chrome, and your Mac itself."],
      ["Reach", "30 chat apps, voice and phone calls, every major model."],
    ],
  },
  patchbay: {
    name: "Patchbay",
    blurb: "Every model you pay for, one endpoint.",
    title: "One endpoint for every model.",
    intro:
      "A menu-bar app that signs in to ChatGPT, Claude, Grok and OpenRouter once, then hands every tool on your machine one URL and one key.",
    links: [
      { label: "Download", href: "https://github.com/Robinbinu/patchbay/releases", primary: true },
      { label: "GitHub", href: "https://github.com/Robinbinu/patchbay" },
    ],
    spec: [["Platform", "macOS · Windows · Linux"], ["Stack", "Go"], ["License", "MIT"], ["Status", "Beta"]],
    figure: { kind: "route", caption: "Your subscriptions in, one local endpoint out." },
    highlights: [
      ["Both dialects", "OpenAI and Anthropic APIs, one merged model list."],
      ["Local only", "Listens on 127.0.0.1. No telemetry, no relay."],
      ["One binary", "The core proxy is Go's standard library."],
    ],
  },
  sshup: {
    name: "sshup",
    blurb: "Every SSH server's health, at a glance.",
    title: "Every server, one glance.",
    intro: "Reads your ~/.ssh/config, checks every host in parallel, and shows what's up. No daemon. No config.",
    links: [
      { label: "Download", href: "https://github.com/Robinbinu/sshup/releases/latest", primary: true },
      { label: "GitHub", href: "https://github.com/Robinbinu/sshup" },
    ],
    spec: [["Platform", "macOS · Linux"], ["Stack", "Go"], ["License", "MIT"]],
    figure: {
      kind: "hosts",
      rows: [
        ["prod-api-server", 31, "0.82"],
        ["prod-db-primary", 72, "2.10"],
        ["prod-db-replica", 71, "0.43"],
        ["cache-redis-east", 18, "0.05"],
        ["worker-east-01", 54, "1.67"],
        ["worker-west-01", 52, "1.44"],
        ["bastion-prod", 12, "0.01"],
        ["monitoring-srv", 41, "0.33"],
        ["dev-workstation", null],
      ],
      caption: "Disk and load per host, from the README's sample run.",
    },
    highlights: [],
  },
  serverbrdg: {
    name: "Serverbrdg",
    blurb: "Any SSH server, as a file manager.",
    title: "SSH, as a file manager.",
    intro:
      "One command opens a dual-pane file manager in your browser: the server on the left, your machine on the right. No Electron. No cloud. Just SSH and rsync.",
    links: [{ label: "GitHub", href: "https://github.com/Robinbinu/Serverbrdg", primary: true }],
    spec: [["Platform", "macOS · Linux · Windows"], ["Runtime", "Bun"], ["Build step", "None"]],
    figure: { kind: "bundle", caption: "With Compress on, a whole directory crosses as one archive." },
    highlights: [
      ["Fast directories", "Tarred on the server, moved as one archive."],
      ["Terminal", "Tabs, saved snippets and session logs, in the browser."],
      ["Tunnels", "Local port forwards from the same tab."],
    ],
  },
  "nsfw-onnx": {
    name: "nsfw-onnx",
    blurb: "Open-NSFW on ONNX Runtime. 7 ms, on CPU.",
    title: "7 ms per image. On CPU.",
    intro: "Yahoo's Open-NSFW classifier, repackaged for ONNX Runtime. No TensorFlow or PyTorch at runtime, no download at first use.",
    links: [
      { label: "PyPI", href: "https://pypi.org/project/yahoo-open-nsfw-onnx/", primary: true },
      { label: "GitHub", href: "https://github.com/Robinbinu/yahoo-open-nsfw-onnx" },
    ],
    spec: [["Language", "Python"], ["Runtime", "ONNX Runtime"], ["License", "MIT"]],
    figure: {
      kind: "bars",
      metrics: [
        { label: "Latency, one image", ours: 6.98, theirs: 25.69, unit: "ms" },
        { label: "Process memory", ours: 128, theirs: 513, unit: "MB" },
        { label: "Cold start", ours: 0.2, theirs: 2, unit: "s" },
      ],
      legend: ["nsfw-onnx", "Keras + TensorFlow"],
      caption: "Same model, same Apple M4, batch size 1.",
    },
    install: "pip install yahoo-open-nsfw-onnx",
    highlights: [],
  },
  "pi5-mhs35": {
    name: "Pi 5 MHS35",
    blurb: "A 3.5\" touchscreen, working on Pi 5.",
    title: "The touchscreen, fixed.",
    intro:
      "goodtft's MHS35 installer kills HDMI on a Pi 5 and leaves touch dead on kernel 6.18. This patches the overlay, re-arms the touch chip at boot, and switches between HDMI and the panel on its own.",
    links: [{ label: "GitHub", href: "https://github.com/Robinbinu/pi5-mhs35-touchscreen", primary: true }],
    spec: [["Board", "Raspberry Pi 5"], ["Stack", "Shell · device tree"], ["License", "MIT"]],
    figure: {
      kind: "pins",
      columns: ["GPIO17 · PENIRQ", "GPIO25", "GPIO24"],
      rows: [
        ["goodtft", "theirs", ["in · pull-down", "in", "in"]],
        ["Patched", "ours", ["in · pull-up", "out", "out"]],
      ],
      caption: "The overlay's pin group before and after, from the README.",
    },
    install: "git clone https://github.com/Robinbinu/pi5-mhs35-touchscreen.git\ncd pi5-mhs35-touchscreen && ./install.sh",
    highlights: [],
  },
  "xpt2046-fix": {
    name: "XPT2046 fix",
    blurb: "Dead touch, traced to the kernel.",
    title: "Your clone chip is being disarmed.",
    intro:
      "On cheap SPI touch panels, the kernel driver echoes one byte back at probe. A genuine chip ignores it. A clone reads it as a command and switches its pen interrupt off.",
    links: [{ label: "GitHub", href: "https://github.com/Robinbinu/xpt2046-clone-touch-fix", primary: true }],
    spec: [["Panels", "waveshare35a · MHS35 · tft35a · piscreen"], ["Stack", "Shell"], ["License", "MIT"]],
    figure: {
      kind: "bits",
      rows: [
        ["Genuine reply", "0x7F", "01111111", false],
        ["Clone reply", "0xFF", "11111111", true],
      ],
      note: "The driver echoes this byte back. With the start bit set, the clone reads it as a command: PD=11, pen interrupt off.",
      caption: "Captured with SPI tracepoints. Pi 5, kernel 6.18.34.",
    },
    install: "git clone https://github.com/Robinbinu/xpt2046-clone-touch-fix.git\ncd xpt2046-clone-touch-fix && sudo ./install.sh",
    highlights: [],
  },
  stack: {
    name: "Stack",
    blurb: "What this site is built with.",
    title: "What this site is built with.",
    intro:
      "Plain HTML and one stylesheet; the only script is one line that picks the hero's intro. A small Node script turns content and an Obsidian vault into pages; GitHub Actions deploys them on every push.",
    links: [{ label: "Source", href: "https://github.com/Robinbinu/robinbinu.github.io", primary: true }],
    spec: [["Build", "Node, zero config"], ["Host", "GitHub Pages"], ["Script", "One line"]],
    figure: {
      kind: "specimen",
      swatches: [
        ["accent", "#ff6b1a"],
        ["foreground", "#e9e9e6"],
        ["muted", "#868b94"],
        ["line", "#23262c"],
        ["panel", "#101215"],
        ["background", "#0b0c0e"],
      ],
      caption: "One typeface. One orange.",
    },
    highlights: [
      ["Writing", "Markdown from Obsidian, built on push."],
      ["Figures", "Drawn in HTML and SVG, not screenshots."],
      ["Motion", "CSS only, and off when you ask for less."],
    ],
  },
};
