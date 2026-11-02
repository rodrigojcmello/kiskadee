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
  const manifest = {
    formatVersion: 3,
    components,
    revision: 'synthetic-2000'
  } as unknown as Manifest;
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url);
      const name = url.match(/component\d+/)?.[0];
      if (url.includes('/components/'))
        return new Response(
          JSON.stringify({
            formatVersion: 3,
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
        JSON.stringify({
          formatVersion: 3,
          component: name,
          classMap: { e1: { s: { 'md:1': 'size' } } }
        })
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
    formatVersion: 3,
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
            formatVersion: 3,
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

it('discovers variant capabilities from metadata without loading class maps or CSS', async () => {
  const { loadComponentMetadata } = await import('./component-resources.client');
  const manifest = {
    formatVersion: 3,
    revision: 'metadata-only',
    components: { button: { artifacts: { metadata: 'components/button.json' } } }
  } as Manifest;
  const fetcher = vi.fn(
    async (_url: string) =>
      new Response(
        JSON.stringify({
          formatVersion: 3,
          component: 'button',
          sizeSupport: { sizes: ['md:1'] },
          capabilities: {
            colorVariants: { alternative: { 'default.light': { onVivid: { primary: ['high'] } } } }
          },
          resources: {
            core: 'button.core.json',
            styles: [{ path: 'button.css', sha256: 'a'.repeat(64), order: 0 }],
            palettes: { 'default.light': 'button.palette.json' }
          }
        })
      )
  );
  vi.stubGlobal('fetch', fetcher);
  const [first, second] = await Promise.all([
    loadComponentMetadata('discovery', manifest, 'button'),
    loadComponentMetadata('discovery', manifest, 'button')
  ]);
  expect(first).toBe(second);
  expect(
    first?.capabilities?.colorVariants?.alternative?.['default.light']?.onVivid?.primary
  ).toEqual(['high']);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(style.prepare).not.toHaveBeenCalled();
  expect(fetcher.mock.calls[0]?.[0]).toContain('components/button.json');
});

it.each([
  undefined,
  2
])('rejects manifest format %j before requesting dependent artifacts', async (formatVersion) => {
  const { loadComponentMetadata } = await import('./component-resources.client');
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  await expect(
    loadComponentMetadata(
      'old',
      {
        formatVersion,
        components: { button: { artifacts: { metadata: 'button.json' } } }
      } as unknown as Manifest,
      'button'
    )
  ).rejects.toThrow('Unsupported manifest format');
  await expect(
    prepareComponentResources(
      'old',
      {
        formatVersion,
        components: { button: { artifacts: { metadata: 'button.json' } } }
      } as unknown as Manifest,
      'button',
      'default',
      'light'
    )
  ).rejects.toThrow('Unsupported manifest format');
  expect(fetcher).not.toHaveBeenCalled();
});
