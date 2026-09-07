/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('@/registry/css.registry', () => ({ cssPaths: {} }));

import { activateSelectionStylesheets, prepareStylesheet } from './use-stylesheet-manager';

afterEach(() => {
  document.head.innerHTML = '';
});
it('waits for load, stages CSS and changes activation only on commit', async () => {
  const old = document.createElement('link');
  old.dataset.kSelection = 'true';
  old.media = 'all';
  document.head.append(old);
  const promise = prepareStylesheet('/ready.css');
  const link = document.querySelector<HTMLLinkElement>('link[href="/ready.css"]')!;
  expect(link.media).toBe('not all');
  expect(old.media).toBe('all');
  expect(prepareStylesheet('/ready.css')).toBe(promise);
  link.dispatchEvent(new Event('load'));
  expect(await promise).toBe(link);
  activateSelectionStylesheets([link]);
  expect(link.media).toBe('all');
  expect(old.media).toBe('not all');
});
it('evicts rejected sheets and recreates them on retry', async () => {
  const promise = prepareStylesheet('/retry.css');
  const first = document.querySelector('link[href="/retry.css"]')!;
  first.dispatchEvent(new Event('error'));
  await expect(promise).rejects.toThrow('Failed to load stylesheet');
  const retry = prepareStylesheet('/retry.css');
  const second = document.querySelector('link[href="/retry.css"]')!;
  expect(second).not.toBe(first);
  second.dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBe(second);
});
