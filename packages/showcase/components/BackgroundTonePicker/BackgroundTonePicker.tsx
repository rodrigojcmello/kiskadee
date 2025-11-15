'use client';
import { useKiskadee } from '@kiskadee/react-components';
import { useEffect, useId, useMemo, useState } from 'react';
import styles from './BackgroundTonePicker.module.scss';

const TONES = [
  { key: 'white', color: '#ffffff', aria: 'White' },
  { key: 'gray', color: '#d1d5db', aria: 'Gray' },
  { key: 'dark-gray', color: '#374151', aria: 'Dark gray' },
  { key: 'black', color: '#000000', aria: 'Black' }
] as const;

const STORAGE_KEY = 'kiskadee.preview.background';

type Position = 'inline' | 'fixed-right-top';

export default function BackgroundTonePicker({
  position = 'fixed-right-top',
  onChange
}: {
  position?: Position;
  onChange?: (toneKey: string, color: string) => void;
}) {
  const groupId = useId();
  const { theme } = useKiskadee();

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
    setSelected(theme === 'dark' ? 'black' : 'white');
  }, [theme]);

  useEffect(() => {
    const tone = TONES.find((t) => t.key === selected) ?? TONES[0];
    const el = document.documentElement;
    el.style.transition = 'background-color 150ms ease-in-out';
    el.style.backgroundColor = tone.color;
    try {
      localStorage.setItem(STORAGE_KEY, tone.key);
    } catch {}
    // Notify listeners about background tone change
    try {
      window.dispatchEvent(
        new CustomEvent('kiskadee:background-tone-changed', {
          detail: { key: tone.key, color: tone.color }
        })
      );
    } catch {}
    onChange?.(tone.key, tone.color);
  }, [selected, onChange]);

  return (
    <div className={position === 'fixed-right-top' ? styles.containerFixed : undefined}>
      <fieldset className={styles.fieldset} aria-label="Background tone">
        <div className={styles.swatches} role="radiogroup" aria-labelledby={`rg-${groupId}`}>
          {TONES.map((t) => (
            <label key={t.key} className={styles.swatch} title={t.color}>
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
                style={{ backgroundColor: t.color }}
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
