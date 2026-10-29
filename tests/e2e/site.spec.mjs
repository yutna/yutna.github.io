// @ts-check
import { expect, test } from '@playwright/test';

/**
 * @param {import('@playwright/test').Page} page
 * @returns {string[]}
 */
const consoleErrors = (page) => {
  /** @type {string[]} */
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

test('the homepage carries the foundation metadata', async ({ page }) => {
  const errors = consoleErrors(page);
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Yutthana Siphuengchai/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Yutthana Siphuengchai/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://yutna.github.io/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(errors).toEqual([]);
});

test('the site loads no third-party runtime code', async ({ page }) => {
  /** @type {string[]} */
  const external = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== 'http://127.0.0.1:4173') {
      external.push(request.url());
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(external).toEqual([]);
});

test('the skip link is the first tab stop and targets the main landmark', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('a.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('#main')).toBeVisible();
  expect(new URL(page.url()).hash).toBe('#main');
});

test('the page does not scroll horizontally', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('an unknown path returns the built 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/Page not found/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
