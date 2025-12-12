import { useEffect, useState } from 'react';
import { useManifest } from '@/hooks/use-manifest';
import { FONTS } from '@/registry/fonts.registry';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

const systemFont = FONTS[0].key;

function extractPrimaryFontLabel(bodyStack: string): string | null {
  const trimmed = bodyStack.trim();
  if (!trimmed) return null;

  const [first] = trimmed.split(',');
  if (!first) return null;

  const cleaned = first.trim().replace(/^['"]+|['"]+$/g, '');
  return cleaned || null;
}

async function loadBodyFontForDesignSystem(designSystemSlug: string): Promise<string | null> {
  try {
    const json = await loadJsonFromBuild<{ fonts?: { body?: string } }>(
      `${designSystemSlug}/fonts.kiskadee.json`,
      { required: false, fallback: {} }
    );

    return json.fonts?.body ?? null;
  } catch {
    return null;
  }
}

export function useFontPreference(options: { designSystemKey?: string }) {
  const { designSystemKey } = options;
  const manifest = useManifest(designSystemKey);
  const hasFont: boolean | undefined = manifest?.font;
  const [fontName, setFontName] = useState(systemFont);

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialFont() {
      if (!manifest?.key) {
        if (!cancelled) {
          setFontName(systemFont);
        }
        return;
      }

      // While manifest is loading for the current design system, keep
      // the existing fontName to avoid unnecessary flicker.
      if (hasFont === undefined) {
        return;
      }

      if (hasFont) {
        const bodyStack = await loadBodyFontForDesignSystem(manifest.key);

        if (cancelled) return;

        if (bodyStack) {
          const primary = extractPrimaryFontLabel(bodyStack);

          if (primary && primary !== 'system-ui') {
            const match = FONTS.find((f) => f.label === primary);
            if (match) {
              setFontName(match.key);
              return;
            }
          }
        }
      }

      if (!cancelled) {
        setFontName(systemFont);
      }
    }

    void resolveInitialFont();

    return () => {
      cancelled = true;
    };
  }, [manifest?.key, hasFont]);

  return { manifest, fontName, setFontName } as const;
}
