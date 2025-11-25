'use client';
import { useKiskadee } from '@kiskadee/react-components';
import { useEffect, useId, useMemo, useState } from 'react';
import styles from './BackgroundTonePicker.module.scss';

const TONES = [
  { key: 'white', color: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#f5f5f5', aria: 'Gray' },
  { key: 'dark-gray', color: '#374151', aria: 'Dark gray' },
  { key: 'black', color: '#000000', aria: 'Black' }
] as const;

const STORAGE_KEY = 'kiskadee.preview.background';

type Position = 'inline' | 'fixed-right-top';

export default function BackgroundTonePicker({
  position = 'fixed-right-top'
}: {
  position?: Position;
}) {
  const groupId = useId();
  const { theme, backgroundsByTheme } = useKiskadee();

  const tonesWithResolvedColors = useMemo(() => {
    const themeByToneKey: Record<string, string | undefined> = {
      white: 'light',
      gray: undefined,
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
    setSelected(theme === 'dark' ? 'dark-gray' : 'white');
  }, [theme]);

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
    <div className={position === 'fixed-right-top' ? styles.containerFixed : undefined}>
      <fieldset className={styles.fieldset} aria-label="Background tone">
        <div className={styles.swatches} role="radiogroup" aria-labelledby={`rg-${groupId}`}>
          {tonesWithResolvedColors.map((t) => (
            <label key={t.key} className={styles.swatch} title={t.resolvedColor}>
              <input
                type="radio"
                name={`ktp-${groupId}`}
                value={t.key}
                checked={selected === t.key}
                onChange={() => setSelected(t.key)}
                aria-checked={selected === t.key}
                aria-label={t.aria}
                className={styles.input}
              />
              <span
                className={selected === t.key ? `${styles.dot} ${styles.selected}` : styles.dot}
                style={{ backgroundColor: t.resolvedColor }}
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
