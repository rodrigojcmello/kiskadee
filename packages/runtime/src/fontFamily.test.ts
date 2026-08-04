import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineFontFamily,
  getFontFamilyPreparationResult,
  getFontFamilyPreparationStatus,
  prepareFontFamilies,
  prepareFontFamily,
  resetFontFamilyPreparation
} from './fontFamily';

beforeEach(() => {
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', {});
});

afterEach(() => {
  resetFontFamilyPreparation();
  vi.unstubAllGlobals();
});

describe('defineFontFamily', () => {
  it('creates an inert descriptor without preparing it', () => {
    const prepare = vi.fn();
    const family = defineFontFamily({
      id: 'acme-sans',
      stack: ['Acme Sans', 'Arial', 'sans-serif'],
      prepare
    });

    expect(family).toEqual({
      id: 'acme-sans',
      stack: ['Acme Sans', 'Arial', 'sans-serif'],
      prepare
    });
    expect(Object.isFrozen(family)).toBe(true);
    expect(Object.isFrozen(family.stack)).toBe(true);
    expect(prepare).not.toHaveBeenCalled();
  });

  it('rejects invalid identifiers and empty stacks', () => {
    expect(() => defineFontFamily({ id: 'Acme Sans', stack: ['Acme Sans'] })).toThrow(
      /lowercase kebab-case/
    );
    expect(() =>
      defineFontFamily({
        id: 'acme-sans',
        stack: ['Acme Sans', '   ']
      })
    ).toThrow(/non-empty tokens/);
  });
});

describe('font family preparation', () => {
  it('does not run prepare callbacks outside a browser environment', async () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    const prepare = vi.fn();
    const family = defineFontFamily({ id: 'server-font', prepare });

    await prepareFontFamily(family);

    expect(prepare).not.toHaveBeenCalled();
    expect(getFontFamilyPreparationStatus('server-font')).toBe('idle');

    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
    await prepareFontFamily(family);

    expect(prepare).toHaveBeenCalledTimes(1);
    expect(getFontFamilyPreparationStatus('server-font')).toBe('ready');
  });

  it('deduplicates concurrent and completed preparation by id', async () => {
    let resolvePreparation: (() => void) | undefined;
    const prepare = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePreparation = resolve;
        })
    );
    const family = defineFontFamily({ id: 'acme-sans', prepare });

    const first = prepareFontFamily(family);
    const second = prepareFontFamily(family);

    await Promise.resolve();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(getFontFamilyPreparationStatus('acme-sans')).toBe('preparing');

    resolvePreparation?.();
    await Promise.all([first, second]);

    expect(getFontFamilyPreparationStatus('acme-sans')).toBe('ready');
    await prepareFontFamily(family);
    expect(prepare).toHaveBeenCalledTimes(1);
  });

  it('normalizes and caches an optional preparation result', async () => {
    const family = defineFontFamily({
      id: 'resolved-family',
      prepare: async () => ({
        family: '  Online Sans  ',
        source: 'online' as const,
        fallbackFor: '  Local Sans  '
      })
    });

    await expect(prepareFontFamily(family)).resolves.toEqual({
      family: 'Online Sans',
      source: 'online',
      fallbackFor: 'Local Sans'
    });
    expect(getFontFamilyPreparationResult('resolved-family')).toEqual({
      family: 'Online Sans',
      source: 'online',
      fallbackFor: 'Local Sans'
    });
  });

  it('prepares distinct selected families in parallel', async () => {
    const order: string[] = [];
    const first = defineFontFamily({
      id: 'first-family',
      prepare: async () => {
        order.push('first:start');
        await Promise.resolve();
        order.push('first:end');
      }
    });
    const second = defineFontFamily({
      id: 'second-family',
      prepare: async () => {
        order.push('second:start');
        await Promise.resolve();
        order.push('second:end');
      }
    });

    await prepareFontFamilies([first, second]);

    expect(order.slice(0, 2)).toEqual(['first:start', 'second:start']);
  });

  it('allows a failed family to be retried', async () => {
    const prepare = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce();
    const family = defineFontFamily({ id: 'retry-family', prepare });

    await expect(prepareFontFamily(family)).rejects.toThrow('offline');
    expect(getFontFamilyPreparationStatus('retry-family')).toBe('idle');

    await expect(prepareFontFamily(family)).resolves.toBeUndefined();
    expect(prepare).toHaveBeenCalledTimes(2);
    expect(getFontFamilyPreparationStatus('retry-family')).toBe('ready');
  });
});
