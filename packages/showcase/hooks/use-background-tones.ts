'use client';

import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useMemo } from 'react';
import { useColorScaleTones } from '@/hooks/use-color-scale';

const BACKGROUND_TONES = [
  { key: 'white', color: '#ffffff', displayColor: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#f5f5f5', displayColor: '#e5e7eb', aria: 'Gray' },
  { key: 'light-primary', color: '#f0eafb', displayColor: '#f0eafb', aria: 'Light primary' },
  { key: 'dark-gray', color: '#29313d', displayColor: '#6b6f7b', aria: 'Dark gray' },
  { key: 'dark-primary', color: '#201933', displayColor: '#201933', aria: 'Dark primary' },
  { key: 'black', color: '#000000', displayColor: '#000000', aria: 'Black' }
] as const;

export type BackgroundToneKey = (typeof BACKGROUND_TONES)[number]['key'];
export type ResolvedBackgroundTone = {
  key: BackgroundToneKey;
  color: string;
  displayColor: string;
  aria: string;
  resolvedColor: string;
};

export function useBackgroundTones() {
  const { designSystem, theme } = useKiskadee();
  const { backgroundsByTheme } = useShowcase();

  const designSystemKey = String(designSystem ?? '');
  const canLoadPrimary = Boolean(designSystemKey);

  const lightPrimary = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'semantic:primary',
    tones: ['5'],
    preferredTracks: ['subtle', 'vivid'],
    enabled: canLoadPrimary
  });

  const darkPrimary = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'semantic:primary',
    tones: ['85'],
    preferredTracks: ['vivid', 'subtle'],
    enabled: canLoadPrimary
  });

  const tones = useMemo<ResolvedBackgroundTone[]>(() => {
    const themeByToneKey: Record<string, string | undefined> = {
      white: undefined,
      gray: 'light',
      'light-primary': undefined,
      'dark-gray': 'dark',
      'dark-primary': undefined,
      black: 'darker'
    };

    return BACKGROUND_TONES.map((tone) => {
      if (tone.key === 'light-primary') {
        const hex = lightPrimary.picked['5'];
        return {
          ...tone,
          resolvedColor: hex ?? tone.color,
          displayColor: hex ?? tone.displayColor
        };
      }

      if (tone.key === 'dark-primary') {
        const hex = darkPrimary.picked['85'];
        return {
          ...tone,
          resolvedColor: hex ?? tone.color,
          displayColor: hex ?? tone.displayColor
        };
      }

      const themeKey = themeByToneKey[tone.key];
      const backgroundFromStore = themeKey ? backgroundsByTheme[themeKey] : undefined;

      return {
        ...tone,
        resolvedColor: backgroundFromStore ?? tone.color
      };
    });
  }, [backgroundsByTheme, darkPrimary.picked, lightPrimary.picked]);

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

  const defaultToneKey: BackgroundToneKey =
    theme === 'dark' ? 'dark-gray' : backgroundsByTheme.light ? 'gray' : 'white';

  return {
    defaultToneKey,
    items,
    tones
  };
}

export function usePrimarySurfaceTone({
  fallback = '#615690',
  tone = '60'
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
    preferredTracks: ['vivid', 'subtle'],
    enabled: Boolean(designSystemKey)
  });

  return {
    color: primary.picked[tone] ?? fallback,
    error: primary.error,
    loading: primary.loading
  };
}
