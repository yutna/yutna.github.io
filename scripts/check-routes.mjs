// @ts-check
/**
 * Check the route registry against the built site. Fails when a project path
 * overlaps a reserved route or a top-level path in `_site`.
 */

import { readFile, readdir } from 'node:fs/promises';
import { validateRoutes } from './lib/routes.mjs';

const ROUTES = 'docs/routes.json';
const SITE = '_site';

try {
  /** @type {import('./lib/routes.mjs').Routes} */
  const routes = JSON.parse(await readFile(ROUTES, 'utf8'));
  const sitePaths = await readdir(SITE);
  const failures = validateRoutes(routes, sitePaths);

  if (failures.length > 0) {
    console.error(`Route checks failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Route checks passed: ${routes.projects.length} project paths, ` +
      `${routes.reserved.length} reserved.`
  );
} catch (error) {
  console.error(
    `Route checks failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
