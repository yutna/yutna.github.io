# AGENTS.md

## Design rules

Functional design (FDS) governs every tracked JavaScript file in this
repository. Jekyll/Liquid, HTML, CSS, docs, CI YAML, Ruby, JSON, and
non-JavaScript configuration are outside its scope.

In scope:

- `assets/js/**/*.{js,mjs}`
- `scripts/**/*.{js,mjs}`
- `tests/**/*.{js,mjs}`
- `playwright.config.mjs`

All in-scope files use plain ESM with JSDoc types checked by `tsc`
(`checkJs`, `strict`).

For every in-scope change:

- Read the `functional-design` skill index and name the calibration row.
  A row that skips a rule binds nothing.
- Run the "Is the problem decided?" check. If the rules are not settled,
  stop and ask before modelling.
- Apply every rule the chosen row binds, then use
  `functional-javascript` for syntax. For tests, also read
  `functional-testing-functional-code`.
- Run the checklist in `functional-reviewing-functional-design` before
  finishing any in-scope change.
- This project's conventions win over the pack. Calibration decides how
  much design a file needs: config and tooling usually take the lightest
  row, and over-modelling is itself a design failure.

The pack is vendored at `vendor/functional-design-skills/` (version
3.3.0). Start at
`vendor/functional-design-skills/plugin/skills/functional-design/SKILL.md`.
The `.opencode/skills/functional-design` bridge is the OpenCode entry
point. Do not modify the vendored pack; update it as a whole when the
upstream version changes.

## Project

This is the public personal site of Yutthana Siphuengchai, served as a
GitHub Pages user site at <https://yutna.github.io/> with an empty
`baseurl`.

- `_config.yml` is the site contract: English metadata, `url`,
  `permalink: pretty`, strict Liquid and front matter.
- `_data/site.yml` holds identity and contact details.
- `_layouts/` and `_includes/` hold the markup; `assets/css/` holds the
  design system. The homepage is a designed under-construction page
  until the content pages exist.
- `scripts/` holds Node checks and the preview server; use `node:`
  built-ins. `tests/` holds unit and Playwright specs.
- Search indexing is intentionally off. Every page sends `noindex` while
  `seo.indexable` is false, and `robots.txt` allows crawling so search
  engines can see the directive. `scripts/check-site.mjs` enforces that
  the two agree in either state.
- No analytics, trackers, cookies, third-party runtime fonts, or
  third-party runtime dependencies. The site must build to a fully
  self-hosted artifact.

## Context map

| Path | Why it matters |
| --- | --- |
| `_config.yml` | Site metadata, permalinks, plugins, exclusions |
| `_data/site.yml` | Name, role, location, email, GitHub |
| `_includes/head.html` | SEO tag, noindex guard, favicon, stylesheet |
| `_layouts/default.html` | Document shell, skip link, main landmark |
| `assets/css/main.scss` | Design system entry point |
| `assets/js/` | Progressive enhancement runtime |
| `scripts/check-site.mjs` | Built-site checks; shell around `scripts/lib/site.mjs` |
| `scripts/lib/site.mjs` | Pure URL, srcset, and noindex helpers |
| `scripts/serve-site.mjs` | Static preview used by Playwright |
| `tests/unit/` | Value tests for the pure helpers |
| `tests/e2e/` | Behaviour, keyboard, overflow, and axe checks |
| `.github/workflows/` | CI, PR checks, Pages, and release |

## Workflow

1. Read the issue, then restate the goal and acceptance criteria. Stop
   and ask if they are undecided.
2. Search before reading. Use `rg` and globs, then read only the
   relevant files and line ranges.
3. Decide whether FDS applies, and plan the files, data or signature
   changes, tests, risks, and verification.
4. Implement the smallest complete change. Keep unrelated files alone.
5. Run targeted checks while iterating. Read the failure, fix the
   cause, and rerun the smallest check that proves it.
6. Run the full quality gate, review the diff, run the FDS review for
   JavaScript, and report the changed files, verification, and blockers.

Fewer revision loops come from better inspection, not from skipping
verification. Do not stop after one edit while a check is failing.

## Quality gate

Aim for a correct first implementation: inspect enough that avoidable
mistakes do not happen. If a check or review finds a problem, fix it and
rerun until the gate is green.

### Definition of done

- [ ] The issue is linked from the pull request.
- [ ] Acceptance criteria are met and checked off.
- [ ] `mise exec -- npm run test:all` passes.
- [ ] JavaScript changes used the FDS pass and review.
- [ ] Docs and templates match the behaviour.
- [ ] The diff is scoped, reviewed, and free of secrets.

## Token discipline

- Search first; read targeted ranges instead of whole files.
- Do not re-read a file after editing; use `git diff`.
- Batch related edits. Run targeted checks between batches, not after
  every line.
- Load only the skills the task needs. Non-JavaScript work does not
  need FDS.
- Keep reports to changed files, verification, and blockers.
- Never trade correctness for fewer tokens or a faster-looking result.

## Commands

Use the pinned toolchain through mise:

```bash
mise exec -- bundle exec jekyll serve    # local site at :4001
mise exec -- npm run preview             # serve the built _site at :4173
mise exec -- npm run lint:js             # tsc --noEmit
mise exec -- npm run check:static        # metadata, links, robots, sitemap
mise exec -- npm run check:html          # html-validate the build
mise exec -- npm run test:unit           # node:test
mise exec -- npm run test:e2e            # Playwright + axe
mise exec -- npm test                    # every check against an existing build
mise exec -- npm run test:all            # build first, then the full suite
```

Run `npm run test:all` before claiming a change is complete.

## Git workflow

Follow the oss-kit workflow in `CONTRIBUTING.md`: issue first, branch as
`<type>/<issue>-<slug>`, draft PR, Conventional Commits title, milestone,
and squash merge. Keep the pull request in draft until the quality gate
is green.

## Site rules that are not negotiable

- English only. Thai copy must not reach `_site`; the check fails on it.
- Every page carries one `h1`, a description, a canonical URL, OG tags,
  and JSON-LD.
- `noindex` and `robots.txt` change together. Never add `Disallow: /`
  while `noindex` is the control.
- Internal links and assets must resolve in the built artifact.
- The design must work at 390, 768, and 1440 pixels without horizontal
  scrolling, and respect `prefers-reduced-motion`.
