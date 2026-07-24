# Talal Ahmed — Portfolio

A lightweight Hugo portfolio for a SOC analyst and software engineer. The site
uses Hugo templates, plain CSS, and small framework-free JavaScript modules.

## Requirements and commands

- Hugo Extended 0.164.0 or newer
- Node.js 22 or newer for tests and quality checks

```sh
npm install
npm run dev
```

The maintained commands are:

```sh
npm run build          # production Hugo build
npm test               # unit and contract tests
npm run validate:data  # JSON and content-front-matter contracts
npm run lint           # JavaScript, CSS, and formatting
npm run check          # complete local CI sequence
```

Generated Hugo output and caches belong in `public/`, `resources/_gen/`,
`.hugo_cache/`, and `.report-work/`; all are ignored by Git.

## Architecture

- `content/` contains blog posts, project case studies, and section copy.
- `data/` contains the two role-specific JSON Resume documents, achievement
  snapshots, and cached Valorant status.
- `layouts/` contains page templates and reusable partials.
- `assets/` contains source CSS and JavaScript processed by Hugo Pipes.
- `static/` contains files that must be copied without transformation, including
  downloadable CVs and case-study PDFs.
- `schemas/`, `scripts/`, and `tests/` define and verify maintained content
  contracts.

The SOC and software CVs intentionally remain separate JSON Resume documents in
`data/resume-soc.json` and `data/resume-software.json`. Shared identity and
social links used outside the CV are configured in `hugo.toml`.

## Authoring content

Create content with the provided archetypes:

```sh
hugo new content blog/my-post/index.md
hugo new content projects/my-project/index.md
```

Keep article images inside the page bundle beside `index.md`. Hugo's Markdown
image render hook generates responsive WebP variants while preserving the
original for the lightbox.

Before committing content or implementation changes, run:

```sh
npm run check
git diff --check
```

## Live data

Committed vendor snapshots power achievements. Their expected top-level shapes
are normalized into `data/achievements.json`. After refreshing a snapshot, run
`npm run normalize:achievements`; `npm run validate:data` fails if the normalized
file is stale or violates its schema.
Credential artwork is cached only from the allowlisted provider hosts with
`npm run cache:achievement-images`; the normalized data then points at the
locally served copies and validation confirms that every referenced file exists.
The Valorant refresh script validates the upstream text response before updating
`data/valorant.json`. Discord presence is progressively loaded in visitors'
browsers from the public server widget and falls back to static copy on failure.

## Deployment

Pushes to `main` deploy through GitHub Actions. In repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.

The workflow runs live-status tests, restores the last successful cached Valorant
rank, attempts a refresh, and builds with Hugo Extended. If the refresh fails, it
deploys the cached rank when available or the committed fallback otherwise. A
scheduled run at 03:17 UTC refreshes and redeploys the rank daily.
