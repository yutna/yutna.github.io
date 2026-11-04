# Site routes

The user site owns the root of `https://yutna.xyz`. GitHub Pages serves every
project site owned by `yutna` under `/<repo>/` automatically, so a project repo
named `about` would collide with the user site's future `/about/` route.

`docs/routes.json` is the registry and the source of truth:

- `reserved` lists the root-level routes owned by this site.
- `projects` lists the repositories whose Pages sites are served at `/<repo>/`.

## Current map

| Path | Owner |
| --- | --- |
| `/` | `yutna.github.io` |
| `/about/` | reserved for the user site |
| `/work/` | reserved for the user site |
| `/writing/` | reserved for the user site |
| `/contact/` | reserved for the user site |
| `/assets/` | reserved for the user site |
| `/404.html` | reserved for the user site |
| `/robots.txt` | reserved for the user site |
| `/sitemap.xml` | reserved for the user site |
| `/fastwork-portfolio/` | `fastwork-portfolio` |
| `/software-delivery-assurance/` | `software-delivery-assurance` |

## Adding a Pages repository

1. Check the repository name against `reserved` and the existing `projects`.
2. If it collides, rename the repository or give that project its own custom
   subdomain instead of sharing the root.
3. Add the repository name to `projects` in `docs/routes.json` in the same
   change.
4. Run `npm run check:routes`. `npm run check:static` runs it after the build.

The check cannot discover repositories with the default `GITHUB_TOKEN`, so the
registry is deliberately manual. A scheduled audit would need a fine-grained
personal access token with access to every repository.

A project can avoid the shared root entirely by setting its own custom domain
(for example `fastwork.yutna.xyz`); in that case it does not need a path in this
registry.
