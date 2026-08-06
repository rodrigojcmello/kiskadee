/** @vitest-environment jsdom */

import {
  defineIconFamily,
  defineIconFamilyCatalogEntry,
  defineIconFamilyFallback
} from '@kiskadee/icons/interface';
import { cleanup, render, waitFor } from '@testing-library/react';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  IconFamilyProvider,
  type IconFamilyProviderStatus,
  useIconFamilyStatus,
  useResolvedIconGlyph
} from './IconFamilyContext.tsx';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';

function SearchGlyph() {
  return h('svg', { 'data-glyph': 'search' });
}

function createFamily(id: string, prepare?: () => void | Promise<void>) {
  return defineIconFamily({
    id,
    label: id,
    glyphs: { search: SearchGlyph },
    prepare
  });
}

function createVariantFamily(id: string) {
  function ThinSearchGlyph() {
    return h('svg', { 'data-variant': 'thin' });
  }
  function BoldSearchGlyph() {
    return h('svg', { 'data-variant': 'bold' });
  }
  return defineIconFamily({
    id,
    label: id,
    defaultVariant: 'thin',
    variants: {
      thin: { label: 'Thin', glyphs: { search: ThinSearchGlyph } },
      bold: { label: 'Bold', glyphs: { search: BoldSearchGlyph } }
    }
  });
}

function createCatalogEntry(
  id: string,
  label: string,
  load: () => Promise<ReturnType<typeof createFamily>>
) {
  return defineIconFamilyCatalogEntry({
    id,
    label,
    defaultVariant: 'regular',
    variants: [{ id: 'regular', label: 'Regular' }],
    load
  });
}

function createContextValue(family?: string, variant?: string): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'test',
    setDesignSystem: () => {},
    global: family ? { icons: { family, ...(variant ? { variant } : {}) } } : undefined
  };
}

function StatusProbe() {
  const status = useIconFamilyStatus();
  const resolved = useResolvedIconGlyph('search');

  return h(
    'button',
    {
      'data-effective': status.effectiveFamilyId ?? '',
      'data-effective-variant': status.effectiveVariantId ?? '',
      'data-error': status.error?.message ?? '',
      'data-fallback-for': status.fallbackFor ?? '',
      'data-has-glyph': String(Boolean(resolved.glyph)),
      'data-pending': status.pendingFamilyId ?? '',
      'data-pending-variant': status.pendingVariantId ?? '',
      'data-requested': status.requestedFamilyId ?? '',
      'data-requested-variant': status.requestedVariantId ?? '',
      'data-status': status.status,
      onClick: status.retry,
      type: 'button'
    },
    status.status
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('IconFamilyProvider', () => {
  it('renders an eager default family during SSR', () => {
    const fallback = createFamily('ssr-icons');
    const html = renderToString(
      h(IconFamilyProvider, { defaultFamily: 'ssr-icons', families: [fallback] }, h(StatusProbe))
    );

    expect(html).toContain('data-effective="ssr-icons"');
    expect(html).toContain('data-status="ready"');
  });

  it('does not re-prepare an eager synchronous family after mounting', async () => {
    const statuses: IconFamilyProviderStatus[] = [];
    const eager = createFamily('eager-icons');

    function StatusHistoryProbe() {
      const status = useIconFamilyStatus();
      statuses.push(status.status);
      return h('span', { 'data-testid': 'status' }, status.status);
    }

    const result = render(
      h(IconFamilyProvider, { families: [eager], family: 'eager-icons' }, h(StatusHistoryProbe))
    );

    await waitFor(() => expect(result.getByTestId('status').textContent).toBe('ready'));
    expect(statuses).not.toContain('preparing');
  });

  it('adds no DOM wrapper and does not prepare unselected families', async () => {
    const selectedPrepare = vi.fn().mockResolvedValue(undefined);
    const unusedPrepare = vi.fn().mockResolvedValue(undefined);
    const selected = createFamily('selected-icons', selectedPrepare);
    const unused = createFamily('unused-icons', unusedPrepare);
    const result = render(
      h(
        IconFamilyProvider,
        {
          families: [selected, unused],
          family: 'selected-icons'
        },
        h('span', { 'data-testid': 'child' }),
        h(StatusProbe)
      )
    );

    expect(result.container.children).toHaveLength(2);
    await waitFor(() => expect(result.getByRole('button').dataset.status).toBe('ready'));
    expect(selectedPrepare).toHaveBeenCalledTimes(1);
    expect(unusedPrepare).not.toHaveBeenCalled();
  });

  it('uses preset recommendation before the application default', async () => {
    const preset = createFamily('preset-icons');
    const fallback = createFamily('default-icons');
    const result = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('preset-icons') },
        h(
          IconFamilyProvider,
          { defaultFamily: 'default-icons', families: [preset, fallback] },
          h(StatusProbe)
        )
      )
    );

    await waitFor(() => expect(result.getByRole('button').dataset.effective).toBe('preset-icons'));
  });

  it('uses an explicit family before the preset recommendation', async () => {
    const explicit = createFamily('explicit-icons');
    const preset = createFamily('other-preset-icons');
    const result = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('other-preset-icons') },
        h(
          IconFamilyProvider,
          {
            defaultFamily: 'default-icons',
            families: [explicit, preset],
            family: 'explicit-icons'
          },
          h(StatusProbe)
        )
      )
    );

    await waitFor(() =>
      expect(result.getByRole('button').dataset.effective).toBe('explicit-icons')
    );
  });

  it('loads only the selected catalog entry', async () => {
    const selectedLoad = vi.fn().mockResolvedValue(createFamily('catalog-icons'));
    const unusedLoad = vi.fn().mockResolvedValue(createFamily('unused-catalog'));
    const result = render(
      h(
        IconFamilyProvider,
        {
          catalog: [
            createCatalogEntry('catalog-icons', 'Catalog', selectedLoad),
            createCatalogEntry('unused-catalog', 'Unused', unusedLoad)
          ],
          family: 'catalog-icons'
        },
        h(StatusProbe)
      )
    );

    await waitFor(() => expect(result.getByRole('button').dataset.effective).toBe('catalog-icons'));
    expect(selectedLoad).toHaveBeenCalledTimes(1);
    expect(unusedLoad).not.toHaveBeenCalled();
  });

  it('selects the only registered lazy family without requiring a default', async () => {
    const load = vi.fn().mockResolvedValue(createFamily('only-icons'));
    const result = render(
      h(
        IconFamilyProvider,
        {
          catalog: [createCatalogEntry('only-icons', 'Only', load)]
        },
        h(StatusProbe)
      )
    );

    await waitFor(() => expect(result.getByRole('button').dataset.effective).toBe('only-icons'));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent loads and preparation for the same family', async () => {
    const prepare = vi.fn().mockResolvedValue(undefined);
    const sharedFamily = createFamily('shared-icons', prepare);
    const firstLoad = vi.fn().mockResolvedValue(sharedFamily);
    const secondLoad = vi.fn().mockResolvedValue(sharedFamily);
    const firstEntry = createCatalogEntry('shared-icons', 'Shared', firstLoad);
    const secondEntry = createCatalogEntry('shared-icons', 'Shared', secondLoad);
    const result = render(
      h(
        'div',
        null,
        h(IconFamilyProvider, { catalog: [firstEntry], family: 'shared-icons' }, h(StatusProbe)),
        h(IconFamilyProvider, { catalog: [secondEntry], family: 'shared-icons' }, h(StatusProbe))
      )
    );

    await waitFor(() =>
      expect(
        result.getAllByRole('button').every((probe) => probe.dataset.effective === 'shared-icons')
      ).toBe(true)
    );
    expect(firstLoad.mock.calls.length + secondLoad.mock.calls.length).toBe(1);
    expect(prepare).toHaveBeenCalledTimes(1);
  });

  it('deduplicates preparation by semantic family ID across definitions', async () => {
    const firstPrepare = vi.fn().mockResolvedValue(undefined);
    const secondPrepare = vi.fn().mockResolvedValue(undefined);
    const firstDefinition = createFamily('shared-direct-icons', firstPrepare);
    const secondDefinition = createFamily('shared-direct-icons', secondPrepare);
    const result = render(
      h(
        'div',
        null,
        h(
          IconFamilyProvider,
          { families: [firstDefinition], family: 'shared-direct-icons' },
          h(StatusProbe)
        ),
        h(
          IconFamilyProvider,
          { families: [secondDefinition], family: 'shared-direct-icons' },
          h(StatusProbe)
        )
      )
    );

    await waitFor(() =>
      expect(
        result
          .getAllByRole('button')
          .every((probe) => probe.dataset.effective === 'shared-direct-icons')
      ).toBe(true)
    );
    expect(firstPrepare.mock.calls.length + secondPrepare.mock.calls.length).toBe(1);
  });

  it('preserves the effective family until the next preparation finishes', async () => {
    let release: (() => void) | undefined;
    const first = createFamily('first-icons');
    const second = createFamily(
      'second-icons',
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    const result = render(
      h(IconFamilyProvider, { families: [first, second], family: 'first-icons' }, h(StatusProbe))
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effective).toBe('first-icons'));
    result.rerender(
      h(IconFamilyProvider, { families: [first, second], family: 'second-icons' }, h(StatusProbe))
    );

    await waitFor(() => expect(probe.dataset.status).toBe('preparing'));
    expect(probe.dataset.effective).toBe('first-icons');
    expect(probe.dataset.pending).toBe('second-icons');

    release?.();
    await waitFor(() => expect(probe.dataset.effective).toBe('second-icons'));
  });

  it('resolves a preset variant and switches variants without changing family identity', async () => {
    const variants = createVariantFamily('variant-icons');
    const result = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('variant-icons', 'bold') },
        h(IconFamilyProvider, { families: [variants] }, h(StatusProbe))
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effective).toBe('variant-icons'));
    expect(probe.dataset.effectiveVariant).toBe('bold');

    result.rerender(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('variant-icons', 'thin') },
        h(IconFamilyProvider, { families: [variants] }, h(StatusProbe))
      )
    );

    await waitFor(() => expect(probe.dataset.effectiveVariant).toBe('thin'));
    expect(probe.dataset.effective).toBe('variant-icons');
  });

  it('loads a lazy family once while switching between its local variants', async () => {
    const family = createVariantFamily('lazy-variant-icons');
    const load = vi.fn().mockResolvedValue(family);
    const entry = defineIconFamilyCatalogEntry({
      id: family.id,
      label: family.label,
      defaultVariant: family.defaultVariant,
      variants: [
        { id: 'thin', label: 'Thin' },
        { id: 'bold', label: 'Bold' }
      ],
      load
    });
    const result = render(
      h(
        IconFamilyProvider,
        { catalog: [entry], family: family.id, variant: 'thin' },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effectiveVariant).toBe('thin'));
    result.rerender(
      h(
        IconFamilyProvider,
        { catalog: [entry], family: family.id, variant: 'bold' },
        h(StatusProbe)
      )
    );

    await waitFor(() => expect(probe.dataset.effectiveVariant).toBe('bold'));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('prepares each selected variant independently', async () => {
    const thinPrepare = vi.fn().mockResolvedValue(undefined);
    const boldPrepare = vi.fn().mockResolvedValue(undefined);
    const family = defineIconFamily({
      id: 'prepared-variant-icons',
      label: 'Prepared variants',
      defaultVariant: 'thin',
      variants: {
        thin: { label: 'Thin', glyphs: { search: SearchGlyph }, prepare: thinPrepare },
        bold: { label: 'Bold', glyphs: { search: SearchGlyph }, prepare: boldPrepare }
      }
    });
    const result = render(
      h(
        IconFamilyProvider,
        { families: [family], family: family.id, variant: 'thin' },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effectiveVariant).toBe('thin'));
    result.rerender(
      h(
        IconFamilyProvider,
        { families: [family], family: family.id, variant: 'bold' },
        h(StatusProbe)
      )
    );

    await waitFor(() => expect(probe.dataset.effectiveVariant).toBe('bold'));
    expect(thinPrepare).toHaveBeenCalledTimes(1);
    expect(boldPrepare).toHaveBeenCalledTimes(1);
  });

  it('rejects an unavailable explicit variant without visual fallback', async () => {
    const family = createVariantFamily('strict-variant-icons');
    const result = render(
      h(
        IconFamilyProvider,
        { families: [family], family: family.id, variant: 'missing' },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.status).toBe('error'));
    expect(probe.dataset.effective).toBe('');
    expect(probe.dataset.error).toContain('does not provide variant "missing"');
  });

  it('resolves the explicit SF Symbols web fallback', async () => {
    const iconoir = createFamily('iconoir');
    const result = render(
      h(
        IconFamilyProvider,
        {
          families: [iconoir],
          catalog: [
            defineIconFamilyFallback({
              id: 'sf-symbols',
              label: 'SF Symbols',
              fallbackTo: 'iconoir'
            })
          ],
          family: 'sf-symbols'
        },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effective).toBe('iconoir'));
    expect(probe.dataset.requested).toBe('sf-symbols');
    expect(probe.dataset.fallbackFor).toBe('sf-symbols');
  });

  it('prefers an application SF Symbols implementation over the Web fallback', async () => {
    const nativeSfSymbols = createFamily('sf-symbols');
    const iconoir = createFamily('iconoir');
    const result = render(
      h(
        IconFamilyProvider,
        {
          families: [nativeSfSymbols, iconoir],
          catalog: [
            defineIconFamilyFallback({
              id: 'sf-symbols',
              label: 'SF Symbols',
              fallbackTo: 'iconoir'
            })
          ],
          family: 'sf-symbols'
        },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effective).toBe('sf-symbols'));
    expect(probe.dataset.fallbackFor).toBe('');
  });

  it('keeps the previous family after failure and retries', async () => {
    const first = createFamily('stable-icons');
    const prepare = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce();
    const second = createFamily('retry-icons', prepare);
    const result = render(
      h(IconFamilyProvider, { families: [first, second], family: 'stable-icons' }, h(StatusProbe))
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.effective).toBe('stable-icons'));
    result.rerender(
      h(IconFamilyProvider, { families: [first, second], family: 'retry-icons' }, h(StatusProbe))
    );

    await waitFor(() => expect(probe.dataset.status).toBe('error'));
    expect(probe.dataset.effective).toBe('stable-icons');
    expect(probe.dataset.error).toBe('offline');

    probe.click();
    await waitFor(() => expect(probe.dataset.effective).toBe('retry-icons'));
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('retries a failed lazy catalog load', async () => {
    const load = vi
      .fn<() => Promise<ReturnType<typeof createFamily>>>()
      .mockRejectedValueOnce(new Error('chunk unavailable'))
      .mockResolvedValueOnce(createFamily('load-retry-icons'));
    const result = render(
      h(
        IconFamilyProvider,
        {
          catalog: [createCatalogEntry('load-retry-icons', 'Load retry', load)],
          family: 'load-retry-icons'
        },
        h(StatusProbe)
      )
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.status).toBe('error'));
    expect(probe.dataset.error).toBe('chunk unavailable');

    probe.click();
    await waitFor(() => expect(probe.dataset.effective).toBe('load-retry-icons'));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('exposes an unresolved recommendation as an error without silent fallback', async () => {
    const fallback = createFamily('lucide');
    const result = render(
      h(IconFamilyProvider, { families: [fallback], family: 'missing-icons' }, h(StatusProbe))
    );
    const probe = result.getByRole('button');

    await waitFor(() => expect(probe.dataset.status).toBe('error'));
    expect(probe.dataset.requested).toBe('missing-icons');
    expect(probe.dataset.effective).toBe('');
    expect(probe.dataset.error).toContain('not registered');
  });
});
