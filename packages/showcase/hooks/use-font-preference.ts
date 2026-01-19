import { toCssFontFamily } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import { useManifest } from '@/hooks/use-manifest';
import { FONTS } from '@/registry/fonts.registry';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

const systemFont = FONTS[0].key;

async function loadFontsForDesignSystem(designSystemSlug: string): Promise<{
  body: string;
  heading: string;
} | null> {
  try {
    const json = await loadJsonFromBuild<{ fonts?: { body?: string; heading?: string } }>(
      `${designSystemSlug}/global.kiskadee.json`,
      { required: false, fallback: {} }
    );

    const body = json.fonts?.body?.trim();
    const heading = json.fonts?.heading?.trim();
    if (!body || !heading) return null;
    return { body, heading };
  } catch {
    return null;
  }
}

export function useFontPreference(options: { designSystemKey?: string }) {
  const { designSystemKey } = options;
  const manifest = useManifest(designSystemKey);
  const hasFont: boolean | undefined = manifest ? manifest.font !== undefined : undefined;
  const [fontName, setFontNameInternal] = useState(systemFont);
  const [isOverrideActive, setIsOverrideActive] = useState(false);

  const setFontName = (next: string) => {
    setIsOverrideActive(true);
    setFontNameInternal(next);
  };

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialFont() {
      if (!manifest?.key) {
        if (!cancelled) {
          setIsOverrideActive(false);
          setFontNameInternal(systemFont);
        }
        return;
      }

      // While manifest is loading for the current design system, keep
      // the existing fontName to avoid unnecessary flicker.
      if (hasFont === undefined) {
        return;
      }

      if (hasFont && manifest.font) {
        // Reset override state when switching design systems.
        if (!cancelled) {
          setIsOverrideActive(false);
        }

        const primary = manifest.font.body[0] ?? null;
        if (primary) {
          if (primary === 'system-ui') {
            if (!cancelled) {
              setFontNameInternal(systemFont);
            }
            return;
          }

          const match = FONTS.find((f) => f.family[0] === primary);
          if (match) {
            if (!cancelled) {
              setFontNameInternal(match.key);
            }
            return;
          }
        }
      }

      if (!cancelled) {
        setIsOverrideActive(false);
        setFontNameInternal(systemFont);
      }
    }

    void resolveInitialFont();

    return () => {
      cancelled = true;
    };
  }, [manifest?.key, hasFont]);

  useEffect(() => {
    let cancelled = false;

    async function applyFontCssVariables() {
      const root = document.documentElement;

      if (!manifest?.key) {
        const system = FONTS[0];
        const systemCss = toCssFontFamily(system.family);
        root.style.setProperty('--k-font-body', systemCss);
        root.style.setProperty('--k-font-heading', systemCss);
        return;
      }

      if (hasFont === undefined) {
        return;
      }

      if (isOverrideActive) {
        const selected = FONTS.find((f) => f.key === fontName) ?? FONTS[0];
        const selectedCss = toCssFontFamily(selected.family);
        root.style.setProperty('--k-font-body', selectedCss);
        root.style.setProperty('--k-font-heading', selectedCss);
        return;
      }

      if (hasFont) {
        const fonts = await loadFontsForDesignSystem(manifest.key);
        if (cancelled) return;

        if (fonts) {
          root.style.setProperty('--k-font-body', fonts.body);
          root.style.setProperty('--k-font-heading', fonts.heading);
          return;
        }
      }

      const system = FONTS[0];
      const systemCss = toCssFontFamily(system.family);
      root.style.setProperty('--k-font-body', systemCss);
      root.style.setProperty('--k-font-heading', systemCss);
    }

    void applyFontCssVariables();

    return () => {
      cancelled = true;
    };
  }, [manifest?.key, hasFont, fontName, isOverrideActive]);

  return { manifest, fontName, setFontName } as const;
}
