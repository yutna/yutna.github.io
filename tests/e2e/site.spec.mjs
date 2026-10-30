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
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /software engineer in Chiangmai/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://yutna.github.io/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://yutna.github.io/assets/images/og.png'
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
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

/**
 * @param {import('@playwright/test').Locator} locator
 */
const footerType = (locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      color: style.color
    };
  });

test('the contact CTA opens the Fastwork profile in a new tab', async ({ page }) => {
  await page.goto('/');

  const cta = page.locator('.button--primary');
  await expect(cta).toHaveAttribute('href', 'https://fastwork.com/user/yutna');
  await expect(cta).toHaveAttribute('target', '_blank');
  await expect(cta).toHaveAttribute('rel', /noopener/);
  await expect(cta).toHaveAttribute('rel', /noreferrer/);
  await expect(cta).toHaveAttribute('aria-label', /Fastwork/);
});

test('the footer note and meta share one type style', async ({ page }) => {
  await page.goto('/');

  const note = await footerType(page.locator('.site-footer__note'));
  const meta = await footerType(page.locator('.site-footer__meta'));
  expect(note).toEqual(meta);
});
