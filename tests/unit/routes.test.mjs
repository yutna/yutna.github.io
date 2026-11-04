import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeRoute, validateRoutes } from '../../scripts/lib/routes.mjs';

const current = {
  reserved: ['', 'about', 'work', 'writing', 'contact', 'assets'],
  projects: ['fastwork-portfolio', 'software-delivery-assurance']
};

test('normalizeRoute strips slashes and lowercases', () => {
  assert.equal(normalizeRoute('/About/'), 'about');
  assert.equal(normalizeRoute('//assets//'), 'assets');
  assert.equal(normalizeRoute(''), '');
  assert.equal(normalizeRoute('  work  '), 'work');
});

test('the current registry passes', () => {
  assert.deepEqual(validateRoutes(current, ['assets', '404.html', 'index.html']), []);
});

test('duplicate project paths fail', () => {
  assert.deepEqual(
    validateRoutes({ reserved: [''], projects: ['about', 'About'] }),
    ['duplicate project route: about']
  );
});

test('a project path cannot be reserved', () => {
  assert.deepEqual(
    validateRoutes({ reserved: ['about'], projects: ['about'] }),
    ['project route about collides with a reserved route']
  );
});

test('a project path cannot shadow a built top-level path', () => {
  assert.deepEqual(
    validateRoutes({ reserved: [''], projects: ['assets'] }, ['assets']),
    [
      'project route assets collides with a built top-level path'
    ]
  );
});

test('an empty or multi-segment project path fails', () => {
  assert.deepEqual(
    validateRoutes({ reserved: [''], projects: ['', 'work/about'] }),
    [
      'project routes cannot be empty',
      'project route must be one segment: work/about'
    ]
  );
});

test('invalid input fails without throwing', () => {
  assert.deepEqual(validateRoutes(/** @type {never} */ (null)), ['routes must be an object']);
  assert.deepEqual(
    validateRoutes(/** @type {never} */ ({ reserved: 'about', projects: 'work' })),
    ['reserved must be an array', 'projects must be an array']
  );
});
