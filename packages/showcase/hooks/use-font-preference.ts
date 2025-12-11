import { useEffect, useState } from 'react';
import { FONTS } from '@/registry/fonts.registry';

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
    const response = await fetch(`/build/${designSystemSlug}/fonts.kiskadee.json`);
    if (!response.ok) return null;

    const json = (await response.json()) as { fonts?: { body?: string } };
    return json.fonts?.body ?? null;
  } catch {
    return null;
  }
}

export function useFontPreference(designSystemSlug?: string) {
  const [fontName, setFontName] = useState('system');

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialFont() {
      if (designSystemSlug) {
        const bodyStack = await loadBodyFontForDesignSystem(designSystemSlug);

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
  }, [designSystemSlug]);

  return { fontName, setFontName } as const;
}
