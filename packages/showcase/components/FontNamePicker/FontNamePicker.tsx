'use client';
import { Select } from '@kiskadee/react-headless';
import { useEffect, useMemo, useState } from 'react';
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
    document.documentElement.style.setProperty('--k-font-name', font.family);
    try {
      localStorage.setItem(STORAGE_KEY, font.key);
    } catch {}
  }, [selected]);

  const selectedFont = FONTS.find((f) => f.key === selected) || FONTS[0];

  // Convert FONTS to SelectOption format
  const options = FONTS.map((font) => ({
    value: font.key,
    label: font.label
  }));

  return (
    <Select.Root
      options={options}
      value={selected}
      onValueChange={setSelected}
      classNames={{
        e1: `${styles.container} ${position === 'fixed-right-top' ? styles.fixed : ''}`,
        e2: styles.trigger,
        e3: styles.dropdown,
        e4: styles.option,
        e4a: `${styles.option} ${styles.selected}`
      }}
    >
      <Select.Trigger>
        <span className={styles.triggerLabel} style={{ fontFamily: selectedFont.family }}>
          {selectedFont.label}
        </span>
        <Icon name="ChevronDown" className={styles.chevron} />
      </Select.Trigger>

      <Select.Content>
        {FONTS.map((font) => (
          <Select.Option key={font.key} value={font.key}>
            <span style={{ fontFamily: font.family }}>{font.label}</span>
          </Select.Option>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
