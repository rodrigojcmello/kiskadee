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

const BUTTON_LIGHT_TONES = ['0', '100', 'subtle', 'vivid'] as const;
const BUTTON_DARK_TONES = ['5'] as const;

export type ButtonStressTestBackgroundToneKey =
  | 'white'
  | 'light-neutral'
  | 'light-blue'
  | 'light-green'
  | 'light-red'
  | 'light-purple'
  | 'light-orange'
  | 'vivid-blue'
  | 'vivid-green'
  | 'vivid-red'
  | 'vivid-purple'
  | 'vivid-orange'
  | 'vivid-black'
  | 'dark-blue'
  | 'dark-green'
  | 'dark-red'
  | 'dark-purple'
  | 'dark-orange'
  | 'dark-black'
  | 'black';

export type ResolvedButtonStressTestBackgroundTone = {
  key: ButtonStressTestBackgroundToneKey;
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
    tones: ['0', '3'],
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
      gray: lightNeutral.picked['3'],
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

  const defaultToneKey: BackgroundToneKey =
    theme === 'darker' ? 'black' : theme === 'dark' ? 'dark-gray' : 'white';

  return {
    defaultToneKey,
    items,
    tones
  };
}

export function useButtonStressTestBackgroundTones() {
  const { designSystem } = useKiskadee();
  const designSystemKey = String(designSystem ?? '');
  const enabled = Boolean(designSystemKey);

  const lightBlack = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:black.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });
  const lightBlue = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:blue.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });
  const lightGreen = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:green.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });
  const lightRed = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:red.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });
  const lightPurple = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:purple.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });
  const lightOrange = useColorScaleTones({
    designSystemKey,
    theme: 'light',
    selection: 'primitive:orange.v1',
    tones: BUTTON_LIGHT_TONES,
    enabled
  });

  const darkBlack = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:black.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });
  const darkBlue = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:blue.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });
  const darkGreen = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:green.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });
  const darkRed = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:red.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });
  const darkPurple = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:purple.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });
  const darkOrange = useColorScaleTones({
    designSystemKey,
    theme: 'dark',
    selection: 'primitive:orange.v1',
    tones: BUTTON_DARK_TONES,
    enabled
  });

  const tones = useMemo<ResolvedButtonStressTestBackgroundTone[]>(() => {
    const candidates: Array<{
      key: ButtonStressTestBackgroundToneKey;
      aria: string;
      resolvedColor: string | undefined;
    }> = [
      { key: 'white', aria: 'White', resolvedColor: lightBlack.picked['0'] },
      {
        key: 'light-neutral',
        aria: 'Light neutral',
        resolvedColor: lightBlack.picked.subtle
      },
      { key: 'light-blue', aria: 'Light blue', resolvedColor: lightBlue.picked.subtle },
      { key: 'light-green', aria: 'Light green', resolvedColor: lightGreen.picked.subtle },
      { key: 'light-red', aria: 'Light red', resolvedColor: lightRed.picked.subtle },
      { key: 'light-purple', aria: 'Light purple', resolvedColor: lightPurple.picked.subtle },
      { key: 'light-orange', aria: 'Light orange', resolvedColor: lightOrange.picked.subtle },
      { key: 'vivid-blue', aria: 'Vivid blue', resolvedColor: lightBlue.picked.vivid },
      { key: 'vivid-green', aria: 'Vivid green', resolvedColor: lightGreen.picked.vivid },
      { key: 'vivid-red', aria: 'Vivid red', resolvedColor: lightRed.picked.vivid },
      { key: 'vivid-purple', aria: 'Vivid purple', resolvedColor: lightPurple.picked.vivid },
      { key: 'vivid-orange', aria: 'Vivid orange', resolvedColor: lightOrange.picked.vivid },
      { key: 'vivid-black', aria: 'Vivid black', resolvedColor: lightBlack.picked.vivid },
      { key: 'black', aria: 'Absolute black', resolvedColor: lightBlack.picked['100'] },
      { key: 'dark-black', aria: 'Very dark black', resolvedColor: darkBlack.picked['5'] },
      { key: 'dark-blue', aria: 'Very dark blue', resolvedColor: darkBlue.picked['5'] },
      { key: 'dark-green', aria: 'Very dark green', resolvedColor: darkGreen.picked['5'] },
      { key: 'dark-red', aria: 'Very dark red', resolvedColor: darkRed.picked['5'] },
      { key: 'dark-purple', aria: 'Very dark purple', resolvedColor: darkPurple.picked['5'] },
      { key: 'dark-orange', aria: 'Very dark orange', resolvedColor: darkOrange.picked['5'] }
    ];

    return candidates.flatMap((tone) =>
      tone.resolvedColor
        ? [
            {
              key: tone.key,
              aria: tone.aria,
              resolvedColor: tone.resolvedColor,
              displayColor: tone.resolvedColor
            }
          ]
        : []
    );
  }, [
    darkBlack.picked,
    darkBlue.picked,
    darkGreen.picked,
    darkOrange.picked,
    darkPurple.picked,
    darkRed.picked,
    lightBlack.picked,
    lightBlue.picked,
    lightGreen.picked,
    lightOrange.picked,
    lightPurple.picked,
    lightRed.picked
  ]);

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

  return {
    defaultToneKey: 'white' as const,
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
