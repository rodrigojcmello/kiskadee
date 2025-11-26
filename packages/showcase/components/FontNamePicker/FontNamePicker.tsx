'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './FontNamePicker.module.scss';

const FONTS = [
  {
    key: 'system',
    label: 'System UI',
    family:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  {
    key: 'inter',
    label: 'Inter',
    family: '"Inter", sans-serif'
  },
  {
    key: 'roboto',
    label: 'Roboto',
    family: '"Roboto", sans-serif'
  },
  {
    key: 'open-sans',
    label: 'Open Sans',
    family: '"Open Sans", sans-serif'
  },
  {
    key: 'lora',
    label: 'Lora',
    family: '"Lora", serif'
  }
];

const STORAGE_KEY = 'kiskadee.preview.font';

export default function FontNamePicker({
  position = 'inline'
}: {
  position?: 'inline' | 'fixed-right-top';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to apply CSS variable and save preference
  useEffect(() => {
    const font = FONTS.find((f) => f.key === selected) ?? FONTS[0];
    document.documentElement.style.setProperty('--k-font-name', font.family);
    try {
      localStorage.setItem(STORAGE_KEY, font.key);
    } catch {}
  }, [selected]);

  const selectedFont = FONTS.find((f) => f.key === selected) || FONTS[0];

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${position === 'fixed-right-top' ? styles.fixed : ''}`}
    >
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select font"
      >
        <span className={styles.triggerLabel} style={{ fontFamily: selectedFont.family }}>
          {selectedFont.label}
        </span>
        <Icon name="ChevronDown" className={styles.chevron} />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {FONTS.map((font) => (
            <li
              key={font.key}
              className={`${styles.option} ${selected === font.key ? styles.selected : ''}`}
              onClick={() => {
                setSelected(font.key);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selected === font.key}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
