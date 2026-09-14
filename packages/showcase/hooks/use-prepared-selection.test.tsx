/** @vitest-environment jsdom */

import { createElement, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { DesignSystemKey } from '../registry/registry-utils';
import { act, cleanup, renderHook, waitFor } from '../test-utils/react';

const fixtures = vi.hoisted(() => ({
  prepare: vi.fn(),
  wow: vi.fn(),
  activate: vi.fn(),
  json: vi.fn(async (path: string): Promise<unknown> => ({ key: path.split('/')[0] }))
}));
vi.mock('@/utils/brand-pack-loader.client', () => ({ loadBrandPack: vi.fn() }));
vi.mock('@/utils/playWowTransition', () => ({ playWowTransition: fixtures.wow }));
vi.mock('./use-stylesheet-manager', () => ({
  prepareSelectionStylesheets: fixtures.prepare,
  prepareStylesheet: vi.fn(async () => document.createElement('link')),
  activateSelectionStylesheets: fixtures.activate
}));
vi.mock('@/utils/build-artifacts.client', () => ({
  loadJsonFromBuild: fixtures.json
}));

import { usePreparedSelection } from './use-prepared-selection';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it('keeps the last selection through CSS failure, supports retry and ignores obsolete completion', async () => {
  let finishB: (links: HTMLLinkElement[]) => void = () => {};
  fixtures.prepare
    .mockResolvedValueOnce([])
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishB = resolve;
        })
    )
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([]);
  const view = renderHook(
    ({ designSystem }) =>
      usePreparedSelection({
        designSystem: designSystem as DesignSystemKey,
        segment: 'default',
        theme: 'light'
      }),
    { initialProps: { designSystem: 'A' } }
  );
  await waitFor(() => expect(view.result.current.prepared?.designSystem).toBe('A'));
  expect(fixtures.wow).not.toHaveBeenCalled();
  view.rerender({ designSystem: 'B' });
  expect(view.result.current.prepared?.designSystem).toBe('A');
  view.rerender({ designSystem: 'C' });
  await waitFor(() => expect(view.result.current.error).toBeInstanceOf(Error));
  expect(view.result.current.prepared?.designSystem).toBe('A');
  await act(async () => finishB([]));
  expect(view.result.current.prepared?.designSystem).toBe('A');
  expect(fixtures.wow).not.toHaveBeenCalled();
  act(() => view.result.current.retry());
  await waitFor(() => expect(view.result.current.prepared?.designSystem).toBe('C'));
  expect(fixtures.activate).toHaveBeenCalledTimes(2);
  expect(fixtures.wow).toHaveBeenCalledTimes(1);
});

it('waits for consumed component maps and supports retry without committing partial resources', async () => {
  fixtures.prepare.mockResolvedValue([]);
  let failPalette = true;
  fixtures.json.mockImplementation(async (path: string) => {
    path = path.split('?')[0];
    if (path.endsWith('manifest.json'))
      return {
        key: 'resources',
        version: '1',
        components: {
          button: {
            artifacts: {
              metadata: 'button.metadata.json',
              classMaps: {
                core: 'button.core.json',
                palettes: { 'default.light': 'button.palette.json' }
              }
            }
          }
        }
      };
    if (path.endsWith('global.kiskadee.json')) return {};
    if (path.endsWith('button.descriptor.json'))
      return { component: 'button', styles: [], classMap: 'button.palette.json' };
    if (path.endsWith('button.metadata.json'))
      return {
        component: 'button',
        options: {},
        sizeSupport: { sizes: ['md:1'] },
        resources: {
          styles: [],
          core: 'button.core.json',
          palettes: { 'default.light': 'button.descriptor.json' }
        }
      };
    if (path.split('?')[0].endsWith('button.palette.json') && failPalette)
      throw new Error('offline');
    return {
      component: 'button',
      classMap: {
        e1: path.split('?')[0].endsWith('button.core.json')
          ? { d: 'base' }
          : { c: { s: { neutral: { m: 'color' } } } }
      }
    };
  });
  const names = new Set(['button']);
  const view = renderHook(
    () =>
      usePreparedSelection(
        { designSystem: 'resources' as DesignSystemKey, segment: 'default', theme: 'light' },
        names
      ),
    { initialProps: {} }
  );
  await waitFor(() => expect(view.result.current.error).toBeInstanceOf(Error));
  expect(view.result.current.prepared).toBeUndefined();
  expect(fixtures.activate).not.toHaveBeenCalled();
  failPalette = false;
  act(() => view.result.current.retry());
  await waitFor(() =>
    expect(view.result.current.prepared?.classMaps).toEqual({
      button: { e1: { d: 'base', c: { s: { neutral: { m: 'color' } } } } }
    })
  );
});

it('activates each selection before descendant layout measurements', async () => {
  fixtures.json.mockImplementation(async (path: string) => ({ key: path.split('/')[0] }));
  const links = {
    A: [document.createElement('link')],
    B: [document.createElement('link')]
  };
  fixtures.prepare.mockImplementation(
    async ({ designSystem }: { designSystem: 'A' | 'B' }) => links[designSystem]
  );
  let activeLinks: HTMLLinkElement[] | undefined;
  fixtures.activate.mockImplementation((next: HTMLLinkElement[]) => {
    activeLinks = next;
  });
  const measurements: boolean[] = [];
  function Child({ expected }: { expected: HTMLLinkElement[] }) {
    useLayoutEffect(() => {
      measurements.push(activeLinks === expected);
    }, [expected]);
    return null;
  }
  function Parent({ designSystem }: { designSystem: string }) {
    const { prepared } = usePreparedSelection({
      designSystem: designSystem as DesignSystemKey,
      segment: 'default',
      theme: 'light'
    });
    return prepared ? createElement(Child, { expected: prepared.stylesheets }) : null;
  }
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(createElement(Parent, { designSystem: 'A' })));
    await waitFor(() => expect(measurements).toEqual([true]));
    await act(async () => root.render(createElement(Parent, { designSystem: 'B' })));
    await waitFor(() => expect(measurements).toEqual([true, true]));
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

it('prepares active Brand Packs before committing a new selection', async () => {
  fixtures.prepare.mockResolvedValue([]);
  fixtures.json.mockImplementation(async (path: string) => ({ key: path.split('/')[0] }));
  const { loadBrandPack } = await import('@/utils/brand-pack-loader.client');
  let release: (value: any) => void = () => {};
  vi.mocked(loadBrandPack).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      })
  );
  const packs = new Map([['auth', { pack: 'auth' as const, components: ['button'] as const }]]);
  const components = new Set<string>();
  const view = renderHook(
    () =>
      usePreparedSelection(
        { designSystem: 'brand-ready' as DesignSystemKey, segment: 'default', theme: 'light' },
        components,
        packs
      ),
    { initialProps: {} }
  );
  await waitFor(() => expect(loadBrandPack).toHaveBeenCalled());
  expect(view.result.current.prepared).toBeUndefined();
  const resource = {
    designSystem: 'brand-ready',
    pack: 'auth',
    segment: 'default',
    theme: 'light',
    components: ['button'],
    cacheKey: 'brand-ready|auth|default|light|button',
    stylesheets: [{ href: '/ready-pack.css', sha256: '0'.repeat(64) }],
    classMaps: {},
    intents: ['brand.google']
  };
  await act(async () => {
    release(resource);
  });
  await waitFor(() =>
    expect(view.result.current.prepared?.preloadedBrandPacks[resource.cacheKey]).toEqual(resource)
  );
});
