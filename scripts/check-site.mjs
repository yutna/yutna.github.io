// @ts-check
/**
 * Checks the built site in `_site` without a browser.
 *
 * Fails when a page loses its metadata, a link points at a file that was not
 * built, the noindex stage and `robots.txt` disagree, or a third-party runtime
 * request sneaks in.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { load } from 'cheerio';
import {
  containsLiquid,
  containsNoindex,
  containsThai,
  fileCandidates,
  isSkippableUrl,
  parseSrcset,
  plural,
  pngSize
} from './lib/site.mjs';

const SITE = '_site';
const ORIGIN = 'https://yutna.github.io';
const TITLE_LIMIT = 65;
const DESCRIPTION_LIMIT = 160;
const CSS_BUDGET = 40 * 1024;
const JS_BUDGET = 15 * 1024;
const OG_SIZE = { width: 1200, height: 630 };

/** @type {string[]} */
const failures = [];
/** @type {Array<{ label: string, noindex: boolean }>} */
const pages = [];

/**
 * @param {string} message
 */
const fail = (message) => {
  failures.push(message);
};

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
const walk = async (directory) => {
  /** @type {string[]} */
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
};

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const exists = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

/**
 * The public URL of a built HTML file.
 *
 * @param {string} file
 * @returns {string}
 */
const pageUrl = (file) => {
  const path = relative(SITE, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`;
  return `/${path}`;
};

/**
 * @param {string} pathname
 * @returns {Promise<boolean>}
 */
const targetExists = async (pathname) => {
  try {
    for (const candidate of fileCandidates(pathname)) {
      if (await exists(join(SITE, candidate))) return true;
    }
  } catch {
    return false;
  }
  return false;
};

/**
 * @param {string} value
 * @param {string} from
 * @returns {URL | null} null when the URL leaves the site
 */
const resolveInternal = (value, from) => {
  try {
    const url = new URL(value, new URL(from, ORIGIN));
    return url.origin === ORIGIN ? url : null;
  } catch {
    return null;
  }
};

/**
 * @param {string} file
 * @param {string} html
 * @returns {Promise<{ label: string, noindex: boolean }>}
 */
const checkPage = async (file, html) => {
  const label = relative(SITE, file).split(sep).join('/');
  const $ = load(html);
  const url = pageUrl(file);
  const isNotFound = url === '/404.html';

  if (containsThai(html)) fail(`${label}: Thai script reached the output`);
  if (containsLiquid(html)) fail(`${label}: unrendered Liquid reached the output`);

  if ($('html').attr('lang') !== 'en') fail(`${label}: html lang is not "en"`);
  if ($('meta[name="viewport"]').length !== 1) fail(`${label}: missing viewport meta`);

  const title = $('title').first().text().trim();
  if (title === '') fail(`${label}: empty title`);
  else if (title.length > TITLE_LIMIT) fail(`${label}: title is ${title.length} characters (limit ${TITLE_LIMIT})`);

  const description = $('meta[name="description"]').attr('content')?.trim() ?? '';
  if (description === '') fail(`${label}: empty meta description`);
  else if (description.length > DESCRIPTION_LIMIT) {
    fail(`${label}: description is ${description.length} characters (limit ${DESCRIPTION_LIMIT})`);
  }

  const canonical = $('link[rel="canonical"]').attr('href');
  const expectedCanonical = new URL(url, ORIGIN).href;
  if (canonical !== expectedCanonical) {
    fail(`${label}: canonical is ${canonical ?? 'missing'}, expected ${expectedCanonical}`);
  }

  for (const property of ['og:title', 'og:description', 'og:url']) {
    if (($(`meta[property="${property}"]`).attr('content') ?? '') === '') {
      fail(`${label}: missing ${property}`);
    }
  }
  if ($('script[type="application/ld+json"]').length === 0) fail(`${label}: missing JSON-LD`);

  if ($('h1').length !== 1) fail(`${label}: expected exactly one h1, found ${$('h1').length}`);

  $('img').each((_, element) => {
    if ($(element).attr('alt') === undefined) {
      fail(`${label}: img without alt: ${$(element).attr('src') ?? '(no src)'}`);
    }
  });

  $('a[target="_blank"]').each((_, element) => {
    const rel = ($(element).attr('rel') ?? '').split(/\s+/);
    if (!rel.includes('noopener')) {
      fail(`${label}: target=_blank without rel=noopener: ${$(element).attr('href') ?? '(no href)'}`);
    }
  });

  const robotsContent = $('meta[name="robots"]').attr('content');
  const noindex = containsNoindex(robotsContent);
  if (isNotFound && !noindex) fail(`${label}: the 404 page must stay noindex`);

  /** @type {Array<{ value: string, label: string }>} */
  const targets = [];
  $('a[href]').each((_, element) => {
    const value = $(element).attr('href') ?? '';
    if (isSkippableUrl(value)) return;
    if (/^javascript:/i.test(value)) {
      fail(`${label}: javascript: link`);
      return;
    }
    targets.push({ value, label: 'link' });
  });
  $('link[href]').each((_, element) => {
    targets.push({ value: $(element).attr('href') ?? '', label: 'stylesheet' });
  });
  $('script[src]').each((_, element) => {
    targets.push({ value: $(element).attr('src') ?? '', label: 'script' });
  });
  $('img[src]').each((_, element) => {
    targets.push({ value: $(element).attr('src') ?? '', label: 'image' });
  });
  $('img[srcset], source[srcset]').each((_, element) => {
    for (const value of parseSrcset($(element).attr('srcset'))) {
      targets.push({ value, label: 'srcset' });
    }
  });

  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) targets.push({ value: ogImage, label: 'og image' });
  if (url === '/' && !ogImage) fail(`${label}: missing og:image`);

  for (const target of targets) {
    const isRuntime = target.label === 'script' || target.label === 'stylesheet';
    const resolved = resolveInternal(target.value, url);
    if (!resolved) {
      if (isRuntime) fail(`${label}: third-party ${target.label} request: ${target.value}`);
      continue;
    }
    if (!(await targetExists(resolved.pathname))) {
      fail(`${label}: ${target.label} points at a missing file: ${target.value}`);
    }
  }

  return { label, noindex };
};

const allFiles = await walk(SITE);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html')).sort();

for (const file of htmlFiles) {
  pages.push(await checkPage(file, await readFile(file, 'utf8')));
}

if (pages.length === 0) fail('no HTML pages were built');

const contentPages = pages.filter((page) => page.label !== '404.html');
if (contentPages.length === 0) fail('no content page besides 404 was built');
const indexable = contentPages.every((page) => !page.noindex);
const noindexed = contentPages.every((page) => page.noindex);
if (!indexable && !noindexed) fail('pages disagree about noindex: some are indexable, some are not');

const robotsPath = join(SITE, 'robots.txt');
if (!(await exists(robotsPath))) {
  fail('missing robots.txt');
} else {
  const robots = await readFile(robotsPath, 'utf8');
  if (containsThai(robots)) fail('robots.txt: Thai script reached the output');
  if (!/^User-agent:\s*\*/im.test(robots)) fail('robots.txt: missing the wildcard user agent');
  if (!/^Allow:\s*\/\s*$/im.test(robots)) fail('robots.txt: missing "Allow: /"');
  if (/^Disallow:\s*\/\s*$/im.test(robots)) {
    fail('robots.txt: "Disallow: /" blocks crawlers from seeing noindex');
  }
  if (/<html/i.test(robots)) fail('robots.txt: rendered as HTML');
  const advertisesSitemap = /^Sitemap:\s*\S+/im.test(robots);
  if (indexable && !advertisesSitemap) fail('robots.txt: indexing is on but the sitemap is not advertised');
  if (!indexable && advertisesSitemap) fail('robots.txt: the sitemap is advertised while the site is noindex');
}

const sitemapPath = join(SITE, 'sitemap.xml');
if (!(await exists(sitemapPath))) {
  fail('missing sitemap.xml');
} else {
  const sitemap = await readFile(sitemapPath, 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locations.includes(`${ORIGIN}/404.html`)) fail('sitemap.xml: the 404 page must not be listed');
  const expected = contentPages.map((page) => page.label);
  for (const page of expected) {
    const url = new URL(pageUrl(join(SITE, page)), ORIGIN).href;
    if (!locations.includes(url)) fail(`sitemap.xml: missing ${url}`);
  }
}

const ogPath = join(SITE, 'assets/images/og.png');
if (!(await exists(ogPath))) {
  fail('missing assets/images/og.png');
} else {
  const size = pngSize(await readFile(ogPath));
  if (!size || size.width !== OG_SIZE.width || size.height !== OG_SIZE.height) {
    fail(
      `og.png is ${size ? `${size.width}x${size.height}` : 'not a PNG'}, ` +
        `expected ${OG_SIZE.width}x${OG_SIZE.height}`
    );
  }
}

/**
 * @param {string[]} files
 * @returns {Promise<number>}
 */
const totalBytes = async (files) => {
  const sizes = await Promise.all(files.map(async (file) => (await stat(file)).size));
  return sizes.reduce((total, size) => total + size, 0);
};

const cssFiles = allFiles.filter((file) => file.endsWith('.css'));
const jsFiles = allFiles.filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
const cssBytes = await totalBytes(cssFiles);
const jsBytes = await totalBytes(jsFiles);
if (cssBytes > CSS_BUDGET) {
  fail(`CSS is ${(cssBytes / 1024).toFixed(1)} KB (budget ${CSS_BUDGET / 1024} KB)`);
}
if (jsBytes > JS_BUDGET) {
  fail(`JavaScript is ${(jsBytes / 1024).toFixed(1)} KB (budget ${JS_BUDGET / 1024} KB)`);
}

if (!(await exists(join(SITE, '.nojekyll')))) fail('missing .nojekyll');

if (failures.length) {
  console.error(`Static checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Static checks passed: ${plural(pages.length, 'page')}, ` +
    `${indexable ? 'indexing on' : 'indexing off'}, ${plural(allFiles.length, 'file')}, ` +
    `CSS ${(cssBytes / 1024).toFixed(1)} KB, JS ${(jsBytes / 1024).toFixed(1)} KB.`
);
