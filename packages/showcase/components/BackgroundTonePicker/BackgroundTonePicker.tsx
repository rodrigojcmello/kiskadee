'use client';

import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useColorScaleTones } from '@/hooks/use-color-scale';
import { SwatchRadioGroup } from '@/k-components';

const TONES = [
  { key: 'white', color: '#ffffff', displayColor: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#f5f5f5', displayColor: '#e5e7eb', aria: 'Gray' },
  { key: 'light-primary', color: '#f0eafb', displayColor: '#f0eafb', aria: 'Light primary' },
  { key: 'dark-gray', color: '#29313d', displayColor: '#6b6f7b', aria: 'Dark gray' },
  { key: 'dark-primary', color: '#201933', displayColor: '#201933', aria: 'Dark primary' },
  { key: 'black', color: '#000000', displayColor: '#000000', aria: 'Black' }
] as const;

export default function BackgroundTonePicker() {
  const { designSystem, theme } = useKiskadee();
  const { backgroundsByTheme } = useShowcase();

  const designSystemKey = String(designSystem ?? '');
  const canLoadPrimary = Boolean(designSystemKey);

  // Resolve primary scale tones:
  // - light-primary uses primary@5 (from the light theme scale)
  // - dark-primary uses primary@85 (from the dark theme scale)
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

  const tonesWithResolvedColors = useMemo(() => {
    const themeByToneKey: Record<string, string | undefined> = {
      white: undefined,
      gray: 'light',
      'light-primary': undefined,
      'dark-gray': 'dark',
      'dark-primary': undefined,
      black: 'darker'
    };

    return TONES.map((tone) => {
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
      tonesWithResolvedColors.map((t) => ({
        value: t.key,
        label: t.aria,
        swatch: {
          color: t.displayColor
        }
      })),
    [tonesWithResolvedColors]
  );

  const [selected, setSelected] = useState<string>(() =>
    theme === 'dark' ? 'dark-gray' : 'white'
  );

  // Sync background tone with theme changes: light → white, dark → black
  useEffect(() => {
    if (theme === 'dark') {
      setSelected('dark-gray');
      return;
    }

    setSelected(backgroundsByTheme.light ? 'gray' : 'white');
  }, [theme, backgroundsByTheme.light]);

  useEffect(() => {
    const tone =
      tonesWithResolvedColors.find((t) => t.key === selected) ?? tonesWithResolvedColors[0];
    document.body.style.backgroundColor = tone.resolvedColor;
  }, [selected, tonesWithResolvedColors]);

  return (
    <SwatchRadioGroup
      groupLabel="Background"
      value={selected}
      onValueChange={setSelected}
      items={items}
      aria-label="Background tone"
    />
  );
}
