---
title: Pixel staircase
date: 2026-10-16
tags: [design]
draft: true
---

The hero graph is 28 by 14 squares drawn at build time. Each column's height follows a curve, and each square's opacity fades with distance from the top of its column.

## Why it blinks

A few squares are picked by a seeded random function and pulse slowly. The seed never changes, so every build draws the same picture.
