// @vitest-environment jsdom

import type { Manifest } from '@kiskadee/web-builder/types';
import { afterEach, expect, it, vi } from 'vitest';
import { clearBuildArtifactCache } from './build-artifacts.client';

const style = vi.hoisted(() => ({
  prepare: vi.fn(async (href: string) => {
    const link = document.createElement('link');
    link.href = href;
    return link;
  })
}));
vi.mock('@/hooks/use-stylesheet-manager', () => ({ prepareStylesheet: style.prepare }));

import { prepareComponentResources } from './component-resources.client';

afterEach(() => {
  vi.unstubAllGlobals();
  clearBuildArtifactCache();
  style.prepare.mockClear();
});
it('loads 15 of 2,000 components, deduplicates instances and never asks for aggregate resources', async () => {
  const components = Object.fromEntries(
    Array.from({ length: 2000 }, (_, i) => [
      `component${i}`,
      { artifacts: { metadata: `components/component${i}.json` } }
    ])
  );
  const manifest = { components, revision: 'synthetic-2000' } as unknown as Manifest;
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url);
      const name = url.match(/component\d+/)?.[0];
      if (url.includes('/components/'))
        return new Response(
          JSON.stringify({
            component: name,
            sizeSupport: { sizes: ['md:1'] },
            resources: {
              core: `class-maps/${name}.json`,
              styles: [{ path: `styles/${name}.css`, sha256: 'a'.repeat(64), order: 0 }],
              palettes: {}
            }
          })
        );
      return new Response(
        JSON.stringify({ component: name, classMap: { e1: { s: { 'md:1': 'size' } } } })
      );
    })
  );
  const first = Array.from({ length: 15 }, (_, i) =>
    prepareComponentResources('synthetic', manifest, `component${i}`, 'default', 'light')
  );
  expect(prepareComponentResources('synthetic', manifest, 'component0', 'default', 'light')).toBe(
    first[0]
  );
  await Promise.all(first);
  expect(calls).toHaveLength(30);
  expect(new Set(calls.map((url) => url.match(/component\d+/)?.[0])).size).toBe(15);
  expect(calls.some((url) => /core\.kiskadee|global|schema|component1999/.test(url))).toBe(false);
  expect(style.prepare).toHaveBeenCalledTimes(15);
});
it('does not expose metadata until CSS is ready, and retries a rejected resource', async () => {
  const manifest = {
    revision: 'retry',
    components: { button: { artifacts: { metadata: 'components/button.json' } } }
  } as Manifest;
  let release: () => void = () => {};
  style.prepare.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve(document.createElement('link'));
      })
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            component: 'button',
            sizeSupport: { sizes: ['md:1'] },
            resources: { styles: [{ path: 'styles/one.css', sha256: 'a'.repeat(64), order: 0 }] }
          })
        )
    )
  );
  let ready = false;
  const pending = prepareComponentResources('retry', manifest, 'button', 'default', 'light').then(
    () => {
      ready = true;
    }
  );
  await vi.waitFor(() => expect(style.prepare).toHaveBeenCalledTimes(1));
  expect(ready).toBe(false);
  release();
  await pending;
  style.prepare.mockRejectedValueOnce(new Error('offline'));
  await expect(
    prepareComponentResources(
      'retry',
      { ...manifest, revision: 'retry2' },
      'button',
      'default',
      'light'
    )
  ).rejects.toThrow('offline');
  await expect(
    prepareComponentResources(
      'retry',
      { ...manifest, revision: 'retry2' },
      'button',
      'default',
      'light'
    )
  ).resolves.toBeDefined();
  expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
});
