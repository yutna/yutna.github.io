import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  containsLiquid,
  containsNoindex,
  containsThai,
  fileCandidates,
  isSkippableUrl,
  parseSrcset,
  plural
} from '../../scripts/lib/site.mjs';

test('containsNoindex reads a robots directive', () => {
  assert.equal(containsNoindex('noindex, noarchive'), true);
  assert.equal(containsNoindex('NOINDEX'), true);
  assert.equal(containsNoindex('index, follow'), false);
  assert.equal(containsNoindex('max-snippet:-1, noindex'), true);
  assert.equal(containsNoindex(undefined), false);
});

test('isSkippableUrl ignores anchors and non-HTTP links', () => {
  for (const value of ['', '  ', '#main', 'mailto:yutthana.s@outlook.com', 'tel:+66123456789', 'data:image/png;base64,AA']) {
    assert.equal(isSkippableUrl(value), true, value);
  }
  assert.equal(isSkippableUrl('/about/'), false);
  assert.equal(isSkippableUrl('https://github.com/yutna'), false);
});

test('parseSrcset keeps only the URLs', () => {
  assert.deepEqual(parseSrcset('/a.png 1x, /b.png 2x'), ['/a.png', '/b.png']);
  assert.deepEqual(parseSrcset('  /a.png  '), ['/a.png']);
  assert.deepEqual(parseSrcset(''), []);
  assert.deepEqual(parseSrcset(undefined), []);
});

test('fileCandidates mirrors static hosting order', () => {
  assert.deepEqual(fileCandidates('/'), ['index.html']);
  assert.deepEqual(fileCandidates('/about/'), ['about/index.html']);
  assert.deepEqual(fileCandidates('/about'), ['about', 'about.html', 'about/index.html']);
  assert.deepEqual(fileCandidates('/assets/css/main.css'), ['assets/css/main.css']);
  assert.deepEqual(fileCandidates('/a%20b/'), ['a b/index.html']);
});

test('containsThai guards the English-only rule', () => {
  assert.equal(containsThai('Layer 00 — Foundation'), false);
  assert.equal(containsThai('เลเยอร์'), true);
});

test('containsLiquid finds unrendered tags', () => {
  assert.equal(containsLiquid('<p>{{ page.title }}</p>'), true);
  assert.equal(containsLiquid('<p>{% if x %}</p>'), true);
  assert.equal(containsLiquid('<p>plain</p>'), false);
});

test('plural stays readable at one', () => {
  assert.equal(plural(1, 'page'), '1 page');
  assert.equal(plural(2, 'page'), '2 pages');
  assert.equal(plural(0, 'file'), '0 files');
});
