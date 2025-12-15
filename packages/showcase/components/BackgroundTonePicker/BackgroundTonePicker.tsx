'use client';

import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useEffect, useMemo, useState } from 'react';
import { SwatchRadioGroup } from '@/k-components';

const TONES = [
  { key: 'white', color: '#ffffff', displayColor: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#f5f5f5', displayColor: '#e5e7eb', aria: 'Gray' },
  { key: 'dark-gray', color: '#29313d', displayColor: '#6b6f7b', aria: 'Dark gray' },
  { key: 'black', color: '#000000', displayColor: '#000000', aria: 'Black' }
] as const;

export default function BackgroundTonePicker() {
  const { theme } = useKiskadee();
  const { backgroundsByTheme } = useShowcase();

  const tonesWithResolvedColors = useMemo(() => {
    const themeByToneKey: Record<string, string | undefined> = {
      white: undefined,
      gray: 'light',
      'dark-gray': 'dark',
      black: 'darker'
    };

    return TONES.map((tone) => {
      const themeKey = themeByToneKey[tone.key];
      const backgroundFromStore = themeKey ? backgroundsByTheme[themeKey] : undefined;

      return {
        ...tone,
        resolvedColor: backgroundFromStore ?? tone.color
      };
    });
  }, [backgroundsByTheme]);

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
