'use client';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { ColorRadioGroup } from '@kiskadee/react-headless';
import { useEffect, useMemo, useState } from 'react';
import styles from './BackgroundTonePicker.module.scss';

const TONES = [
  { key: 'white', color: '#ffffff', displayColor: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#f5f5f5', displayColor: '#e5e7eb', aria: 'Gray' },
  { key: 'dark-gray', color: '#29313d', displayColor: '#6b6f7b', aria: 'Dark gray' },
  { key: 'black', color: '#000000', displayColor: '#000000', aria: 'Black' }
] as const;

const STORAGE_KEY = 'kiskadee.preview.background';

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
        color: t.displayColor,
        label: t.aria
      })),
    [tonesWithResolvedColors]
  );

  const initialKey = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TONES.some((t) => t.key === saved)) return saved;
    } catch {}
    return 'white';
  }, []);

  const [selected, setSelected] = useState<string>(initialKey);

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
    const el = document.body;
    el.style.backgroundColor = tone.resolvedColor;
    try {
      localStorage.setItem(STORAGE_KEY, tone.key);
    } catch {}
  }, [selected, tonesWithResolvedColors]);

  return (
    <ColorRadioGroup
      value={selected}
      onValueChange={setSelected}
      items={items}
      aria-label="Background tone"
      classNames={{
        e1: styles.fieldset,
        e2: styles.swatches,
        e3: styles.swatch,
        e4: styles.input,
        e5: styles.dot,
        e5a: styles.selected
      }}
    />
  );
}
