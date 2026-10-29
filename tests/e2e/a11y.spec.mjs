// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 */
const analyze = async (page, path) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
};

/**
 * @param {import('axe-core').AxeResults['violations']} violations
 */
const seriousViolations = (violations) =>
  violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');

test('the homepage has no serious or critical WCAG A/AA violations', async ({ page }) => {
  const results = await analyze(page, '/');
  expect(seriousViolations(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('the 404 page has no serious or critical WCAG A/AA violations', async ({ page }) => {
  const results = await analyze(page, '/missing-page');
  expect(seriousViolations(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('the homepage is accessible at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  const results = await analyze(page, '/');
  expect(seriousViolations(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});
