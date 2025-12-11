import { useEffect, useState } from 'react';
import { FONTS } from '@/registry/fonts.registry';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

function extractPrimaryFontLabel(bodyStack: string): string | null {
  const trimmed = bodyStack.trim();
  if (!trimmed) return null;

  const [first] = trimmed.split(',');
  if (!first) return null;

  const cleaned = first.trim().replace(/^['"]+|['"]+$/g, '');
  return cleaned || null;
}

async function loadBodyFontForDesignSystem(
  designSystemSlug: string,
  hasFont: boolean | undefined
): Promise<string | null> {
  if (!hasFont) {
    return null;
  }

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

export function useFontPreference(options: { designSystemSlug?: string; hasFont?: boolean }) {
  const { designSystemSlug, hasFont } = options;
  const [fontName, setFontName] = useState('system');

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialFont() {
      if (designSystemSlug && hasFont) {
        const bodyStack = await loadBodyFontForDesignSystem(designSystemSlug, hasFont);

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
        setFontName('system');
      }
    }

    void resolveInitialFont();

    return () => {
      cancelled = true;
    };
  }, [designSystemSlug, hasFont]);

  return { fontName, setFontName } as const;
}
