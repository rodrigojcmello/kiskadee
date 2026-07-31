/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createElement as h } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BrandPackBoundary,
  type BrandPackLoadRequest,
  createBrandPackResourceKey,
  type LoadedBrandPackResources
} from './BrandPackContext.tsx';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';

function createContextValue(overrides: Partial<KiskadeeContextValue> = {}): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'fluent-2-microsoft',
    setDesignSystem: () => {},
    ...overrides
  };
}

function createResources(
  request: BrandPackLoadRequest,
  stylesheetHref: string
): LoadedBrandPackResources {
  return {
    ...request,
    cacheKey: createBrandPackResourceKey(request),
    stylesheetHref,
    stylesheetSha256: '0'.repeat(64),
    classMaps: {
      button: {
        component: 'button',
        classMap: {
          e1: {}
        }
      }
    },
    intents: ['brand.google']
  };
}

function addLoadedStylesheet(stylesheetHref: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesheetHref;
  link.dataset.kLoaded = 'true';
  link.dataset.testBrandPack = 'true';
  document.head.appendChild(link);
  return link;
}

afterEach(() => {
  cleanup();
  for (const link of document.querySelectorAll('[data-test-brand-pack], [data-k-brand-pack]')) {
    link.remove();
  }
  vi.restoreAllMocks();
});

describe('BrandPackBoundary', () => {
  it('creates stable cache keys from deduplicated, ordered components', () => {
    expect(
      createBrandPackResourceKey({
        designSystem: 'fluent-2-microsoft',
        pack: 'auth',
        segment: 'default',
        theme: 'light',
        components: ['button', 'button']
      })
    ).toBe('fluent-2-microsoft|auth|default|light|button');
  });

  it('deduplicates concurrent resource loading and waits for the stylesheet', async () => {
    const request: BrandPackLoadRequest = {
      designSystem: 'brand-boundary-dedupe',
      pack: 'auth',
      segment: 'default',
      theme: 'light',
      components: ['button']
    };
    const stylesheetHref = '/brand-packs/auth/dedupe.css';
    addLoadedStylesheet(stylesheetHref);
    const resources = createResources(request, stylesheetHref);
    const loader = vi.fn(async () => resources);
    const context = createContextValue({
      designSystem: request.designSystem,
      brandPackLoader: loader
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(
          'div',
          null,
          h(
            BrandPackBoundary,
            { pack: 'auth', components: ['button'], fallback: h('span', null, 'loading-a') },
            h('span', null, 'ready-a')
          ),
          h(
            BrandPackBoundary,
            { pack: 'auth', components: ['button'], fallback: h('span', null, 'loading-b') },
            h('span', null, 'ready-b')
          )
        )
      )
    );

    await waitFor(() => {
      expect(screen.getByText('ready-a')).toBeTruthy();
      expect(screen.getByText('ready-b')).toBeTruthy();
    });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('attaches SHA-256 integrity before revealing CSR content', async () => {
    const request: BrandPackLoadRequest = {
      designSystem: 'brand-boundary-integrity',
      pack: 'auth',
      segment: 'default',
      theme: 'light',
      components: ['button']
    };
    const resources = createResources(request, '/brand-packs/auth/integrity.css');
    const context = createContextValue({
      designSystem: request.designSystem,
      brandPackLoader: vi.fn(async () => resources)
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(
          BrandPackBoundary,
          { pack: 'auth', components: ['button'], fallback: h('span', null, 'loading') },
          h('span', null, 'ready')
        )
      )
    );

    expect(screen.getByText('loading')).toBeTruthy();
    const stylesheet = await waitFor(() => {
      const link = document.head.querySelector<HTMLLinkElement>(
        'link[href$="/brand-packs/auth/integrity.css"]'
      );
      expect(link).toBeTruthy();
      return link as HTMLLinkElement;
    });
    expect(stylesheet.integrity).toBe('sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
    stylesheet.dispatchEvent(new Event('load'));

    await waitFor(() => expect(screen.getByText('ready')).toBeTruthy());
  });

  it('uses SSR-preloaded resources without calling the loader', () => {
    const request: BrandPackLoadRequest = {
      designSystem: 'brand-boundary-preloaded',
      pack: 'social',
      segment: 'default',
      theme: 'dark',
      components: ['button']
    };
    const stylesheetHref = '/brand-packs/social/preloaded.css';
    addLoadedStylesheet(stylesheetHref);
    const resources = createResources(request, stylesheetHref);
    const loader = vi.fn();
    const context = createContextValue({
      designSystem: request.designSystem,
      theme: request.theme,
      brandPackLoader: loader,
      preloadedBrandPacks: {
        [resources.cacheKey]: resources
      }
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(
          BrandPackBoundary,
          { pack: 'social', components: ['button'], fallback: h('span', null, 'loading') },
          h('span', null, 'ready')
        )
      )
    );

    expect(screen.getByText('ready')).toBeTruthy();
    expect(loader).not.toHaveBeenCalled();
  });

  it('never exposes incompatible SSR-preloaded resources', () => {
    const request: BrandPackLoadRequest = {
      designSystem: 'brand-boundary-invalid-preload',
      pack: 'auth',
      segment: 'default',
      theme: 'light',
      components: ['button']
    };
    const resources = {
      ...createResources(request, '/brand-packs/auth/invalid.css'),
      segment: 'other'
    };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const context = createContextValue({
      designSystem: request.designSystem,
      preloadedBrandPacks: {
        [createBrandPackResourceKey(request)]: resources
      }
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(
          BrandPackBoundary,
          { pack: 'auth', components: ['button'], fallback: h('span', null, 'blocked') },
          h('span', null, 'must-not-render')
        )
      )
    );

    expect(screen.getByText('blocked')).toBeTruthy();
    expect(screen.queryByText('must-not-render')).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[Kiskadee] Invalid preloaded brand-pack resources.',
      expect.any(Error)
    );
  });
});
