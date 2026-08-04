/** @vitest-environment jsdom */

import type { SchemaFonts } from '@kiskadee/core';
import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { cleanup, render, waitFor } from '@testing-library/react';
import { createElement as h } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FontFamilyProvider, useFontFamilyStatus } from './FontFamilyContext.tsx';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';

function createContextValue(fonts?: SchemaFonts): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'test',
    setDesignSystem: () => {},
    global: fonts ? { fonts } : undefined
  };
}

function StatusProbe() {
  const { error, familyResolutions, pendingFamilyIds, retry, status } = useFontFamilyStatus();

  return h(
    'button',
    {
      'data-error': error?.message ?? '',
      'data-pending': pendingFamilyIds.join(','),
      'data-resolutions': JSON.stringify(familyResolutions),
      'data-status': status,
      onClick: retry,
      type: 'button'
    },
    status
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty('--k-font-body');
  document.documentElement.style.removeProperty('--k-font-heading');
  document.documentElement.style.removeProperty('--k-font-code');
  vi.restoreAllMocks();
});

describe('FontFamilyProvider', () => {
  it('does not add a wrapper element to the DOM', () => {
    const result = render(
      h(FontFamilyProvider, null, h('span', { 'data-testid': 'direct-child' }))
    );

    expect(result.container.children).toHaveLength(1);
    expect(result.container.firstElementChild?.tagName).toBe('SPAN');
  });

  it('requires an override-only family to provide its stack', () => {
    const loaderOnly = defineFontFamily({
      id: 'loader-only',
      prepare: () => {}
    });

    expect(() =>
      render(
        h(
          FontFamilyProvider,
          {
            families: [loaderOnly],
            roles: { body: 'loader-only' }
          },
          h(StatusProbe)
        )
      )
    ).toThrow(/requires a stack/);
  });

  it('does not prepare unselected definitions and resolves preset role fallbacks', async () => {
    const selectedPrepare = vi.fn().mockResolvedValue(undefined);
    const unusedPrepare = vi.fn().mockResolvedValue(undefined);
    const selected = defineFontFamily({ id: 'acme-sans', prepare: selectedPrepare });
    const unused = defineFontFamily({ id: 'unused-serif', prepare: unusedPrepare });
    const fonts: SchemaFonts = {
      families: {
        'acme-sans': {
          stack: ['Acme Sans', 'Arial', 'sans-serif']
        }
      },
      roles: {
        body: 'acme-sans'
      }
    };

    render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue(fonts) },
        h(FontFamilyProvider, { families: [selected, unused] }, h(StatusProbe))
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"Acme Sans", Arial, sans-serif'
      );
    });

    expect(document.documentElement.style.getPropertyValue('--k-font-heading')).toBe(
      '"Acme Sans", Arial, sans-serif'
    );
    expect(selectedPrepare).toHaveBeenCalledTimes(1);
    expect(unusedPrepare).not.toHaveBeenCalled();
  });

  it('exposes preparation results for the currently selected families', async () => {
    const selected = defineFontFamily({
      id: 'policy-sans',
      stack: ['Policy Sans', 'sans-serif'],
      prepare: async () => ({
        family: 'Online Sans',
        source: 'online' as const,
        fallbackFor: 'Policy Sans'
      })
    });
    const result = render(
      h(
        FontFamilyProvider,
        { families: [selected], roles: { body: 'policy-sans' } },
        h(StatusProbe)
      )
    );

    const probe = result.getByRole('button');
    await waitFor(() => expect(probe.dataset.status).toBe('ready'));
    expect(JSON.parse(probe.dataset.resolutions ?? '{}')).toEqual({
      'policy-sans': {
        family: 'Online Sans',
        source: 'online',
        fallbackFor: 'Policy Sans'
      }
    });
  });

  it('applies multiple prepared roles together and restores previous inline values', async () => {
    document.documentElement.style.setProperty('--k-font-body', 'Host Sans');
    const release: Array<() => void> = [];
    const body = defineFontFamily({
      id: 'body-sans',
      stack: ['Body Sans', 'sans-serif'],
      prepare: () =>
        new Promise<void>((resolve) => {
          release.push(resolve);
        })
    });
    const code = defineFontFamily({
      id: 'code-mono',
      stack: ['Code Mono', 'monospace'],
      prepare: () =>
        new Promise<void>((resolve) => {
          release.push(resolve);
        })
    });

    const result = render(
      h(
        FontFamilyProvider,
        {
          families: [body, code],
          roles: {
            body: 'body-sans',
            code: 'code-mono'
          }
        },
        h(StatusProbe)
      )
    );

    await waitFor(() => expect(release).toHaveLength(2));
    const probe = result.getByRole('button');
    expect(probe.dataset.status).toBe('preparing');
    expect(probe.dataset.pending).toBe('body-sans,code-mono');
    expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe('Host Sans');

    for (const resolve of release) resolve();

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-code')).toBe(
        '"Code Mono", monospace'
      );
    });
    expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
      '"Body Sans", sans-serif'
    );
    expect(probe.dataset.pending).toBe('');

    result.unmount();
    expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe('Host Sans');
    expect(document.documentElement.style.getPropertyValue('--k-font-heading')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--k-font-code')).toBe('');
  });

  it('keeps the previous selection after failure and exposes a retry', async () => {
    const first = defineFontFamily({
      id: 'first-sans',
      stack: ['First Sans', 'sans-serif']
    });
    const prepare = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce();
    const second = defineFontFamily({
      id: 'second-sans',
      stack: ['Second Sans', 'sans-serif'],
      prepare
    });

    const result = render(
      h(
        FontFamilyProvider,
        {
          families: [first],
          roles: { body: 'first-sans' }
        },
        h(StatusProbe)
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"First Sans", sans-serif'
      );
    });

    result.rerender(
      h(
        FontFamilyProvider,
        {
          families: [second],
          roles: { body: 'second-sans' }
        },
        h(StatusProbe)
      )
    );

    const probe = result.getByRole('button');
    await waitFor(() => expect(probe.dataset.status).toBe('error'));
    expect(probe.dataset.error).toBe('offline');
    expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
      '"First Sans", sans-serif'
    );

    probe.click();
    await waitFor(() => expect(probe.dataset.status).toBe('ready'));
    expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
      '"Second Sans", sans-serif'
    );
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('keeps an explicit preset heading when only body is overridden', async () => {
    const fonts: SchemaFonts = {
      families: {
        'preset-sans': { stack: ['Preset Sans', 'sans-serif'] },
        'preset-serif': { stack: ['Preset Serif', 'serif'] }
      },
      roles: {
        body: 'preset-sans',
        heading: 'preset-serif'
      }
    };
    const override = defineFontFamily({
      id: 'override-sans',
      stack: ['Override Sans', 'sans-serif']
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue(fonts) },
        h(
          FontFamilyProvider,
          {
            families: [override],
            roles: { body: 'override-sans' }
          },
          h(StatusProbe)
        )
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"Override Sans", sans-serif'
      );
    });
    expect(document.documentElement.style.getPropertyValue('--k-font-heading')).toBe(
      '"Preset Serif", serif'
    );
  });

  it('makes an implicit heading follow the effective body override', async () => {
    const fonts: SchemaFonts = {
      families: {
        'preset-sans': { stack: ['Preset Sans', 'sans-serif'] }
      },
      roles: {
        body: 'preset-sans'
      }
    };
    const override = defineFontFamily({
      id: 'override-sans',
      stack: ['Override Sans', 'sans-serif']
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue(fonts) },
        h(
          FontFamilyProvider,
          {
            families: [override],
            roles: { body: 'override-sans' }
          },
          h(StatusProbe)
        )
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"Override Sans", sans-serif'
      );
    });
    expect(document.documentElement.style.getPropertyValue('--k-font-heading')).toBe(
      '"Override Sans", sans-serif'
    );
  });

  it('prefers the active preset stack for a registered preset family', async () => {
    const fonts: SchemaFonts = {
      families: {
        inter: { stack: ['Preset Inter', 'sans-serif'] }
      },
      roles: {
        body: 'inter'
      }
    };
    const registered = defineFontFamily({
      id: 'inter',
      stack: ['Override Inter', 'sans-serif']
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue(fonts) },
        h(FontFamilyProvider, { families: [registered] }, h(StatusProbe))
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"Preset Inter", sans-serif'
      );
    });
  });

  it('removes provider-owned variables when the next preset has no recommendation', async () => {
    const fonts: SchemaFonts = {
      families: {
        'preset-sans': { stack: ['Preset Sans', 'sans-serif'] }
      },
      roles: {
        body: 'preset-sans'
      }
    };
    const result = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue(fonts) },
        h(FontFamilyProvider, null, h(StatusProbe))
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe(
        '"Preset Sans", sans-serif'
      );
    });

    result.rerender(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue() },
        h(FontFamilyProvider, null, h(StatusProbe))
      )
    );

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--k-font-body')).toBe('');
    });
    expect(document.documentElement.style.getPropertyValue('--k-font-heading')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--k-font-code')).toBe('');
  });
});
