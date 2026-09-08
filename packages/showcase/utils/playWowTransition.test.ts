/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from 'vitest';
import { playWowTransition } from './playWowTransition';

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  document.body.replaceChildren();
});

it('scopes the effect to content and lets the latest trigger own expiration', () => {
  vi.useFakeTimers();
  const content = document.createElement('main');
  content.className = 's-content';
  const chrome = document.createElement('aside');
  document.body.append(content, chrome);
  playWowTransition();
  expect(content.classList.contains('s-wow')).toBe(true);
  expect(chrome.classList.contains('s-wow')).toBe(false);
  expect(document.documentElement.classList.contains('s-wow')).toBe(false);
  vi.advanceTimersByTime(600);
  playWowTransition();
  vi.advanceTimersByTime(300);
  expect(content.classList.contains('s-wow')).toBe(true);
  vi.advanceTimersByTime(600);
  expect(content.classList.contains('s-wow')).toBe(false);
});
