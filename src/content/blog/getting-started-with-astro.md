---
title: "Getting Started with Static Sites"
description: "Why I chose Astro for my portfolio and how it compares to other static site generators."
date: 2026-06-10
categories: ["development", "astro"]
---

Static sites are making a comeback. With modern tooling, you get the best of both worlds: dynamic-like development experience with static-site performance.

## Why Static?

Static sites are fast by nature. There's no database query, no server-side rendering on each request — just pre-built HTML, CSS, and JS served directly from a CDN.

## Why Astro?

I chose Astro for this portfolio for a few key reasons:

- **Zero JS by default** — Pages ship zero JavaScript unless you explicitly add it.
- **Content Collections** — Built-in type-safe Markdown/MDX handling with schema validation.
- **Island Architecture** — You can add interactive components without shipping JS to the entire page.
- **Fast builds** — Astro's build pipeline is remarkably quick.

## The Developer Experience

Setting up content collections was straightforward. Define a schema in `src/content/config.ts`, drop Markdown files in `src/content/blog/`, and Astro handles the rest — including type-safe frontmatter access.
