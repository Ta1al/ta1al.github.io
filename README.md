# Talal Ahmed — Portfolio

A lightweight Hugo portfolio for a SOC analyst and software engineer.

## Local development

Requires Hugo Extended 0.164.0 or newer.

```sh
hugo server --buildDrafts
```

Create content with the provided archetypes:

```sh
hugo new content blog/my-post.md
hugo new content projects/my-project.md
```

CV content is maintained in `data/resume.json` using the JSON Resume structure. Identity and social links are configured in `hugo.toml`.

## Production build

```sh
hugo --gc --minify
```

Pushes to `hugo-main` deploy through GitHub Actions. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The deployment workflow validates the live-status integrations and refreshes the Valorant rank before each build. A scheduled run at 03:17 UTC refreshes and redeploys the rank daily; a failed or malformed rank response stops deployment so the last successful site remains online. Discord presence is progressively loaded in visitors' browsers from the public server widget.
