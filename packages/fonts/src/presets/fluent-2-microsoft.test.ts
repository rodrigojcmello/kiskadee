import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetGoogleFontStylesheetPreparation } from '../google/prepareGoogleFontStylesheet.ts';

type Listener = () => void;

class FakeLink {
  readonly dataset: Record<string, string> = {};
  href = '';
  rel = '';
  sheet: CSSStyleSheet | null = null;
  private readonly listeners = new Map<string, Listener[]>();

  addEventListener(type: string, listener: Listener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchLoad(): void {
    for (const listener of this.listeners.get('load') ?? []) listener();
  }

  remove(): void {}
}

function installDocument() {
  const links: FakeLink[] = [];

  vi.stubGlobal('document', {
    createElement: () => new FakeLink(),
    head: {
      appendChild(link: FakeLink) {
        links.push(link);
      },
      querySelectorAll() {
        return links;
      }
    }
  });

  return links;
}

afterEach(() => {
  resetGoogleFontStylesheetPreparation();
  vi.unstubAllGlobals();
});

describe('Fluent 2 Microsoft font integration', () => {
  it('publishes the preset family id and complete Web stack without preparing it', async () => {
    const { getFontFamilyPreparationStatus } = await import('@kiskadee/runtime/font-family');
    const {
      FLUENT_2_MICROSOFT_FONT_STACK,
      fluent2MicrosoftFontFamilies,
      fluent2MicrosoftFontFamily
    } = await import('./fluent-2-microsoft.ts');

    expect(fluent2MicrosoftFontFamily).toEqual({
      id: 'segoe-ui',
      stack: FLUENT_2_MICROSOFT_FONT_STACK,
      prepare: expect.any(Function)
    });
    expect(fluent2MicrosoftFontFamilies).toEqual([fluent2MicrosoftFontFamily]);
    expect(getFontFamilyPreparationStatus('segoe-ui')).toBe('idle');
  });

  it('keeps an installed Segoe family without requesting Google Fonts', async () => {
    const links = installDocument();

    class InstalledFontFace {
      async load(): Promise<this> {
        return this;
      }
    }

    vi.stubGlobal('FontFace', InstalledFontFace);
    const { prepareFluent2MicrosoftFontFamily } = await import('./fluent-2-microsoft.ts');

    await expect(prepareFluent2MicrosoftFontFamily()).resolves.toEqual({
      family: 'Segoe UI',
      source: 'local'
    });

    expect(links).toHaveLength(0);
  });

  it('loads Open Sans when Segoe is unavailable', async () => {
    const links = installDocument();

    class MissingSegoeFontFace {
      async load(): Promise<this> {
        throw new Error('not installed');
      }
    }

    vi.stubGlobal('FontFace', MissingSegoeFontFace);
    const { prepareFluent2MicrosoftFontFamily } = await import('./fluent-2-microsoft.ts');
    const preparation = prepareFluent2MicrosoftFontFamily();

    await vi.waitFor(() => expect(links).toHaveLength(1));
    expect(links[0]?.href).toContain('Open+Sans');
    links[0]?.dispatchLoad();

    await expect(preparation).resolves.toEqual({
      family: 'Open Sans',
      source: 'online',
      fallbackFor: 'Segoe UI'
    });
  });

  it('loads Open Sans when the FontFace probing API is unavailable', async () => {
    const links = installDocument();
    const { prepareFluent2MicrosoftFontFamily } = await import('./fluent-2-microsoft.ts');
    const preparation = prepareFluent2MicrosoftFontFamily();

    await vi.waitFor(() => expect(links).toHaveLength(1));
    links[0]?.dispatchLoad();

    await expect(preparation).resolves.toEqual({
      family: 'Open Sans',
      source: 'online',
      fallbackFor: 'Segoe UI'
    });
  });
});
