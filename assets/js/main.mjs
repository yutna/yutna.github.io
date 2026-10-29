// @ts-check
/**
 * Progressive enhancement for the Layer 00 deck.
 *
 * The markup already works without this file: all four layers are visible and
 * every one is a button. The script adds two things around that foundation —
 * a single selected layer, and a pointer tilt on fine pointers. Both are
 * effects, so they stay here in the shell; the decisions live in
 * `deck-core.mjs`.
 */

import { selectionForKey, tiltFromPoint } from './deck-core.mjs';

/**
 * @param {HTMLButtonElement} button
 * @returns {string} a sentence a screen reader can announce
 */
const layerAnnouncement = (button) => {
  const name = button.querySelector('.layer__name')?.textContent?.trim() ?? '';
  const status = button.querySelector('.layer__status')?.textContent?.trim() ?? '';
  return [name, status].filter((part) => part !== '').join('. ');
};

/**
 * @param {HTMLElement} deck
 */
const setupSelection = (deck) => {
  const buttons = [...deck.querySelectorAll('[data-layer]')].filter(
    (element) => element instanceof HTMLButtonElement
  );
  if (buttons.length === 0) return;

  const status = deck.querySelector('[data-deck-status]');

  /**
   * @param {number} index
   * @param {boolean} moveFocus
   */
  const select = (index, moveFocus) => {
    buttons.forEach((button, position) => {
      const active = position === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const active = buttons[index];
    if (!active) return;
    if (status) status.textContent = layerAnnouncement(active);
    if (moveFocus) active.focus();
  };

  deck.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-layer]');
    if (!(button instanceof HTMLButtonElement)) return;

    const index = buttons.indexOf(button);
    if (index >= 0) select(index, false);
  });

  deck.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-layer]');
    if (!(button instanceof HTMLButtonElement)) return;

    const current = buttons.indexOf(button);
    const next = selectionForKey(event.key, current, buttons.length);
    if (next === null) return;

    event.preventDefault();
    select(next, true);
  });
};

/**
 * @param {HTMLElement} deck
 */
const setupTilt = (deck) => {
  const stage = deck.querySelector('[data-deck-stage]');
  if (!(stage instanceof HTMLElement)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  let frame = 0;
  /** @type {import('./deck-core.mjs').Tilt | null} */
  let pendingTilt = null;

  const applyPendingTilt = () => {
    frame = 0;
    if (!pendingTilt) return;
    stage.style.setProperty('--tilt-x', pendingTilt.x.toFixed(2));
    stage.style.setProperty('--tilt-y', pendingTilt.y.toFixed(2));
    pendingTilt = null;
  };

  /** @param {import('./deck-core.mjs').Tilt} tilt */
  const scheduleTilt = (tilt) => {
    pendingTilt = tilt;
    if (frame === 0) frame = window.requestAnimationFrame(applyPendingTilt);
  };

  deck.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;

    const bounds = stage.getBoundingClientRect();
    scheduleTilt(
      tiltFromPoint(
        { width: bounds.width, height: bounds.height },
        { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      )
    );
  });

  deck.addEventListener('pointerleave', () => scheduleTilt({ x: 0, y: 0 }));

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) scheduleTilt({ x: 0, y: 0 });
  });
};

for (const deck of document.querySelectorAll('[data-deck]')) {
  if (!(deck instanceof HTMLElement)) continue;
  setupSelection(deck);
  setupTilt(deck);
}
