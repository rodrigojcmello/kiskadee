// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { acquirePointerModality } from './pointerModality.ts';

function pointer(type: string, pointerType: string, buttons = 0) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    buttons: { value: buttons }
  });
  document.body.dispatchEvent(event);
}

describe('pointer modality', () => {
  it('keeps touch hover suppressed after release, compatibility mouse events and keyboard focus', () => {
    const release = acquirePointerModality();
    pointer('pointerdown', 'touch', 1);
    pointer('pointerup', 'touch');
    document.body.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(document.documentElement.getAttribute('data-k-input')).toBe('touch');
    pointer('pointermove', 'mouse');
    expect(document.documentElement.hasAttribute('data-k-input')).toBe(false);
    button.remove();
    release();
  });

  it('shares listeners across roots and removes them only after the last consumer', () => {
    const releaseA = acquirePointerModality();
    const releaseB = acquirePointerModality();
    releaseA();
    releaseA();
    pointer('pointerdown', 'touch', 1);
    expect(document.documentElement.getAttribute('data-k-input')).toBe('touch');
    releaseB();
    pointer('pointerdown', 'touch', 1);
    expect(document.documentElement.hasAttribute('data-k-input')).toBe(false);
  });

  it('supports pen hover and touch cancellation without clearing focus or selection', () => {
    const release = acquirePointerModality();
    pointer('pointerdown', 'touch', 1);
    pointer('pointercancel', 'touch');
    expect(document.documentElement.getAttribute('data-k-input')).toBe('touch');
    pointer('pointermove', 'pen');
    expect(document.documentElement.hasAttribute('data-k-input')).toBe(false);
    release();
  });
});
