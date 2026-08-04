import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  prepareGoogleFontStylesheet,
  resetGoogleFontStylesheetPreparation
} from './prepareGoogleFontStylesheet.ts';

type Listener = () => void;

class FakeLink {
  readonly dataset: Record<string, string> = {};
  href = '';
  rel = '';
  sheet: CSSStyleSheet | null = null;
  removed = false;
  private readonly listeners = new Map<string, Listener[]>();

  addEventListener(type: string, listener: Listener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type: 'error' | 'load'): void {
    for (const listener of this.listeners.get(type) ?? []) listener();
    this.listeners.delete(type);
  }

  remove(): void {
    this.removed = true;
  }
}

function installDocument() {
  const links: FakeLink[] = [];
  const documentStub = {
    createElement: vi.fn(() => new FakeLink()),
    head: {
      appendChild(link: FakeLink) {
        links.push(link);
        return link;
      },
      querySelectorAll() {
        return links.filter((link) => !link.removed);
      }
    }
  };

  vi.stubGlobal('document', documentStub);
  return { documentStub, links };
}

afterEach(() => {
  resetGoogleFontStylesheetPreparation();
  vi.unstubAllGlobals();
});

describe('prepareGoogleFontStylesheet', () => {
  it('creates no document work until preparation is requested', () => {
    const { documentStub, links } = installDocument();

    expect(documentStub.createElement).not.toHaveBeenCalled();
    expect(links).toHaveLength(0);
  });

  it('deduplicates concurrent aliases that use the same Google stylesheet', async () => {
    const { links } = installDocument();
    const first = prepareGoogleFontStylesheet('open-sans', 'Open Sans:wght@400;500;600;700');
    const second = prepareGoogleFontStylesheet('segoe-ui', 'Open Sans:wght@400;500;600;700');

    expect(second).toBe(first);
    expect(links).toHaveLength(1);
    expect(links[0]?.href).toContain('family=Open+Sans%3Awght%40400%3B500%3B600%3B700');
    expect(links[0]?.href).toContain('display=swap');

    links[0]?.dispatch('load');
    await expect(first).resolves.toEqual({
      family: 'Open Sans',
      source: 'online'
    });
  });

  it('removes a failed stylesheet and allows a retry', async () => {
    const { links } = installDocument();
    const first = prepareGoogleFontStylesheet('inter', 'Inter:wght@400;500;700');

    links[0]?.dispatch('error');
    await expect(first).rejects.toThrow('Unable to load');
    expect(links[0]?.removed).toBe(true);

    const second = prepareGoogleFontStylesheet('inter', 'Inter:wght@400;500;700');
    expect(second).not.toBe(first);
    expect(links).toHaveLength(2);

    links[1]?.dispatch('load');
    await expect(second).resolves.toEqual({
      family: 'Inter',
      source: 'online'
    });
  });

  it('rejects direct preparation outside a browser document', async () => {
    await expect(prepareGoogleFontStylesheet('inter', 'Inter:wght@400;500;700')).rejects.toThrow(
      'requires a browser document'
    );
  });
});
