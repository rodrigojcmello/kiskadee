import { describe, expect, it } from 'vitest';
import {
  applyRuntimePlatformClasses,
  clearRuntimePlatformClasses,
  detectRuntimePlatform,
  resolveRuntimePlatformClasses
} from './platformClasses';

type FakeClassListHost = {
  classList: {
    add: (...tokens: string[]) => void;
    remove: (...tokens: string[]) => void;
    contains: (token: string) => boolean;
    values: () => string[];
  };
};

function createFakeClassListHost(initialTokens: string[] = []): FakeClassListHost {
  const tokens = new Set(initialTokens);

  return {
    classList: {
      add: (...nextTokens: string[]) => {
        for (const token of nextTokens) {
          tokens.add(token);
        }
      },
      remove: (...nextTokens: string[]) => {
        for (const token of nextTokens) {
          tokens.delete(token);
        }
      },
      contains: (token: string) => tokens.has(token),
      values: () => Array.from(tokens)
    }
  };
}

function createFakeDocument(options?: {
  htmlClasses?: string[];
  bodyClasses?: string[];
  withBody?: boolean;
}) {
  const html = createFakeClassListHost(options?.htmlClasses);
  const body = options?.withBody === false ? null : createFakeClassListHost(options?.bodyClasses);

  return {
    documentElement: html as unknown as HTMLElement,
    body: body as unknown as HTMLElement | null
  } as Document;
}

describe('platformClasses', () => {
  describe('detectRuntimePlatform', () => {
    it('detects macOS Blink from Chromium-based browsers', () => {
      const platform = detectRuntimePlatform({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0',
        platform: 'MacIntel',
        maxTouchPoints: 0
      } as Navigator);

      expect(platform).toEqual({
        os: 'macos',
        engine: 'blink'
      });
    });

    it('detects iOS WebKit even when the user agent belongs to another browser shell', () => {
      const platform = detectRuntimePlatform({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/135.0.0.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5
      } as Navigator);

      expect(platform).toEqual({
        os: 'ios',
        engine: 'webkit'
      });
    });

    it('detects Windows Gecko for Firefox', () => {
      const platform = detectRuntimePlatform({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
        platform: 'Win32',
        maxTouchPoints: 0
      } as Navigator);

      expect(platform).toEqual({
        os: 'windows',
        engine: 'gecko'
      });
    });

    it('falls back to unknown when navigator does not expose known platform signals', () => {
      expect(
        detectRuntimePlatform({
          userAgent: 'UnknownRuntime/1.0',
          platform: 'Unknown',
          maxTouchPoints: 0
        } as Navigator)
      ).toEqual({
        os: 'unknown',
        engine: 'unknown'
      });
    });
  });

  describe('resolveRuntimePlatformClasses', () => {
    it('returns only the public os and engine classes', () => {
      expect(
        resolveRuntimePlatformClasses({
          os: 'macos',
          engine: 'blink'
        })
      ).toEqual(['k-os-macos', 'k-engine-blink']);
    });

    it('skips unknown values from the public class list', () => {
      expect(
        resolveRuntimePlatformClasses({
          os: 'unknown',
          engine: 'webkit'
        })
      ).toEqual(['k-engine-webkit']);
    });
  });

  describe('applyRuntimePlatformClasses', () => {
    it('applies the resolved classes to body by default', () => {
      const documentRef = createFakeDocument();
      const platform = applyRuntimePlatformClasses({
        document: documentRef,
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          platform: 'MacIntel',
          maxTouchPoints: 0
        } as Navigator
      });

      expect(platform).toEqual({
        os: 'macos',
        engine: 'blink'
      });
      expect(documentRef.body?.classList.contains('k-os-macos')).toBe(true);
      expect(documentRef.body?.classList.contains('k-engine-blink')).toBe(true);
      expect(documentRef.documentElement.classList.contains('k-os-macos')).toBe(false);
    });

    it('clears legacy browser classes and previous platform flags before applying the next result', () => {
      const documentRef = createFakeDocument({
        bodyClasses: ['k-os-windows', 'k-engine-gecko', 'k-browser-firefox']
      });

      applyRuntimePlatformClasses({
        document: documentRef,
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          platform: 'MacIntel',
          maxTouchPoints: 0
        } as Navigator
      });

      expect(documentRef.body?.classList.contains('k-os-windows')).toBe(false);
      expect(documentRef.body?.classList.contains('k-engine-gecko')).toBe(false);
      expect(documentRef.body?.classList.contains('k-browser-firefox')).toBe(false);
      expect(documentRef.body?.classList.contains('k-os-macos')).toBe(true);
      expect(documentRef.body?.classList.contains('k-engine-blink')).toBe(true);
    });

    it('does nothing when body is missing and target stays on body', () => {
      const documentRef = createFakeDocument({
        htmlClasses: ['existing-html'],
        withBody: false
      });

      const platform = applyRuntimePlatformClasses({
        document: documentRef,
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          platform: 'MacIntel',
          maxTouchPoints: 0
        } as Navigator
      });

      expect(platform).toEqual({
        os: 'macos',
        engine: 'blink'
      });
      expect(documentRef.documentElement.classList.contains('existing-html')).toBe(true);
    });
  });

  describe('clearRuntimePlatformClasses', () => {
    it('removes known os, engine, and legacy browser classes from body', () => {
      const documentRef = createFakeDocument({
        bodyClasses: ['k-os-macos', 'k-engine-blink', 'k-browser-opera', 'custom-flag']
      });

      clearRuntimePlatformClasses({
        document: documentRef
      });

      expect(documentRef.body?.classList.contains('k-os-macos')).toBe(false);
      expect(documentRef.body?.classList.contains('k-engine-blink')).toBe(false);
      expect(documentRef.body?.classList.contains('k-browser-opera')).toBe(false);
      expect(documentRef.body?.classList.contains('custom-flag')).toBe(true);
    });
  });
});
