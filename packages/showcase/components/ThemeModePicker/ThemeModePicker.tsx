'use client';
import type { ThemeMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import dynamic from 'next/dynamic';
import { useId } from 'react';
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

const IconSunMax = dynamic(async () => {
  const mod = await import('./icons/IconSunMax');
  return mod.IconSunMax;
});

const IconMoonStars = dynamic(async () => {
  const mod = await import('./icons/IconMoonStars');
  return mod.IconMoonStars;
});

const IconMoon = dynamic(async () => {
  const mod = await import('./icons/IconMoon');
  return mod.IconMoon;
});

export default function ThemeModePicker({ position = 'inline' }: { position?: Position }) {
  const groupId = useId();
  const { theme, setTheme, availableThemes } = useKiskadee();

  const visibleOptions = OPTIONS.filter((o) => availableThemes.includes(o.key));

  const iconFor = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return IconSunMax;
      case 'dark':
        return IconMoonStars;
      case 'darker':
        return IconMoon;
      default:
        return IconSunMax;
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
                {(() => {
                  const Icon = iconFor(opt.key);
                  return <Icon className={styles.icon} aria-hidden="true" focusable="false" />;
                })()}
              </span>
              <span className={styles.label}>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
