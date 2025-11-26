'use client';
import { useEffect, useId, useMemo, useState } from 'react';
import styles from './FontNamePicker.module.scss';

const FONTS = [
  {
    key: 'system',
    label: 'System UI',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    aria: 'System standard font'
  },
  {
    key: 'inter',
    label: 'Inter',
    family: '"Inter", sans-serif',
    aria: 'Inter font'
  },
  {
    key: 'roboto',
    label: 'Roboto',
    family: '"Roboto", sans-serif',
    aria: 'Roboto font'
  },
  {
    key: 'open-sans',
    label: 'Open Sans',
    family: '"Open Sans", sans-serif',
    aria: 'Open Sans font'
  },
  {
    key: 'lora',
    label: 'Lora',
    family: '"Lora", serif',
    aria: 'Lora serif font'
  }
];

const STORAGE_KEY = 'kiskadee.preview.font';

export default function FontNamePicker({ position = 'inline' }: { position?: 'inline' | 'fixed-right-top' }) {
  const groupId = useId();

  // Retrieve from localStorage or use 'system' as default
  const initialKey = useMemo(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && FONTS.some((f) => f.key === saved)) return saved;
    } catch {}
    return 'system';
  }, []);

  const [selected, setSelected] = useState<string>(initialKey);

  // Effect to apply CSS variable and save preference
  useEffect(() => {
    const font = FONTS.find((f) => f.key === selected) ?? FONTS[0];

    // Set CSS variable globally
    document.documentElement.style.setProperty('--k-font-name', font.family);

    try {
      localStorage.setItem(STORAGE_KEY, font.key);
    } catch {}
  }, [selected]);

  return (
    <div className={position === 'fixed-right-top' ? styles.containerFixed : undefined}>
      <fieldset className={styles.fieldset} aria-label="Font family">
        <div className={styles.swatches} role="radiogroup" aria-labelledby={`rg-${groupId}`}>
          {FONTS.map((font) => (
            <label key={font.key} className={styles.swatch} title={font.label}>
              <input
                type="radio"
                name={`kfp-${groupId}`}
                value={font.key}
                checked={selected === font.key}
                onChange={() => setSelected(font.key)}
                className={styles.input}
                aria-label={font.aria}
              />
              {/* Shows 'Aa' preview in the correct font */}
              <span
                className={`${styles.dot} ${selected === font.key ? styles.selected : ''}`}
                style={{
                  fontFamily: font.family
                }}
              >
                Aa
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
