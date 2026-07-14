'use client';

import { useKiskadee } from '@kiskadee/react-components';
import { useMemo } from 'react';
import { useColorScaleTones } from '@/hooks/use-color-scale';

const BACKGROUND_TONES = [
  { key: 'white', aria: 'White' },
  { key: 'gray', aria: 'Light neutral' },
  { key: 'light-primary', aria: 'Light primary' },
  { key: 'primary', aria: 'Primary rest' },
  { key: 'dark-primary', aria: 'Dark primary' },
  { key: 'very-dark-primary', aria: 'Very dark primary' },
  { key: 'dark-gray', aria: 'Dark neutral' },
  { key: 'black', aria: 'Black' }
] as const;

export type BackgroundToneKey = (typeof BACKGROUND_TONES)[number]['key'];
export type ResolvedBackgroundTone = {
  key: BackgroundToneKey;
  displayColor: string;
  aria: string;
  resolvedColor: string;
};

export function useBackgroundTones() {
  const { designSystem, theme } = useKiskadee();

  const designSystemKey = String(designSystem ?? '');
  const canLoadPrimary = Boolean(designSystemKey);

  const lightPrimary = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'semantic:primary',
    tones: ['5', '50'],
    enabled: canLoadPrimary
  });

  const darkPrimary = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'semantic:primary',
    tones: ['5', '10'],
    enabled: canLoadPrimary
  });

  const lightNeutral = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'semantic:neutral',
    tones: ['0', '5'],
    enabled: canLoadPrimary
  });

  const darkNeutral = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'semantic:neutral',
    tones: ['0', '5'],
    enabled: canLoadPrimary
  });

  const tones = useMemo<ResolvedBackgroundTone[]>(() => {
    const resolvedByKey: Record<BackgroundToneKey, string | undefined> = {
      white: lightNeutral.picked['0'],
      gray: lightNeutral.picked['5'],
      'light-primary': lightPrimary.picked['5'],
      primary: lightPrimary.picked['50'],
      'dark-primary': darkPrimary.picked['10'],
      'very-dark-primary': darkPrimary.picked['5'],
      'dark-gray': darkNeutral.picked['5'],
      black: darkNeutral.picked['0']
    };

    return BACKGROUND_TONES.flatMap((tone) => {
      const resolvedColor = resolvedByKey[tone.key];
      if (!resolvedColor) return [];

      return [
        {
          ...tone,
          resolvedColor,
          displayColor: resolvedColor
        }
      ];
    });
  }, [darkNeutral.picked, darkPrimary.picked, lightNeutral.picked, lightPrimary.picked]);

  const items = useMemo(
    () =>
      tones.map((tone) => ({
        value: tone.key,
        label: tone.aria,
        swatch: {
          color: tone.displayColor
        }
      })),
    [tones]
  );

  const defaultToneKey: BackgroundToneKey = theme === 'light' ? 'white' : 'dark-gray';

  return {
    defaultToneKey,
    items,
    tones
  };
}

export function usePrimarySurfaceTone({
  fallback = 'transparent',
  tone = '50'
}: {
  fallback?: string;
  tone?: string;
} = {}) {
  const { designSystem, theme } = useKiskadee();
  const designSystemKey = String(designSystem ?? '');
  const themeKey = theme === 'light' ? 'light' : 'dark';
  const primary = useColorScaleTones({
    designSystemKey,
    theme: themeKey,
    selection: 'semantic:primary',
    tones: [tone],
    enabled: Boolean(designSystemKey)
  });

  return {
    color: primary.picked[tone] ?? fallback,
    error: primary.error,
    loading: primary.loading
  };
}
