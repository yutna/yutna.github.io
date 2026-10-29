// @ts-check
/**
 * Pure decisions for the layer deck. This module never touches the DOM: the
 * caller reads bounds and keys, passes plain values in, and applies the
 * result. Keeping it that way is what lets the rules be tested without a
 * browser.
 */

/** @typedef {{ x: number, y: number }} Tilt */

/**
 * Round to two decimals so repeated pointer moves do not churn the DOM.
 *
 * @param {number} value
 * @returns {number}
 */
const round = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Turn a pointer position inside an element into a tilt in the range -1..1.
 * Positions outside the element are clamped, and a zero-sized element has no
 * meaningful centre, so it reports no tilt.
 *
 * @param {{ width: number, height: number }} bounds
 * @param {{ x: number, y: number }} point
 * @returns {Tilt}
 */
export const tiltFromPoint = (bounds, point) => {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0, y: 0 };
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return { x: 0, y: 0 };

  const x = (point.x - bounds.width / 2) / (bounds.width / 2);
  const y = (point.y - bounds.height / 2) / (bounds.height / 2);
  return { x: round(clamp(x, -1, 1)), y: round(clamp(y, -1, 1)) };
};

/**
 * The layer a key press selects, or null when the key belongs to someone else.
 * Arrow keys wrap, Home and End jump, and an empty deck selects nothing.
 *
 * @param {string} key
 * @param {number} current
 * @param {number} count
 * @returns {number | null}
 */
export const selectionForKey = (key, current, count) => {
  if (count <= 0 || current < 0 || current >= count) return null;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
};
