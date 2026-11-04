// @ts-check
/**
 * Pure rules for the route registry. The registry decides which root-level
 * paths belong to the user site and which belong to project repositories.
 */

/**
 * @typedef {{ reserved: string[], projects: string[] }} Routes
 */

/**
 * Normalize a route or repository name to a single lower-case segment.
 *
 * @param {string} value
 * @returns {string}
 */
export const normalizeRoute = (value) =>
  value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

/**
 * Return every reason the registry cannot be used. An empty list means the
 * registry is valid. `sitePaths` are the top-level entries in the built site;
 * a project path that matches one of them would shadow a user-site route.
 *
 * @param {Routes} routes
 * @param {string[]} [sitePaths]
 * @returns {string[]}
 */
export const validateRoutes = (routes, sitePaths = []) => {
  if (!routes || typeof routes !== 'object') return ['routes must be an object'];

  /** @type {string[]} */
  const failures = [];
  const reserved = new Set();
  const projects = new Set();
  const built = new Set(
    sitePaths
      .filter((value) => typeof value === 'string')
      .map(normalizeRoute)
      .filter((value) => value !== '')
  );

  if (!Array.isArray(routes.reserved)) {
    failures.push('reserved must be an array');
  } else {
    for (const value of routes.reserved) {
      if (typeof value !== 'string') {
        failures.push('reserved entries must be strings');
        continue;
      }

      const route = normalizeRoute(value);
      if (reserved.has(route)) {
        failures.push(`duplicate reserved route: ${route === '' ? '/' : route}`);
      }
      reserved.add(route);
    }
  }

  if (!Array.isArray(routes.projects)) {
    failures.push('projects must be an array');
    return failures;
  }

  for (const value of routes.projects) {
    if (typeof value !== 'string') {
      failures.push('project entries must be strings');
      continue;
    }

    const route = normalizeRoute(value);
    if (route === '') {
      failures.push('project routes cannot be empty');
      continue;
    }
    if (route.includes('/')) {
      failures.push(`project route must be one segment: ${value}`);
      continue;
    }
    if (route === '.' || route === '..') {
      failures.push(`invalid project route: ${value}`);
      continue;
    }
    if (projects.has(route)) {
      failures.push(`duplicate project route: ${route}`);
      continue;
    }

    projects.add(route);

    if (reserved.has(route)) {
      failures.push(`project route ${route} collides with a reserved route`);
    }
    if (built.has(route)) {
      failures.push(`project route ${route} collides with a built top-level path`);
    }
  }

  return failures;
};
