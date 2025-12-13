'use client';
import type { ThemeMode } from '@kiskadee/core';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useId } from 'react';
import { playWowTransition } from '@/utils/playWowTransition';
import styles from './ThemeModePicker.module.scss';
import { Icon, type IconName } from '../Icon/Icon';

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

export default function ThemeModePicker() {
  const groupId = useId();
  const { theme, setTheme } = useKiskadee();
  const { availableThemes } = useShowcase();

  const visibleOptions = OPTIONS.filter((o) => availableThemes.includes(o.key));

  const iconFor = (mode: ThemeMode): IconName => {
    switch (mode) {
      case 'light':
        return 'SunMax';
      case 'dark':
        return 'MoonStars';
      case 'darker':
        return 'Moon';
      default:
        return 'SunMax';
    }
  };

  return (
    <fieldset className={styles.fieldset} aria-label="Theme mode">
      <div className={styles.swatches} role="radiogroup" aria-labelledby={`rg-${groupId}`}>
        {visibleOptions.map((opt) => (
          <label
            key={opt.key}
            className={theme === opt.key ? `${styles.swatch} ${styles.swatchSelected}` : styles.swatch}
            title={opt.label}
          >
            <input
              type="radio"
              name={`tmp-${groupId}`}
              value={opt.key}
              checked={theme === opt.key}
              onChange={() => {
                playWowTransition();
                setTheme(opt.key);
              }}
              aria-checked={theme === opt.key}
              aria-label={opt.aria}
              className={styles.input}
            />
            <span className={theme === opt.key ? `${styles.dot} ${styles.selected}` : styles.dot}>
              <Icon
                name={iconFor(opt.key)}
                className={styles.icon}
                aria-hidden="true"
                focusable="false"
              />
            </span>
            <span className={styles.label}>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
