'use client';
import type { ThemeMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { useEffect, useId, useMemo, useState } from 'react';
import moonBrightBlack from './img/moon-bright-48-black.png';
import moonBrightWhite from './img/moon-bright-48-white.png';
import moonFullBlack from './img/moon-full-48-black.png';
import moonFullWhite from './img/moon-full-48-white.png';
// Icon variants (black/white)
import sunBlack from './img/sun-48-black.png';
import sunWhite from './img/sun-48-white.png';
import styles from './ThemeModePicker.module.scss';

/*
  ThemeModePicker: mirrors BackgroundTonePicker identity
  Icons mapping (per request):
  - light  → sun
  - dark   → full moon (céu mais claro)
  - darker → bright crescent moon (lua "mordida")
*/

const OPTIONS: Array<{
  key: ThemeMode;
  label: string;
  aria: string;
}> = [
  { key: 'light', label: 'Light', aria: 'Light theme' },
  { key: 'dark', label: 'Dark', aria: 'Dark theme' },
  { key: 'darker', label: 'Darker', aria: 'Darker theme' }
];

export type Position = 'inline' | 'fixed-right-top';

export default function ThemeModePicker({ position = 'inline' }: { position?: Position }) {
  const groupId = useId();
  const { theme, setTheme, availableThemes } = useKiskadee();

  const visibleOptions = OPTIONS.filter((o) => availableThemes.includes(o.key));

  const STORAGE_KEY = 'kiskadee.preview.background';
  const isDarkKey = (k: string | null | undefined) => k === 'dark-gray' || k === 'black';

  const initialDark = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return isDarkKey(saved);
    } catch {
      return false;
    }
  }, []);

  const [useWhiteIcons, setUseWhiteIcons] = useState<boolean>(initialDark);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ key: string; color: string }>;
      setUseWhiteIcons(isDarkKey(ev.detail?.key));
    };
    window.addEventListener('kiskadee:background-tone-changed', handler as EventListener);
    return () =>
      window.removeEventListener('kiskadee:background-tone-changed', handler as EventListener);
  }, []);

  const iconFor = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return useWhiteIcons ? sunWhite : sunBlack;
      case 'dark':
        return useWhiteIcons ? moonFullWhite : moonFullBlack;
      case 'darker':
        return useWhiteIcons ? moonBrightWhite : moonBrightBlack;
      default:
        return useWhiteIcons ? sunWhite : sunBlack;
    }
  };

  return (
    <div className={position === 'fixed-right-top' ? styles.containerFixed : undefined}>
      <fieldset className={styles.fieldset} aria-label="Theme mode">
        <div className={styles.swatches} role="radiogroup" aria-labelledby={`rg-${groupId}`}>
          {visibleOptions.map((opt) => (
            <label
              key={opt.key}
              className={
                theme === opt.key ? `${styles.swatch} ${styles.swatchSelected}` : styles.swatch
              }
              title={opt.label}
            >
              <input
                type="radio"
                name={`tmp-${groupId}`}
                value={opt.key}
                checked={theme === opt.key}
                onChange={() => setTheme(opt.key)}
                aria-checked={theme === opt.key}
                aria-label={opt.aria}
                className={styles.input}
              />
              <span className={theme === opt.key ? `${styles.dot} ${styles.selected}` : styles.dot}>
                <img
                  className={styles.icon}
                  src={iconFor(opt.key) as unknown as string}
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <span className={styles.label}>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
