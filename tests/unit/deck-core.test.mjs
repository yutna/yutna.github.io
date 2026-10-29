import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectionForKey, tiltFromPoint } from '../../assets/js/deck-core.mjs';

test('tiltFromPoint reports no tilt at the centre', () => {
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: 100, y: 50 }), { x: 0, y: 0 });
});

test('tiltFromPoint reaches the extremes at the corners', () => {
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: 0, y: 0 }), { x: -1, y: -1 });
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: 200, y: 100 }), { x: 1, y: 1 });
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: 200, y: 0 }), { x: 1, y: -1 });
});

test('tiltFromPoint clamps a pointer outside the element', () => {
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: -400, y: 300 }), { x: -1, y: 1 });
});

test('tiltFromPoint rounds so repeated moves do not churn the DOM', () => {
  const tilt = tiltFromPoint({ width: 300, height: 300 }, { x: 123.456, y: 76.543 });
  assert.deepEqual(tilt, { x: -0.18, y: -0.49 });
});

test('tiltFromPoint stays total for degenerate input', () => {
  assert.deepEqual(tiltFromPoint({ width: 0, height: 100 }, { x: 0, y: 0 }), { x: 0, y: 0 });
  assert.deepEqual(tiltFromPoint({ width: 200, height: 0 }, { x: 0, y: 0 }), { x: 0, y: 0 });
  assert.deepEqual(tiltFromPoint({ width: 200, height: 100 }, { x: Number.NaN, y: 0 }), { x: 0, y: 0 });
  assert.deepEqual(
    tiltFromPoint({ width: 200, height: 100 }, { x: Number.POSITIVE_INFINITY, y: 0 }),
    { x: 0, y: 0 }
  );
});

test('selectionForKey wraps in both directions', () => {
  assert.equal(selectionForKey('ArrowRight', 0, 4), 1);
  assert.equal(selectionForKey('ArrowRight', 3, 4), 0);
  assert.equal(selectionForKey('ArrowDown', 1, 4), 2);
  assert.equal(selectionForKey('ArrowLeft', 0, 4), 3);
  assert.equal(selectionForKey('ArrowLeft', 3, 4), 2);
  assert.equal(selectionForKey('ArrowUp', 2, 4), 1);
});

test('selectionForKey jumps with Home and End', () => {
  assert.equal(selectionForKey('Home', 2, 4), 0);
  assert.equal(selectionForKey('End', 1, 4), 3);
});

test('selectionForKey ignores keys and positions it does not own', () => {
  assert.equal(selectionForKey('Enter', 0, 4), null);
  assert.equal(selectionForKey('a', 0, 4), null);
  assert.equal(selectionForKey('Tab', 0, 4), null);
  assert.equal(selectionForKey('ArrowRight', -1, 4), null);
  assert.equal(selectionForKey('ArrowRight', 4, 4), null);
  assert.equal(selectionForKey('ArrowRight', 0, 0), null);
});
