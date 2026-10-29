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
sitemap is generated but not submitted until the site is ready.

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
mise exec -- bundle exec jekyll serve
```

Open <http://127.0.0.1:4000/>. To build the production artifact:

```bash
JEKYLL_ENV=production mise exec -- bundle exec jekyll build
```

## Checks

```bash
mise exec -- npm run test:all
```

This builds the site, validates HTML and internal links, checks the SEO
guards, type-checks JavaScript, and runs the unit and browser tests.

## Contributing

This is a personal site with a single maintainer. The workflow is still
documented in [CONTRIBUTING.md](CONTRIBUTING.md); issues and pull requests are
welcome when they follow it.

## License

Code is released under the [MIT License](LICENSE). Personal writing, images,
and the site's visual identity remain © Yutthana Siphuengchai.
