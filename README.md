# yutna.github.io

[![ci](https://github.com/yutna/yutna.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/yutna/yutna.github.io/actions/workflows/ci.yml)
[![pages](https://github.com/yutna/yutna.github.io/actions/workflows/pages.yml/badge.svg)](https://github.com/yutna/yutna.github.io/actions/workflows/pages.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Personal site of **Yutthana Siphuengchai**, built with Jekyll and deployed to
GitHub Pages with GitHub Actions.

**Live site:** <https://yutna.github.io/>

## Status

The site is in its foundation stage. The homepage is a designed
under-construction page; the content model for work, writing, and notes is
scaffolded but not published yet.

Search indexing is intentionally off. Every page sends `noindex`, and
`robots.txt` allows crawling so search engines can see that directive. The
sitemap is generated but not submitted until the site is ready. The switch
and the launch checklist are in [docs/seo.md](docs/seo.md).

## Design

The homepage carries a light lavender and violet identity: pale paper,
violet ink, Bricolage Grotesque for display and JetBrains Mono for labels, both
self-hosted from `assets/fonts/` under the SIL Open Font License. The four
cards and the contact CTA are the interactive elements; pointer, touch, and
keyboard selection are progressively enhanced by `assets/js/main.mjs`, and
`prefers-reduced-motion` removes the tilt and entrance motion.

The page loads no third-party runtime code and ships about 15 KB of CSS and
6 KB of JavaScript uncompressed. `scripts/check-site.mjs` enforces a 40 KB
CSS and 15 KB JavaScript budget, and checks the 1200×630 social card.

## Built with

- Ruby 4.0.7, Bundler, Jekyll 4.4.1, WEBrick
- Node.js 24.22.1 for checks and browser tests
- `jekyll-seo-tag`, `jekyll-sitemap`
- GitHub Actions for CI and GitHub Pages

## Development

The toolchain is pinned with [mise](https://mise.jdx.dev/).

```bash
mise install
mise exec -- bundle install
mise exec -- npm ci
mise exec -- npm run serve
```

Open <http://127.0.0.1:4000/>. To build the production artifact and preview it
the way GitHub Pages serves it:

```bash
JEKYLL_ENV=production mise exec -- bundle exec jekyll build
mise exec -- npm run preview
```

The preview runs at <http://127.0.0.1:4173/>.

## Checks

```bash
mise exec -- npm run test:all
```

This builds the site, type-checks the JavaScript, validates HTML, checks
titles, descriptions, canonicals, internal links, `noindex`, `robots.txt`, and
the sitemap, then runs the unit tests and the Playwright suite at desktop and
mobile widths. The browser tests include axe accessibility checks and verify
that no third-party runtime request is made.

Individual entry points:

```bash
mise exec -- npm run lint:js        # tsc --noEmit
mise exec -- npm run check:static  # built-site metadata and link checks
mise exec -- npm run check:html    # html-validate
mise exec -- npm run test:unit     # node:test
mise exec -- npm run test:e2e      # Playwright + axe
```

## Contributing

This is a personal site with a single maintainer. The workflow is still
documented in [CONTRIBUTING.md](CONTRIBUTING.md); issues and pull requests are
welcome when they follow it.

## License

Code is released under the [MIT License](LICENSE). Personal writing, images,
and the site's visual identity remain © Yutthana Siphuengchai.
