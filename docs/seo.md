# SEO and indexing

The site is built to be indexed later and deliberately kept out of search
while it says "under construction". The switch is one boolean, and the static
checks keep the pieces in agreement in either state.

## The current state

`_config.yml` sets:

```yaml
seo:
  indexable: false
```

While it is false:

- `_includes/head.html` adds `noindex, noarchive, nosnippet, noimageindex`
  to every page.
- `robots.txt` allows crawling (`Allow: /`) and does not advertise the
  sitemap.
- `jekyll-sitemap` still builds `/sitemap.xml`; it is simply not submitted.

`noindex` is the control. `robots.txt` must keep `Allow: /`, because a
crawler blocked by `Disallow: /` never sees the directive. The 404 page
also sets `noindex: true` in its own front matter, so it stays out of the
index whether the site-wide switch is on or off.

`scripts/check-site.mjs` fails when the two disagree in either state: all
content pages must be indexable or all must be `noindex`, the 404 must
always be `noindex`, and `robots.txt` must advertise the sitemap exactly
when indexing is on.

## Turning indexing on

1. Set `seo.indexable: true` in `_config.yml`.
2. Run `mise exec -- npm run test:all`. The static check now expects the
   content pages to be indexable and `robots.txt` to advertise the sitemap.
3. Inspect the build before deploying:
   - `_site/index.html` has no `meta[name="robots"]` containing `noindex`.
   - `_site/404.html` still has one.
   - `_site/robots.txt` ends with
     `Sitemap: https://yutna.github.io/sitemap.xml`.
   - `_site/sitemap.xml` lists every content page and not `404.html`.
4. Merge the change and wait for the Pages workflow, then request the live
   files and confirm the same three things.
5. Submit `https://yutna.github.io/sitemap.xml` in Google Search Console
   and Bing Webmaster Tools, then request indexing for the homepage once.

Turning indexing off is the same change in reverse.

## What every page must carry

`scripts/check-site.mjs` enforces these on every built page:

- `lang="en"` and one viewport meta
- exactly one `h1`
- a title of 1 to 65 characters, measured after `jekyll-seo-tag` adds the
  site title
- a description of 1 to 160 characters
- a canonical URL matching the page's own URL
- `og:title`, `og:description`, and `og:url`
- at least one `application/ld+json` block
- an `og:image` on the homepage, and any `og:image` must resolve to a file
  in the build
- no Thai script, no unrendered Liquid, `alt` on every image, and
  `rel="noopener"` on every `target="_blank"` link
- internal links and assets that resolve, and no third-party script or
  stylesheet request

`jekyll-seo-tag` fills most of this from front matter. A new page needs:

```yaml
---
layout: default
title: "About"
description: "A short, specific description of the page."
---
```

Add an `image` block only when the page has its own card:

```yaml
image:
  path: "/assets/images/og.png"
  alt: "What the image shows"
  width: 1200
  height: 630
```

The title is combined with the site title by `jekyll-seo-tag`, so keep the
page title short enough that the built title stays under the limit.

## Social card

`assets/images/og.png` is 1200×630. The check reads the PNG header and fails
on any other size. Regenerate it at the same size when the design changes,
and keep the text inside the safe area.

## Budgets

The check enforces 40 KB of CSS and 15 KB of JavaScript, uncompressed,
across the built site, and reports the current totals. It also fails on any
third-party runtime request. Both budgets are deliberately below what a
framework would cost, which is why the page ships plain ESM and one
stylesheet.
