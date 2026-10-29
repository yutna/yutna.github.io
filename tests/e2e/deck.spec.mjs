// @ts-check
import { expect, test } from '@playwright/test';

const LAYERS = 4;

/**
 * @param {import('@playwright/test').Page} page
 */
const openHome = async (page) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
};

test('the deck offers four layers with the first selected', async ({ page }) => {
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await openHome(page);

  await expect(page.locator('[data-layer]')).toHaveCount(LAYERS);
  await expect(page.locator('[data-layer="0"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-layer="0"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-layer="1"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-deck-status]')).toHaveText('');
  expect(errors).toEqual([]);
});

test('clicking a layer selects it and announces the change', async ({ page }) => {
  await openHome(page);

  await page.locator('[data-layer="3"]').click();

  await expect(page.locator('[data-layer="3"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-layer="3"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-layer="0"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-deck-status]')).toHaveText('Contact. Coming in Layer 04');
});

test('arrow keys move the selection and the focus', async ({ page }) => {
  await openHome(page);

  await page.locator('[data-layer="0"]').focus();
  await page.keyboard.press('ArrowRight');

  await expect(page.locator('[data-layer="1"]')).toBeFocused();
  await expect(page.locator('[data-layer="1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-deck-status]')).toHaveText('Writing. Coming in Layer 02');

  await page.keyboard.press('End');
  await expect(page.locator('[data-layer="3"]')).toBeFocused();
  await expect(page.locator('[data-deck-status]')).toHaveText('Contact. Coming in Layer 04');

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-layer="0"]')).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-layer="3"]')).toBeFocused();
});

test('a fine pointer tilts the deck', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch devices do not tilt the deck');

  await openHome(page);
  const stage = page.locator('[data-deck-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('the deck has no bounding box');

  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.85);

  await expect
    .poll(async () => stage.evaluate((element) => element.style.getPropertyValue('--tilt-x')))
    .not.toBe('');

  const tilt = await stage.evaluate((element) => ({
    x: Number(element.style.getPropertyValue('--tilt-x')),
    y: Number(element.style.getPropertyValue('--tilt-y'))
  }));
  expect(tilt.x).toBeGreaterThan(0.5);
  expect(tilt.y).toBeGreaterThan(0.5);
});

test('reduced motion removes the tilt and the entrance movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);

  const stage = page.locator('[data-deck-stage]');
  await stage.hover();
  await page.mouse.move(1, 1);
  await page.mouse.move(600, 400);

  const transform = await stage.evaluate((element) => getComputedStyle(element).transform);
  expect(transform).toBe('none');

  const duration = await page
    .locator('.deck')
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThan(0.001);
});

test('the deck is a flat two-column grid at 390 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);

  const perspective = await page
    .locator('.deck')
    .evaluate((element) => getComputedStyle(element).perspective);
  expect(perspective).toBe('none');

  const columns = await page
    .locator('[data-deck-stage]')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(2);
});

test('the page fits at 390, 768, and 1440 pixels', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});
