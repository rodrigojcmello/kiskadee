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
it('reuses matching SSR CSS and replaces an integrity mismatch before becoming ready', async () => {
  const hash = '0'.repeat(64);
  const wrong = document.createElement('link');
  wrong.rel = 'stylesheet';
  wrong.href = '/ssr-wrong.css';
  wrong.integrity = 'sha256-wrong';
  Object.defineProperty(wrong, 'sheet', { value: {} });
  document.head.append(wrong);
  const pending = prepareStylesheet('/ssr-wrong.css', hash);
  const right = document.querySelector<HTMLLinkElement>('link[href="/ssr-wrong.css"]')!;
  expect(right).not.toBe(wrong);
  expect(right.integrity).toBe(`sha256-${btoa('\0'.repeat(32))}`);
  right.dispatchEvent(new Event('load'));
  await expect(pending).resolves.toBe(right);
});

it('keeps common sheets attached and makes repeated activation a DOM no-op', async () => {
  const { activateComponentStylesheets } = await import('./use-stylesheet-manager');
  const make = (order: number) => {
    const link = document.createElement('link');
    link.dataset.kOrder = String(order);
    link.media = 'not all';
    document.head.append(link);
    return link;
  };
  const common = make(10);
  const old = make(30);
  activateSelectionStylesheets([common, old]);
  const next = make(20);
  const observer = new MutationObserver(() => {});
  observer.observe(document.head, { childList: true, subtree: true, attributes: true });
  activateSelectionStylesheets([common, next]);
  const records = observer.takeRecords();
  expect(records.some((r) => [...r.removedNodes].includes(common))).toBe(false);
  expect(records.some((r) => r.target === common)).toBe(false);
  expect([...document.head.children]).toEqual([common, next, old]);
  activateSelectionStylesheets([common, next]);
  activateComponentStylesheets([common, next]);
  expect(observer.takeRecords()).toEqual([]);
  observer.disconnect();
});
