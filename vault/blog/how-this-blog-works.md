---
title: How this blog works
date: 2026-10-16
description: Write in Obsidian, push, and it is live. Everything this page shows is plain Markdown.
tags: [meta, obsidian]
draft: true
---

This post is a **draft**: it only shows up in local preview (`npm run dev`). Delete it, or set `draft: false` to publish it. It doubles as a reference for everything the renderer understands.

## Writing

Plain Markdown works as you'd expect: *emphasis*, **strong**, `inline code`, [links](https://github.com/Robinbinu), and ==highlights== from Obsidian. Link to other notes with wikilinks, like [[Pixel staircase|this note]], or to a heading in one with [[Pixel staircase#Why it blinks]].

> A plain blockquote reads as a pull quote.

> [!tip] Callouts work too
> Any Obsidian callout type: `note`, `tip`, `warning`, `danger`, `quote` and the rest each get their own colour.

## Images

Paste an image into Obsidian and it lands in `attachments/`. Embeds can take a caption:

![[pipeline.svg|From the vault to the page, one push.]]

Standard Markdown images work as well, and the title becomes the caption: `![alt](path "caption")`.

## Code

```ts
export function publish(note: Note) {
  if (note.draft) return;
  return render(note);
}
```

## Lists and tables

- [x] Write in Obsidian
- [x] Commit and push
- [ ] GitHub Actions builds and deploys

| Syntax | Result |
| --- | --- |
| `[[note]]` | link to a note |
| `![[image.png]]` | embedded image |
| `==text==` | highlight |
