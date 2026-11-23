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
  const host = document.createElement('div');
  host.dataset.showcaseTransitionHost = '';
  host.append(content, chrome);
  document.body.append(host);
  playWowTransition();
  expect(host.classList.contains('s-wow')).toBe(true);
  expect(chrome.classList.contains('s-wow')).toBe(false);
  expect(document.documentElement.classList.contains('s-wow')).toBe(false);
  content.className = 's-content new-surface-color';
  expect(content.matches('.s-wow .s-content')).toBe(true);
  expect(chrome.matches('.s-wow .s-content, .s-wow .s-content *')).toBe(false);
  vi.advanceTimersByTime(600);
  playWowTransition();
  vi.advanceTimersByTime(300);
  expect(host.classList.contains('s-wow')).toBe(true);
  vi.advanceTimersByTime(600);
  expect(host.classList.contains('s-wow')).toBe(false);
});
