---
title: "Building a CLI Tool in Rust"
description: "Lessons learned from writing my first production-grade CLI tool in Rust."
date: 2026-05-15
categories: ["development", "rust"]
---

I recently finished rewriting one of my Python CLI tools in Rust. The goal wasn't speed (though that was a nice side effect) — it was learning the language properly.

## Why Rust for CLIs?

Rust is an excellent choice for command-line tools:

- **Single binary** — No runtime dependencies, easy to distribute.
- **Excellent error handling** — The `Result` type forces you to handle errors explicitly.
- **Crates like `clap`** — Makes argument parsing a breeze with derive macros.

## What I Learned

The borrow checker was predictably frustrating at first, but once it clicked, I started writing safer code by default. The compiler catches issues that would be runtime bugs in Python or JavaScript.

## Performance

The final binary is about 3MB (stripped) and processes log files roughly 15x faster than the Python equivalent. For a tool that parses multi-gigabyte log files, that difference matters.
